import gulp from 'gulp'

gulp.task('watch',
    gulp.series(
        'build',
        () => {
            gulp.watch(
                [
                    'app/manifest.json',
                    'app/scripts/*.ts',
                    'app/images/*.png',
                    'app/_locales/**/messages.json',
                    'app/pages/*.html'
                ],
                gulp.task('build')
            )
        }
    )
);
