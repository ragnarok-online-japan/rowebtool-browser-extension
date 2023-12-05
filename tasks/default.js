import gulp from 'gulp'

gulp.task('default',
    gulp.series(
        'build'
    )
);

gulp.task('watch', () => {
    gulp.watch(
        [
            'app/manifest.json',
            'app/scripts/*.ts',
            'app/_locales/**/messages.json',
            'app/pages/*.html'
        ],
        gulp.task('build')
    )
});
