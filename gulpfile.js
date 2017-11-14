var gulp        = require('gulp');
var sass        = require('gulp-sass');
var browserSync = require('browser-sync').create();

gulp.task('sass-login', function(){
    return gulp.src('./app/login/scss/*.scss')
                .pipe(sass())
                .pipe(gulp.dest('./app/login/css'))
                .pipe(browserSync.stream());
})

gulp.task('sass-game', function(){
    return gulp.src('./app/game/scss/*.scss')
                .pipe(sass())
                .pipe(gulp.dest('./app/game/css'))
                .pipe(browserSync.stream());
})


gulp.task('watch', ['sass-login', 'sass-game'], function(){
    browserSync.init({
        server: "./app"
    });
    
    gulp.watch('./app/login/scss/*.scss', ['sass-login'])
    gulp.watch('./app/game/scss/*.scss', ['sass-game'])
    gulp.watch('./app/**/js/*.js').on('change', browserSync.reload);
    gulp.watch('./app/**/js/class/*.js').on('change', browserSync.reload);
    gulp.watch("./app/**/*.html").on('change', browserSync.reload);
})

gulp.task('default', ['sass-login', 'sass-game', 'watch']);