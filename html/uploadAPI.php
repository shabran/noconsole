<?php
if($_FILES["inputFile"]["name"] != '')
{
 $fileName = $_FILES["inputFile"]["name"];
 $tempLoc = $_FILES["inputFile"]["tmp_name"];
 $location = './uploads/' . $fileName;  
 move_uploaded_file($tempLoc, $location);
 print '<a style="color:blue;text-decoration: underline;" href="'.$location.'" target="_blank">'.$fileName.'</a>';
}
?>
