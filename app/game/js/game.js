var gh = new GraphicsHelper();

$(document).ready(function () {

    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false)
    window.addEventListener('click', onClick, false)

    gh.init('#content');

    var animate = function () {
        requestAnimationFrame(animate);
        gh.loop();
    };

    animate();
})

//#region Métodos
function startCountdown(){
    let limit = new Date();
    limit.setMinutes(limit.getMinutes() + 10);

    let timerUpdate = setInterval(() => {
        let time = getRemainTime(limit.toString());
        let format = `${time.remainMinutes}:${time.remainSeconds}`;

        $('#timer')
            .text(format)
            .toggleClass('text-warning', time.remainMinutes < 5)
            .toggleClass('text-danger', time.remainMinutes < 1)

        if(time.remainTime <= 1){
          clearInterval(timerUpdate);

          $('#lose')
            .removeClass('d-none')
            .addClass('d-flex');
        }
    }, 1000)
}
function getRemainTime(deadline){
    let now = new Date(),
        remainTime = ((new Date(deadline)).valueOf() - now.valueOf() + 1000) / 1000,
        remainSeconds = ('0' + Math.floor(remainTime % 60)).slice(-2),
        remainMinutes = ('0' + Math.floor(remainTime / 60 % 60)).slice(-2),
        remainHours = ('0' + Math.floor(remainTime / 3600 % 24)).slice(-2),
        remainDays = Math.floor(remainTime / (3600 * 24));

    return {
        remainTime,
        remainSeconds,
        remainMinutes,
        remainHours,
        remainDays
    }
}
//#endregion

//#region Eventos
function onMouseMove(e){
    gh.onMouseMove(e);
}
function onWindowResize(e){
    gh.onWindowResize(e);
}
function onClick(e){
    gh.onClick(e);
}
function onBtnPlayClick(){
    
}
function onBtnTutorialClick(){

}
function onBtnSettingsClick(){
    
}
function onBtnStatisticsClick(){
        
}
//#endregion