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

        checkLoginStatus();
    })
});


function checkLoginStatus(){
    FB.getLoginStatus((response) => {
        if(response.status == 'connected'){
            isConnected(response);
        }else{
            window.location.replace('../login/login.html');
        }
    })
}


function isConnected(response){
    let user_id = response.authResponse.userID;
    let access_token = response.authResponse.accessToken;
    if(user_id != undefined && access_token != undefined){
        FB.api('/'+user_id+'?access_token='+access_token, {fields: 'email'}, function(response){
            let username = response.email.split('@')[0];
            response.username = username;
    
            database.ref('user/' + username).once('value').then(function(snap){
                $('#username').text(username)
                $('#picture').attr('src',snap.val().img);
            })
        })
    }
}