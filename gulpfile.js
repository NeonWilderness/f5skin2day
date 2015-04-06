var browserify = require('browserify');
var concat = require('gulp-concat');
var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jade = require('gulp-jade');
var path = require('path');
var pkg = require('./package.json');
var rename = require('gulp-rename');
var replace = require('gulp-replace-task');
var sass = require('gulp-sass');
var save = require('gulp-save');
var sourcemaps = require('gulp-sourcemaps');
var tap = require('gulp-tap');
var transform = require('vinyl-transform');
var trim = require('gulp-trim');
var uglify = require('gulp-uglify');
var zip = require("gulp-zip");

gulp.task( 'default', ['jade2skin', 'zip', 'xml', 'housekeeping'], function(){
});

//-------- Convert scss files to css
gulp.task( 'scss2css', function(){

    del([ './src/css/layout.css' ]);

    return gulp.src('./src/scss/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', gutil.log))
        .pipe(gulp.dest('src/css'));
});

//-------- Convert css files to site skins: i.e. "foundation.css" becomes "Site/cssFoundation.skin"
gulp.task( 'css2skin', ['scss2css'], function(){

    del([ './dist/skins/Site/*' ]);

    return gulp.src('./src/css/*.css')
        .pipe(rename(function(path){ // e.g. "foundation.css"
            path.basename = "css"+path.basename.substr(0,1).toUpperCase()+path.basename.substr(1); // cssFoundation
            path.extname = ".skin";
        }))
        .pipe(gulp.dest('dist/skins/Site'));
});

//-------- Convert jade template files to skins: i.e. "Site-page.jade" becomes "Site/page.skin"
gulp.task( 'jade2skin', ['css2skin'], function(){

    gulp.src('./src/preferences.jade')
        .pipe(jade({pretty:true}))
        .pipe(rename('preferences.xml'))
        .pipe(gulp.dest('dist'));

    return gulp.src('./src/skins/*.jade')
        .pipe(jade({pretty:true})) // Site-page.jade
        .pipe(trim()) // trim any whitespace
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
            var filename = path.basename(file.path, path.extname(file.path)).replace("-",".");
            file.contents = Buffer.concat([
                new Buffer('<!-- Skin: '+filename+' -->\n<skin>\n<key>'+filename+'</key>\n<content>\n'),
                file.contents,
                new Buffer('\n</content>\n</skin>')
            ]);
        }))
        .pipe(rename(function(path){
            path.extname = ".xml";
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

    del([ './dist/releaseinfo.xml' ]);

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

    return gulp.src(['./dist/releasehead.*', './dist/xml/*.xml'])
        .pipe(concat('releaseinfo.xml'))
        .pipe(tap(function(file, t){
            file.contents = Buffer.concat([
                file.contents,
                new Buffer('\n</layout>')
            ]);
        }))
        .pipe(gulp.dest('dist'));
});

//-------- Zips skins and preferences.xml into the f5skin2day.zip layout file for later import on Twoday
gulp.task("zip", ['jade2skin'], function(){

    del([ './dist/zip/f5skin2day.zip' ]);

    return gulp.src([ './dist/skins/**/*', './dist/preferences.xml' ], {base: "dist"})
        .pipe(zip('f5skin2day.zip'))
        .pipe(gulp.dest('dist/zip'));
});

//-------- Browserifies and uglifies JS file/s to be encompassed in the head section
gulp.task( 'headjs', function(){

    return gulp.src([
            //'./src/js/vendor/modernizr-*.js',
            // './src/js/vendor/fastclick-*.js',
            './src/js/vendor/mm-foundation-*.js',
            './src/js/vendor/ga.js'
        ])
        .pipe(concat('head.js'))
        .pipe(gulp.dest('dist/js/'));
});

//-------- Browserifies and uglifies JS file/s to be encompassed at the end of the body section
gulp.task( 'bodyjs', function(){

    var browserified = transform(function(filename) {
        var b = browserify({entries: filename, debug: true});
        return b.bundle();
    });

    return gulp.src('src/js/app/app.js')
        .pipe(browserified)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/js/'));
});

//-------- Housekeeping deletes obsolete temp files
gulp.task("housekeeping", ['xml'], function(){
    del([ './dist/releasehead.xml' ]);
});