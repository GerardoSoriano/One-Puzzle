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
    FB.api('/me', {fields: 'email, gender, name, age_range'}, function(response) {
        console.log(response);
    });
}