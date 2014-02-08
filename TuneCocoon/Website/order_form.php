<?php 

session_start() ;

$first_name = $_SESSION['first_name'] ;

?>

<HTML>

<link rel="stylesheet" type="text/css" href="./css/main.css" />

<HEAD>
	<TITLE>Order Form</TITLE>
</HEAD>
<BODY>
	<FORM action="place_order.php" METHOD="POST" name="main_form">

	<TABLE>
		<TR>
			<TD colspan=2>
				Please enter your personal information:
			</TD>
		</TR>
		<TR>
			<TD>
				First Name:
			</TD>
			<TD>
				<input type="text" name="first_name" size=20 value='<?php echo "$first_name" ; ?>'>
			</TD>
		</TR>
	</TABLE>
	
	<input type=submit name=submit value="Place Order">

	</FORM>

</BODY>
</HTML>