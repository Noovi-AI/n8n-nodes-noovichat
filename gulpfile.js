const gulp = require('gulp');

// Copy SVG icons to dist folder
gulp.task('build:icons', () => {
  return gulp.src('nodes/**/!(*.ts)').pipe(gulp.dest('dist/nodes'));
});

gulp.task('default', gulp.series('build:icons'));