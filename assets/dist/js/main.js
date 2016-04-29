$(document).ready(function(){$("#cmn-toggle-1").change(function(t){var a=$(t.target).is(":checked"),e="",n="";a?(e="enableautosync",n="enabled"):(e="disableautosync",n="disabled"),$.ajax({url:e,success:function(){$(".js-autosync-status").html(n)},error:function(){alert("Couldn't save status!")}})})});
//# sourceMappingURL=../maps/main.js.map
