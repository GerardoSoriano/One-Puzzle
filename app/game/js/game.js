var gh = new GraphicsHelper();
var timerUpdate = null;
var animate = null;
var animateController = null;

$(document).ready(function () {
    if(localStorage.getItem('facebook:user:id') === null){
        window.location.replace('../login/login.html')
    }

    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false)
    window.addEventListener('click', onClick, false)
    window.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('keyup', onKeyUp, false)

    gh.init('#content');
    let isWinner = false;

    animate = function () {
        animateController = requestAnimationFrame(animate);
        gh.loop();
        isWinner = gh.win;

        if (isWinner) {
            displayWinnerScreen();
        }
    };
})

//#region Métodos
function startCountdown(start) {
    let limit = new Date();
    limit.setMinutes(limit.getMinutes() + parseInt(start[0]));
    limit.setSeconds(limit.getSeconds() + parseInt(start[1]));

    timerUpdate = setInterval(() => {
        let time = getRemainTime(limit.toString());
        let format = `${time.remainMinutes}:${time.remainSeconds}`;

        $('#timer')
            .text(format)
            .toggleClass('text-warning', time.remainMinutes < 5)
            .toggleClass('text-danger', time.remainMinutes < 1)

        if (time.remainTime <= 1) {
            clearInterval(timerUpdate);

            $('#lose')
                .removeClass('d-none')
                .addClass('d-flex');
        }
    }, 1000)
}

function getRemainTime(deadline) {
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

function displayWinnerScreen() {
    let winnerScreen = $('#win');

    if (winnerScreen.hasClass('d-none')) {
        clearInterval(timerUpdate);
        winnerScreen.removeClass('d-none').addClass('d-flex');
        cancelAnimationFrame(animateController);

        let timer = $('#timer').text();
        timer = timer.split(':');
        let totalTime = new Date();
        totalTime.setMinutes(totalTime.getMinutes() + parseInt(timer[0]));
        totalTime.setSeconds(totalTime.getSeconds() + parseInt(timer[1]));
        let timeScore = getRemainTime(totalTime.toString());

        let clickScore = gh.clickCount;

        let totalScore = ((timeScore.remainTime - clickScore) < 0) ? 1000 : (timeScore.remainTime - clickScore) * 1000;
        $('#score').text(totalScore);
    }
}
//#endregion

//#region Eventos
function onMouseMove(e) {
    gh.onMouseMove(e);
}

function onWindowResize(e) {
    gh.onWindowResize(e);
}

function onClick(e) {
    gh.onClick(e);
}

function onKeyDown(e) {
    switch (e.which) {
        case 32:
            displayWinnerScreen();
            break;
        case 80:
            let pause = $('#pause');
            if (pause.hasClass('d-none')) {
                clearInterval(timerUpdate);
                pause.removeClass('d-none');
                cancelAnimationFrame(animateController);
            }
            break;
    }
    gh.onKeyDown(e);
}

function onKeyUp(e) {
    gh.onKeyUp(e);
}

function onBtnPlayClick() {
    var start = $('#timer').text();
    start = start.split(":");
    startCountdown(start)
    $('#menu').toggleClass('d-none');
    requestAnimationFrame(animate)
}

function onBtnTutorialClick() {

}

function onBtnSettingsClick() {
    $('#buttons').toggleClass('d-none');
    $('#settings').toggleClass('d-none');
}

function onBtnStatisticsClick() {
    $('#buttons').toggleClass('d-none');
    $('#statistics').toggleClass('d-none');
}

function onBtnContinueClick() {
    var start = $('#timer').text();
    start = start.split(":");
    startCountdown(start)
    $('#pause').toggleClass('d-none');
    requestAnimationFrame(animate)
}

function onBtnBackClick() {
    $('#buttons').toggleClass('d-none');
    if (!$('#settings').hasClass('d-none')) {
        $('#settings').addClass('d-none');
    }
    if (!$('#statistics').hasClass('d-none')) {
        $('#statistics').addClass('d-none');
    }
}

function onBtnShareClick() {
    
}
//#endregion