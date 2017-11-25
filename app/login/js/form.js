$(document).ready(function () {

    $('#login').submit((e) => {
        e.preventDefault();
    }).validate({
        validClass: 'is-valid',
        errorClass: 'is-invalid text-danger',
        errorElement: 'small',
        rules: {
            email: {
                required: true,
                pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            }
        },
        messages: {
            email: {
                required: 'Debes introducir este campo.',
                pattern: 'Por favor, introduce un correo electrónico válido.'
            }
        },
        invalidHandler: function (event, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                var message = errors == 1 ?
                    'Tienes un campo que no cumple con lo requerido' :
                    'Tienes ' + errors + ' campos que no cumplen con lo requerido';
                alert(message);
            }
        },
        submitHandler: function (form) {
            let json = formToObject(form, '.json');
            let username = json.email.split('@')[0];
            
            database.ref('user/' + username).once('value').then(function(snap){
                if(snap.val() !== null && snap.val() !== undefined){
                    window.location.replace('../game');
                }else{
                    alert('Por favor, registrate')
                }
            })

            console.log(json);
        }
    })

    $('#register').submit((e) => {
        e.preventDefault();
    }).validate({
        validClass: 'is-valid',
        errorClass: 'is-invalid text-danger',
        errorElement: 'small',
        rules: {
            email: {
                required: true,
                pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            },
            username: {
                required: true,
                pattern: /^[a-zA-Z0-9_-\s]+$/
            },
            gender: {
                required: true
            }
        },
        messages: {
            email: {
                required: 'Debes introducir este campo.',
                pattern: 'Por favor, introduce un correo electrónico válido.'
            },
        },
        invalidHandler: function (event, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                var message = errors == 1 ?
                    'Tienes un campo que no cumple con lo requerido' :
                    'Tienes ' + errors + ' campos que no cumplen con lo requerido';
                alert(message);
            }
        },
        submitHandler: function (form) {
            let json = formToObject(form, '.json');
            json.picture = {};
            json.picture.data = {};
            json.picture.data.url = null;
            json.first_name = null;
            json.last_name = null;
            registerUser(json);
            window.location.replace('../game');

            console.log(json);
        }
    })

})

function formToObject(form, common) {
    let json = {};

    $(form)
        .find(common)
        .each((index, object) => {
            let key = $(object).attr('name');
            let value = undefined;

            switch($(object).attr('type')){
                case 'checkbox':
                    value = $(object).is(':checked');
                    break;
                case 'radio':
                    value = $('input[name=' + object.attributes.name.value + ']').filter(':checked').val();
                    break;
                default:
                    value = $(object).val();
                    break;
            }

            json[key] = value;
        })

    return json;
}