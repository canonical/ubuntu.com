var gulp = require('gulp');

// Watch tasks
gulp.task('watch', function() {
  gulp.watch('static/css/**/*', ['sass:develop']);
});
