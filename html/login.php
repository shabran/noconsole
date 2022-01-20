<?php
// initialize session
session_start();

include("authenticate.php");

// check to see if user is logging out
if(isset($_GET['out'])) {
	// destroy session
	session_unset();
	$_SESSION = array();
	unset($_SESSION['user'],$_SESSION['access'],$_SESSION['username']); // TODO: add $_SESSION['username']
	session_destroy();
}

// check to see if login form has been submitted
if(isset($_POST['userLogin'])){
	// run information through authenticator, essentially a function which included above
	if(authenticate($_POST['userLogin'],$_POST['userPassword']))
	{
    // authentication passed
    // TODO: check again the effect of return_url (Undefined index: return_url in nginx error log)
    $return_to = $_SESSION['return_url'];
    $_SESSION['return_url'] = null; // clear it, just in case.
    if ($return_to != null) {
      header("Location: $return_to");
    } else {
		  header("Location: index.php");
    }
    die();
	} else {
		// authentication failed
		$error = 1;
	}
}

// output error to user
if(isset($error)) echo "Login failed: Incorrect user name, password, or rights<br />";

// output logout success
if(isset($_GET['out'])) echo "<script>alert('logout successful')</script>";
?>

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login - NOConsole</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha256-eZrrJcwDc/3uDhsdt61sL2oOBY362qM3lon1gyExkL0=" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700" rel="stylesheet">
  <!-- Bulma Version 0.6.0 -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.6.0/css/bulma.min.css" integrity="sha256-HEtF7HLJZSC3Le1HcsWbz1hDYFPZCqDhZa9QsCgVUdw=" crossorigin="anonymous" />
  <link rel="stylesheet" type="text/css" href="./src/css/login.css">
</head>
<body>
  <section class="hero is-success is-fullheight">
    <div class="hero-body">
      <div class="container has-text-centered">
        <div class="column is-4 is-offset-4">
					<img src="./src/img/logo.PNG" alt="logo" width="200">
          <div class="box">
            <form action="login.php" method="post">
              <div class="field">
                <div class="control">
                      <input class="input is-large" type="text" placeholder="ntti2010xxx" value="" name="userLogin" autofocus="" required>
                </div>
              </div>

              <div class="field">
                <div class="control">
                  <input class="input is-large" type="password" placeholder="Enter Password" value="" name="userPassword" required>
                </div>
              </div>
              <div class="field">
                <label class="checkbox">
                  <input type="checkbox">
                  Remember me
                </label>
              </div>
							<input class="button is-block is-info is-large" type="submit" name="submit" value="Submit" />
            </form>
          </div>
        </div>
      </div>
    </div>
	</section>
	  <script async type="text/javascript" src="./src/js/bulma.js"></script>
</body>
</html>