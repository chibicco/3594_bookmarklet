(function(f) {
        s = document.createElement("script");
        s.src = "//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js";
        s.onload = function() {
            f(jQuery.noConflict(true))
        }
        document.body.appendChild(s);
    }
)(function($, undefined) {
    var csv_data = "";

    function getCardHash(filename) {
        if(!filename) return "";
        var l = filename.split('/');
        l = l[l.length-1];
        l = l.split('.')[0];
        return l;
    }

    $(".datalist_block").each(function(i, elem) {
        if ($(elem).has(".datalist_block_state").length == 0) return;

        t = i + ','
        + $(elem).find(".datalist_block_state").text() + ','
        + $(elem).find(".datalist_block_vr").text() + ','
        + $(elem).find(".datalist_block_name").text() + ','
        + getCardHash($(elem).find('.datalist_block_card').first().children('img').first().attr('src'))
        ;
        csv_data += t + "\n";
        console.log(t);
    });

    var new_win = window.open();
    new_win.document.write("<html><head><title>datalist</title></head><body></body></html>");
    new_win.document.body.innerHTML = "<textarea cols=\"100\" rows=\"50\">" + csv_data + "</textarea>";
});
