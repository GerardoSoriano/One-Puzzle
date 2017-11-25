var gh = new GraphicsHelper();
var timerUpdate = null;
var animate = null;
var animateController = null;

$(document).ready(function () {
    if (localStorage.getItem('facebook:user:id') === null) {
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

    $('input#rngAudio').on('change', function () {
        gh.waterSound.setVolume($(this).val())
    })
    $('input#rngBrightness').on('change', function () {
        $('div#content > canvas')
            .css('opacity', $(this).val())
            .css('z-index', -1)
    })
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
        $('#score').text(totalScore).attr('time', timeScore.remainTime);
    }
}

function hideAllMenus() {
    let menu = $('#menu'),
        pause = $('#pause'),
        tutorial = $('#tutorial'),
        settings = $('#settings'),
        statistics = $('#statistics'),
        lose = $('#lose'),
        win = $('#win')

    if (!menu.hasClass('d-none'))
        menu.addClass('d-none');
    if (!pause.hasClass('d-none'))
        pause.addClass('d-none');
    if (!tutorial.hasClass('d-none'))
        tutorial.addClass('d-none');
    if (!settings.hasClass('d-none'))
        settings.addClass('d-none');
    if (!statistics.hasClass('d-none'))
        statistics.addClass('d-none');
    if (!lose.hasClass('d-none'))
        lose.addClass('d-none');
    if (!win.hasClass('d-none'))
        win.addClass('d-none');
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
            hideAllMenus();
            $('#pause').removeClass('d-none');
            clearInterval(timerUpdate);
            cancelAnimationFrame(animateController);
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

    $('#background').toggleClass('d-none');
    hideAllMenus();

    gh.waterSound.play();
    requestAnimationFrame(animate)
}

function onBtnTutorialClick() {

}

function onBtnSettingsClick(from) {
    hideAllMenus();
    $('#settings')
        .removeClass('d-none')
        .attr('from', from);
}

function onBtnStatisticsClick() {
    hideAllMenus();
    $('#statistics').removeClass('d-none')
}

function onBtnBackClick() {
    let from = $('#settings').attr('from')

    hideAllMenus();

    if (from == 'menu')
        $('#menu').removeClass('d-none');
    if (from == 'pause')
        $('#pause').removeClass('d-none');
}

function onBtnApplyClick() {
    console.log($('input#rngBrightness').val())
}


function onBtnContinueClick() {
    var start = $('#timer').text();
    start = start.split(":");
    startCountdown(start)

    hideAllMenus();

    requestAnimationFrame(animate)
}

function onBtnShareClick() {
    let totalScore = $('#score').text();
    let timeScore = $('#score').attr('time');
    let username = $('#username').text();

    FB.getLoginStatus((response) => {
        if (response.status == 'connected') {
            FB.ui({
                method: 'share',
                href: 'www.onepuzzle.net',
                quote: 'Mi record fue de ' + totalScore +  ', ¿cuál es el tuyo?'
            }, function (response) {
                let newScore = database.ref().child('game').push();
                newScore.set({
                    score: totalScore,
                    time: timeScore,
                    user: username
                })
            });
        } else {
            FB.login((response) => {
                if (response.status === 'connected') {
                    FB.ui({
                        method: 'share',
                        href: 'https://developers.facebook.com/docs/',
                        quote: 'Mi record fue de ' + totalScore +  ', ¿cuál es el tuyo?'
                    }, function (response) {
                        let newScore = database.ref('game/').push().key;
                        newScore.set({
                            score: totalScore,
                            time: timeScore,
                            user: username
                        })
                    });
                } else {
                    console.log(response);
                }
            }, {
                scope: 'public_profile, email'
            })
        }
    })
}
//#endregion