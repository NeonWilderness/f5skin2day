var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var crc32 = require('buffer-crc32');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var jade = require('gulp-jade');
var jshint = require('gulp-jshint');
var path = require('path');
var pkg = require('./package.json');
var rename = require('gulp-rename');
var replace = require('gulp-replace-task');
var sass = require('gulp-sass');
var save = require('gulp-save');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var stylish = require('jshint-stylish');
var tap = require('gulp-tap');
var trim = require('gulp-trim');
var uglify = require('gulp-uglify');
var zip = require("gulp-zip");

var production = false;

gulp.task( 'default', ['headjs', 'bodyjs', 'zip', 'deploy'], function(){
});

//--------- Convert scss files to css
gulp.task( 'scss2css', function(){

    return gulp.src('./src/scss/*.scss')
        .pipe(changed('src/css', {extension: '.css'}))
        .pipe(sass({ outputStyle: 'compressed' }).on('error', gutil.log))
        .pipe(gulp.dest('src/css'));
});

//--------- Convert css files to site skins: i.e. "foundation.css" becomes "Site/cssFoundation.skin"
gulp.task( 'css2skin', ['scss2css'], function(){

    del([ './dist/skins/Site/*', './dist/xml/*' ]);

    return gulp.src('./src/css/*.css')
        .pipe(rename(function(path){ // e.g. "foundation.css"
            path.basename = "css"+path.basename.substr(0,1).toUpperCase()+path.basename.substr(1); // cssFoundation
            path.extname = ".skin";
        }))
        .pipe(gulp.dest('dist/skins/Site'))
        .pipe(tap(function(file, t){
            var parsedPath = path.parse(file.path),
                fileCRC = crc32.unsigned(file.contents).toString();
            parsedPath.name = "Site-"+parsedPath.name;
            parsedPath.ext = ".xml";
            file.path = path.join(file.base, parsedPath.name+parsedPath.ext);
            fileName = parsedPath.name.replace("-",".");
            file.contents = Buffer.concat([
                new Buffer('<!-- Skin: '+fileName+' -->\n<skin key="'+
                    fileName+'" lastupdate="'+file.stat.mtime.toJSON()+'" crc="'+fileCRC+'">\n<content>\n'),
                    file.contents, new Buffer('\n</content>\n</skin>')
            ]);

        }))
        .pipe(gulp.dest('dist/xml'));
});

//--------- Convert jade template files to skins: i.e. "Site-page.jade" becomes "Site/page.skin"
gulp.task( 'jade2skin', ['css2skin'], function(){

    pkgVersion = pkg.version; // global var package.version will be injected into stdPreferences.jade

    gulp.src('./src/preferences.jade')
        .pipe(jade({pretty:true}))
        .pipe(rename('preferences.xml'))
        .pipe(gulp.dest('dist'));

    return gulp.src('./src/skins/*.jade')
        .pipe(jade({pretty:true, globals:['pkgVersion']})) // Site-page.jade
        .pipe(trim()) // trim any whitespace content at the beginning/end
        .pipe(save('before-wrap')) // save current stream
        .pipe(tap(function(file, t){
            file.crc32 = crc32.unsigned(file.contents).toString();
        }))
        .pipe(replace({
            patterns: [
                { match: '&', replacement: '&amp;' },
                { match: '<', replacement: '&lt;' },
                { match: '>', replacement: '&gt;' }
            ],
            usePrefix: false
        }))
        .pipe(tap(function(file, t){

            var parsedPath = path.parse(file.path);
            parsedPath.ext = ".xml";

            file.path = path.join(file.base, parsedPath.name+parsedPath.ext);

            fileName = parsedPath.name.replace("-",".");
            file.contents = Buffer.concat([
                new Buffer('<!-- Skin: '+fileName+' -->\n<skin key="'+
                    fileName+'" lastupdate="'+file.stat.mtime.toJSON()+'" crc="'+file.crc32+'">\n<content>\n'),
                    file.contents, new Buffer('\n</content>\n</skin>')
            ]);

        }))
        .pipe(gulp.dest('dist/xml'))
        .pipe(save.restore('before-wrap')) // restore the stream
        .pipe(rename(function(path){
            var parts = path.basename.split("-"); // Site-page.html
            path.dirname = "/"+parts[0]; // Site
            path.basename = parts[1]; // page
            path.extname = ".skin";
        }))
        .pipe(gulp.dest('dist/skins'));
});

//-------- Enclose all skins in a xml wrapper, concatenate with a header file and push to a releaseinfo xml
gulp.task("xml", ['jade2skin'], function(){

    gulp.src('./src/releasehead.jade')
        .pipe(jade({pretty:true}))
        .pipe(replace({
            patterns: [
                { match: 'version', replacement: pkg.version },
                { match: 'author',  replacement: pkg.author.split(" ")[0] }
            ]
        }))
        .pipe(rename('releasehead.xml'))
        .pipe(gulp.dest('dist'));

    return gulp.src(['./dist/releasehead.xml', './dist/xml/*.xml'])
        .pipe(concat('releaseinfo.xml'))
        .pipe(tap(function(file, t){
            file.contents = Buffer.concat([
                file.contents,
                new Buffer('\n</layout>')
            ]);
        }))
        .pipe(gulp.dest('dist'));
});

//-------- Zips skins and preferences.xml into the f5skin2day.zip layout file for later import on Twoday's layout page
gulp.task("zip", ['xml'], function(){

    del([ './dist/zip/f5skin2day.zip' ]);

    return gulp.src([ './dist/skins/**/*', './dist/preferences.xml' ], {base: 'dist'})
        .pipe(zip('f5skin2day.zip'))
        .pipe(gulp.dest('dist/zip'));
});

//--------- Concats vendor JS file/s to be encompassed in the head section
gulp.task( "headjs", function(){

    return gulp.src([
            './src/js/vendor/fastclick*.js',
            './src/js/vendor/mm-foundation*.js',
            './src/js/vendor/angular-spectrum-colorpicker*.js',
            './src/js/vendor/angular-toastr*.js',
            './src/js/vendor/swipebox.min.js',
            './src/js/vendor/ga.js'
        ])
        .pipe(concat('head.js'))
        .pipe(gulp.dest('dist/js/'));
});

//--------- Browserifies and uglifies JS file/s to be encompassed at the end of the body section
gulp.task( "bodyjs", function(){

    var b = browserify({
        entries: './src/js/app/app.js',
        debug: !production,
        cache: {}
    });

    gulp.src(['./src/js/app/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish));

    return b.bundle()
        .pipe(source('app.js'))
        .pipe(gulpif(production, buffer()))
        .pipe(gulpif(production, sourcemaps.init({loadMaps: true})))
        .pipe(gulpif(production, uglify())).on('error', gutil.log)
        .pipe(gulpif(production, sourcemaps.write('./')))
        .pipe(gulp.dest('dist/js/'));
});

//-------- Housekeeping deletes obsolete temp files
gulp.task("housekeeping", [], function(){
    del([ './dist/releasehead.xml' ]);
});

//-------- Deploy js/map/xml to GoogleDrive folder
gulp.task("deploy", ['headjs', 'bodyjs', 'xml'], function(){

    var folderGoogleDrive = "D:/Dokumente/Google Drive/Public/";

    gulp.src('dist/releaseinfo.xml')
        .pipe(gulp.dest('site/twoday/f5skin', { cwd: folderGoogleDrive}));

    return gulp.src('dist/js/*')
        .pipe(gulp.dest('js/f5skin2day', { cwd: folderGoogleDrive}));
});

//-------- Add unsplash.com img origin url to unsplashIt json data
gulp.task("unsplash", [], function(){

    var getJSON = require('get-json-plz'),
        csvParse = require('fast-csv'),
        unsplashIt, unsplashImgix={}, i=-1, key, url;

    getJSON('http://unsplash.it/list', function(err, data){
        if (err){
            console.error('Error reading unsplash.it image json data:', err.status);
            return false;
        } else {

            unsplashIt = data;

            fs.createReadStream('./src/csv/unsplash.csv')
                .pipe(csvParse())
                .on("data", function(data){
                    if (++i > 0){
                        key = data[1].replace('/download', '');
                        url = data[2].split("?")[0];
                        unsplashImgix[key] = url;
                    }
                })
                .on("end", function(){
                    unsplashIt.reverse().forEach( function(value, index){
                        if (typeof unsplashImgix[value.post_url] !== 'undefined'){
                            value['img_url'] = unsplashImgix[value.post_url];
                        } else {
                            console.log('imgix url for key:', value.post_url, 'not found!');
                        }
                        if (typeof value.width !== 'undefined' && typeof value.height !== 'undefined'){
                            value.ratio = parseInt(value.width, 10) / parseInt(value.height, 10);
                        }
                    });
                    var folderGoogleDrive = "D:/Dokumente/Google Drive/Public";
                    fs.writeFile(folderGoogleDrive+'/site/twoday/f5skin/unsplash.json', JSON.stringify(unsplashIt), function(err){
                        if (err) throw err;
                        console.log('*** unsplash.json successfully created/saved to GoogleDrive.');
                    });
                });
        }
    });

});

//-------- Convert picjumbo.csv to json data
gulp.task("picjumbo", [], function(){

    var csvParse = require('fast-csv'),
        picjumbo=[], i=-1;

    fs.createReadStream('./src/csv/picjumbo.csv')
        .pipe(csvParse())
        .on("data", function(data){
            if (++i > 0){
                picjumbo.push({ img_url: data[0], img_title: data[1].replace('Free image: ', ''), img_tags: data[2] });
            }
        })
        .on("end", function(){
            var folderGoogleDrive = "D:/Dokumente/Google Drive/Public";
            fs.writeFile(folderGoogleDrive+'/site/twoday/f5skin/picjumbo.json', JSON.stringify(picjumbo), function(err){
                if (err) throw err;
                console.log('*** picjumbo.json successfully created/saved to GoogleDrive.');
            });
        });

});

//-------- Convert fontawesome.csv to json data
gulp.task("fontawesome", [], function(){

    var csvParse = require('fast-csv'),
        icons=[], i=-1;

    fs.createReadStream('./src/csv/fontawesome.csv')
        .pipe(csvParse())
        .on("data", function(data){
            if (++i > 0){
                icons.push({ name: data[0], code: data[1].match(/f.{3}/)[0] });
            }
        })
        .on("end", function(){
            var folderGoogleDrive = "D:/Dokumente/Google Drive/Public";
            fs.writeFile(
                folderGoogleDrive+'/site/twoday/f5skin/fontawesome.json',
                JSON.stringify(icons.sort(function(a,b){
                    if(a.name < b.name) return -1;
                    if(a.name > b.name) return 1;
                    return 0;
                })),
                function(err){
                    if (err) throw err;
                    console.log('*** fontawesome.json ('+icons.length+' icons) successfully created/saved to GoogleDrive.');
                }
            );
        });

});