$(document).ready(function() {

    $("#cmn-toggle-1").change(function(e) {
        var value = $(e.target).is(":checked");
        var url = "";
        var status = "";
        if (value) {
            url = "enableautosync";
            status = "enabled";
        } else {
            url = "disableautosync";
            status = "disabled";
        }
        $.ajax({
            url: url,
            success: function() {
                $(".js-autosync-status").html(status);
            },
            error: function() {
                alert("Couldn't save status!");
            }
        })
    });

});
