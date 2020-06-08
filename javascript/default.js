(function (f) {
    s = document.createElement("script");
    s.src = "//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js";
    s.onload = function () {
        f(jQuery.noConflict(true))
    }
    document.body.appendChild(s);
}
)(function ($, undefined) {
    var scriptVersion = "script version 1.1.0";
    var duels = {
        nationwide: {
            title: '全国',
            winCount: 0,
            loseCount: 0
        },
        friendmatch: {
            title: '戦友',
            winCount: 0,
            loseCount: 0
        },
        giyuload: {
            title: '義勇',
            winCount: 0,
            loseCount: 0
        },
        event: {
            title: '統一',
            winCount: 0,
            loseCount: 0
        }
    };
    var yourPlayList = [];
    var yourPlayTotalDayCount = 0;

    // 結果表示boxを削除しておく
    $("#bookmarklet_result").remove();

    if (!confirm('集計を開始しますか？\n1~2分かかります、処理中はページを開いたままにしてください。\nまた、利用後はタブを閉じるようお願いします。')) {
        alert(`キャンセルしました\n${scriptVersion}`);
        return;
    }

    // 月毎に対象日を取得する
    $('#history').find('.title_calendar').each(function (e) {
        var h = {
            title: '',
            class: '',
            day_urls: [],
            duels: JSON.parse(JSON.stringify(duels)) // ディープコピーでduelsのテンプレートを設定、api内で詰め直す
        }
        // 2020年5月
        h['title'] = $(this).text();
        // calendar_202005 classの取得
        h['class'] = $(this).parent().parent().children(".calendar").attr("class").split(' ').pop();

        var play_days = $(this).parent().parent().children(".calendar").find('.play_day a');
        play_days.each(function () {
            // daily?y=2020&m=5&d=24
            h['day_urls'].push($(this).attr('href').replace(/^\.\//, ''));
            yourPlayTotalDayCount++;
        });

        yourPlayList.push(h);
    });

    function dispLoading() {
        var d = $.Deferred();
        setTimeout(function () {
            var msg = 'loading';
            var dispMsg = "<div class='bookmarklet_loading_msg'>" + msg + "</div>";

            if ($("#bookmarklet_loading").length == 0) {

                $("#wrap").append("<div id='bookmarklet_loading'>" + dispMsg + "</div>");

                var ua = navigator.userAgent;
                var width = $(window).width();
                var height = $(window).height();
                if ((ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0) && ua.indexOf('Mobile') > 0) {
                    // スマートフォン用処理
                    width = "200%";
                    height = "200%";
                } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
                    // タブレット用処理
                    width = "200%";
                    height = "200%";
                }
                $("#bookmarklet_loading").css({
                    "display": "table",
                    "width": width,
                    "height": height,
                    "position": "fixed",
                    "top": "0",
                    "left": "0",
                    "background-color": "#fff",
                    "opacity": "0.8",
                    "z-index": 2001
                });

                $("#bookmarklet_loading").find(".bookmarklet_loading_msg").css({
                    "display": "table-cell",
                    "text-align": "center",
                    "vertical-align": "middle",
                    "padding-top": "140px",
                    "background": "url('https://chibicco.github.io/3594_bookmarklet/image/gif-load.gif') center center no-repeat"
                });
            }
            d.resolve();
        }, 10);
        return d.promise();
    }

    function updateLoading(nowCount, maxCount) {
        var d = $.Deferred();
        setTimeout(function () {
            if ($("#bookmarklet_loading").length > 0) {
                var per = (nowCount / maxCount * 100).toFixed(0);
                $("#bookmarklet_loading").find(".bookmarklet_loading_msg").text(`loading ${per}%`);
            }
            d.resolve();
        }, 20);
        return d.promise();
    }

    function removeLoading() {
        var d = $.Deferred();
        setTimeout(function () {
            $("#bookmarklet_loading").remove();
            d.resolve();
        }, 500);
        return d.promise();
    }

    function wait(msec) {
        var d = new $.Deferred();
        setTimeout(function () {
            d.resolve(msec);
        }, msec);
        return d.promise();
    }

    function api(day, playListNumber) {
        var d = new $.Deferred();
        $.ajax({
            url: "https://3594t.net/members/history/" + day,
        }).done(function (data, status, xhr) {
            var errorText = $(data).find('#container p').text();

            if (errorText == "短時間に多数のアクセスがあった為、一時的にご利用を制限しております。しばらくお待ちください。") {
                return d.reject('短時間に多数のアクセスがあった為、一時的にご利用を制限しております。しばらくお待ちください。');
            } else if (errorText == "不明なエラーが発生しました。") {
                return d.reject('不明なエラーが発生しました。');
            }

            for (key in duels) {
                var winCount = $(data).find(`.top_data_${key}record .data_count_win`).text();
                var loseCount = $(data).find(`.top_data_${key}record .data_count_lose`).text();

                if (winCount.length == 0 || loseCount.length == 0) {
                    return d.reject('項目の取得に失敗しました、しばらくしてからご利用ください。');
                }
                yourPlayList[playListNumber]['duels'][key]['winCount'] += +(winCount);
                yourPlayList[playListNumber]['duels'][key]['loseCount'] += +(loseCount);
            }
            d.resolve(data);
        }).fail(function (data) {
            return d.reject("取得に失敗しました、しばらくしてからご利用ください。");
        });
        return d.promise();
    }

    var execute = $.Deferred();
    var deferred = execute.then(function () {
        dispLoading()
    });

    var yourPlayTotalDayCountNumerator = 0;
    for (var y = 0; y < yourPlayList.length; y++) {
        var days = yourPlayList[y]['day_urls'];
        for (var i = 0; i < days.length; i++) {
            deferred = deferred.then(function (days, i, y) {
                return function () {
                    yourPlayTotalDayCountNumerator++;
                    return $.when(api(days[i], y), updateLoading(yourPlayTotalDayCountNumerator, yourPlayTotalDayCount), wait(2500));
                }
            }(days, i, y)).done(function (data, b) {
                console.log($(data).find('h2').text());
            });
        }
    }

    deferred.always(function () {
        removeLoading();
    }).done(function () {
        // トータルの戦績
        var prepend_text = "総合戦績<br>";
        for (key in duels) {
            var winCount = 0;
            var loseCount = 0;
            var title = '';
            var win_per = 0;
            for (i in yourPlayList) {
                winCount += yourPlayList[i]['duels'][key]['winCount'];
                loseCount += yourPlayList[i]['duels'][key]['loseCount'];
            }
            title = yourPlayList[i]['duels'][key]['title'];
            win_per = winCount / (winCount + loseCount) * 100;
            prepend_text += `${title} 勝ち:${winCount} 負け:${loseCount} 勝率:${win_per.toFixed(1)}<br>`;
        }

        // 月毎の戦績
        for (i in yourPlayList) {
            prepend_text += `${yourPlayList[i]['title']}<br>`;
            for (key in duels) {
                var winCount = 0;
                var loseCount = 0;
                var title = '';
                var win_per = 0;
                winCount += yourPlayList[i]['duels'][key]['winCount'];
                loseCount += yourPlayList[i]['duels'][key]['loseCount'];
                title = yourPlayList[i]['duels'][key]['title'];
                win_per = winCount / (winCount + loseCount) * 100;
                prepend_text += `${title} 勝ち:${winCount} 負け:${loseCount} 勝率:${win_per.toFixed(1)}<br>`;
            }
        }

        $("#container").prepend("<div id='bookmarklet_result' class='frame01'>" + prepend_text + "<br></div>").css({ 'color': 'white' });
        alert("正常に終了しました。\nこのポップアップを閉じたあと、画面上部に表示されています。");
    }).fail(function (e) {
        console.log(e);
        alert(e);
    });

    execute.resolve();
});
