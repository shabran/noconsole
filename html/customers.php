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
    <script type="text/javascript" src="./src/js/pqCustomers.js"></script>
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
      <li class="active"><a href="./customers.php">Customers</a></li>
      <li><a href="./assets.php">Assets</a></li>
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
            <input hidden type="text" name="cust_no"/>
    <tr>
    <td class="label">CID:*</td>
    <td><input type="text" id="CID" name="CID" required></td>
    </tr>
    <tr>
    <td class="label">Customer Name:*</td>
    <td><input type="text" name="CustomerName" class="needed" required></td>
    </tr>
    <tr>
    <td class="label">PE Router:</td>
    <td><input type="text" name="PERouter"></td>
    </tr>
    <tr>
    <td class="label">Service:*</td>
    <td>
    <select type="text" name="Service" id="Service">
    </select>
    </td>
    </tr>
    <tr>
    <td class="label">Carrier Name:</td>
    <td>
    <select type="text" class="text" name="CarrierName" id="CarrierName">
    </select>
    </td>
    </tr>
    <tr>
    <td class="label">Circuit:</td>
    <td><input type="text" name="Circuit" id="Circuit"></td>
    </tr>
    <tr>
        <td class="labelLog" style="height: 50px;padding-right: 20px;">
        <table>
        <tr>
          <td>Cacti:</td>
          <td><input name="Cacti" type="checkbox"/></td>
        </tr>
        <tr>
          <td>Basic Diagram:</td>
          <td><input name="BasicDiagram" type="checkbox"/></td>
        </tr>
          <tr>
          <td>SI Maintenance:</td>
          <td><input name="SIMaintenance" type="checkbox"/></td>
        </tr>
      </table>
      </td>
        <td class="labelCheck">
        <table>
        <tr>
        <td>OpenNMS:</td>
          <td><input name="OpenNMS" type="checkbox"/></td>
        </tr>
        <tr>
          <td>Trouble Ticket:</td>
          <td><input name="TroubleTicket" type="checkbox"/></td>
        </tr>
        <tr>
          <td>Service Manager:</td>
          <td><input name="ServiceManager" type="checkbox"/></td>
        </tr>
      </table>
      </td>

    </tr>
    </table>

    <table style="float: right;">
    <tbody>
    <tr>
    <td class="label">Bandwidth:</td>
    <td><input type="text" name="Bandwidth" id="Bandwidth"></td>
    </tr>
    <tr>
    <td class="label">Customer Area:</td>
    <td><input type="text" name="CustomerArea" id="CustomerArea"></td>
    </tr>
    <tr>
    <td class="labelLog">Remarks:</td>
    <td><textarea class="addTicketSum" type="text" name="Remarks" ></textarea></td>
    </tr>
    <tr>
    <td class="labelLog">Contact No:</td>
    <td><textarea class="addTicketSum" name="ContactNo"></textarea></td>
    </tr>
    <tr>
    <td class="labelLog">Email Address:</td>
    <td><textarea class="addTicketSum" name="EmailAddress"></textarea></td>
    </tr>
    <tr>
      <td class="labelLog">Test:</td>
        <td>
        <div class="contact-field-wrapper">
          <div class="contact-fields">
            <div class="contact-field">
              <input type="text" class="contactStuff[]">
              <input type="text" class="contactStuff[]">
              <input class="stuff[]" name="isMainContact" type="checkbox"/>
              <button type="button" class="contact-remove-field">-</button>
            </div>
          </div>
        <button type="button" class="contact-add-field">+</button>
        </div>
      </td>
    </tr>
    <tr>
      <td class="labelLogCust">Test2:</td>
        <td>
        <div class="email-field-wrapper" style="padding-top: 10px;">
          <div class="email-fields">
            <div class="email-field">
              <input type="text" class="emailStuff[]">
              <input class="stuff[]" name="isMainEmail" type="checkbox"/>
              <button type="button" class="email-remove-field">-</button>
            </div>
          </div>
        <button type="button" class="email-add-field">+</button>
        </div>
      </td>    </tr>
    </table>
    <table style="float: left;">
    <tbody>
    <tr>
    <td class="labelLogCust">Add Attachment:</td>
    <td><input  type="file" class="attachment" name="attachment"/>
    <button type="button" name="uploadButton">Upload</button></td>
    </tr>
    <tr>
    <td class="labelLogCust">Detail Log:</td>
    <td><textarea class="needed addTicketSum" name="DetailLog" style="margin-top:20px;" required></textarea></td>
    </tr>
    <tr>
    <td class="labelLogCust">Log Category:</td>
    <td>
    <select type="text" class="text" name="LogCategory" id="LogCategory">
        <option value="Data Update">Data Update</option>
    </select>
    </td>
    </tr>
    <input hidden type="text" name="attachmentHolder"/>
    <input hidden type="text" name="userLogin"/>
    <input hidden type="text" name="userEmail"/>
    </tbody>
    </table>
    </div>
</form>
</div>

  <!--script tag used to define detail template-->
    <script type="text/pq-template" id="tmpl">  
      <div class="pq-tabs" style="width:auto;">
          <ul>
              <li><a href="#tabs-1">Checklist</a></li>
              <li><a href="#tabs-2">Address List</a></li>
              <li><a href="#tabs-3">PIC List</a></li>
              <li><a href="#tabs-4">Change Log</a></li>
          </ul>
          <div id="tabs-1">
          </div>        
          <div id="tabs-2">
          </div>
          <div id="tabs-3">
            <p><b>Contact Name:</b> <#=PIC_name#></p>
            <p><b>Contact No:</b> <#=PIC_number#></p>
            <p><b>Email Address:</b> <#=PIC_email#></p>
          </div>
          <div id="tabs-4">
          </div>
      </div>
    </script>
  
<div class="container">
  <div class="tabs">
    <ul class="tab-links">
    <li class="active"><a class="tab-details" href="#tab1" id="customerTab">Customers</a></li>
      <li ><a class="tab-details" href="#tab3" id="PICTab">PIC List</a></li>
    <li ><a class="tab-details" href="#tab2" id="detailLogTab">Detail Log</a></li>
    </ul>

    <div class="tab-content">
    <div id="tab1" class="tab active">
      <div id="cust_grid" style="margin:5px auto;"></div>
    </div>
      <div id="tab3" class="tab">
        <b style="color:red;">Under Construction...Up-to-date data is in the Customer table</b>
        <div id="PIC_grid" style="margin:5px auto;"></div>
      </div>
      <div id="tab2" class="tab">
        <div id="detailCustLog_grid" style="margin:5px auto;"></div>
      </div>
    </div>
  </div>
</div>

</body>
</html>