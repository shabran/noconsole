<?php
// Database details
// $db_server   = 'localhost';
$db_server   = 'logbook.local'; // for local development

$db_username = 'nocuser';
// $db_password = 'n0cus3r';
$db_password = 'n0cF00k!nus3r'; // for local development
$db_name     = 'noconsole';

if(!$_SESSION)
   session_start();

// $loginUser & $loginEmail have to re-declared again because variable is not global
// $loginUser = $_SESSION['username'];
// $loginEmail = $_SESSION['email']; 

// for non LDAP environment :

  $loginUser = "M. Ardhi"; 
  $loginEmail = "m.ardhi@ntt.co.id"; 

// Get job (and id)
$job = '';
$id  = '';
if (isset($_GET['job'])){
  $job = $_GET['job'];
  if ($job == 'get_logbooks' ||
      $job == 'get_logbook'   ||
      $job == 'add_logbook'   ||
      $job == 'edit_logbook'  ||
      $job == 'delete_logbook'){
    if (isset($_GET['id'])){
      $id = $_GET['id'];
      if (!is_numeric($id)){
        $id = '';
      }
    }
  } else {
    $job = '';
  }
}

// Prepare array
$mysql_data = array();

// Valid job found
if ($job != ''){
  
  // Connect to database
  $db_connection = mysqli_connect($db_server, $db_username, $db_password, $db_name);
  if (mysqli_connect_errno()){
    $result  = 'error';
    $message = 'Failed to connect to database: ' . mysqli_connect_error();
    $job     = '';
  }
  
  // Execute job
  if ($job == 'get_logbooks'){
    
    // Get logbooks
    $query = "SELECT * FROM noc_log_book ORDER BY logbook_no";
    $query = mysqli_query($db_connection, $query);
    if (!$query){
      $result  = 'error';
      $message = 'query error';
    } else {
      $result  = 'success';
      $message = 'query success';
      while ($logbook = mysqli_fetch_array($query)){
        $functions  = '<div class="function_buttons"><ul>';
        $functions .= '<li class="function_edit"><a data-id="'   . $logbook['logbook_no'] . '" data-name="' . $logbook['lendee_name'] . '"><span>Edit</span></a></li>';
        // $functions .= '<li class="function_delete"><a data-id="' . $logbook['logbook_no'] . '" data-name="' . $logbook['lendee_name'] . '"><span>Delete</span></a></li>';
        $functions .= '</ul></div>';
        $mysql_data[] = array(
          "logbook_no"  => $logbook['logbook_no'],
          "lendee_name"  => $logbook['lendee_name'],
          "items"    => $logbook['items'],
          "start_time"       => $logbook['start_time'],
          "end_time"  => $logbook['end_time'],
          "remarks"  => $logbook['remarks'],
          "status"     => $logbook['status'],
          // "lendee_email"     => $logbook['lendee_email'],
          "functions"     => $functions
        );
      }
    }
    
  } elseif ($job == 'get_logbook'){
    
    // Get logbook
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query = "SELECT * FROM noc_log_book WHERE logbook_no = '" . mysqli_real_escape_string($db_connection, $id) . "'";
      $queryDetails = "SELECT * FROM logbook_remarks WHERE logbook_no = '" . mysqli_real_escape_string($db_connection, $id) . "'";
      
      $query = mysqli_query($db_connection, $query);
      $queryDetails = mysqli_query($db_connection, $queryDetails);
      
      if (!$query || !$queryDetails){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        while ($logbook = mysqli_fetch_array($query)){
          $mysql_data[] = array(
            "logbook_no"  => $logbook['logbook_no'],
            "lendee_name"  => $logbook['lendee_name'],
            "items"    => $logbook['items'],
            "start_time"       => $logbook['start_time'],
            "end_time"  => $logbook['end_time'],
            "remarks"  => $logbook['remarks'],  // should be set automatically get from latest of logbook_remarks
            "status"     => $logbook['status'],
            "lendee_email"     => $logbook['lendee_email'], // set for requester email
          );
        }
        while ($logbookDetails = mysqli_fetch_array($queryDetails)){
        $mysql_data[] = array(
          "logs"     => $logbookDetails['remark_log'], // need to iterate
          "loggers"     => $logbookDetails['logger'], // need to iterate
          "timestamps"     => $logbookDetails['time_stamp'] // need to iterate
          );
        }
      }
    }
  
  } elseif ($job == 'add_logbook'){
    
    // Add log
    // for remarks, add it into logbook_remarks for remark_log, logger, and timestamp, as well as to last remark in noc_log_book
    $query = "INSERT INTO noc_log_book SET ";
    if (isset($loginUser)) { $query .= "lendee_name = '" . mysqli_real_escape_string($db_connection, $loginUser)   . "', "; $lendee_name = $_GET['lendee_name'];}
    if (isset($_GET['items']))   { $query .= "items   = '" . mysqli_real_escape_string($db_connection, $_GET['items'])   . "', "; $userItems = $_GET['items'];}
    if (isset($_GET['start_time']))      { $query .= "start_time      = '" . mysqli_real_escape_string($db_connection, $_GET['start_time'])      . "', "; $userStartTime = $_GET['start_time'];}
    if (isset($_GET['end_time'])) { $query .= "end_time = '" . mysqli_real_escape_string($db_connection, $_GET['end_time'])    . "', ";  $userEndTime = $_GET['end_time']; }
    if (isset($_GET['remarks']))      { $query .= "remarks      = '" . mysqli_real_escape_string($db_connection, $_GET['remarks'])      . "', "; $userRemarks = $_GET['remarks']; } 
    if (isset($_GET['status']))    { $query .= "status    = '" . mysqli_real_escape_string($db_connection, $_GET['status'])    . "', "; $userStatus = $_GET['status'];}
    if (isset($loginEmail))    { $query .= "lendee_email    = '" . mysqli_real_escape_string($db_connection, $loginEmail)    . "';";}

      $query .= "INSERT INTO logbook_remarks (logbook_no, time_stamp, logger,remark_log) 
      VALUES (LAST_INSERT_ID(),NOW(), '" . $loginUser . "', '" . mysqli_real_escape_string($db_connection, $_GET['remarks']) . "')"; // Success

      $query  = mysqli_multi_query($db_connection, $query);
    if (!$query){
      $result  = 'error';
      $message = 'query error';
    } else {
      $result  = 'success';
      $message = 'query success';
      $recipient = $loginEmail;
      $bodyMail = "Dear {$loginUser}, \n\n\nYou have proposed to borrow {$userItems} from {$userStartTime}\n\nwith the following remarks : {$userRemarks},\n\nnow your status is : {$userStatus}.\n\n\nBest Regards,\n\nLogBook Admin";
      $subjectMail = "Borrowing of {$userItems} by {$loginUser} [{$userStatus}]";
      mail("{$recipient},noc-members@ntt.co.id",$subjectMail,$bodyMail,"From: logbook@noconsole.ntt.net.id".PHP_EOL); // success
    }
  
  } elseif ($job == 'edit_logbook'){
    
    // Edit logbook
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      // for remarks, function is changed to add to logbook_remarks for remark_log, logger, and timestamp, as well as to last remark in noc_log_book (edited)
      $query = "UPDATE noc_log_book SET ";
      if (isset($_GET['lendee_name'])) { $query .= "lendee_name = '" . mysqli_real_escape_string($db_connection, $_GET['lendee_name']) . "', "; $lendee_name = $_GET['lendee_name'];}
      if (isset($_GET['items']))   { $query .= "items   = '" . mysqli_real_escape_string($db_connection, $_GET['items'])   . "', "; $userItems = $_GET['items'];}
      if (isset($_GET['start_time']))      { $query .= "start_time      = '" . mysqli_real_escape_string($db_connection, $_GET['start_time'])      . "', "; $userStartTime = $_GET['start_time'];}
      if (isset($_GET['end_time'])) { $query .= "end_time = '" . mysqli_real_escape_string($db_connection, $_GET['end_time']) . "', ";  $userEndTime = $_GET['end_time'];}
      if (isset($_GET['remarks']))      { $query .= "remarks      = '" . mysqli_real_escape_string($db_connection, $_GET['remarks'])      . "', "; $userRemarks = $_GET['remarks'];} // Should be updated, reflecting last remark
      if (isset($_GET['status']))    { $query .= "status    = '" . mysqli_real_escape_string($db_connection, $_GET['status'])    . "', "; $userStatus = $_GET['status'];}      
      if (isset($_GET['lendee_email']))    { $query .= "lendee_email    = '" . mysqli_real_escape_string($db_connection, $_GET['lendee_email'])    . "'"; $lendee_email = $_GET['lendee_email'];}      

      $query .= "WHERE logbook_no = '" . mysqli_real_escape_string($db_connection, $id) . "';";

      $query .= "INSERT INTO logbook_remarks (logbook_no, time_stamp, logger,remark_log) 
      VALUES ('" . mysqli_real_escape_string($db_connection, $id) . "',NOW(), '" . $loginUser . "', '" . mysqli_real_escape_string($db_connection, $_GET['remarks']) . "')"; 

      $query  = mysqli_multi_query($db_connection, $query);

      if (!$query){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $recipient = '{$loginEmail},noc-members@ntt.co.id,{$lendee_email}';
        $bodyMail = "Dear {$loginUser}, \n\n\nYou have updated log for {$userItems} borrowal with starting time {$userStartTime}\nand the following remark : {$userRemarks},\n\nnow {$lendee_name}'s status is : {$userStatus}.\n\n\nBest Regards,\n\nLogBook Admin";
        $subjectMail = "Borrowing of {$userItems} by {$lendee_name} [{$userStatus}]";
        mail("{$loginEmail},noc-members@ntt.co.id,{$lendee_email}",$subjectMail,$bodyMail,"From: logbook@noconsole.ntt.net.id".PHP_EOL); // lendee email still not working
        // mail("m.ardhi@ntt.co.id",$subjectMail,$bodyMail,"From: logbook@noconsole.ntt.net.id".PHP_EOL); // lendee email still not working        
      }

    }
    
  } elseif ($job == 'delete_logbook'){
  
    // Delete logbook
    // Should be created deleted all with its noc_log_book
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query = "DELETE FROM noc_log_book WHERE logbook_no = '" . mysqli_real_escape_string($db_connection, $id) . "'";
      $query = mysqli_query($db_connection, $query);
      if (!$query){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
      }
    }
  
  }
  
  // Close database connection
  mysqli_close($db_connection);

}

// Prepare data
$data = array(
  "result"  => $result,
  "message" => $message,
  "data"    => $mysql_data
);

// Convert PHP array to JSON array
$json_data = json_encode($data);
print $json_data;
?>