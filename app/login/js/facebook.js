$(document).ready(function () {
    $.ajaxSetup({
        cache: true
    });
    $.getScript('//connect.facebook.net/es_LA/sdk.js', function () {
        FB.init({
            appId       : '1970695686503409',
            cookie      : true,
            xfbml       : true,
            version     : 'v2.7' // or v2.1, v2.2, v2.3, ...
        });
        $('#facebook').removeAttr('disabled')
    })
});

function checkLoginStatus(){
    FB.getLoginStatus((response) => {
        if(response.status == 'connected'){
            isConnected(response);
        }else{
            FB.login((response) => {
                if (response.status === 'connected') {
                    isConnected(response);
                } else {
                    console.log(response);
                }
            }, {scope: 'public_profile, email'})
        }
    })
}

function isConnected(response){
    FB.api('/me', {fields: 'email, gender, name, age_range, first_name, last_name, picture'}, function(response) {
        let username = response.email.split('@')[0];
        response.username = username;

        //checamos si existe el username en la base de datos
        database.ref('user/' + username).once('value').then(function(snap){
            if(snap.val() !== null && snap.val() !== undefined){
                window.location.replace('../game');
            }else{
                registerUser(response);
                window.location.replace('../game');
            }
        })
    });
}

function registerUser(user){
    database.ref('user/' + user.username).set({
        email: user.email,
        firstName: user.first_name,
        gender: user.gender,
        img: user.picture.data.url,
        lastName: user.last_name
    })
}