/**
 * Este es el compilador.
 * 
 * Si tienes dudas de como funciona, puedes leer lo que escribi.
 * Si no, solo corre el comando 'gulp' en la consola y disfruta.
 * 
 * Empecemos diciendo que esto no se ejecuta en el navegador.
 * Esto se ejecuta en tu computadora. Miralo como si fuera un programa escrito en php, java, c++, etc.
 * Necesitamos importar las librerias 'gulp', 'gulp-sass' y 'browser-sync' para que esto funcione.
 * Esas librerias se encuentran en la carpeta 'node_modules', por lo que solo las usamos.
 * Si no tienes la carpeta node_modules, puedes correr los siguientes comandos:
 *  npm init
 *  npm install --save-dev gulp gulp-sass browser-sync
 * Asumiendo que tengas instalado Node.js, claro.
 */

var gulp        = require('gulp');
var sass        = require('gulp-sass');
var browserSync = require('browser-sync').create();

/**
 * Modulo sass.
 * 
 * Este modulo se lanza por primera vez cuando corres gulp y las demas veces cuando hay un cambio en un archivo scss.
 * Lo que hace es compilar todos los archivos que se encuentren en la raiz scss y los expulsa ya compuilados en la raiz css.
 * Si quieres pasar parametros, como por ejemplo que tu css este comprimido, etc, lo escribes en la función sass().
 * Cuando termina, recarga el navegador en el que lo estes corriendo.
 * 
 * DOCUMENTACIÓN:
 *  -https://www.npmjs.com/package/gulp-sass
 * VIDEOS:
 *  -https://www.youtube.com/watch?v=e1G7ZpwoRe4
 */
gulp.task('sass', function(){
    return gulp.src('./app/scss/*.scss')
                .pipe(sass())
                .pipe(gulp.dest('./app/css'))
                .pipe(browserSync.stream());
})

/**
 * Modulo watch.
 * 
 * Aquí ocurre la magia.
 * Cuando corre watch, lo que hace es importar el modulo sass, esto para llamarlo después.
 * Una vez incia, lo primero que hace es levantar un servidor, en este caso './app', por lo que todo lo que este dentro, será accesible desde el navegador.
 * Lo que este fuera de la carpeta app, no se mostrara y no será accesible por el navegador.
 * Cuando lo ah levantado, se mantiene al pendiente las rutas que le pasemos.
 * En este caso:
 *  -Si algo cambia en la raiz de 'scss', se va a compilar todo sass.
 *  -En caso de que haya un cambio een la raiz de 'js' o en la carpeta 'js/class', se recarga el navegador.
 *  -Si algun html cambia en la raiz de 'app', se recarga el navegador.
 */
gulp.task('watch', ['sass'], function(){
    browserSync.init({
        server: "./app"
    });
    
    gulp.watch('./app/scss/*.scss', ['sass'])
    gulp.watch('./app/js/*.js').on('change', browserSync.reload);
    gulp.watch('./app/js/class/*.js').on('change', browserSync.reload);
    gulp.watch("./app/*.html").on('change', browserSync.reload);
})

/**
 * Gulp.
 * 
 * Gulp es lo que hace que esto funcione.
 * Puedes correr tasks en especifico en la consola de comandos.
 * Por ejemplo, para correr solo el modulo 'sass', escribes 'gulp sass'.
 * Si solo escribes gulp, por defecto, busca el modulo 'default'.
 * Cuando lo encuentra, le decimos que lo primero que hace, es correr el modulo 'sass' y luego 'watch'.
 * Es por eso que tenemos esos modulos, en ese orden, en el arreglo.
 */
gulp.task('default', ['sass','watch']);