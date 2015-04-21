var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var crc32 = require('buffer-crc32');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jade = require('gulp-jade');
var path = require('path');
var pkg = require('./package.json');
var rename = require('gulp-rename');
var replace = require('gulp-replace-task');
var sass = require('gulp-sass');
var save = require('gulp-save');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var tap = require('gulp-tap');
var trim = require('gulp-trim');
var uglify = require('gulp-uglify');
var zip = require("gulp-zip");

gulp.task( 'default', ['headjs', 'bodyjs', 'zip', 'deploy'], function(){
});

//--------- Convert scss files to css
gulp.task( 'scss2css', function(){

    del([ './src/css/layout.css' ]);

    return gulp.src('./src/scss/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', gutil.log))
        .pipe(gulp.dest('src/css'));
});

//--------- Convert css files to site skins: i.e. "foundation.css" becomes "Site/cssFoundation.skin"
gulp.task( 'css2skin', ['scss2css'], function(){

    del([ './dist/skins/Site/*' ]);

    return gulp.src('./src/css/*.css')
        .pipe(tap(function(file, t){
            file.contents = Buffer.concat([
                new Buffer('/* CRC32: '+crc32.unsigned(file.contents)+' */\n'), file.contents
            ]);
        }))
        .pipe(rename(function(path){ // e.g. "foundation.css"
            path.basename = "css"+path.basename.substr(0,1).toUpperCase()+path.basename.substr(1); // cssFoundation
            path.extname = ".skin";
        }))
        .pipe(gulp.dest('dist/skins/Site'));
});

//--------- Convert jade template files to skins: i.e. "Site-page.jade" becomes "Site/page.skin"
gulp.task( 'jade2skin', ['css2skin'], function(){

    del([ './dist/xml/*' ]); // delete all previously generated xml files

    gulp.src('./src/preferences.jade')
        .pipe(jade({pretty:true}))
        .pipe(rename('preferences.xml'))
        .pipe(gulp.dest('dist'));

    return gulp.src('./src/skins/*.jade')
        .pipe(tap(function(file, t){
            var fileStat = fs.statSync(file.path),
                fileLastModified = fileStat.mtime.toJSON().replace(/:/g, "#"),
                parsedPath = path.parse(file.path);
            file.path = path.join(file.base, fileLastModified+parsedPath.base);
        }))
        .pipe(jade({pretty:true})) // Site-page.jade
        .pipe(trim()) // trim any whitespace content at the beginning/end
        .pipe(save('before-wrap')) // save current stream
        .pipe(replace({
            patterns: [
                { match: '&', replacement: '&amp;' },
                { match: '<', replacement: '&lt;' },
                { match: '>', replacement: '&gt;' }
            ],
            usePrefix: false
        }))
        .pipe(tap(function(file, t){

            var parsedPath = path.parse(file.path),
                fileLastModified = parsedPath.name.substr(0,24).replace(/#/g, ":"),
                fileName = parsedPath.name.substr(24),
                fileCRC = crc32.unsigned(file.contents).toString();
            parsedPath.name = fileName;
            parsedPath.ext = ".xml";

            file.path = path.join(file.base, parsedPath.name+parsedPath.ext);

            fileName = fileName.replace("-",".");
            file.contents = Buffer.concat([
                new Buffer('<!-- Skin: '+fileName+' -->\n<skin key="'+
                    fileName+'" lastupdate="'+fileLastModified+'" crc="'+fileCRC+'">\n<content>\n'),
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
                { match: 'author',  replacement: pkg.author }
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

//--------- Browserifies and uglifies JS file/s to be encompassed in the head section
gulp.task( "headjs", function(){

    return gulp.src([
            './src/js/vendor/fastclick-*.js',
            './src/js/vendor/mm-foundation-*.js',
            './src/js/vendor/ga.js'
        ])
        .pipe(concat('head.js'))
        .pipe(gulp.dest('dist/js/'));
});

//--------- Browserifies and uglifies JS file/s to be encompassed at the end of the body section
gulp.task( "bodyjs", function(){

    var b = browserify({
        entries: './src/js/app/app.js',
        debug: true
    });

    return b.bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify()).on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
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