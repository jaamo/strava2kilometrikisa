import '../scss/main.scss';

$(document).ready(function() {
  $('#cmn-toggle-1').change(function(e) {
    var value = $(e.target).is(':checked');
    var url = '';
    var status = '';
    if (value) {
      url = 'enableautosync';
      status = 'enabled';
    } else {
      url = 'disableautosync';
      status = 'disabled';
    }
    $.ajax({
      url: url,
      success: function() {
        $('.js-autosync-status').html(status);
      },
      error: function() {
        alert("Couldn't save status!");
      },
    });
  });
  $('#cmn-toggle-2').change(function(e) {
    var value = $(e.target).is(':checked');
    var url = '';
    var status = '';
    if (value) {
      url = 'enableebike';
      status = 'enabled';
    } else {
      url = 'disableebike';
      status = 'disabled';
    }
    $.ajax({
      url: url,
      success: function() {
        $('.js-ebike-status').html(status);
      },
      error: function() {
        alert("Couldn't save status!");
      },
    });
  });

  if ($('.js-isauthenticated').length > 0) {
    $.ajax({
      url: '/isauthenticated',
      dataType: 'json',
      success: function(data) {
        if (!data.kilometrikisa) {
          $('.js-isauthenticated').removeClass('hidden');
        }
      },
      error: function() {},
    });
  }
});
