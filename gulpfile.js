var browserify = require('browserify');
var concatcss = require('gulp-concat-css');
var del = require('del');
var footer = require('gulp-footer');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jade = require('gulp-jade');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var transform = require('vinyl-transform');
var trim = require('gulp-trim');
var uglify = require('gulp-uglify');
var zip = require("gulp-zip");

gulp.task( 'default', ['clean:skins', 'sass2css', 'css2skin', 'jade2skin', 'zip'], function(){
});

//-------- Cleanup skin output directory
gulp.task('clean:skins', function(){
    del([ 'dist/preferences.xml', 'dist/skins/Site/*' ]);
});

//-------- Convert sass files to css
gulp.task( 'sass2css', function(){

    gulp.src('src/scss/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', gutil.log))
        .pipe(gulp.dest('src/css'));
});

//-------- Convert css files to site skins: i.e. "foundation.css" becomes "Site/cssFoundation.skin"
gulp.task( 'css2skin', function(){

    gulp.src('src/css/*.css')
        .pipe(rename(function(path){ // e.g. "foundation.css"
            path.basename = "css"+path.basename.substr(0,1).toUpperCase()+path.basename.substr(1); // cssFoundation
            path.extname = ".skin";
        }))
        .pipe(gulp.dest('dist/skins/Site'));
});

//-------- Convert jade template files to skins: i.e. "Site-page.jade" becomes "Site/page.skin"
gulp.task( 'jade2skin', function(){

    gulp.src('src/skins/*.jade')
        .pipe(jade({pretty:true})) // Site-page.jade
        .pipe(trim()) // trim any whitespace
        .pipe(rename(function(path){
            var parts = path.basename.split("-"); // Site-page.html
            path.dirname += "/"+parts[0]; // Site
            path.basename = parts[1]; // page
            path.extname = ".skin";
        }))
        .pipe(gulp.dest('dist/skins'));

    gulp.src('src/preferences.jade')
        .pipe(jade({pretty:true}))
        .pipe(rename('preferences.xml'))
        .pipe(gulp.dest('dist'));
});

//-------- Zips skins and preferences.xml into the f5skin2day.zip layout file for later import on Twoday
gulp.task("zip", function(){
    del([ 'dist/zip/f5skin2day.zip' ]);
    return gulp.src([ 'dist/skins/**/*', 'dist/preferences.xml' ], {base: "dist"})
        .pipe(zip('f5skin2day.zip'))
        .pipe(gulp.dest('dist/zip'));
});

//-------- Browserifies and uglifies JS file/s to be encompassed in the head section
gulp.task( 'headjs', function(){

    var browserified = transform(function(filename) {
        var b = browserify({entries: filename, debug: true});
        return b.bundle();
    });

    return gulp.src('src/js/head/head.js')
        .pipe(browserified)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
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