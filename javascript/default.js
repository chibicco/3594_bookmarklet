(function(f, s) {
        s = document.createElement("script");
        s.src = "//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js";
        s.onload = function() {
            f(jQuery.noConflict(true))
        }
        ;
        document.body.appendChild(s)
    }
)(function($) {
    try {
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
            sleep(100);
            var day_url = location.href + hr;
            var day_html = $.ajax({
                url: day_url,
                async: false,
                dataType: 'html',
            }).done(function(data) {
                for (key in duels) {
                    duels[key]['win_count'] += +($(data).find(`.top_data_${key}record .data_count_win`).text());
                    duels[key]['lose_count'] += +($(data).find(`.top_data_${key}record .data_count_lose`).text());
                }
            });
        });

        for (key in duels) {
            var win_count = duels[key]['win_count'];
            var lose_count = duels[key]['lose_count'];
            var title = duels[key]['title'];
            var win_per = win_count / (win_count + lose_count);
            alert_text += `${title} 勝ち:${win_count} 負け:${lose_count} 勝率:${win_per.toFixed(3)}\n`;
        }

        alert(alert_text);
    } catch (e) {
        console.log(e.message);
        alert("Error");
    }
});
