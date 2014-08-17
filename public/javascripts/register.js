var formMethod = (function () {
    var idField = document.getElementsByClassName('form-control')[0],
        psField = document.getElementsByClassName('form-control')[1],
        psReField = document.getElementsByClassName('form-control')[2],
        button = document.getElementsByClassName('signUp')[0];

    var validPassword = function () {
        if (psReField.value !== psField.value) {
            button.style.backgroundColor = "#f67373";
            button.style.borderColor = "#f67373";
            psReField.type = "text";
            psReField.value = "비밀번호를 다시 입력해주세요";
            psReField.color = "#999C9F";
        }
        else {
            button.style.backgroundColor = "#428BCA";
            button.style.borderColor = "#428BCA";
        }
    };

    var resetPsField = function () {
        psReField.type = "password";
        psReField.value = "";
    };

    var validId = function() {
        var userId = idField.value;
    };

    return {
        validPassword: validPassword,
        validId: validId,
        resetPassword: resetPsField
    };
}());

var pageWriteFunction = (function () {
    var util = {
        toMain: function () {
            window.location.reload();
            window.location = "/";
        }
    };

    return {
        toMain: util.toMain
    }
})();

var toMain = pageWriteFunction.toMain;
var validId = formMethod.validId;
var validPassword = formMethod.validPassword;
var resetPassword = formMethod.resetPassword;