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
    <!-- <script charset="utf-8" src="//cdn.jsdelivr.net/jquery.validation/1.13.1/jquery.validate.min.js"></script> -->
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js"></script>

    <script type="text/javascript" src="./src/js/shortcut.js"></script>
    <script type="text/javascript" src="./src/js/helper.js"></script>
    <script type="text/javascript" src="./src/js/paramQuery.js"></script>

    <link rel="stylesheet" href="./src/css/layout.css">

    <script>
    sessionStorage.setItem('username', '<?php echo $_SESSION['user'];?>');  
    sessionStorage.setItem('email', '<?php echo $_SESSION['email'];?>');
    sessionStorage.setItem('access', '<?php echo $_SESSION['access'];?>');
    </script>

  </head>

  <body>    
    <nav class="navbar navbar-default">
      <div class="container-fluid">
        <div class="navbar-header">
          <a class="navbar-brand" href="#">NoConsole</a>
        </div>
        <ul class="nav navbar-nav">
          <li class="active"><a href="#">Ticketing</a></li>
          <li><a href="./customers.php">Customers</a></li>
          <li><a href="./assets.php">Assets</a></li>
          <li><a href="./logbook.php">Logbook</a></li>
        </ul>
        <ul class="nav navbar-nav navbar-right">
          <a class="navbar-brand" href="#">Hello, <?= $_SESSION['user'] ?></a>
          <a class="navbar-brand" style="color:red;" href="login.php?out">Logout</a>
        </ul>
      </div>
    </nav>

    <div id="popup-dialog-crud" style="display:none;">
      <form id="crud-form">
        <div style="display: inline-block;">
          <table style="display: inline-block;">
            <tbody>
              <input hidden type="text" name="TicketNo">
              <tr>
                <td class="label">Title:*</td>
                <td><input type="text" id="Title" name="Title" class="needed" required></td>
              </tr>
              <tr>
                <td class="label">Status:*</td>
                <td><select type="text" class="text" name="Status" id="Status"></select></td>
              </tr>
              <tr>
                <td class="label">Carrier:*</td>
                <td><select type="text" class="text" name="Carrier" id="Carrier"></select></td>
              </tr>
                <?php include('./DBConnects.php'); ?>
              <tr>
                <td class="label">Customer Name:*</td>
                <td><input type="text" name="CustomerName" id="CustomerName" class="needed" required></td>
                <div id="suggesstion-box"></div>
              </tr>
              <tr>
                <td class="label">Service:*</td>
                <td><select type="text" class="text" name="Service" id="Service"></select></td>
              </tr>
              <tr>
                <td class="label">Downtime:*</td>
                <td><input type="text" name="Downtime" class="needed" required></td>
              </tr>
              <tr>
                <td class="label">Uptime:</td>
                <td><input type="text" name="Uptime"></td>
              </tr>
              <tr>
                <td class="labelLogCust">Add Attachment:</td>
                <td><input type="file" class="attachment" name="attachment"/>
                <button type="button" name="uploadButton">Upload</button></td>
              </tr>
              <tr>
                <td class="labelLog">Detail Log:*</td>
                <td><textarea placeholder="Please don't leave it blank..." id="DetailLog" style="margin-top:20px;" class="needed addTicketSum" name="DetailLog" required></textarea></td>
              </tr>
            </tbody>
          </table>
          <table style="float: right;">
            <tbody>
              <tr>
                <td class="label">Duration:</td>
                <td><input type="text" name="Duration" readonly="readonly"></td>
              </tr>
              <tr>
                <td class="label">Summary:</td>
                <td><textarea class="addTicketSum" name="Summary"></textarea></td>
              </tr>
              <tr>
                <td class="label">Next Action:</td>
                <td><textarea class="addTicket" name="NextAction"></textarea></td>
              </tr>
              <tr>
                <td class="label">RFO:</td>
                <td><input class="addTicket" name="RFO"/></td>
              </tr>
              <tr>
                <td class="labelLog" style="padding-top: 20px;">Log Cat:</td>
                <td><select type="text" style="margin-top:20px;" class="addTicketSum" name="LogCategory" id="DetailLog">
                  <option value="Progress Update">Progress Update</option>
                  <option value="First Notification">First Notification</option>
                  <option value="Customer Update">Customer Update</option>
                  <option value="Carrier Coordination">Carrier Coordination</option>
                  </select>
                </td>
              </tr>
                <input hidden type="text" name="DayCounter">
                <input hidden type="text" name="TicketCreated">
                <input hidden type="text" name="attachmentHolder">
                <input hidden type="text" name="userLogin">
                <input hidden type="text" name="userEmail">
            </tbody>
          </table>
        </div>
    </form>
    </div> 
    <!--script tag used to define detail template-->
    <script type="text/pq-template" id="tmpl">
      <div class="pq-tabs" style="width:auto;">
        <ul>
          <li><a href="#tabs-2" >Ticket Logs</a></li>            
          <li><a href="#tabs-1" >Runbook</a></li>            
          <li><a href="#tabs-3" >Customer Details</a></li>
        </ul>
      <div id="tabs-2">
      </div>        
      <div id="tabs-1">
      </div>         
      <div id="tabs-3">
        <p><b>Customer Name:</b> <#=CustomerName#></p>
        <p><b>Contact No:</b> <#=ContactNo#></p>
        <p><b>Email Address:</b> <#=EmailAddress#></p>
        <p><b>Customer Area:</b> <#=CustomerArea#></p>
      </div>   
      </div>
    </script>

    <div class="container">
      <div class="tabs">
        <ul class="tab-links">
          <li class="active"><a class="tab-details" id="ticketTab" href="#tab1">Ticketing</a></li>
          <li><a class="tab-details" id="detailTab" href="#tab2">Detail Log</a></li>
          <li><a class="tab-details" id="detailTab" href="#tab3">Charts</a></li>
        </ul>

        <div class="tab-content">
          <div id="tab1" class="tab active">
            <div id="grid_crud" style="margin:5px auto;"></div>
          </div>
          <div id="tab2" class="tab">
            <div id="detailTicketLog_grid" style="margin:5px auto;"></div>
          </div>
          <div id="tab3" class="tab">
            <div class="chart-container" style="position: relative; height:80vh; width:80vw">
              <b style="color:red;">Under Construction...</b>
              <button onclick="refreshData()">Refresh Data</button>
              <canvas id="KPIchart"></canvas>
            </div>
            <script type="text/javascript" src="./src/js/chartScript.js"></script>
          </div>
        </div>

      </div>
    </div>
    <div class="modal"><!-- Place at bottom of page --></div>
  </body>
</html>