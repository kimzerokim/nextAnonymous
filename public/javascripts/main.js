var pageWriteFunction = (function () {
    var card = {
        write: function (e) {
            e.preventDefault();

            var curForm = e.currentTarget.form,
                sendFormData = new FormData(curForm),
                appendTarget = document.getElementsByClassName('cardList')[0].childNodes[0].childNodes[0],
                url = "/card/add",
                request = new XMLHttpRequest();

            request.open("POST", url, true);
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    var res = JSON.parse(request.responseText),
                    // later, change String object to DOM Object
                        card = '<div class="col-md-6 col-md-offset-3 card"><div class="cardInfomation">' +
                            '<div class="cardNum"> No.' + res._id + '</div><div class="cardCommitTime"> 방금 </div>' +
                            '</div><div class="cardBody">' + res.body + '</div><div class="cardStatus">' +
                            '<div class="likeCount">은행 115개</div><div class="commitCount">댓글 0개</div></div>' +
                            '<div class="cardComment"><div class="commentList"></div>' +
                            '<form action="/card/' + res._id + '/comment/add" method="post" role="form" class="commentCommit">' +
                            '<input type="hidden" name="cardId" value="' + res._id + '"/><textarea rows="1" cols="20" type="text"' +
                            ' name="commentBody" class="commentBody"></textarea><button type="submit" ' +
                            'class="btn btn-lg btn-block commentButton"> 댓글</button></form></div></div>';
                    appendTarget.insertAdjacentHTML('afterbegin', card);
                }
            };
            //ajax가 동작하지 않더라도 request에서 formdata를 보내준다.
            request.send(sendFormData);
            //ajax 통신이 끝난 후 폼의 값을 초기화 해준다.
            //curForm[0] => textField
            curForm[0].value = "";

            comment.addEvent();
        },

        addEvent: function () {
            var writeArea = document.getElementById('postTextArea'),
                writeButton = document.getElementById('writeButton');
            writeArea.addEventListener("click", util.writeSectionExpand, true);
            //writeButton.addEventListener("click", card.write, true);
        }
    };

    var comment = {
        write: function (e) {
            e.preventDefault();

            var curForm = e.currentTarget.form,
                appendTarget = curForm.parentNode.firstChild,
                sendFormData = new FormData(curForm),
                cardId = curForm[0].value,
            //curForm[1] => card_id
                url = "/card/" + cardId + "/comment/add",
                request = new XMLHttpRequest();

            if (curForm[1].value === "") {
                return;
            }

            request.open("POST", url, true);
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    var res = JSON.parse(request.responseText),
                        commentFragment = document.createDocumentFragment(),
                        commentDiv = document.createElement('div'),
                        commentBody = document.createTextNode(res.commentBody);

                    commentDiv.className = "comment";
                    commentDiv.appendChild(commentBody);
                    commentFragment.appendChild(commentDiv);

                    appendTarget.appendChild(commentFragment);

                    // change commentCount

                    var likeCountPattern = /\d+/, // regExp that find all digits
                        likeSection = curForm.parentNode.parentNode.childNodes[2].childNodes[0],
                        likeCountText = likeSection.innerText,
                        likeCountNum = likeCountPattern.exec(likeCountText);
                    likeCountNum = Number(likeCountNum); // change String type result to Number type
                    likeCountNum++; // increase comment Number

                    (function () {
                        likeSection.innerHTML = "댓글 " + likeCountNum + "개";
                    })();

                }
            };

            request.send(sendFormData);
            //curForm[0] => textField
            curForm[1].value = "";
        },

        addEvent: function () {
            var commentSection = document.getElementsByClassName("commentBody"),
                commentButton = document.getElementsByClassName("commentButton"),
                commentNum = commentSection.length;

            for (var i = 0; i < commentNum; i++) {
                commentSection[i].addEventListener("click", util.writeSectionExpand, true);
                commentButton[i].addEventListener("click", comment.write, true);
            }
        }
    };

    var util = {
        writeSectionExpand: function (e) {
            var curTextArea = e.toElement;
            curTextArea.oninput = function () {
                curTextArea.style.height = "";
                curTextArea.style.height = Math.min(curTextArea.scrollHeight, 100) + "px";
            };
        }
    };

    return {
        cardEventAdd: card.addEvent,
        commentEventAdd: comment.addEvent
    };
})();

var pageFunction = (function () {
    var load = {
        cardNum: 0,
        isFirst: true,
//        checkNewCard: function () {
//            $.ajax({
//                type: "GET",
//                url: "/card/checkNewCard",
//                success: function (obj) {
//                    load.showButton(obj.data.length);
//                }
//            });
//        },
        showButton: function (number) {
            if (load.isFirst == true) {
                load.isFirst = false;
                load.cardNum = number;
            }
            else {
                if (load.cardNum != number) {
                    $("#newCardButton").css("display", "block");
                }
            }

        },
        hideButton: function () {
            $("#newCardButton").css("display", "none");
        },
        newCard: function () {
            window.location.reload();
            load.hideButton();
            window.location = "/card#newCardStart";
        },
        toMain: function () {
            window.location.reload();
            window.location = "/";
        }
    };

    var cardInfo = {
        showCardCommitTime: function () {
            var cardInfoDiv = $(".cardInfomation"),
                cardNum = cardInfoDiv.length,
                curTime = Date.now(),
                ms24Hour = 86400000;

            for (var i = 0; i < cardNum; i++) {
                var commitTime = cardInfoDiv[i].childNodes[1].innerText,
                    elapsedTime = (ms24Hour - (curTime - commitTime)) / 1000,
                    elapsedHours = Math.floor(((elapsedTime % 31536000) % 86400) / 3600),
                    elapsedMinutes = Math.floor((((elapsedTime % 31536000) % 86400) % 3600) / 60);

                //later, add color to Time
                cardInfoDiv[i].childNodes[1].innerHTML = "삭제까지 " + elapsedHours + "시간 " + elapsedMinutes + "분 남음";
                // if card's aging is over, auto delete item (execute at client)
                // now execute at server
//                if (elapsedHours <= 0 && elapsedMinutes <= 0) {
//                    var cardNo = cardInfoDiv[i].childNodes[0].innerText,
//                        cardNoCountPattern = /\d+/,
//                        card_id = cardNoCountPattern.exec(cardNo);
//
//                    cardInfo.deleteCard(card_id);
//                }
            }
        },

        deleteCard: function (card_id) {
            $.ajax({
                type: "POST",
                url: "/card/" + card_id + "/delete"
            });
        }
    };

    (function () {
        cardInfo.showCardCommitTime();
    })();

    return {
        checkNewCard: load.checkNewCard,
        hideButton: load.hideButton,
        newCard: load.newCard,
        toMain: load.toMain
    }
})();

(function () {
    pageWriteFunction.cardEventAdd();
    pageWriteFunction.commentEventAdd();

    //refresh every 30sec
    //setInterval(pageFunction.checkNewCard, 30000);
})();

var newCard = pageFunction.newCard;
var toMain = pageFunction.toMain;