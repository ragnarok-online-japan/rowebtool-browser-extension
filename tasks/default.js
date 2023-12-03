import gulp from 'gulp'

gulp.task('watch', () => {
    return gulp.watch(
        [
            'app/manifest.json',
            'app/scripts/*.ts',
            'app/_locales/**/messages.json',
            'app/pages/*.html'
        ],
        gulp.task('build')
    )
});

gulp.task('default',
    gulp.series(
        'build',
        'watch'
    )
);
