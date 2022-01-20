$(document).ready(function () {

    $('#button').on('click', function () {
        var text = $('#text');
        text.val(text.val() + ' after clicking');
    });

});