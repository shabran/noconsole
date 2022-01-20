// <?php header("Content-type: application/javascript"); ?>

$(document).ready(function () {

  $("input[name^=end_time]").datetimepicker();
  $("input[name^=start_time]").datetimepicker();

  $('#button').on('click', function () {
    var text = $('#text');
    text.val(text.val() + ' after clicking');
  });

  // var loginUser = "<?php echo json_encode($_SESSION['username']); ?>";
  // On page load: datatable
  var table_logbooks = $('#table_logbooks').dataTable({
    "order": [[0, "desc"]],
    "ajax": "data.php?job=get_logbooks",
    "columns": [
      { "data": "logbook_no" },
      { "data": "lendee_name" },
      { "data": "items", "sClass": "lendee_name" },
      { "data": "start_time" },
      { "data": "end_time" },
      { "data": "remarks" },
      { "data": "status" },
      { "data": "functions", "sClass": "functions" }
    ],
    "aoColumnDefs": [
      { "bSortable": false, "aTargets": [-1] }
    ],
    "lengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
    "oLanguage": {
      "oPaginate": {
        "sFirst": " ",
        "sPrevious": " ",
        "sNext": " ",
        "sLast": " ",
      },
      "sLengthMenu": "Records per page: _MENU_",
      "sInfo": "Total of _TOTAL_ records (showing _START_ to _END_)",
      "sInfoFiltered": "(filtered from _MAX_ total records)"
    }
  });

  //////////////////////////////////////////////////////////// Experimentation begins 


  //////////////////////////////////////////////////////////// Experimentation ends 

  // On page load: form validation
  jQuery.validator.setDefaults({
    success: 'valid',
    rules: {
      items: {
        required: true
      },
      start_time: {
        required: true
      },
      remarks: {
        required: true
      },
      status: {
        required: true
      }
    },
    errorPlacement: function (error, element) {
      error.insertBefore(element);
    },
    highlight: function (element) {
      $(element).parent('.field_container').removeClass('valid').addClass('error');
    },
    unhighlight: function (element) {
      $(element).parent('.field_container').addClass('valid').removeClass('error');
    }
  });
  var form_logbook = $('#form_logbook');
  form_logbook.validate();

  // Show message
  function show_message(message_text, message_type) {
    $('#message').html('<p>' + message_text + '</p>').attr('class', message_type);
    $('#message_container').show();
    if (typeof timeout_message !== 'undefined') {
      window.clearTimeout(timeout_message);
    }
    timeout_message = setTimeout(function () {
      hide_message();
    }, 8000);
  }
  // Hide message
  function hide_message() {
    $('#message').html('').attr('class', '');
    $('#message_container').hide();
  }

  // Show loading message
  function show_loading_message() {
    $('#loading_container').show();
  }
  // Hide loading message
  function hide_loading_message() {
    $('#loading_container').hide();
  }

  // Show lightbox
  function show_lightbox() {
    $('.lightbox_bg').show();
    $('.lightbox_container').show();
  }
  // Hide lightbox
  function hide_lightbox() {
    $('.lightbox_bg').hide();
    $('.lightbox_container').hide();
  }
  // Lightbox background
  $(document).on('click', '.lightbox_bg', function () {
    hide_lightbox();
  });
  // Lightbox close button
  $(document).on('click', '.lightbox_close', function () {
    hide_lightbox();
  });
  // Escape keyboard key
  $(document).keyup(function (e) {
    if (e.keyCode == 27) {
      hide_lightbox();
    }
  });

  // Hide iPad keyboard
  function hide_ipad_keyboard() {
    document.activeElement.blur();
    $('input').blur();
  }

  // Add log button, this is the first time when ANY user
  // tries to add log, so the choice is only 'proposed'
  $(document).on('click', '#add_logbook', function (e) {
    e.preventDefault();
    $('.lightbox_content h2').text('Add log');
    $('#form_logbook button').text('Add log');
    $('#form_logbook').attr('class', 'form add');
    $('#form_logbook').attr('data-id', '');
    $('#form_logbook .field_container label.error').hide();
    $('#form_logbook .field_container').removeClass('valid').removeClass('error');
    $('#form_logbook #lendee_name').val(usernameLogin);
    $('#form_logbook #items').val('');
    $('#form_logbook #start_time').val('');
    $('#form_logbook #end_time').val('');
    $('#form_logbook #remarks').val('');
    $('#form_logbook #status').replaceWith("<select type='text' name='status' id='status'> <option value='Proposed'>Proposed</option> </select>"); // add below for detail remarks
    $('#form_logbook #details').html('');
    show_lightbox();
  });

  // Add log submit form
  $(document).on('submit', '#form_logbook.add', function (e) {
    e.preventDefault();
    // Validate form
    if (form_logbook.valid() == true) {
      // Send logbook information to database
      hide_ipad_keyboard();
      hide_lightbox();
      show_loading_message();
      var form_data = $('#form_logbook').serialize();
      var request = $.ajax({
        url: 'data.php?job=add_logbook',
        cache: false,
        data: form_data,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        type: 'get'
      });
      request.done(function (output) {
        if (output.result == 'success') {
          // Reload datable
          table_logbooks.api().ajax.reload(function () {
            hide_loading_message();
            var lendee_name = $('#lendee_name').val();
            show_message("Logbook '" + lendee_name + "' added successfully.", 'success');
          }, true);
        } else {
          hide_loading_message();
          show_message('Add request failed', 'error');
        }
      });
      request.fail(function (jqXHR, textStatus) {
        hide_loading_message();
        show_message('Add request failed: ' + textStatus, 'error');
      });
    }
  });

  // Edit logbook button
  $(document).on('click', '.function_edit a', function (e) {
    e.preventDefault();

    // Get logbook information from database
    show_loading_message();
    var id = $(this).data('id');
    var request = $.ajax({
      url: 'data.php?job=get_logbook',
      cache: false,
      data: 'id=' + id,
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      type: 'get'
    });
    request.done(function (output) {
      if (output.result == 'success') {
        var i;
        var aggregate = '';
        $('.lightbox_content h2').text('Edit logbook');
        $('#form_logbook button').text('Edit logbook');
        $('#form_logbook').attr('class', 'form edit');
        $('#form_logbook').attr('data-id', id);
        $('#form_logbook .field_container label.error').hide();
        $('#form_logbook .field_container').removeClass('valid').removeClass('error');
        $('#form_logbook #lendee_name').val(output.data[0].lendee_name);
        $('#form_logbook #items').val(output.data[0].items);
        $('#form_logbook #start_time').val(output.data[0].start_time);
        $('#form_logbook #end_time').val(output.data[0].end_time);
        $("label[for='remarks']").text('Add Remark:*');
        $('#form_logbook #remarks').val('');

        if (usernameAccess == 2) {
          $('#form_logbook #status').val(output.data[0].status); // add below for detail remarks

        } else if (usernameAccess == 1) {
          $('#form_logbook #status').replaceWith("<select type='text' name='status' id='status'> <option value=" + output.data[0].status + ">" + output.data[0].status + "</option> </select>"); // add below for detail remarks
          // alert(usernameAccess);
        }

        // TODO : iterate until complete array and get into tag id in table form
        for (i = 1; i < output.data.length; i++) {
          aggregate += output.data[i].loggers + ' | ' + output.data[i].timestamps + ' | ' + (output.data[i].logs).bold() + '<br>';
        }
        $('#form_logbook #details').html(aggregate);  // iterate data here      
        $('#form_logbook #lendee_email').val(output.data[0].lendee_email);
        hide_loading_message();
        show_lightbox();
      } else {
        hide_loading_message();
        show_message('Information request failed', 'error');
      }
    });
    request.fail(function (jqXHR, textStatus) {
      hide_loading_message();
      show_message('Information request failed: ' + textStatus, 'error');
    });
  });

  // Edit logbook submit form
  $(document).on('submit', '#form_logbook.edit', function (e) {
    e.preventDefault();
    // Validate form
    if (form_logbook.valid() == true) {
      // Send logbook information to database
      hide_ipad_keyboard();
      hide_lightbox();
      show_loading_message();
      var id = $('#form_logbook').attr('data-id');
      var form_data = $('#form_logbook').serialize();
      var request = $.ajax({
        url: 'data.php?job=edit_logbook&id=' + id,
        cache: false,
        data: form_data,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        type: 'get'
      });
      request.done(function (output) {
        if (output.result == 'success') {
          // Reload datable // this is still error
          table_logbooks.api().ajax.reload(function () {
            hide_loading_message();
            var lendee_name = $('#lendee_name').val();
            show_message("Logbook '" + lendee_name + "' edited successfully.", 'success');
          }, true);
        } else {
          hide_loading_message();
          show_message('Edit request failed', 'error');
        }
      });
      request.fail(function (jqXHR, textStatus) {
        hide_loading_message();
        show_message('Edit request failed: ' + textStatus, 'error');
      });
    }
  });

  // Delete logbook
  // $(document).on('click', '.function_delete a', function(e){
  //   e.preventDefault();
  //   var lendee_name = $(this).data('name');
  //   if (confirm("Are you sure you want to delete '" + lendee_name + "'?")){
  //     show_loading_message();
  //     var id      = $(this).data('id');
  //     var request = $.ajax({
  //       url:          'data.php?job=delete_logbook&id=' + id,
  //       cache:        false,
  //       dataType:     'json',
  //       contentType:  'application/json; charset=utf-8',
  //       type:         'get'
  //     });
  //     request.done(function(output){
  //       if (output.result == 'success'){
  //         // Reload datable
  //         table_logbooks.api().ajax.reload(function(){
  //           hide_loading_message();
  //           show_message("Logbook '" + lendee_name + "' deleted successfully.", 'success');
  //         }, true);
  //       } else {
  //         hide_loading_message();
  //         show_message('Delete request failed', 'error');
  //       }
  //     });
  //     request.fail(function(jqXHR, textStatus){
  //       hide_loading_message();
  //       show_message('Delete request failed: ' + textStatus, 'error');
  //     });
  //   }
  // });

});