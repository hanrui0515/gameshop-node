const gulp = require('gulp');
const typescript = require('gulp-typescript');
const del = require('del');

const devProject = typescript.createProject('tsconfig.dev.json');
const prodProject = typescript.createProject('tsconfig.prod.json');

gulp.task('clean:ts', function () {
    return del([
        'dist/**'
    ]);
});

gulp.task('clean:all', gulp.parallel('clean:ts'));

gulp.task('build:ts:dev', function () {
    return devProject.src()
        .pipe(devProject())
        .js
        .pipe(gulp.dest('dist'));
});

gulp.task('build:dev', gulp.series('clean:ts', 'build:ts:dev'));

gulp.task('build:ts:prod', function () {
    return prodProject.src()
        .pipe(prodProject())
        .js
        .pipe(gulp.dest('dist'));
});

gulp.task('build:prod', gulp.series('clean:ts', 'build:ts:prod'));


