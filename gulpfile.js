var gulp = require('gulp');

gulp.task('lint', function() {
    var eslint = require('gulp-eslint');
    return gulp.src(['lib/**/*.js', 'test/**/*.js', 'bin/**/*.js', 'gulpfile.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', function() {
    var mocha = require('gulp-mocha');
    return gulp.src('test/*.test.js', {read: false})
        .pipe(mocha());
});

gulp.task('default', ['lint', 'test']);
