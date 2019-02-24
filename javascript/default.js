(function(f, s) {
        var dispLoading = function(msg) {
            if (msg == undefined) {
                msg = "";
            }

            var dispMsg = "<div class='bookmarklet_loading_msg'>" + msg + "</div>";
            if ($("#bookmarklet_loading").length == 0) {
                console.log($("#bookmarklet_loading"));
                $("body").find('#wrap').append("<div id='bookmarklet_loading'>" + dispMsg + "</div>");

                $("#bookmarklet_loading").css({
                    "display": "table",
                    "width": "100%",
                    "height": "100%",
                    "position": "fixed",
                    "top": "0",
                    "left": "0",
                    "background-color": "#fff",
                    "opacity": "0.8"
                });

                $("#bookmarklet_loading").find(".bookmarklet_loading_msg").css({
                    "display": "table-cell",
                    "text-align": "center",
                    "vertical-align": "middle",
                    "padding-top": "140px",
                    "background": "url('https://chibicco.github.io/3594_bookmarklet/image/gif-load.gif') center center no-repeat"
                });
            }
        }

        s = document.createElement("script");
        s.src = "//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js";
        s.onload = function() {
            f(jQuery.noConflict(true))
        }
        ;
        document.body.appendChild(s);

        dispLoading("集計中<br>1~2分かかります、そのままお待ちください");
    }
)(function($) {
    try {
        var removeLoading = function() {
            var s = $("#bookmarklet_loading").remove();
        }

        var sleep = function(waitMsec) {
            var startMsec = new Date();
            while (new Date() - startMsec < waitMsec)
                ;
        }

        var alert_text = "";
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

        var links = [];
        var days = $("[class^='calendar calendar_']").find('.play_day a');
        days.each(function() {
            links.push($(this).attr('href').replace(/\/$/, ''));
        });
        links.forEach(function(hr) {
            console.log(hr);
            sleep(200);
            var day_url = location.href + hr;
            var day_html = $.ajax({
                url: day_url,
                async: false,
                dataType: 'html',
            }).success(function(data, status, xhr) {
                if (xhr.status === 200) {
                    var error_text = $(data).find('#container p').text();

                    if (error_text == "短時間に多数のアクセスがあった為、一時的にご利用を制限しております。しばらくお待ちください。") {
                        throw new Error('短時間に多数のアクセスがあった為、一時的にご利用を制限しております。しばらくお待ちください。');
                    } else if (error_text == "不明なエラーが発生しました。") {
                        throw new Error('短時間に多数のアクセスがあった為、一時的にご利用を制限しております。しばらくお待ちください。');
                    }

                    for (key in duels) {
                        duels[key]['win_count'] += +($(data).find(`.top_data_${key}record .data_count_win`).text());
                        duels[key]['lose_count'] += +($(data).find(`.top_data_${key}record .data_count_lose`).text());
                    }
                } else {
                    throw new Error('アクセス制限中です、しばらくしてからご利用ください');
                }
            }).error(function(data, status, xhr) {
                throw new Error('アクセス制限中です、しばらくしてからご利用ください');
            });
        });

        for (key in duels) {
            var win_count = duels[key]['win_count'];
            var lose_count = duels[key]['lose_count'];
            var title = duels[key]['title'];
            var win_per = win_count / (win_count + lose_count);
            alert_text += `${title} 勝ち:${win_count} 負け:${lose_count} 勝率:${win_per.toFixed(3)}\n`;
        }

        removeLoading();

        alert(alert_text);
    } catch (e) {
        console.log(e.message);
        alert(e.message);
    }
});
