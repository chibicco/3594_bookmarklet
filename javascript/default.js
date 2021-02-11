(function (f) {
    s = document.createElement("script");
    s.src = "//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js";
    s.onload = function () {
        f(jQuery.noConflict(true))
    }
    document.body.appendChild(s);
}
)(function ($) {
    if (!confirm('集計を開始しますか？\n1~2分かかります、処理中はページを開いたままにしてください。\nまた、利用後はタブを閉じるようお願いします。')) {
        alert('キャンセルしました、ScriptVersion: 3.5.0A');
        return;
    }
    class ComprehensiveRecord {
        constructor() {
            this.data = [];
        }

        add(monthlyRecord) {
            this.data.push(monthlyRecord);
        }

        totalAggregateByTitle() {
            let _totalAggregateByTitleData = {};

            for (let [_, monthlyRecord] of Object.entries(this.data)) {
                for (let [title, value] of Object.entries(monthlyRecord.aggregateByTitle())) {
                    if (!_totalAggregateByTitleData[title]) { _totalAggregateByTitleData[title] = {} }
                    for (let [issue, count] of Object.entries(value)) {
                        if (!_totalAggregateByTitleData[title][issue]) { _totalAggregateByTitleData[title][issue] = 0 }
                        _totalAggregateByTitleData[title][issue] += count;
                    }
                }
            }

            return _totalAggregateByTitleData;
        }
    }
    class MonthlyRecord {
        // title_calendar: 2021年1月, 2021年2月
        constructor(title_calendar) {
            this.title_calendar = title_calendar;
            this.winCount = 0;
            this.loseCount = 0;
            this.drawCount = 0;
            this.totalCount = 0;
            this.data = [];
        }

        append(battleListRecord) {
            this.data.push(battleListRecord);
        }

        // {
        //      daily?y=2021&m=2&d=1:
        //          { 全国対戦戦績:
        //              { winCount: 4, loseCount: 2, drawCount: 0, totalCount: 6} }
        //          { 戦友対戦戦績:
        //              { winCount: 1, loseCount: 1, drawCount: 0, totalCount: 2} }
        // }
        getDailies() {
            let _getDailiesData = {};

            for (let [_k, battleListRecord] of Object.entries(this.data)) {
                for (let [daily, data] of Object.entries(battleListRecord.data)) {
                    _getDailiesData[daily] = data;
                    for (let [title, value] of Object.entries(data)) {
                    }
                }
            }

            return _getDailiesData;
        }

        aggregateByTitle() {
            let _aggregateByTitleData = {};

            for (let [_daily, data] of Object.entries(this.getDailies())) {
                for (let [title, value] of Object.entries(data)) {
                    if (!_aggregateByTitleData[title]) { _aggregateByTitleData[title] = {} }
                    for (let [issue, count] of Object.entries(value)) {
                        if (!_aggregateByTitleData[title][issue]) { _aggregateByTitleData[title][issue] = 0 }
                        _aggregateByTitleData[title][issue] += count;
                    }
                }
            }

            return _aggregateByTitleData;
        }
    }
    class BattleListRecord {
        // daily: daily?y=2021&m=2&d=1
        constructor(daily) {
            this.daily = daily;
            this.data = {};
        }

        append(lineRecordBlock) {
            let r = lineRecordBlock;

            if (!this.data[this.daily]) { this.data[this.daily] = {}; }
            if (!this.data[this.daily][r.title]) { this.data[this.daily][r.title] = {}; }

            this.data[this.daily][r.title] = {
                winCount: r.winCount,
                loseCount: r.loseCount,
                drawCount: r.drawCount,
                totalCount: r.totalCount,
            }
        }
    }
    class LineRecordBlock {
        // title: 全国対戦戦績, 戦友対戦戦績, 武練の章戦績, 義勇ロード戦績, 店内対戦戦績
        constructor(title) {
            this.title = title;
            this.winCount = 0;
            this.loseCount = 0;
            this.drawCount = 0;
            this.totalCount = 0;
        }

        setCountByAlt(alt, count) {
            if (alt == '勝') {
                this.winCount = Number(count);
            } else if (alt == '敗') {
                this.loseCount = Number(count);
            } else if (alt == '分') {
                this.drawCount = Number(count);
            } else if (alt == '戦') {
                this.totalCount = Number(count);
            }
        }
    }
    class ResultHtml {
        constructor(comprehensiveRecord) {
            this.comprehensive = comprehensiveRecord;
        }

        generate() {
            return this.totalBattleHtml() + this.monthsBattleHtml();
        }

        totalBattleHtml() {
            let innerHtml = '<div class="frame01"><div class="frame01_top"></div><div class="title2">総合戦績</div><div class="statistics_data">';
            innerHtml += '<table class="statistics_ability_table">'
            innerHtml += '<tbody><tr><th>種別</th><th>勝ち/負け</th><th>勝率</th></tr>'

            for (let [title, value] of Object.entries(this.comprehensive.totalAggregateByTitle())) {
                var calc = new VCalc(value);
                innerHtml += `<tr><td>${title}</td><td>${calc.winCount}/${calc.loseCount}</td><td>${calc.winPer()}</td></tr>`;
            }

            innerHtml += '</table>'
            innerHtml += '</div><div class="frame01_bottom"></div></div>'

            return innerHtml;
        }

        monthsBattleHtml() {
            let innerHtml = '';

            for (let [_, monthlyRecord] of Object.entries(this.comprehensive.data)) {
                innerHtml += `<div class="frame01"><div class="frame01_top"></div><div class="title2">${monthlyRecord.title_calendar}</div><div class="statistics_data">`;
                innerHtml += '<table class="statistics_ability_table">'
                innerHtml += '<tbody><tr><th>種別</th><th>勝ち/負け</th><th>勝率</th></tr>'

                for (let [title, value] of Object.entries(monthlyRecord.aggregateByTitle())) {
                    var calc = new VCalc(value);
                    innerHtml += `<tr><td>${title}</td><td>${calc.winCount}/${calc.loseCount}</td><td>${calc.winPer()}</td></tr>`;
                }

                innerHtml += '</table>'
                innerHtml += '</div><div class="frame01_bottom"></div></div>'
            }

            return innerHtml;
        }
    }
    class VCalc {
        constructor(value) {
            this.winCount = value['winCount'];
            this.loseCount = value['loseCount'];
            this.drawCount = value['drawCount'];
            this.totalCount = value['totalCount'];
        }

        winPer(fixedNum = 1) {
            let _winPer = this.winCount / (this.winCount + this.loseCount) * 100;
            return _winPer.toFixed(fixedNum);
        }
    }

    function refreshResultHtml() {
        var d = new $.Deferred();
        setTimeout(function () {
            $("#bookmarklet_result").remove();
            d.resolve();
        }, 0);
        return d.promise();
    }

    function dispLoading() {
        var d = new $.Deferred();
        setTimeout(function () {
            var msg = 'loading';
            var dispMsg = "<div class='bookmarklet_loading_msg'>" + msg + "</div>";

            if ($("#bookmarklet_loading").length == 0) {

                $("#wrap").append("<div id='bookmarklet_loading'>" + dispMsg + "</div>");

                var ua = navigator.userAgent;
                var width = window.innerWidth;
                var height = window.innerHeight;
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
        var d = new $.Deferred();
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
        var d = new $.Deferred();
        setTimeout(function () {
            $("#bookmarklet_loading").remove();
            d.resolve();
        }, 500);
        return d.promise();
    }

    function wait(milliseconds = 2000) {
        var d = new $.Deferred();
        setTimeout(function() {
            console.log("waiting " + milliseconds + " milliseconds");
            d.resolve();
        }, milliseconds);
        return d.promise();
    }

    function callApi(monthlyRecord, daily) {
        var d = new $.Deferred();

        $.ajax({
            url: "https://3594t.net/members/history/" + daily,
        }).done(function (data, status, xhr) {
            console.log(daily);

            playDayNowCount++;

            if ($(data).find('#container p').text() == "短時間に多数のアクセスがあった為、一時的にご利用を制限しております。しばらくお待ちください。") {
                return d.reject('短時間に多数のアクセスがあった為、一時的にご利用を制限しております。しばらくお待ちください。');
            }

            if (xhr.status !== 200) {
                return d.reject('サーバの応答が停止しました、時間を置いてから実行してください。');
            }

            if (status !== 'success') {
                return d.reject('不明なステータスを受信しました、時間を置いてから実行してください。');
            }

            let battleListRecord = new BattleListRecord(daily);
            $(data).find(".line_record_block").each(function (i, element) {
                var lineRecordBlock = new LineRecordBlock($(element).find('img').attr('alt'));

                $(element).find('.count').each(function (i, element) {
                    var count_alt = $(element).find('img').attr('alt'); // 戦, 勝, 敗, 分
                    var count_value = $(element).text();
                    lineRecordBlock.setCountByAlt(count_alt, count_value);
                });

                battleListRecord.append(lineRecordBlock);
            });

            monthlyRecord.append(battleListRecord);

            d.resolve();
        }).fail(function (data) {
            return d.reject('取得に失敗しました、時間を置いてから実行してください。');
        });

        return d.promise();
    }

    let debugMode = false;
    let deferred = wait(0);
    let comprehensiveRecord = new ComprehensiveRecord();
    let playDayNowCount = 1;
    let playDayAllCount = $("[class$='play_day']").length;

    deferred.then(function() {
        return $.when(refreshResultHtml(), dispLoading());
    });

    $('#history').find("[class^='calendar calendar_']").each(function (i, element) {
        if (i != 0 && debugMode ) { return; }
        var monthlyRecord = new MonthlyRecord($(element).prev().find('.title_calendar').text());

        $(this).find("[class$='play_day']").each(function (i, element) {
            if (i != 0 && debugMode ) { return; }

            // daily?y=2021&m=1&d=16
            var daily = $(element).find('a').attr('href').replace(/^\.\//, '');

            deferred = deferred.then(function() {
                return $.when(callApi(monthlyRecord, daily), updateLoading(playDayNowCount, playDayAllCount), wait(2500));
            });
        });

        comprehensiveRecord.add(monthlyRecord);
    });

    deferred.then(function() {
        return removeLoading();
    });

    deferred.always(function () {
        console.log("Always ：）");
        let resultHtml = new ResultHtml(comprehensiveRecord);
        $("#container").prepend("<span id='bookmarklet_result'>" + resultHtml.generate() + "<br></span>");
    }).done(function () {
        console.log("Done ；）");
    }).fail(function (e) {
        console.log("Fail ：’）");
        alert(e);
    });
});
