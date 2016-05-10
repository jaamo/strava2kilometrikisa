//require our modules
var gulp = require('gulp');
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps')
    autoprefixer = require('gulp-autoprefixer');

//global src, dist and watch paths
var paths = {
  css: {
    src: ['assets/scss/**/*.scss'],
    dist: 'assets/dist/css/'
  },
  js: {
    src: ['assets/js/*.js', 'assets/js/components/*.js'],
    dist: 'assets/dist/js/'
  },
  img: {
    src: ['assets/img/*'],
    dist: 'assets/dist/img/'
  }
}

//lets handle the sexy ass stylesheets
gulp.task('sass', function () {
  setTimeout(function(){
    gulp.src(paths.css.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(cleanCSS({compatibility: 'ie9'}))
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest(paths.css.dist));
  }, 500);
});

//lets handle our js scripts
gulp.task('js', function () {
  setTimeout(function(){
   gulp.src(paths.js.src)
      .pipe(sourcemaps.init())
      .pipe(plumber())
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(uglify())
      .pipe(concat('main.js'))
      .pipe(sourcemaps.write('../maps'))
      .pipe(gulp.dest(paths.js.dist));
   }, 500);
});

// Just copy image to dist.
gulp.task('img', function () {
    gulp.src(paths.img.src)
      .pipe(gulp.dest(paths.img.dist));
});


//default task for dev
gulp.task('default', ['sass', 'js', 'img', 'watch'], function() {});

gulp.task('build', ['sass', 'js', 'img'], function() {});

//setup watch tasks
gulp.task('watch', function () {
  gulp.watch(paths.css.src, ['sass']);
  gulp.watch(paths.js.src, ['js']);
});
