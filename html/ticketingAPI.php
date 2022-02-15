<?php
include './session.php';
// Database details
$db_server   = 'mysql-server';
// $db_server   = 'logbook.local'; // for local development

$db_username = 'nocuser';
$db_password = 'n0cus3r';
// $db_password = 'n0cF00k!nus3r'; // for local development
$db_name     = 'noconsole';

if (isset($_GET['userLogin'])){
  $loginUser = $_GET['userLogin'];
} 

if (isset($_GET['userEmail'])){
  $loginEmail = $_GET['userEmail'];
} 

function debug_to_console( $data ) {
    $output = $data;
    if ( is_array( $output ) )
        $output = implode( ',', $output);

    echo "<script>console.log( 'Debug Objects: " . $output . "' );</script>";
}

  // debug_to_console( "Test" );

// Get job (and id)
$job = '';
$id  = '';
if (isset($_GET['job'])){
  $job = $_GET['job'];
  if ($job == 'get_tickets' ||
      $job == 'get_ticket'   || // somehow unused
      $job == 'get_detailLog'||  // get detail log per ticket id
      $job == 'get_allDetailLog' || // get all bulky detail log
      $job == 'get_latestDate'|| // fpr ticketing numbering
      $job == 'get_latestTimeStamp' || // for ticket numbering purpose
      $job == 'get_customers' || // Get customer name to fill dropdown
      $job == 'get_allcustomers' || // retrieve all customer in page
      $job == 'get_allcustomer' || // for details in customer page
      $job == 'get_customerdata_byname' || // for detail customer data in index
      $job == 'get_allCustomerName' || // name only, for populating dropdown
      $job == 'get_allPIC' || // get all PIC in one table, for read only
      $job == 'get_PIC' || // for populating PIC table
      $job == 'get_custlogger' || // get all customer with ID
      $job == 'get_allCustLog' || // get customer remarks with customer name on table
      $job == 'get_assets' || // get all assets
      $job == 'get_allAssetName' || // name only, for populating dropdown
      $job == 'get_assetLog' || // get asset log/remark per asset_no
      $job == 'get_asset_remarks' || // get all asset remarks
      $job == 'get_logbook' ||  // get all logbook
      $job == 'get_logbookLog' || // get one logbook log/remark
      $job == 'get_logbook_remarks' // get all logbook remarks
      ){
    if (isset($_GET['id'])){
      $id = $_GET['id'];
    }
  } else {
    $job = '';
  }
}

// TODO:add reference to update to files table
if (isset($_POST['job'])){
  $job = $_POST['job'];
  if ($job == 'add_ticket'   ||
      $job == 'edit_ticket'  ||
      $job == 'add_customer' ||
      $job == 'add_asset' ||
      $job == 'edit_asset' ||
      $job == 'add_logbook' ||
      $job == 'edit_logbook' ||
      $job == 'edit_customer'||
      $job == 'del_customer'
      ){
    if (isset($_POST['id'])){
      $id = $_POST['id'];
    }
  } else {
    $job = '';
  }
}

/** Begin of Filter API */

class ColumnHelper
{
    public static function isValidColumn($dataIndx)
    {            
        if (preg_match('/^[a-z,A-Z,_]*$/', $dataIndx))
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}

class FilterHelper
{
    public static function deSerializeFilter($pq_filter)        
    {
        $filterObj = json_decode($pq_filter);
        
        $mode = $filterObj->mode;                
        $filters = $filterObj->data;
        
        $fc = array();
        $param= array();

        foreach ($filters as $filter)
        {            
            $dataIndx = $filter->dataIndx;            
            if (ColumnHelper::isValidColumn($dataIndx) == false)
            {
                throw new Exception("Invalid column name");
            }
            $text = $filter->value;
            $condition = $filter->condition;
            
            if ($condition == "contain")
            {
                $fc[] = $dataIndx . " like CONCAT('%', ?, '%')";
                $param[] = $text;
            }
            else if ($condition == "notcontain")
            {
                $fc[] = $dataIndx . " not like CONCAT('%', ?, '%')";
                $param[] = $text;                
            }
            else if ($condition == "begin")
            {
                $fc[] = $dataIndx . " like CONCAT( ?, '%')";
                $param[] = $text;                                
            }
            else if ($condition == "end")
            {
                $fc[] = $dataIndx . " like CONCAT('%', ?)";
                $param[] = $text;                                
            }
            else if ($condition == "equal")
            {
                $fc[] = $dataIndx . " = ?";
                $param[] = $text;                                
            }
            else if ($condition == "notequal")
            {
                $fc[] = $dataIndx . " != ?";
                $param[] = $text;                                
            }
            else if ($condition == "empty")
            {             
                $fc[] = "ifnull(" . $dataIndx . ",'')=''";                
            }
            else if ($condition == "notempty")
            {
                $fc[] = "ifnull(" . $dataIndx . ",'')!=''";                
            }
            else if ($condition == "less")
            {
                $fc[] = $dataIndx . " < ?";
                $param[] = $text;                                                
            }
            else if ($condition == "great")
            {
                $fc[] = $dataIndx . " > ?";
                $param[] = $text;                                                                
            }
            else if ($condition == "lte")
            {
                $fc[] = $dataIndx . " <= ?";
                $param[] = $text;                                                                
            }
            else if ($condition == "gte")
            {
                $fc[] = $dataIndx . " >= ?";
                $param[] = $text;                                                                
            }
            else if ($condition == "between")
            {
                $fc[] = "(" . $dataIndx . " >= ? and ".$dataIndx." <= ? )";
                $param[] = $filter->value;                                                
                $param[] = $filter->value2;                                                
            }                                    
            else if ($condition == "range")
            {
                $arrValue=$value;
                $fcRange=  array();                
                foreach ($value as $val){
                    if ($val == "")
                    {
                        continue;
                    }                    
                    $fcRange[]=$dataIndx."= ?";
                    $param[] = $val;                                                
                }
                if(sizeof($fcRange)>0){
                    $fc[] = "(". join(" OR ", $fcRange) .")";
                }
            }                                                
        }
        
        $query = "";
        if (sizeof($filters) > 0)
        {
            $query = " where " . join(" ".$mode." ", $fc);
        }

        $ds = new stdClass();
        $ds->query = $query;
        $ds->param = $param;
        return $ds;
    }
}

// Sort helper
class SortHelper
{
    public static function deSerializeSort($pq_sort)
    {
        $sorters = json_decode($pq_sort);
        $columns = array();
        $sortby = "";
        foreach ($sorters as $sorter){
            $dataIndx = $sorter->dataIndx;
            $dir = $sorter->dir;
            if ($dir == "up")
            {
                $dir = "asc";
            }
            else
            {
                $dir = "desc";
            }
            if (ColumnHelper::isValidColumn($dataIndx))
            {
                $columns[] = $dataIndx . " " . $dir;
            }
            else{
                throw new Exception("invalid column ".$dataIndx);
            }
        }
        if (sizeof($columns) > 0)
        {
            $sortby = " order by " . join(", ", $columns);
        }
        return $sortby;
    }
}
//end of class

// Prepare array
$mysql_data = array();

// Valid job found
if ($job != ''){
  
  // Connect to database
  $dsn = 'mysql:host='.$db_server.';dbname='.$db_name;
  $options = array(
  PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8', );
  try {
    $dbh = new PDO($dsn, $db_username, $db_password, $options);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  } catch (PDOException $e) {
    $result  = 'error';
    $message = 'Failed to connect to database: '  . $e->getMessage();
    $job     = '';
  }

  // condiments
    if (isset($_GET["pq_sort"]) ) {
      $pq_sort = $_GET["pq_sort"];
      $sortQuery = SortHelper::deSerializeSort($pq_sort);
    } else {
      if($job == 'get_tickets') {
      $sortQuery = "order by TicketNo DESC";
      } elseif ($job == 'get_allcustomers') {
      $sortQuery = "order by CustomerName ASC";
      } elseif ($job == 'get_allPIC') {
      $sortQuery = "order by noc_customers.CustomerName ASC";
      } elseif ($job == 'get_allCustLog' || $job == 'get_allDetailLog' || $job == 'get_asset_remarks' || $job == 'get_logbook_remarks') {
      $sortQuery = "order by `timestamp` DESC";
      } elseif ($job == 'get_assets') {
      $sortQuery = "order by asset_no ASC";
      } elseif ($job == 'get_logbook') {
      $sortQuery = "order by logbook_no ASC";
      }
    }
    
    if ( isset($_GET["pq_filter"])) {
      $filterQuery = "";
      $filterParam = array();
      $pq_filter = $_GET["pq_filter"];
      $dsf = FilterHelper::deSerializeFilter($pq_filter);
      $filterQuery = $dsf->query;
      $filterParam = $dsf->param;
      $filterParam2 = $filterParam; // for count queries
    } else {
      $filterQuery = "";
      $filterParam = array();
      $filterParam2 = $filterParam; // for count queries
    }
    
    // it should be noted each query has to own its own count
    if (isset($_GET["pq_curpage"]) && isset($_GET["pq_rpp"])){

      $pq_curPage = $_GET["pq_curpage"];
      if ($pq_curPage < 1) { //still error below, let's try in here
          $pq_curPage = 1;
      }
      $pq_rPP=$_GET["pq_rpp"];

      if($job == 'get_tickets') {
      $query = "Select count(*) from noc_tickets";
      } elseif ($job == 'get_allcustomers') {
      $query = "Select count(*) from noc_customers";
      } elseif ($job == 'get_allPIC') {
      $query = "Select count(*) from noc_PIC";
      } elseif ($job == 'get_allCustLog') {
      $query = "Select count(*) from customer_remarks";
      } elseif ($job == 'get_allDetailLog') {
      $query = "Select count(*) from noc_detail_log";
      } elseif ($job == 'get_assets') {
      $query = "Select count(*) from noc_assets";
      } elseif ($job == 'get_asset_remarks') {
      $query = "Select count(*) from asset_remarks";
      } elseif ($job == 'get_logbook') {
      $query = "Select count(*) from noc_logbook";
      } elseif ($job == 'get_logbook_remarks') {
      $query = "Select count(*) from logbook_remarks";
      }
      $stmtPage = $dbh->prepare($query);
      $stmtPage->execute();
      $total_Records = $stmtPage->fetchColumn();     
      $skip = ($pq_rPP * ($pq_curPage - 1));
    
      if ($skip >= $total_Records)
      {        
          $pq_curPage = ceil($total_Records / $pq_rPP);
          if ($pq_curPage < 1) { //hacky yet still error
            $pq_curPage = 1;
          }
          $skip = ($pq_rPP * ($pq_curPage - 1));
      }
    }

  // Execute job
    if($job == 'get_tickets') {      
      // Get tickets
      if ( !isset($_GET["pq_filter"]) && isset($_GET["pq_curpage"]) && isset($_GET["pq_rpp"])) {       
        $sql ="SELECT * FROM noc_tickets " .$sortQuery. " limit ".$skip." , ".$pq_rPP;
        //$query ="SELECT count(*) FROM noc_tickets";
      } else {        
        $sql ="SELECT * FROM noc_tickets ".$filterQuery. " ".$sortQuery. " limit ".$skip." , ".$pq_rPP;
        $query ="SELECT count(*) FROM noc_tickets ".$filterQuery;
      }

      $stmtPage = $dbh->prepare($query);
      $stmtPage->execute($filterParam2); 
      $total_Records = $stmtPage->fetchColumn();     
      $skip = ($pq_rPP * ($pq_curPage - 1));
    
      if ($skip >= $total_Records)
      {        
          $pq_curPage = ceil($total_Records / $pq_rPP);
          if ($pq_curPage < 1) { 
            $pq_curPage = 1;
          }
          $skip = ($pq_rPP * ($pq_curPage - 1));
      }

      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $sql,
      "totalRecords" => $total_Records,
      "curPage" => $pq_curPage,
      "data"    => $mysql_data,
      );
      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

    } elseif ($job == 'get_ticket'){    
    // Get one ticket, apparently haven't used yet
      if ($id == ''){
        $result  = 'error';
        $message = 'id missing';
      } else {
        $stmt = $dbh->query( "SELECT * FROM noc_tickets WHERE `TicketNo` = '" . $id . "'");
        if (!$stmt){
          $result  = 'error';
          $message = 'query error';
          } else {
            $result  = 'success';
            $message = 'query success';
            $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
          }
        }
              // Prepare data
          $data = array(
          "result"  => $result,
          "message" => $message,
          "data"    => $mysql_data,
        );
        // Convert PHP array to JSON array
        $json_data = json_encode($data);
        print $json_data;

      } elseif ($job == 'add_ticket') {    
    // Add ticket
      $query1 = "INSERT INTO noc_tickets SET ";
      if (isset($_POST['TicketNo']))    { $query1 .= "`TicketNo`= :TicketNo , "; }
      if (isset($_POST['Title']))   { $query1 .= "Title = :Title , "; }
      if (isset($_POST['Status']))      { $query1 .= "Status = :Status , "; }
      if (isset($_POST['Carrier'])) { $query1 .= "Carrier = :Carrier , "; }
      if (isset($_POST['CustomerName']))      { $query1 .= "`CustomerName` = :CustomerName , "; } 
      if (isset($_POST['Service']))    { $query1 .= "Service = :Service , "; }
      if (isset($_POST['Downtime']) && $_POST['Downtime'] != '')    { $query1 .= "Downtime = :Downtime , "; } 
      if (isset($_POST['Uptime']) && $_POST['Uptime'] != '')    { $query1 .= "Uptime = :Uptime , "; } 
      if (isset($_POST['Duration']))    { $query1 .= "Duration  = :Duration , "; } 
      if (isset($_POST['Summary']))    { $query1 .= "Summary = :Summary , "; } 
      if (isset($_POST['NextAction']))    { $query1 .= " `NextAction` = :NextAction , "; } 
      if (isset($_POST['RFO']))    { $query1 .= "RFO = :RFO , "; }
      if (isset($_POST['DayCounter']))    { $query1 .= "DayCounter = :DayCounter ,"; }
      if (isset($_POST['TicketCreated']))    { $query1 .= "TicketCreated = :TicketCreated ;"; }

      $query2 = "INSERT INTO noc_detail_log SET ";
      if (isset($_POST['TicketNo']))    { $query2 .= "`TicketNo`= :TicketNo , "; }
      $query2 .= "`timestamp`= NOW(), ";
      $query2 .= "logger = '".$loginUser."', ";
      if (isset($_POST['attachmentHolder']))    { $query2 .= "attachment = :attachment , "; }
      if (isset($_POST['DetailLog']))    { $query2 .= "log_detail = :log_detail , "; }
      if (isset($_POST['Status']))    { $query2 .= "statusstamp = :statusstamp , "; }
      if (isset($_POST['LogCategory']))    { $query2 .= "log_category = :log_category ; "; }

      $stmt1 = $dbh->prepare($query1);
      $stmt2 = $dbh->prepare($query2);

      if (isset($_POST['TicketNo']))    { $stmt1->bindParam(':TicketNo', $_POST['TicketNo'], PDO::PARAM_STR);}
      if (isset($_POST['Title']))    { $stmt1->bindParam(':Title', $_POST['Title'], PDO::PARAM_STR);}
      if (isset($_POST['Status']))    { $stmt1->bindParam(':Status', $_POST['Status'], PDO::PARAM_STR);}
      if (isset($_POST['Carrier']))    { $stmt1->bindParam(':Carrier', $_POST['Carrier'], PDO::PARAM_STR);}
      if (isset($_POST['CustomerName']))    { $stmt1->bindParam(':CustomerName', $_POST['CustomerName'], PDO::PARAM_STR);}
      if (isset($_POST['Service']))    { $stmt1->bindParam(':Service', $_POST['Service'], PDO::PARAM_STR);}
      if (isset($_POST['Downtime']) && $_POST['Downtime'] != '')   { $stmt1->bindParam(':Downtime', $_POST['Downtime'], PDO::PARAM_STR);}
      if (isset($_POST['Uptime']) && $_POST['Uptime'] != '')    { $stmt1->bindParam(':Uptime', $_POST['Uptime'], PDO::PARAM_STR);}
      if (isset($_POST['Duration']))    { $stmt1->bindParam(':Duration', $_POST['Duration'], PDO::PARAM_STR);}
      if (isset($_POST['Summary']))    { $stmt1->bindParam(':Summary', $_POST['Summary'], PDO::PARAM_STR);}
      if (isset($_POST['NextAction']))    { $stmt1->bindParam(':NextAction', $_POST['NextAction'], PDO::PARAM_STR);}
      if (isset($_POST['RFO']))    { $stmt1->bindParam(':RFO', $_POST['RFO'], PDO::PARAM_STR, 45);}
      if (isset($_POST['DayCounter']))    { $stmt1->bindParam(':DayCounter', $_POST['DayCounter'], PDO::PARAM_INT);}
      if (isset($_POST['TicketCreated']))    { $stmt1->bindParam(':TicketCreated', $_POST['TicketCreated'], PDO::PARAM_STR);}

      if (isset($_POST['TicketNo']))    {  $stmt2->bindParam(':TicketNo', $_POST['TicketNo'], PDO::PARAM_STR);}
      if (isset($_POST['attachmentHolder']))    {  $stmt2->bindParam(':attachment', $_POST['attachmentHolder'], PDO::PARAM_STR);}
      if (isset($_POST['DetailLog']))    {  $stmt2->bindParam(':log_detail', $_POST['DetailLog'], PDO::PARAM_STR);}
      if (isset($_POST['Status']))    {  $stmt2->bindParam(':statusstamp', $_POST['Status'], PDO::PARAM_STR);}
      if (isset($_POST['LogCategory']))    {  $stmt2->bindParam(':log_category', $_POST['LogCategory'], PDO::PARAM_STR);}

      $stmt1->execute();
      $stmt2->execute();

      if (!$stmt1 || !$stmt2){
        $result  = 'error';
        $message = 'query error';
      } else {  
        $result  = 'success';
        $message = 'message success';
      }
          // Prepare data
        $data = array(
        "result"  => $result,
        "message" => $message,
      );

      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

    } elseif ($job == 'edit_ticket') {    
    // Edit ticket as well as add noc_detail_log
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query1 = "UPDATE noc_tickets SET ";
      if (isset($_POST['Title']) )   { $query1 .= "Title = :Title , "; }
      if (isset($_POST['Status']) )      { $query1 .= "Status = :Status , "; }
      if (isset($_POST['Carrier']) ) { $query1 .= "Carrier = :Carrier , "; }
      if (isset($_POST['CustomerName']) )      { $query1 .= "`CustomerName` = :CustomerName , "; } 
      if (isset($_POST['Service']) )    { $query1 .= "Service = :Service , "; }
      if (isset($_POST['Downtime']) && $_POST['Downtime'] != '')    { $query1 .= "Downtime = :Downtime , "; } 
      if (isset($_POST['Uptime']) && $_POST['Uptime'] != '')    { $query1 .= "Uptime = :Uptime , "; } 
      if (isset($_POST['Duration']) )    { $query1 .= "Duration  = :Duration , "; } 
      if (isset($_POST['Summary']) )    { $query1 .= "Summary = :Summary , "; } 
      if (isset($_POST['NextAction']) )    { $query1 .= " `NextAction` = :NextAction , "; } 
      if (isset($_POST['RFO']) )    { $query1 .= "RFO = :RFO "; }

      $query1 .= " WHERE `TicketNo` = '" . $id . "';";

      $query2 = "INSERT INTO noc_detail_log SET ";
      $query2 .= "`TicketNo`= '".$id."' , ";
      $query2 .= "`timestamp`= NOW(), ";
      $query2 .= "logger = '".$loginUser."', ";
      if (isset($_POST['DetailLog']) )    { $query2 .= "log_detail = :log_detail ,"; }
      if (isset($_POST['attachmentHolder']))    { $query2 .= "attachment = :attachment , "; }
      if (isset($_POST['Status']))    { $query2 .= "statusstamp = :statusstamp , "; }    
      if (isset($_POST['LogCategory']))    { $query2 .= "log_category = :log_category ; "; }

      $stmt1 = $dbh->prepare($query1);
      $stmt2 = $dbh->prepare($query2);

      if (isset($_POST['Title']) )    { $stmt1->bindParam(':Title', $_POST['Title']);}
      if (isset($_POST['Status']) )    { $stmt1->bindParam(':Status', $_POST['Status']);}
      if (isset($_POST['Carrier']) )    { $stmt1->bindParam(':Carrier', $_POST['Carrier']);}
      if (isset($_POST['CustomerName']) )    { $stmt1->bindParam(':CustomerName', $_POST['CustomerName']);}
      if (isset($_POST['Service']) )    { $stmt1->bindParam(':Service', $_POST['Service']);}
      if (isset($_POST['Downtime']) && $_POST['Downtime'] != '')   { $stmt1->bindParam(':Downtime', $_POST['Downtime']);}
      if (isset($_POST['Uptime']) && $_POST['Uptime'] != '')    { $stmt1->bindParam(':Uptime', $_POST['Uptime']);}
      if (isset($_POST['Duration']) )    { $stmt1->bindParam(':Duration', $_POST['Duration']);}
      if (isset($_POST['Summary']) )    { $stmt1->bindParam(':Summary', $_POST['Summary']);}
      if (isset($_POST['NextAction']) )    { $stmt1->bindParam(':NextAction', $_POST['NextAction']);}
      if (isset($_POST['RFO']) )    { $stmt1->bindParam(':RFO', $_POST['RFO']);}

      if (isset($_POST['DetailLog']) )    {  $stmt2->bindParam(':log_detail', $_POST['DetailLog']);}
      if (isset($_POST['attachmentHolder']))    {  $stmt2->bindParam(':attachment', $_POST['attachmentHolder'], PDO::PARAM_STR);}
      if (isset($_POST['Status']))    {  $stmt2->bindParam(':statusstamp', $_POST['Status'], PDO::PARAM_STR);}  // TODO: find out why we need PDO::PARAM_STR     
      if (isset($_POST['LogCategory']) )    {  $stmt2->bindParam(':log_category', $_POST['LogCategory']);}

      $stmt1->execute();
      $stmt2->execute();

      if (!$stmt1 || !$stmt2){
          $result  = 'error';
          $message = 'query error';
        } else {
          $result  = 'success';
          $message = 'query success';
        }
      }
            // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "ticketNo" => $_POST['TicketNo'],
    );

    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;

    } elseif ($job == 'get_detailLog') {    
    // Get noc_detail_log
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $sql = "SELECT * FROM noc_detail_log WHERE `TicketNo` = '" . $id . "'";
      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
    }

          // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "data"    => $mysql_data,
    );

    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;

    } elseif ($job == 'get_allDetailLog') {      
      // Get tickets
      if ( !isset($_GET["pq_filter"]) && isset($_GET["pq_curpage"]) && isset($_GET["pq_rpp"])) {       
        $sql ="SELECT * FROM noc_detail_log " .$sortQuery. " limit ".$skip." , ".$pq_rPP;
        // $query ="SELECT count(*) FROM noc_detail_log";
      } else {        // TODO: calling up twice, how not to?
        $sql ="SELECT * FROM noc_detail_log ".$filterQuery. " ".$sortQuery. " limit ".$skip." , ".$pq_rPP;
        $query ="SELECT count(*) FROM noc_detail_log ".$filterQuery;
      }

      $stmtPage = $dbh->prepare($query);
      $stmtPage->execute($filterParam2); 
      $total_Records = $stmtPage->fetchColumn();     
      $skip = ($pq_rPP * ($pq_curPage - 1));
    
      if ($skip >= $total_Records)
      {        
          $pq_curPage = ceil($total_Records / $pq_rPP);
          if ($pq_curPage < 1) { 
            $pq_curPage = 1;
          }
          $skip = ($pq_rPP * ($pq_curPage - 1));
      }

      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $sql,
      "totalRecords" => $total_Records,
      "curPage" => $pq_curPage,
      "data"    => $mysql_data,
      );
      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

    } elseif ($job == 'get_latestDate') {
    
    // Get latest date for implement to primary key
    $sql = "SELECT MAX(TicketCreated) as Downtime, `DayCounter` FROM noc_tickets where `TicketCreated` = (SELECT MAX(TicketCreated) as Downtime FROM noc_tickets) group by TicketCreated, `DayCounter`";
      // $stmt = $dbh->prepare($sql);
      $stmt = $dbh->query($sql); 
    if (!$stmt  ){
      $result  = 'error';
      $message = 'query error';
    } else {
      $result  = 'success';
      $message = 'query success';
      $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }    
          // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "data"    => $mysql_data,
    );

    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;

  } elseif ($job == 'get_latestTimeStamp') {    
    // Get latest timestamp from particular ticket for duration
      if ($id == ''){
        $result  = 'error';
        $message = 'id missing';
      } else {
      $sql = "SELECT MAX(`timestamp`) as `timestamp`, `Status` FROM noc_detail_log,noc_tickets where noc_detail_log.`TicketNo` =  '".$id."' and noc_tickets.`TicketNo` =  '".$id."'";
        // $stmt = $dbh->prepare($sql);
        $stmt = $dbh->query($sql); 
      if (!$stmt  ){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }    
    }
          // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "data"    => $mysql_data,
    );

    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;

  } elseif ($job == 'get_customers') {    
    // Get customer name to fill dropdown
    $sql = "SELECT CustomerName FROM noc_customers order by CustomerName ASC";
      // $stmt = $dbh->prepare($sql);
      $stmt = $dbh->query($sql); 
    if (!$stmt  ){
      $result  = 'error';
      $message = 'query error';
    } else {
      $result  = 'success';
      $message = 'query success';
      $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }    
          // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "data"    => $mysql_data,
    );

    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;
  } elseif ($job == 'get_allcustomers')  { 
      // Get all customers 
      if ( !isset($_GET["pq_filter"]) && isset($_GET["pq_curpage"]) && isset($_GET["pq_rpp"])) {       
        $sql ="SELECT * FROM noc_customers " .$sortQuery. " limit ".$skip." , ".$pq_rPP;
        // $query ="SELECT count(*) FROM noc_customers";
      } else {        
        $sql ="SELECT * FROM noc_customers ".$filterQuery. " ".$sortQuery. " limit ".$skip." , ".$pq_rPP;
        $query ="SELECT count(*) FROM noc_customers ".$filterQuery;
      }
      
      $stmtPage = $dbh->prepare($query);
      $stmtPage->execute($filterParam2); 
      $total_Records = $stmtPage->fetchColumn();     
      $skip = ($pq_rPP * ($pq_curPage - 1));
    
      if ($skip >= $total_Records)
      {        
          $pq_curPage = ceil($total_Records / $pq_rPP);
            if ($pq_curPage < 1) { //hacky yet still error
            $pq_curPage = 1;
          }
          $skip = ($pq_rPP * ($pq_curPage - 1));
      }

      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); // sometimes got error
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = $sortQuery;
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $sql,
      "totalRecords" => $total_Records,
      "curPage" => $pq_curPage,
      "data"    => $mysql_data,
      );
      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;
    } elseif ($job == 'get_allcustomer')  {   // this is for details   
    // Get customer
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $stmt = $dbh->query( "SELECT Circuit,BasicDiagram,Cacti,OpenNMS,TroubleTicket,SIMaintenance,ServiceManager FROM noc_customers WHERE `cust_no` = '" . $id . "'");
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
    }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "data"    => $mysql_data,
    );
    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;

  }  elseif ($job == 'get_customerdata_byname')  {   
    // Get customer data by customer name (alerady unique)
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $stmt = $dbh->query( "SELECT CustomerName,ContactNo,EmailAddress,CustomerArea,Bandwidth FROM noc_customers WHERE `CustomerName` = '" . $id . "'");
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
    }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "data"    => $mysql_data,
    );
    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;

  } elseif ($job == 'get_allCustomerName')  {   // this is for details   
    // Get customer name only, for ajax dropdown purpose
     if ( isset($_GET["pq_filter"])) {
      $stmt = $dbh->prepare( "SELECT CustomerName FROM noc_customers ".$filterQuery." ORDER BY CustomerName");
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
    }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "data"    => $mysql_data,
    );
    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;

  } elseif ($job == 'get_allPIC')  { 
      // Get all PIC 
      if ( !isset($_GET["pq_filter"]) && isset($_GET["pq_curpage"]) && isset($_GET["pq_rpp"])) {       
      $sql = "SELECT noc_customers.CustomerName,noc_PIC.PIC_name,noc_PIC.PIC_number,noc_PIC.PIC_isMainContact,noc_PIC.PIC_email FROM noc_customers,noc_PIC WHERE noc_customers.cust_no = noc_PIC.cust_no " .$sortQuery. " limit ".$skip." , ".$pq_rPP;
        // $query ="SELECT count(*) FROM noc_customers";
      } else {        
      $sql = "SELECT noc_customers.CustomerName,noc_PIC.PIC_name,noc_PIC.PIC_number,noc_PIC.PIC_isMainContact,noc_PIC.PIC_email FROM noc_customers,noc_PIC " .$filterQuery. " AND noc_customers.cust_no = noc_PIC.cust_no ".$sortQuery. " limit ".$skip." , ".$pq_rPP;
        $query ="SELECT count(*) FROM noc_customers,noc_PIC ".$filterQuery. " AND noc_customers.cust_no = noc_PIC.cust_no";
      }
      
      $stmtPage = $dbh->prepare($query);
      $stmtPage->execute($filterParam2); 
      $total_Records = $stmtPage->fetchColumn();     
      $skip = ($pq_rPP * ($pq_curPage - 1));
    
      if ($skip >= $total_Records)
      {        
          $pq_curPage = ceil($total_Records / $pq_rPP);
            if ($pq_curPage < 1) { //hacky yet still error
            $pq_curPage = 1;
          }
          $skip = ($pq_rPP * ($pq_curPage - 1));
      }

      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); // sometimes got error
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = $sortQuery;
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $sql,
      "totalRecords" => $total_Records,
      "curPage" => $pq_curPage,
      "data"    => $mysql_data,
      );
      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;
    }  elseif ($job == 'get_PIC')  {   
    // Get the PIC
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $stmt = $dbh->query( "SELECT * FROM noc_PIC WHERE `cust_no` = '" . $id . "'");
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
    }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "data"    => $mysql_data,
    );
    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;

  } elseif ($job == 'get_custlogger')  { 
      // Get all customer logger with ID
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $sql = "SELECT * FROM customer_remarks WHERE `CID` = '" . $id . "'";
      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
    }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $sql,
      "data"    => $mysql_data,
      );
      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

    } elseif ($job == 'get_allCustLog')  { 
      // Get all customer logger 
      if ( !isset($_GET["pq_filter"]) && isset($_GET["pq_curpage"]) && isset($_GET["pq_rpp"])) {       
      $sql = "SELECT `timestamp`,logger,log_detail,log_category,attachment,CustomerName FROM customer_remarks, noc_customers where customer_remarks.CID=noc_customers.CID " .$sortQuery. " limit ".$skip." , ".$pq_rPP;
      // $query ="SELECT count(*) FROM customer_remarks";
    } else {
      $sql = "SELECT `timestamp`,logger,log_detail,log_category,attachment,CustomerName FROM customer_remarks, noc_customers " .$filterQuery. " AND customer_remarks.CID=noc_customers.CID ".$sortQuery. " limit ".$skip." , ".$pq_rPP;
      $query ="SELECT count(*) FROM customer_remarks,noc_customers ".$filterQuery;
      }

      $stmtPage = $dbh->prepare($query);
      $stmtPage->execute($filterParam2); 
      $total_Records = $stmtPage->fetchColumn();     
      $skip = ($pq_rPP * ($pq_curPage - 1));
    
      if ($skip >= $total_Records)
      {        
          $pq_curPage = ceil($total_Records / $pq_rPP);
          if ($pq_curPage < 1) { 
            $pq_curPage = 1;
          }
          $skip = ($pq_rPP * ($pq_curPage - 1));
      }

      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $sql,
      "totalRecords" => $total_Records,
      "curPage" => $pq_curPage,
      "data"    => $mysql_data,
      );
      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

    } elseif ($job == 'get_assets')  {      
      // Get assets
      if ( !isset($_GET["pq_filter"]) && isset($_GET["pq_curpage"]) && isset($_GET["pq_rpp"])) {       
        $sql ="SELECT * FROM noc_assets " .$sortQuery. " limit ".$skip." , ".$pq_rPP;
        //$query ="SELECT count(*) FROM noc_assets";
      } else {        
        $sql ="SELECT * FROM noc_assets ".$filterQuery. " ".$sortQuery. " limit ".$skip." , ".$pq_rPP;
        $query ="SELECT count(*) FROM noc_assets ".$filterQuery;
      }

      $stmtPage = $dbh->prepare($query);
      $stmtPage->execute($filterParam2); 
      $total_Records = $stmtPage->fetchColumn();     
      $skip = ($pq_rPP * ($pq_curPage - 1));
    
      if ($skip >= $total_Records)
      {        
          $pq_curPage = ceil($total_Records / $pq_rPP);
          if ($pq_curPage < 1) { 
            $pq_curPage = 1;
          }
          $skip = ($pq_rPP * ($pq_curPage - 1));
      }

      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "totalRecords" => $total_Records,
      "curPage" => $pq_curPage,
      "data"    => $mysql_data,
      );
      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

    } elseif ($job == 'get_allAssetName')  {   // this is for details   
    // Get Asset name only, for ajax dropdown purpose
      $stmt = $dbh->prepare( "SELECT asset_name FROM noc_assets ORDER BY asset_name");
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "data"    => $mysql_data,
    );
    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;

  } elseif ($job == 'get_assetLog')  { 
      // Get all asset log logger with ID
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $sql = "SELECT * FROM asset_remarks WHERE `asset_no` = '" . $id . "'";
      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
    }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "data"    => $mysql_data,
      );
      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

     } elseif ($job == 'get_asset_remarks') {      
      // Get all asset remarks
      if ( !isset($_GET["pq_filter"]) && isset($_GET["pq_curpage"]) && isset($_GET["pq_rpp"])) {       
        $sql ="SELECT * FROM asset_remarks " .$sortQuery. " limit ".$skip." , ".$pq_rPP;
        // $query ="SELECT count(*) FROM asset_remarks";
      } else {        // TODO: calling up twice, how not to?
        $sql ="SELECT * FROM asset_remarks ".$filterQuery. " ".$sortQuery. " limit ".$skip." , ".$pq_rPP;
        $query ="SELECT count(*) FROM asset_remarks ".$filterQuery;
      }

      $stmtPage = $dbh->prepare($query);
      $stmtPage->execute($filterParam2); 
      $total_Records = $stmtPage->fetchColumn();     
      $skip = ($pq_rPP * ($pq_curPage - 1));
    
      if ($skip >= $total_Records)
      {        
          $pq_curPage = ceil($total_Records / $pq_rPP);
          if ($pq_curPage < 1) { 
            $pq_curPage = 1;
          }
          $skip = ($pq_rPP * ($pq_curPage - 1));
      }

      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $sql,
      "totalRecords" => $total_Records,
      "curPage" => $pq_curPage,
      "data"    => $mysql_data,
      );
      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

    } elseif ($job == 'add_asset') {    
    // Add asset and remark
      $query1 = "INSERT INTO noc_assets SET ";
      if (isset($_POST['ItemName']))      { $query1 .= "asset_name = :asset_name , "; }
      if (isset($_POST['Quantity'])) { $query1 .= "`quantity` = :quantity , "; }
      if (isset($_POST['SerialNo']))      { $query1 .= "`serial_no` = :serial_no , "; } 
      if (isset($_POST['Location']))    { $query1 .= "location = :location , "; }
      if (isset($_POST['Remark']))    { $query1 .= "remark = :remark , "; }

      if (isset($_POST['CanBorrow']))    { $query1 .= "can_borrow = '1';"; } else { $query1 .= "can_borrow = '0';"; }
           
      $stmt1 = $dbh->prepare($query1);

      if (isset($_POST['ItemName']))    { $stmt1->bindParam(':asset_name', $_POST['ItemName'], PDO::PARAM_STR);}
      if (isset($_POST['Quantity']))    { $stmt1->bindParam(':quantity', $_POST['Quantity'], PDO::PARAM_INT);}
      if (isset($_POST['SerialNo']))    { $stmt1->bindParam(':serial_no', $_POST['SerialNo'], PDO::PARAM_STR);}
      if (isset($_POST['Location']))    { $stmt1->bindParam(':location', $_POST['Location'], PDO::PARAM_STR);}
      if (isset($_POST['Remark']))    { $stmt1->bindParam(':remark', $_POST['Remark'], PDO::PARAM_STR);}

      try {

        $stmt1->execute();

        $asset_no_fk = $dbh->lastInsertId();
      
        $query2 = "INSERT INTO asset_remarks SET ";
        if (isset($asset_no_fk))    { $query2 .= "`asset_no`= :asset_no , "; }
        $query2 .= "`timestamp`= NOW(), ";
        $query2 .= "logger = '".$loginUser."', ";
        if (isset($_POST['DetailLog']))    { $query2 .= "log_detail = :log_detail ; "; }
      
        $stmt2 = $dbh->prepare($query2);

        // TODO: get around AssetNo of noc_assets
        if (isset($asset_no_fk))    {  $stmt2->bindParam(':asset_no', $asset_no_fk, PDO::PARAM_INT);}
        if (isset($_POST['DetailLog']))    {  $stmt2->bindParam(':log_detail', $_POST['DetailLog'], PDO::PARAM_STR);}

        $stmt2->execute();

        $result  = 'success';
        $message = 'query success';

      } catch (PDOException $e) {
        if ($e->errorInfo[1] == 1062) {
          $result = 'error';
          $message = 'Duplicate Asset value, transaction aborted';
        } else {
          $result = 'error';
          $message = 'Unknown error, transaction aborted';
        }
      }
          // Prepare data
        $data = array(
        "result"  => $result,
        "message" => $message,
      );

      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

    } elseif ($job == 'edit_asset') {
    // Edit asset as well as add asset_remarks
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query1 = "UPDATE noc_assets SET ";
      if (isset($_POST['ItemName']))      { $query1 .= "asset_name = :asset_name , "; }
      if (isset($_POST['Quantity'])) { $query1 .= "`quantity` = :quantity , "; }
      if (isset($_POST['SerialNo']))      { $query1 .= "`serial_no` = :serial_no , "; } 
      if (isset($_POST['Location']))    { $query1 .= "location = :location , "; }
      if (isset($_POST['Remark']))    { $query1 .= "remark = :remark , "; }

      if (isset($_POST['CanBorrow']))    { $query1 .= "can_borrow = '1' "; } else { $query1 .= "can_borrow = '0' "; }
      
      $query1 .= " WHERE `asset_no` = '" . $id . "';";

      $query2 = "INSERT INTO asset_remarks SET ";
      if (isset($_POST['AssetNo']))    { $query2 .= "`asset_no`= :asset_no , "; }
      $query2 .= "`timestamp`= NOW(), ";
      $query2 .= "logger = '".$loginUser."', ";
      if (isset($_POST['DetailLog']))    { $query2 .= "log_detail = :log_detail ;"; }

      $stmt1 = $dbh->prepare($query1);
      $stmt2 = $dbh->prepare($query2);

      if (isset($_POST['ItemName']))    { $stmt1->bindParam(':asset_name', $_POST['ItemName']);}
      if (isset($_POST['Quantity']))    { $stmt1->bindParam(':quantity', $_POST['Quantity']);}
      if (isset($_POST['SerialNo']))    { $stmt1->bindParam(':serial_no', $_POST['SerialNo']);}
      if (isset($_POST['Location']))    { $stmt1->bindParam(':location', $_POST['Location']);}
      if (isset($_POST['Remark']))    { $stmt1->bindParam(':remark', $_POST['Remark']);}

      if (isset($_POST['AssetNo']))    {  $stmt2->bindParam(':asset_no', $_POST['AssetNo']);}
      if (isset($_POST['DetailLog']))    {  $stmt2->bindParam(':log_detail', $_POST['DetailLog']);}

      $stmt1->execute();
      $stmt2->execute();

    if (!$stmt1 || !$stmt2){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
      }
    }
            // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
    );

    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;

    } elseif ($job == 'get_logbook')  {      
      // Get logbook
      if ( !isset($_GET["pq_filter"]) && isset($_GET["pq_curpage"]) && isset($_GET["pq_rpp"])) {       
        $sql ="SELECT * FROM noc_logbook " .$sortQuery. " limit ".$skip." , ".$pq_rPP;
        //$query ="SELECT count(*) FROM noc_logbook";
      } else {        
        $sql ="SELECT * FROM noc_logbook ".$filterQuery. " ".$sortQuery. " limit ".$skip." , ".$pq_rPP;
        $query ="SELECT count(*) FROM noc_logbook ".$filterQuery;
      }

      $stmtPage = $dbh->prepare($query);
      $stmtPage->execute($filterParam2); 
      $total_Records = $stmtPage->fetchColumn();     
      $skip = ($pq_rPP * ($pq_curPage - 1));
    
      if ($skip >= $total_Records)
      {        
          $pq_curPage = ceil($total_Records / $pq_rPP);
          if ($pq_curPage < 1) { 
            $pq_curPage = 1;
          }
          $skip = ($pq_rPP * ($pq_curPage - 1));
      }

      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $sql,
      "totalRecords" => $total_Records,
      "curPage" => $pq_curPage,
      "data"    => $mysql_data,
      );
      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

    } elseif ($job == 'get_logbookLog')  { 
      // Get all logbook log logger with ID
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $sql = "SELECT * FROM logbook_remarks WHERE `logbook_no` = '" . $id . "'";
      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
    }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "data"    => $mysql_data,
      );
      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

     } elseif ($job == 'get_logbook_remarks') {      
      // Get all logbook remarks
      if ( !isset($_GET["pq_filter"]) && isset($_GET["pq_curpage"]) && isset($_GET["pq_rpp"])) {       
        $sql ="SELECT * FROM logbook_remarks " .$sortQuery. " limit ".$skip." , ".$pq_rPP;
        // $query ="SELECT count(*) FROM logbook_remarks";
      } else {        // TODO: calling up twice, how not to?
        $sql ="SELECT * FROM logbook_remarks ".$filterQuery. " ".$sortQuery. " limit ".$skip." , ".$pq_rPP;
        $query ="SELECT count(*) FROM logbook_remarks ".$filterQuery;
      }

      $stmtPage = $dbh->prepare($query);
      $stmtPage->execute($filterParam2); 
      $total_Records = $stmtPage->fetchColumn();     
      $skip = ($pq_rPP * ($pq_curPage - 1));
    
      if ($skip >= $total_Records)
      {        
          $pq_curPage = ceil($total_Records / $pq_rPP);
          if ($pq_curPage < 1) { 
            $pq_curPage = 1;
          }
          $skip = ($pq_rPP * ($pq_curPage - 1));
      }

      $stmt = $dbh->prepare($sql);
      $stmt->execute($filterParam); 
      if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
        $mysql_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      }
      // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $sql,
      "totalRecords" => $total_Records,
      "curPage" => $pq_curPage,
      "data"    => $mysql_data,
      );
      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

    } elseif ($job == 'add_logbook') {    
    // Add logbook and last_remark

      $userItems = '';
      $userStartTime = '';
      $userRemarks = '';
      $lendee_name = '';
      $userStatus = '';
      if (isset($_POST['userEmail'])) { $lendee_email = $_POST['userEmail']; }

      $query1 = "INSERT INTO noc_logbook SET ";
      if (isset($_POST['LendeeName']))      { $query1 .= "lendee_name = :lendee_name , "; }

      if (isset($_POST['AssetName']))      { $query1 .= "asset_name = :asset_name , "; $userItems = $_POST['AssetName'];}
      if (isset($_POST['StartTime'])) { $query1 .= "`start_time` = :start_time , "; $userStartTime = $_POST['StartTime'];}
      if (isset($_POST['EndTime']))      { $query1 .= "`end_time` = :end_time , "; } 
      if (isset($_POST['Status']))    { $query1 .= "status = :status , "; $userStatus = $_POST['Status'];}
      if (isset($_POST['AddRemark']))    { $query1 .= "last_remark = :last_remark , "; $userRemarks = $_POST['AddRemark'];}

      if (isset($_POST['userEmail']))    { $query1 .= "lendee_email = :lendee_email;"; }
           
      $stmt1 = $dbh->prepare($query1);
      if (isset($_POST['LendeeName']))    { $stmt1->bindParam(':lendee_name', $_POST['LendeeName'], PDO::PARAM_STR);}

      if (isset($_POST['AssetName']))    { $stmt1->bindParam(':asset_name', $_POST['AssetName'], PDO::PARAM_STR); }
      if (isset($_POST['StartTime']))    { $stmt1->bindParam(':start_time', $_POST['StartTime'], PDO::PARAM_STR); }
      if (isset($_POST['EndTime']))    { $stmt1->bindParam(':end_time', $_POST['EndTime'], PDO::PARAM_STR); }
      if (isset($_POST['Status']))    { $stmt1->bindParam(':status', $_POST['Status'], PDO::PARAM_STR); }
      if (isset($_POST['AddRemark']))    { $stmt1->bindParam(':last_remark', $_POST['AddRemark'], PDO::PARAM_STR); }
      if (isset($_POST['userEmail']))    { $stmt1->bindParam(':lendee_email', $_POST['userEmail'], PDO::PARAM_STR); }

      try {
        $stmt1->execute();

        $logbook_no_fk = $dbh->lastInsertId();
      
        $query2 = "INSERT INTO logbook_remarks SET ";
        if (isset($logbook_no_fk))    { $query2 .= "`logbook_no`= :logbook_no , "; }
        $query2 .= "`timestamp`= NOW(), ";
        $query2 .= "logger = '".$loginUser."', ";
        if (isset($_POST['AddRemark']))    { $query2 .= "remark_log = :remark_log ; "; }
      
        $stmt2 = $dbh->prepare($query2);

        // TODO: get around logbook_no of noc_logbook
        if (isset($logbook_no_fk))    {  $stmt2->bindParam(':logbook_no', $logbook_no_fk, PDO::PARAM_INT);}
        if (isset($_POST['AddRemark']))    {  $stmt2->bindParam(':remark_log', $_POST['AddRemark'], PDO::PARAM_STR);}

        $stmt2->execute();

        $result  = 'success';
        $message = 'query success';

        $recipient = $loginEmail;
        $bodyMail = "Dear {$loginUser}, \n\n\nYou have proposed to borrow {$userItems} from {$userStartTime}\n\nwith the following remarks : {$userRemarks},\n\nnow your status is : {$userStatus}.\n\n\nBest Regards,\n\nLogBook Admin";
        // $bodyMail = "loginUser: {$loginUser}\n,loginEmail: {$loginEmail}\n,lendee_email: {$lendee_email}\n,userItems: {$userItems}\n,userRemarks: {$userRemarks}\n,userStatus: {$userStatus}\n";
        $subjectMail = "Borrowing of {$userItems} by {$loginUser} [{$userStatus}]";
        mail("{$recipient},noc-members@ntt.co.id",$subjectMail,$bodyMail,"From: logbook@noconsole.ntt.co.id".PHP_EOL); // success

      } catch (PDOException $e) {
        if ($e->errorInfo[1] == 1062) {
          $result = 'error';
          $message = 'Duplicate logbook value, transaction aborted';
        } else {
          $result = 'error';
          $message = 'Unknown error, transaction aborted';
        }
      }
          // Prepare data
        $data = array(
        "result"  => $result,
        "message" => $message,
      );

      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

    } elseif ($job == 'edit_logbook') {
    // Edit logbook as well as add logbook_remarks
      $userItems = '';
      $userStartTime = '';
      $userRemarks = '';
      if (isset($_POST['LendeeName'])) { $lendee_name = $_POST['LendeeName']; }
      $userStatus = '';
      if (isset($_POST['userEmail'])) { $lendee_email = $_POST['userEmail']; }

    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query1 = "UPDATE noc_logbook SET ";
      if (isset($_POST['AssetName']))      { $query1 .= "asset_name = :asset_name , ";  $userItems = $_POST['AssetName']; }
      if (isset($_POST['StartTime'])) { $query1 .= "`start_time` = :start_time , "; $userStartTime = $_POST['StartTime']; }
      if (isset($_POST['EndTime']))      { $query1 .= "`end_time` = :end_time , "; } 
      if (isset($_POST['Status']))    { $query1 .= "status = :status , ";  $userStatus = $_POST['Status']; }
      if (isset($_POST['AddRemark']))    { $query1 .= "last_remark = :last_remark "; $userRemarks = $_POST['AddRemark']; }
      
      $query1 .= " WHERE `logbook_no` = '" . $id . "';";

      $query2 = "INSERT INTO logbook_remarks SET ";
      if (isset($_POST['LogbookNo']))    { $query2 .= "`logbook_no`= :logbook_no , "; }
      $query2 .= "`timestamp`= NOW(), ";
      $query2 .= "logger = '".$loginUser."', ";
      if (isset($_POST['AddRemark']))    { $query2 .= "remark_log = :remark_log ;"; }

      $stmt1 = $dbh->prepare($query1);
      $stmt2 = $dbh->prepare($query2);

      if (isset($_POST['AssetName']))    { $stmt1->bindParam(':asset_name', $_POST['AssetName']);}
      if (isset($_POST['StartTime']))    { $stmt1->bindParam(':start_time', $_POST['StartTime']);}
      if (isset($_POST['EndTime']))    { $stmt1->bindParam(':end_time', $_POST['EndTime']);}
      if (isset($_POST['Status']))    { $stmt1->bindParam(':status', $_POST['Status']);}
      if (isset($_POST['AddRemark']))    { $stmt1->bindParam(':last_remark', $_POST['AddRemark']);}

      if (isset($_POST['LogbookNo']))    {  $stmt2->bindParam(':logbook_no', $_POST['LogbookNo']);}
      if (isset($_POST['AddRemark']))    {  $stmt2->bindParam(':remark_log', $_POST['AddRemark']);} // because AddRemark already bound

      $stmt1->execute();
      $stmt2->execute();

    if (!$stmt1 || !$stmt2){
        $result  = 'error';
        $message = $query2;
      } else {
        $result  = 'success';
        $message = 'query success';

        $recipient = $loginEmail;
        // $recipient = 'm.ardhi@ntt.co.id';
        $bodyMail = "Dear {$loginUser}, \n\n\nYou have updated log for {$userItems} borrowal with starting time {$userStartTime}\nand the following remark : {$userRemarks},\n\nnow {$lendee_name}'s status is : {$userStatus}.\n\n\nBest Regards,\n\nLogBook Admin";
        // $bodyMail = "loginUser: {$loginUser}\n,loginEmail: {$loginEmail}\n,lendee_email: {$lendee_email}\n,userItems: {$userItems}\n,userRemarks: {$userRemarks}\n,userStatus: {$userStatus}\n";
        $subjectMail = "Borrowing of {$userItems} by {$lendee_name} [{$userStatus}]";
        mail("{$recipient},noc-members@ntt.co.id,{$lendee_email}",$subjectMail,$bodyMail,"From: logbook@noconsole.ntt.co.id".PHP_EOL); // lendee email still not working
      }
    }
            // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
    );

    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;

    } elseif ($job == 'add_customer'){    
    // Add customer
      $query1 = "INSERT INTO noc_customers SET ";
      if (isset($_POST['CID']))   { $query1 .= "CID = :CID , "; }
      if (isset($_POST['CustomerName']))      { $query1 .= "CustomerName = :CustomerName , "; }
      if (isset($_POST['PERouter'])) { $query1 .= "PERouter = :PERouter , "; }
      if (isset($_POST['Service']))      { $query1 .= "`Service` = :Service , "; } 
      if (isset($_POST['CarrierName']))    { $query1 .= "CarrierName = :CarrierName , "; }
      if (isset($_POST['ContactNo']))   { $query1 .= "ContactNo = :ContactNo , "; } 
      if (isset($_POST['EmailAddress']))    { $query1 .= "EmailAddress = :EmailAddress , "; } 
      if (isset($_POST['Bandwidth']))    { $query1 .= "Bandwidth  = :Bandwidth , "; } 
      if (isset($_POST['CustomerArea']))    { $query1 .= "CustomerArea = :CustomerArea , "; } 
      if (isset($_POST['Circuit']))    { $query1 .= "Circuit = :Circuit , "; } 
      
      if (isset($_POST['Cacti']))    { $query1 .= "Cacti = '1' , "; } else { $query1 .= "Cacti = '0' , "; }
      if (isset($_POST['BasicDiagram']))    { $query1 .= "BasicDiagram = '1' , "; } else { $query1 .= "BasicDiagram = '0' , "; }
      if (isset($_POST['OpenNMS']))    { $query1 .= "OpenNMS = '1' , "; } else { $query1 .= "OpenNMS = '0' , "; }
      if (isset($_POST['TroubleTicket']))    { $query1 .= "TroubleTicket = '1' , "; } else { $query1 .= "TroubleTicket = '0' , "; }
      if (isset($_POST['SIMaintenance']))    { $query1 .= "SIMaintenance = '1' , "; } else { $query1 .= "SIMaintenance = '0' , "; }
      if (isset($_POST['ServiceManager']))    { $query1 .= "ServiceManager = '1' , "; } else { $query1 .= "ServiceManager = '0' , "; }
      
      if (isset($_POST['Remarks']))    { $query1 .= " `Remarks` = :Remarks;"; } 

      $query2 = "INSERT INTO customer_remarks SET ";
      if (isset($_POST['CID']))    { $query2 .= "`CID`= :CID , "; }
      $query2 .= "`timestamp`= NOW(), ";
      $query2 .= "logger = '".$loginUser."', ";
      if (isset($_POST['attachmentHolder']))    { $query2 .= "attachment = :attachment , "; }
      if (isset($_POST['DetailLog']))    { $query2 .= "log_detail = :log_detail , "; }
      if (isset($_POST['LogCategory']))    { $query2 .= "log_category = :log_category ; "; }
      
      try {
      $stmt1 = $dbh->prepare($query1);
      $stmt2 = $dbh->prepare($query2);

      if (isset($_POST['CID']))    { $stmt1->bindParam(':CID', $_POST['CID'], PDO::PARAM_STR);}
      if (isset($_POST['CustomerName']))    { $stmt1->bindParam(':CustomerName', $_POST['CustomerName'], PDO::PARAM_STR);}
      if (isset($_POST['PERouter']))    { $stmt1->bindParam(':PERouter', $_POST['PERouter'], PDO::PARAM_STR);}
      if (isset($_POST['Service']))    { $stmt1->bindParam(':Service', $_POST['Service'], PDO::PARAM_STR);}
      if (isset($_POST['CarrierName']))    { $stmt1->bindParam(':CarrierName', $_POST['CarrierName'], PDO::PARAM_STR);}
      if (isset($_POST['ContactNo']))    { $stmt1->bindParam(':ContactNo', $_POST['ContactNo'], PDO::PARAM_STR);}
      if (isset($_POST['EmailAddress']))    { $stmt1->bindParam(':EmailAddress', $_POST['EmailAddress'], PDO::PARAM_STR);}
      if (isset($_POST['Bandwidth']))    { $stmt1->bindParam(':Bandwidth', $_POST['Bandwidth'], PDO::PARAM_STR);}
      if (isset($_POST['Circuit']))    { $stmt1->bindParam(':Circuit', $_POST['Circuit'], PDO::PARAM_STR);}
      if (isset($_POST['CustomerArea']))    { $stmt1->bindParam(':CustomerArea', $_POST['CustomerArea'], PDO::PARAM_STR);}
      if (isset($_POST['Remarks']))    { $stmt1->bindParam(':Remarks', $_POST['Remarks'], PDO::PARAM_STR);}

      if (isset($_POST['CID']))    {  $stmt2->bindParam(':CID', $_POST['CID'], PDO::PARAM_INT);}
      if (isset($_POST['attachmentHolder']))    {  $stmt2->bindParam(':attachment', $_POST['attachmentHolder'], PDO::PARAM_STR);}
      if (isset($_POST['DetailLog']))    {  $stmt2->bindParam(':log_detail', $_POST['DetailLog'], PDO::PARAM_STR);}
      if (isset($_POST['LogCategory']))    {  $stmt2->bindParam(':log_category', $_POST['LogCategory'], PDO::PARAM_STR);}

        $stmt1->execute();
        $stmt2->execute();

      $result  = 'success';
      $message = 'query success';
      } catch (PDOException $e) {
        if ($e->errorInfo[1] == 1062) {
          $result = 'error';
          $message = 'Duplicate CID/Customer value, transaction aborted';
        } else {
          $result = 'error';
          $message = 'Unknown error, transaction aborted';
        }
      }
          // Prepare data
        $data = array(
        "result"  => $result,
        "message" => $message,
      );

      // Convert PHP array to JSON array
      $json_data = json_encode($data);
      print $json_data;

    } elseif ($job == 'edit_customer'){
    // Edit customer as well as add customer_remarks
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query1 = "UPDATE noc_customers SET ";
      if (isset($_POST['CID']))   { $query1 .= "CID = :CID , "; }
      if (isset($_POST['CustomerName']))      { $query1 .= "CustomerName = :CustomerName , "; }
      if (isset($_POST['PERouter'])) { $query1 .= "PERouter = :PERouter , "; }
      if (isset($_POST['Service']))      { $query1 .= "`Service` = :Service , "; } 
      if (isset($_POST['CarrierName']))    { $query1 .= "CarrierName = :CarrierName , "; }
      if (isset($_POST['ContactNo']))    { $query1 .= "ContactNo = :ContactNo , "; } 
      if (isset($_POST['EmailAddress']))    { $query1 .= "EmailAddress = :EmailAddress , "; } 
      if (isset($_POST['Bandwidth']))    { $query1 .= "Bandwidth  = :Bandwidth , "; } 
      if (isset($_POST['CustomerArea']))    { $query1 .= "CustomerArea = :CustomerArea , "; } 
      if (isset($_POST['Circuit']))    { $query1 .= "Circuit = :Circuit , "; } 

      if (isset($_POST['Cacti']))    { $query1 .= "Cacti = '1' , "; } else { $query1 .= "Cacti = '0' , "; }
      if (isset($_POST['BasicDiagram']))    { $query1 .= "BasicDiagram = '1' , "; } else { $query1 .= "BasicDiagram = '0' , "; }
      if (isset($_POST['OpenNMS']))    { $query1 .= "OpenNMS = '1' , "; } else { $query1 .= "OpenNMS = '0' , "; }
      if (isset($_POST['TroubleTicket']))    { $query1 .= "TroubleTicket = '1' , "; } else { $query1 .= "TroubleTicket = '0' , "; }
      if (isset($_POST['SIMaintenance']))    { $query1 .= "SIMaintenance = '1' , "; } else { $query1 .= "SIMaintenance = '0' , "; }
      if (isset($_POST['ServiceManager']))    { $query1 .= "ServiceManager = '1' , "; } else { $query1 .= "ServiceManager = '0' , "; }

      if (isset($_POST['Remarks']))    { $query1 .= " `Remarks` = :Remarks  "; } 

      $query1 .= " WHERE `cust_no` = '" . $id . "';";

      $query2 = "INSERT INTO customer_remarks SET ";
      if (isset($_POST['CID']))   { $query2 .= " `CID` = :CID , "; }
      $query2 .= "`timestamp`= NOW(), ";
      $query2 .= "logger = '".$loginUser."', ";
      if (isset($_POST['attachmentHolder']) )    { $query2 .= "attachment = :attachment ,"; }
      if (isset($_POST['DetailLog']) )    { $query2 .= "log_detail = :log_detail ,"; }
      if (isset($_POST['LogCategory']))    { $query2 .= "log_category = :log_category ; "; }

      $stmt1 = $dbh->prepare($query1);
      $stmt2 = $dbh->prepare($query2);

      if (isset($_POST['CID']))    { $stmt1->bindParam(':CID', $_POST['CID'], PDO::PARAM_STR);}
      if (isset($_POST['CustomerName']))    { $stmt1->bindParam(':CustomerName', $_POST['CustomerName'], PDO::PARAM_STR);}
      if (isset($_POST['PERouter']))    { $stmt1->bindParam(':PERouter', $_POST['PERouter'], PDO::PARAM_STR);}
      if (isset($_POST['Service']))    { $stmt1->bindParam(':Service', $_POST['Service'], PDO::PARAM_STR);}
      if (isset($_POST['CarrierName']))    { $stmt1->bindParam(':CarrierName', $_POST['CarrierName'], PDO::PARAM_STR);}
      if (isset($_POST['ContactNo']))    { $stmt1->bindParam(':ContactNo', $_POST['ContactNo'], PDO::PARAM_STR);}
      if (isset($_POST['EmailAddress']))    { $stmt1->bindParam(':EmailAddress', $_POST['EmailAddress'], PDO::PARAM_STR);}
      if (isset($_POST['Bandwidth']))    { $stmt1->bindParam(':Bandwidth', $_POST['Bandwidth'], PDO::PARAM_STR);}
      if (isset($_POST['CustomerArea']))    { $stmt1->bindParam(':CustomerArea', $_POST['CustomerArea'], PDO::PARAM_STR);}
      if (isset($_POST['Circuit']))    { $stmt1->bindParam(':Circuit', $_POST['Circuit'], PDO::PARAM_STR);}
      if (isset($_POST['Remarks']))    { $stmt1->bindParam(':Remarks', $_POST['Remarks'], PDO::PARAM_STR);}

      if (isset($_POST['CID']))    {  $stmt2->bindParam(':CID', $_POST['CID'], PDO::PARAM_STR);}
      if (isset($_POST['attachmentHolder']))    {  $stmt2->bindParam(':attachment', $_POST['attachmentHolder'], PDO::PARAM_STR);}
      if (isset($_POST['DetailLog']))    {  $stmt2->bindParam(':log_detail', $_POST['DetailLog'], PDO::PARAM_STR);}
      if (isset($_POST['LogCategory']))    {  $stmt2->bindParam(':log_category', $_POST['LogCategory'], PDO::PARAM_STR);}

      $stmt1->execute();
      $stmt2->execute();

    if (!$stmt1 || !$stmt2){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
      }
    }
            // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
      "cust_no" => $_POST['cust_no'],
    );

    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;

    } elseif ($job == 'del_customer')  { 
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query = "DELETE FROM noc_customers WHERE cust_no = :cust_no ;";
      $stmt = $dbh->prepare($query);
      $stmt->bindParam(':cust_no', $id, PDO::PARAM_INT);
      $stmt->execute();

    if (!$stmt){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
      }
    }
            // Prepare data
      $data = array(
      "result"  => $result,
      "message" => $message,
    );

    // Convert PHP array to JSON array
    $json_data = json_encode($data);
    print $json_data;
  }
  // Close database connection
  $dbh = null;
}
?>