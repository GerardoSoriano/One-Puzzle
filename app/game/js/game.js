/**
 * Creamos nuestras variables globales.
 * 
 * Esto es la parte principal de nuestro juego.
 * Esta parte sería el equivalente al WinApi con OpenGL.
 * Simplemente es donde se incializan las cosas, creas eventos, etc.
 */
var gh = new GraphicsHelper();

$(document).ready(function () {

    /**
     * Binding de eventos.
     * 
     * Aquí es donde creamos nuestros eventos principales.
     * En este caso tenemos tres:
     *  -Mousemove (se activa cuando el mouse cambia de posición en el navegador)
     *  -Resize (se activa cuando el tamaño del navegador cambia)
     *  -Click (se actviva cuando se da clic con el mouse)
     * Es recomendable inicializar mas eventos en esta parte.
     * Los parametros que llevan son:
     *  (nombreDelEvento, callback, unaMadreQueNoOcupas)
     */
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false)
    window.addEventListener('click', onClick, false)

    /**
     * Inicializamos Three.js
     * 
     * Mandamos a llamar a la función init.
     * El parametro que toma es un selector, que es donde se va a desplegar el render.
     * Recuerda:
     *  -'.' se utiliza para clases
     *  -'#' se utiliza para id
     */
    gh.init('#content');

    /**
     * Loop infinito.
     * 
     * Esta es la parte del loop.
     * La función requestAnimationFrame es solamente una llamada de vuelta a la función que le pases.
     * En este caso, si le pasamos animate, crea un loop infinito.
     * Por ultimo se hace una llamada al loop de mi clase GraphicsHelper.js
     * 
     * NOTA:
     *  -requestAnimationFrame es una función que a viene integrada en Three.js, no la creamos nosotros.
     */
    var animate = function () {
        requestAnimationFrame(animate);
        gh.loop();
    };

    animate();
})

/**
 * Callbacks de eventos. 
 */
var onMouseMove = function(e){
    gh.onMouseMove(e);
}
var onWindowResize = function(e){
    gh.onWindowResize(e)
}
var onClick = function(e){
    gh.onClick(e);
}