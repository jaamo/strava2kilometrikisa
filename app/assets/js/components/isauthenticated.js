(function() {
  //create empty object in the global em variable
  em.isauthenticated = {};

  // Reload authentication status if auth label exists.
  em.isauthenticated.init = function() {
    if ($('.js-isauthenticated').length > 0) {
      $.ajax({
        url: '/isauthenticated',
        dataType: 'json',
        success: function(data) {
          if (!data.kilometrikisa) {
            $('.js-isauthenticated').removeClass('hidden-xs-up');
          }
        },
        error: function() {},
      });
    }
    // $('[data-toggle="tooltip"]').tooltip()
  };
})();
