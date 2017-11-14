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
            },
            password: {
                required: true
            }
        },
        messages: {
            email: {
                required: 'Debes introducir este campo.',
                pattern: 'Por favor, introduce un correo electrónico válido.'
            },
            password: 'Este campo es necesario.'
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
            password: {
                required: true,
                pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/
            },
            confirmPassword: {
                required: true,
                equalTo: '#txtPassword'
            },
            username: {
                required: true,
                pattern: /^[a-zA-Z0-9_-\s]+$/
            },
            day: {
                required: true,
                number: true,
                maxlength: 2,
                minlength: 2
            },
            month: {
                required: true
            },
            year: {
                required: true,
                number: true,
                maxlength: 4,
                minlength: 4
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
            password: 'Este campo es necesario.'
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