$(document).ready(function() {
    $(window).scroll(function() {
        var topp = $(document).scrollTop();
        if (topp > 200) {
            $('.backtotop').addClass('ml_sidebar_show1')
        } else { $('.backtotop').removeClass('ml_sidebar_show1') }
    })

})

$('.zk_mb').click(function(e) {
    e.preventDefault();
    $('.pronav_ul').slideToggle()
});

$('.pchead').removeAttr('data-aos')
$('.pchead').removeAttr('data-aos-delay')
$('.pcheader').removeAttr('data-aos')
$('.pcheader').removeAttr('data-aos-delay')
$('.pclogo').removeAttr('data-aos')
$('.pclogo').removeAttr('data-aos-delay')
$('.pcnav li').removeAttr('data-aos')
$('.pcnav li').removeAttr('data-aos-delay')
$('.ml_mb_head').removeAttr('data-aos')
$('.ml_mb_head').removeAttr('data-aos-delay')

var bread_width = $('.inside').width()
console.log(bread_width);
$('.ml_bread_inner').css('max-width', bread_width)
$(document).ready(function () {
var domain = window.location.host;
if (domain == "tengyun.template.tyjz.com") {
    $("img").each(function () {
        var srca = $(this).attr("src");
        if (typeof (srca) != 'undefined') {
            var banpan = srca;
            if (srca.indexOf("/../../upload/") >= 0) {
                srca = srca.replace("/../../upload/", "upload/");
            }
            if (srca.indexOf("/upload/") >= 0) {
                srca = srca.replace("/upload/", "upload/");
            }
            if (banpan != srca) {
                $(this).attr("src", srca);
            }
        }
    });
    $("a").each(function () {
        var srca = $(this).attr("href");
        if (typeof (srca) != 'undefined') {
            var banpan = srca;
            if (srca.indexOf("/../../upload/") >= 0) {
                srca = srca.replace("/../../upload/", "upload/");
            }
            if (srca.indexOf("/upload/") >= 0) {
                srca = srca.replace("/upload/", "upload/");
            }
            if (banpan != srca) {
                $(this).attr("href", srca);
            }
        }
        
        if (srca == "http://tengyun.template.tyjz.com"||srca == "/") {
            $(this).attr("href", "default.aspx");

        }
    });
    $(".ueditor_baidumap").attr("src", "qz_ueditor/dialogs/map/show.html#center=116.404,39.915&zoom=10&width=530&height=340&markers=116.404,39.915&markerStyles=l,A");
}
})
