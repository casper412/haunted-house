<?php 

require ('./send_order.php') ;

session_start() ;

$first_name = $_POST['first_name'] ;

//Check Types

//Store them back to the session
$_SESSION['first_name'] = $first_name ;

send_email() ;

?>

<HTML>

<link rel="stylesheet" type="text/css" href="./css/main.css" />

<HEAD>
	<TITLE>Order Submitted</TITLE>
</HEAD>
<BODY>

	<TABLE>
		<TR>
			<TD colspan=2>
				Information Summary:
			</TD>
		</TR>
		<TR>
			<TD>
				First Name:
			</TD>
			<TD>
				<?php echo $first_name ;?> 
			</TD>
		</TR>
	</TABLE>
	
</BODY>
</HTML>