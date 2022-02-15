<?php
session_start();

if(!isset($_SESSION['user'])) { // turn off when deploy inhouse
	// user is not logged in, do something like redirect to login.php
	$_SESSION['return_url'] = $_SERVER['PHP_SELF'];
	header("Location: login.php");
	die();
}

$loginUser = $_SESSION['user']; // turn off when deploy inhouse
// $loginEmail = $_SESSION['email']; // turn off when deploy inhouse
$loginAccess = $_SESSION['access']; // turn off when deploy inhouse

// include 'webapp.php';
// for non LDAP environment :

// $loginUser = "M. Ardhi";             // turn on to deploy inhouse
// $loginEmail = "m.ardhi@ntt.co.id";   // turn on to deploy inhouse
?>