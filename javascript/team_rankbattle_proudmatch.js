(function (f) {
    s = document.createElement("script");
    s.src = "//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js";
    s.onload = function () {
        f(jQuery.noConflict(true))
    }
    document.body.appendChild(s);
})(function ($) {
    $('.team_rankbattle_proudmatch').css('display', 'none');
});
