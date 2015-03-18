var browserify = require('browserify');
var gulp = require('gulp');
var transform = require('vinyl-transform');
var jade = require('gulp-jade');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');

gulp.task( 'default', ['jade2skin'], function(){
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
        .pipe(rename(function(path){
            var parts = path.basename.split("-"); // Site-page.html
            path.dirname += "/"+parts[0]; // Site
            path.basename = parts[1]; // page
            path.extname = ".skin";
        }))
        .pipe(gulp.dest("dist/skins"));
    gulp.src('src/preferences.jade')
        .pipe(jade({pretty:true}))
        .pipe(rename("preferences.xml"))
        .pipe(gulp.dest("dist"));
});