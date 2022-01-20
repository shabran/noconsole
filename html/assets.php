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
    
    <script type="text/javascript" src="./src/js/shortcut.js"></script>
    <script type="text/javascript" src="./src/js/helper.js"></script>
    <script type="text/javascript" src="./src/js/pqAssets.js"></script>
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
      <li><a href="./customers.php">Customers</a></li>
      <li class="active"><a href="./assets.php">Assets</a></li>
      <li><a href="./logbook.php">Logbook</a></li>
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
                <input hidden type="text" name="AssetNo">
                <tr>
                    <td class="label">Asset Name:</td>
                    <td><input type="text" id="ItemName" class="needed" name="ItemName" required></td>
                </tr>
                <tr>
                    <td class="label">Quantity:</td>
                    <td><input type="text" id="Quantity" class="needed" name="Quantity" required></td>
                </tr>
                <tr>
                    <td class="label">Serial No:</td>
                    <td><input id="SerialNo" type="text" name="SerialNo"></td>
                </tr>
                <tr>
                    <td class="label">Location:</td>
                    <td><input type="text" id="Location" class="needed" name="Location" required></td>
                </tr>
                <tr>
                    <td class="labelLogCust">Remark:</td>
                    <td><textarea type="text" class="addTicketSum" name="Remark"></textarea></td>
                </tr>
            </tbody>
        </table>
        <table style="float: right;">
            <tbody>
                <tr>
                    <td class="labelLog">Can Borrow?:</td>
                    <td><input type="checkbox" name="CanBorrow"></td>
                </tr>
                <tr>
                    <td class="labelLogCust"  style="height: 50px;padding-right: 20px;" >Editing/Adding Log:</td>
                    <td><textarea type="text" id="DetailLog" class="addTicketSum needed" name="DetailLog" required></textarea></td>
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
            <li><a href="#tabs-1">Asset Logs</a></li>
        </ul>
        <div id="tabs-1">
        </div>
    </div>
</script>
 
  
<div class="container">

  <div class="tabs">
    <ul class="tab-links">
    <li class="active"><a class="tab-details" href="#tab1" id="assetTab">Assets</a></li>
    <li ><a class="tab-details" href="#tab2" id="detailAssetTab">Detail Log</a></li>
    </ul>

    <div class="tab-content">
    <div id="tab1" class="tab active">
      <div id="asset_grid" style="margin:5px auto;"></div>
    </div>
      <div id="tab2" class="tab">
        <div id="detailAsset_grid" style="margin:5px auto;"></div>
      </div>
    </div>
  </div>
</div>

</body>
</html>