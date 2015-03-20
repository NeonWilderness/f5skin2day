var browserify = require('browserify');
var concatcss = require('gulp-concat-css');
var footer = require('gulp-footer');
var gulp = require('gulp');
var jade = require('gulp-jade');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var transform = require('vinyl-transform');
var trim = require('gulp-trim');
var uglify = require('gulp-uglify');

gulp.task( 'default', ['jade2skin'], function(){
});

gulp.task( 'bundlecss', function(){

    gulp.src('src/css/*.css')
        .pipe(rename(function(path){ // e.g. "foundation.css"
            path.basename = "css"+path.basename.substr(0,1).toUpperCase()+path.basename.substr(1); // cssFoundation
            path.extname = ".skin";
        }))
        .pipe(gulp.dest('dist/skins/Site'));
});

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