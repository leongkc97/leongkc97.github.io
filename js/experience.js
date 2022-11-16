$( document ).ready(function() {
    // Main variables
      var $aboutTitle = $('.about-myself .content h2');
      var $developmentWrapper = $('.development-wrapper');
      var developmentIsVisible = false;
  
  
 
  
    $(window).scroll( function(){
  
      var bottom_of_window = $(window).scrollTop() + $(window).height();
  

    /* ##### EXPERIENCE SECTION #### */
  
        // Check the location of each element hidden */
        $('.experience .content .hidden').each( function(i){
  
            var bottom_of_object = $(this).offset().top + $(this).outerHeight();
  
            /* If the object is completely visible in the window, fadeIn it */
            if( bottom_of_window > bottom_of_object ){
  
              $(this).animate({
                'opacity':'1',
                'margin-left': '0'
              },600);
            }
        });
  

    }); // -- End window scroll --
  });