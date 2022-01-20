<?php include('./session.php'); ?>

<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <title>NOConsole System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=1000, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/src/css/jquery.datetimepicker.min.css"/ >
    <script src="./src/js/jquery.datetimepicker.full.min.js"></script>

    <!--jQuery dependencies-->
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.css" />
    <!--ParamQuery Grid css files-->
    <link rel="stylesheet" href="./src/js/pqGrid/pqgrid.min.css" />
    <!--add pqgrid.ui.css for jQueryUI theme support-->
    <link rel="stylesheet" href="./src/js/pqGrid/pqgrid.ui.min.css" />
    <!--ParamQuery Grid custom theme e.g., office, bootstrap, rosy, chocolate, etc (optional)-->
    <link rel="stylesheet" href="./src/js/pqGrid/themes/office/pqgrid.css" />
    <!--ParamQuery Grid js files-->
    <script type="text/javascript" src="./src/js/pqGrid/pqgrid.min.js"></script>
    <!--Include Touch Punch file to provide support for touch devices (optional)-->
    <script type="text/javascript" src="./src/js/pqGrid/touch-punch/touch-punch.min.js"></script>
    <!--Include jsZip file to support xlsx and zip export (optional)-->
    <script type="text/javascript" src="./src/js/pqGrid/jsZip-2.5.0/jszip.min.js"></script>
     <!--Include autoheight fix file )-->
    <script type="text/javascript" src="./src/js/pqGrid/javascript-detect-element-resize/jquery.resize.js"></script>
    <!-- <script src="https://cdn.jsdelivr.net/npm/vue@2.5.15/dist/vue.js"></script> -->

    <script type="text/javascript" src="./src/js/shortcut.js"></script>
    <script type="text/javascript" src="./src/js/helper.js"></script>
    <script type="text/javascript" src="./src/js/pqLogbook.js"></script>
    <link rel="stylesheet" href="./src/css/layout.css">

  </head>
<body>

<nav class="navbar navbar-default">
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" href="#">NoConsole</a>
    </div>
    <ul class="nav navbar-nav">
      <li><a href="./index.php">Ticketing</a></li>
      <li ><a href="./customers.php">Customers</a></li>
      <li><a href="./assets.php">Assets</a></li>
      <li class="active"><a href="#">Logbook</a></li>
    </ul>
    <ul class="nav navbar-nav navbar-right">
      <a class="navbar-brand" href="#">Hello, <?= $_SESSION['username'] ?></a>
        <a class="navbar-brand" style="color:red;" href="login.php?out">Logout</a>
    </ul>
  </div>
</nav>

<div id="popup-dialog-crud" style="display:none;">
  <form id="crud-form">
    <div style="display: inline-block;">
      <table style="display: inline-block;">
        <tbody>
            <input hidden type="text" name="LogbookNo">
            <input hidden type="text" name="userLogin">
            <input hidden type="text" name="userEmail">
          <tr>
            <td class="label">Lendee Name:</td>
            <td><input type="text" name="LendeeName" readonly="readonly"></td>
          </tr>
          <tr>
            <td class="label" >Items:</td>
            <td><select name="AssetName"></select></td>
          </tr>
          <tr>
            <td class="label" >Start Time:</td>
            <td><input class="needed" type="text" name="StartTime"  class="needed" required></td>
          </tr>
          <tr>
            <td class="label" >End Time:</td>
            <td><input type="text" name="EndTime"></td>
          </tr>
          <tr>
            <td class="label">Status:</td>
            <td><select type="text" id="Status" name="Status">
            </select>
            </td>
          </tr>
        </tbody>
      </table>
      <table style="float: right;">
        <tbody>
            <td class="labelLogCust">Add Remark:</td>
            <td><textarea type="text" id="DetailLog" name="AddRemark" class="addTicketSum needed" required></textarea></td>
          </tr>
        </tbody>
      </table>
    </div>
</form>
</div>

<!--script tag used to define detail template-->
<script type="text/pq-template" id="tmpl">
    <div class="pq-tabs" style="width:auto;">
        <ul>
            <li><a href="#tabs-1">Logbook Remarks</a></li>
        </ul>
        <div id="tabs-1">
        </div>
    </div>
</script>

<div class="container">
  
  <div class="tabs">
    <ul class="tab-links">
    <li class="active"><a class="tab-details" href="#tab1" id="logbookTab">Logbook</a></li>
    <li ><a class="tab-details" href="#tab2" id="detailLogbookTab">Remarks</a></li>
    </ul>

    <div class="tab-content">
    <div id="tab1" class="tab active">
      <div id="logbook_grid" style="margin:5px auto;"></div>
    </div>
      <div id="tab2" class="tab">
        <div id="detailLogbook_grid" style="margin:5px auto;"></div>
      </div>
    </div>
  </div>
</div>

</body>
</html>
