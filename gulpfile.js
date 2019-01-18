'use strict';

var autoprefixer = require('gulp-autoprefixer');//自动补齐前缀
//传送门：https://github.com/sindresorhus/gulp-autoprefixer
//gulp-autoprefixer的browsers参数：https://github.com/browserslist/browserslist
var browserify = require('gulp-browserify');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var del = require('del');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var inject = require('gulp-inject');
var minifycss = require('gulp-minify-css');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var less = require('gulp-less');
var streamSeries = require('stream-series');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');




/* ============================================================================================================
============================================ For Development ==================================================
=============================================================================================================*/


// copy src/fonts to dist/fonts
gulp.task('publish-fonts', function () {
    var fonts = ['src/fonts/*'];

    return gulp.src(fonts)
        .pipe(gulp.dest('dist/fonts')); 
});

// copy src/images to dist/images
gulp.task('publish-images', function () {
    var imgages = ['src/images/*']
    return gulp.src(imgages)
        .pipe(gulp.dest('dist/images'));
});

// copy audios from src/audios to dist/audios
gulp.task('publish-audios', function () {
    return gulp.src('src/audios/*')
        .pipe(gulp.dest('dist/audios'));
});

// compile sass, concat stylesheets in the right order,
gulp.task('publish-css', function () {

    return streamSeries(
        gulp.src('src/less/*.less')
            .pipe(plumber({
                errorHandler: errorAlert
            }))
            .pipe(less())
            .pipe(autoprefixer({
                browsers:['last 1 version','> 1%','ie 10']//https://browserl.ist/?q=last+4+versions  通过这个可查询browsers参数所支持的浏览器
            }))
    )
        .pipe(gulp.dest('dist/stylesheets'))
        .pipe(browserSync.stream());
});
// bundle CommonJS modules under src/javascripts, concat javascripts in the right order,
// and save as dist/javascripts/bundle.js
// gulp.task('publish-js', function () {
//     var jsVendors = vendors.javascripts;

//     return streamSeries(
//         gulp.src(jsVendors),
//         gulp.src('src/javascripts/main.js')
//             .pipe(plumber({
//                 errorHandler: errorAlert
//             }))
//             .pipe(browserify({
//                 transform: ['partialify'],
//                 debug: true
//             }))
//         )
//         .pipe(concat('bundle.js'))
//         .pipe(gulp.dest('dist/javascripts'));
// });

gulp.task('publish-js', function () {
    return gulp.src('src/javascripts/*')
        .pipe(gulp.dest('dist/javascripts'));
});
// inject dist/stylesheets/bundle.css and dist/javascripts/bundle.js into src/index.html
// and save as dist/index.html
gulp.task('inject', function () {
    var target = gulp.src('src/index.html');
    var assets = gulp.src([
        'dist/stylesheets/*.css',
        'dist/javascripts/*.js'
    ], {
        read: false
    });
    return target
        .pipe(inject(assets, {
            ignorePath: 'dist/',
            addRootSlash: false,
            removeTags: true
        }))
        .pipe(gulp.dest('dist'));
});

// watch files and run corresponding task(s) once files are added, removed or edited.
gulp.task('watch', function () {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    });

    gulp.watch('src/index.html', ['inject']);
    gulp.watch(['src/less/**/*.less','src/less/*.less'], ['publish-css']);
    gulp.watch('src/javascripts/**/*', ['publish-js']);
    gulp.watch('src/fonts/**/*', ['publish-fonts']);
    gulp.watch('src/images/**/*', ['publish-images']);
    gulp.watch('src/audios/**/*', ['publish-audios']);

    gulp.watch('dist/index.html').on('change', browserSync.reload);
    gulp.watch('dist/javascripts/*').on('change', browserSync.reload);
    gulp.watch('dist/fonts/*').on('change', browserSync.reload);
    gulp.watch('dist/images/*').on('change', browserSync.reload);
});

// delete files under dist
gulp.task('clean-files', function(cb) {
    return del([
        'dist/**/*'
    ], cb);
});

// delete cache
// gulp.task('clean-cache', function (cb) {
//     return cache.clearAll(cb)
// });

// development workflow task
gulp.task('dev', function (cb) {
    runSequence(['clean-files'], ['publish-fonts', 'publish-images', 'publish-audios', 'publish-css', 'publish-js'], 'inject', 'watch', cb);
});

// default task
gulp.task('default', ['dev']);



/* ============================================================================================================
================================================= For Production ==============================================
=============================================================================================================*/


gulp.task('minify-css', function () {
    return gulp.src('dist/stylesheets/*.css')
        .pipe(minifycss())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist/stylesheets'));
});

// uglify dist/javascripts/bundle.js and save as dist/javascripts/bundle.min.js
gulp.task('uglify-js', function () {
    return gulp.src('dist/javascripts/*.js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist/javascripts'));
});

// inject dist/stylesheets/bundle.min.css and dist/javascripts/bundle.min.js into src/index.html
// and save as dist/index.html
gulp.task('inject-min', function () {
    var target = gulp.src('src/index.html');
    var assets = gulp.src([
        'dist/stylesheets/bundle.min.css',
        'dist/javascripts/bundle.min.js'
    ], {
        read: false
    });
    return target
        .pipe(inject(assets, {
            ignorePath: 'dist/',
            addRootSlash: false,
            removeTags: true
        }))
        .pipe(gulp.dest('dist'));
});

// delete dist/stylesheets/bundle.css and dist/javascripts/bundle.js
gulp.task('del-bundle', function (cb) {
    return del([
        'dist/stylesheets/bundle.css',
        'dist/javascripts/bundle.js'
    ], cb);
});

// run 'minify-css' and 'uglify-js' at the same time
// inject the minified files to index.html
// delete unminified files
gulp.task('prod',  function (cb) {
    runSequence(['minify-css', 'uglify-js'], ['inject-min', 'del-bundle'], cb);
});



/* ===============================================
 ================== Functions ====================
 ================================================*/

// handle errors
function errorAlert(error){
    notify.onError({
        title: "Error in plugin '" + error.plugin + "'",
        message: 'Check your terminal',
        sound: 'Sosumi'
    })(error);
    console.log(error.toString());
    this.emit('end');
}