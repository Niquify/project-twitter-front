var gulp = require('gulp');
var sass = require('gulp-sass');
var concatCss = require('gulp-concat-css');
var concat = require('gulp-concat');
var minifyCss = require('gulp-clean-css');
var minifyJs = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('sass', function() {
  return gulp.src('./scss/**/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest('./dist/css'));
});

gulp.task('concat-css', ['sass'], function() {
  return gulp.src(['./dist/css/main.css', './lib/bootstrap/css/bootstrap.min.css'])
	.pipe(concatCss('style.css'))
	.pipe(gulp.dest('./dist/css/'));
});

gulp.task('concat-js', function() {
  return gulp.src(['./lib/jquery/jquery-3.1.1.min.js','./lib/bootstrap/js/bootstrap.min.js','./lib/angular/angular.min.js','./dist/js/app.js'])
	.pipe(concat('main.js'))
	.pipe(gulp.dest('./dist/js/'));
});


gulp.task('minify-css', ['concat-css'], function() {
  return gulp.src(['./dist/css/style.css'])
	.pipe(minifyCss())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('./dist/css/'));
});

gulp.task('minify-js', ['concat-js'], function() {
  return gulp.src(['./dist/js/main.js'])
	.pipe(minifyJs())
    .pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('./dist/js/'));
});


gulp.task('build', ['minify-js','minify-css']);

gulp.task('build:watch', function () {
  gulp.watch('./scss/**/*.scss', ['minify-css']);
  gulp.watch('./dist/js/app.js', ['minify-js']);
});
