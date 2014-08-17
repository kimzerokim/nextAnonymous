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