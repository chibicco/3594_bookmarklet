(function (f) {
    s = document.createElement("script");
    s.src = "//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js";
    s.onload = function () {
        f(jQuery.noConflict(true))
    }
    document.body.appendChild(s);
}
)(function ($, undefined) {
    var script_version = "script version 1.1.0"

    if (!confirm('集計を開始しますか？\n1~2分かかります、処理中はページを開いたままにしてください。\nまた、利用後はタブを閉じるようお願いします。')) {
        alert(`キャンセルしました\n${script_version}`);
        return;
    }

    var duels = {
        nationwide: {
            title: '全国',
            win_count: 0,
            lose_count: 0
        },
        friendmatch: {
            title: '戦友',
            win_count: 0,
            lose_count: 0
        },
        giyuload: {
            title: '義勇',
            win_count: 0,
            lose_count: 0
        },
        event: {
            title: '統一',
            win_count: 0,
            lose_count: 0
        }
    }

    var error_msg = "";
    var days = [];

    function setDays() {
        var d = $("[class^='calendar calendar_']").find('.play_day a');
        d.each(function () {
            days.push($(this).attr('href').replace(/^\.\//, ''));
        });
    }
    setDays();

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

    function updateLoading(now_count, max_count) {
        var d = $.Deferred();
        setTimeout(function () {
            if ($("#bookmarklet_loading").length > 0) {
                var per = (now_count / max_count * 100).toFixed(0);
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

    function api(day) {
        var d = new $.Deferred();
        $.ajax({
            url: "https://3594t.net/members/history/" + day,
        }).done(function (data, status, xhr) {
            var error_text = $(data).find('#container p').text();

            if (error_text == "短時間に多数のアクセスがあった為、一時的にご利用を制限しております。しばらくお待ちください。") {
                return d.reject('短時間に多数のアクセスがあった為、一時的にご利用を制限しております。しばらくお待ちください。');
            } else if (error_text == "不明なエラーが発生しました。") {
                return d.reject('不明なエラーが発生しました。');
            }

            for (key in duels) {
                var win_count = $(data).find(`.top_data_${key}record .data_count_win`).text();
                var lose_count = $(data).find(`.top_data_${key}record .data_count_lose`).text();

                if (win_count.length == 0 || lose_count.length == 0) {
                    return d.reject('項目の取得に失敗しました、しばらくしてからご利用ください。');
                }

                duels[key]['win_count'] += +(win_count);
                duels[key]['lose_count'] += +(lose_count);
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
    for (var i = 0; i < days.length; i++) {
        deferred = deferred.then(function (i) {
            return function () {
                return $.when(api(days[i]), updateLoading(i + 1, days.length), wait(2500));
            }
        }(i)).done(function (data, b) {
            console.log($(data).find('h2').text());
        });
    }

    deferred.always(function () {
        removeLoading();
    }).done(function () {
        var alert_text = "";
        for (key in duels) {
            var win_count = duels[key]['win_count'];
            var lose_count = duels[key]['lose_count'];
            var title = duels[key]['title'];
            var win_per = win_count / (win_count + lose_count) * 100;
            alert_text += `${title} 勝ち:${win_count} 負け:${lose_count} 勝率:${win_per.toFixed(1)}\n`;
        }
        alert(alert_text);
    }).fail(function (e) {
        console.log(e);
        alert(e);
    });

    execute.resolve();
});
