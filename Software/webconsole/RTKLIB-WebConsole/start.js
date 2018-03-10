{
    var gulp = require('gulp');
    require('./gulpfile.js');
    gulp.start('build');
    gulp = null;
}
{
    var gulp = require('gulp');
    require('./gulpfile.js');
    gulp.start('connect');
}