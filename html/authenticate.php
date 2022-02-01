<?php
function authenticate($user, $password) {
	if(empty($user) || empty($password)) return false;
 
	// active airectory server
	// $ldap_host = "10.51.148.60";
	$ldap_host = "ldap://openldap:1389";
 
	// active directory DN (base location of ldap search)
	$ldap_dn = "ou=NTTI,DC=NTTAPAC,DC=COM";
	// $ldap_dn = "dc=example,dc=org";
 
	// active directory user group name
	// $ldap_user_group = "ADM";
 
	// active directory manager group name
	$ldap_manager_group = "NOC";
 
	// domain, for purposes of constructing $user
	$ldap_usr_dom = '@nttapac.com';
 
	// connect to active directory
	$ldap = ldap_connect($ldap_host);
 
	// configure ldap params
	ldap_set_option($ldap,LDAP_OPT_PROTOCOL_VERSION,3);
	ldap_set_option($ldap,LDAP_OPT_REFERRALS,0);
 
	// verify user and password
	// if($bind = @ldap_bind($ldap, $user.$ldap_usr_dom, $password)) {
		if($bind = @ldap_bind($ldap, "cn=$user,$ldap_dn", $password)) {
		// valid
		// check presence in groups
		// $filter = "(sAMAccountName=".$user.")";
		$filter = "(uid=".$user.")";
		// $attr = array("memberof","mail");
		// $result = ldap_search($ldap, $ldap_dn, $filter, $attr) or exit("Unable to search LDAP server");
		$result = ldap_search($ldap, $ldap_dn, $filter) or exit("Unable to search LDAP server");
		$entries = ldap_get_entries($ldap, $result);

		$first = ldap_first_entry($ldap, $result);
		$data = ldap_get_dn($ldap, $first);
		
		ldap_unbind($ldap);
		 
		// check groups
		// foreach($entries[0]['memberof'] as $grps) {
		// 	// is manager, break loop, returning access indentificator
		// 	if(strpos($grps, $ldap_manager_group)) { $access = 2; break; }
 
		// 	// is user, returning access indentificator
		// 	if(strpos($grps, $ldap_user_group)) $access = 1;
		// 	$access = 1;
		// 	$access = 2;
		// }
		$access = 2;

		// DONE : create function here to retrieve CN, basically a normal name
		// $username = 'blablah';
		
		// https://goo.gl/uxT5FK
		function getCNofDN($dn) {
			$return=preg_match('/\bCN=(.*?),/',$dn,$dn);
			return($dn[1]);
		}
		
		$username = getCNofDN($data);

		// TODO : create function here to retrieve email
		// $email = 'bla@blah';

		// foreach($entries[0]['mail'] as $mail) {
		// 	$userMail = $mail;
		// }

		if($access != 0) {
			// establish session variables
			$_SESSION['user'] = $user;
			$_SESSION['access'] = $access;
			//$_SESSION['username'] = $username; // new variable added to hold CN
			// $_SESSION['email'] = $userMail; // new variable added to hold CN
			return true;
		} else {
			// user has no rights
			return false;
		}
 
	} else {
		// invalid name or password
		return false;
	}
}
?>
