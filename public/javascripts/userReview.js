var pageWriteFunction = (function () {
    var textAreaFunc = {
        addEvent: function () {
            $("#reviewTextArea").click(util.writeSectionExpand);
        }
    };

    var util = {
        writeSectionExpand: function (e) {
            console.log(e);
            var curTextArea = e.toElement;
            curTextArea.oninput = function () {
                curTextArea.style.height = "";
                curTextArea.style.height = Math.min(curTextArea.scrollHeight, 200) + "px";
            };
        },

        toMain : function () {
            window.location.reload();
            window.location = "/";
        }
    };

    return {
        addEvent : textAreaFunc.addEvent,
        toMain : util.toMain
    }
})();

(function() {
    pageWriteFunction.addEvent();
})();

var toMain = pageWriteFunction.toMain;

