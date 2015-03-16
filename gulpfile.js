var gulp = require('gulp');
var jade = require('gulp-jade');
var rename = require('gulp-rename');

gulp.task( 'default', ['jade2skin'], function(){
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