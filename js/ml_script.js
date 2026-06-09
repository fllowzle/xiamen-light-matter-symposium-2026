// 手机导航收起展开
  $('.hb').click(function(e) {
      e.preventDefault();
      $('.center_span').toggleClass('hb_fadeout')
      $('.top_span').toggleClass('change1')
      $('.bottom_span').toggleClass('change2')

  });
  $('.hb').click(function(e) {
      e.preventDefault();
      $('.ml_mb_nav').stop().toggleClass('mb_navShow')

  });
  $('.mb_item1_arrow').click(function(e) {
      e.preventDefault();
      var num1 = $('.mb_item1_arrow').index(this)
      $('.ml_mbnav_2').eq(num1).stop().slideToggle()
      $('.mb_item1_arrow').eq(num1).stop().toggleClass('ml_mb_arrowChange')

  });
  $('.mb_item2_arrow').click(function(e) {
      e.preventDefault();
      var num2 = $('.mb_item2_arrow').index(this)
      $('.ml_mbnav_3').eq(num2).stop().slideToggle()
      $('.mb_item2_arrow').eq(num2).stop().toggleClass('ml_mb_arrowChange')

  });



  // 电脑侧边栏效果
  $(document).ready(function() {
          $(window).scroll(function() {
              var topp = $(document).scrollTop();
              if (topp > 200) {
                  $('.backtotop').addClass('ml_sidebar_show')
              } else { $('.backtotop').removeClass('ml_sidebar_show') }
          })

      })
  new WOW().init() //窗口显示才加载