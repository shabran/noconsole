<?php
// Database details
$db_server   = 'mysql-server';
// $db_server   = 'logbook.local'; // for local development

$db_username = 'nocuser';
$db_password = 'n0cus3r';
// $db_password = 'n0cF00k!nus3r'; // for local development
$db_name     = 'noconsole';

$conn = mysqli_connect($db_server, $db_username, $db_password, $db_name) or die("Connection failed: " . mysqli_connect_error());
if (mysqli_connect_errno()) {
printf("Connect failed: %s\n", mysqli_connect_error());
exit();
}
?>