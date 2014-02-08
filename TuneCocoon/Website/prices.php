<?php 

session_start() ;

$cds = $_SESSION['cds'] ;

$harddrive	= $_SESSION['harddrive'] ;
$cdmedia	= $_SESSION['cdmedia'] ;
	
$gift25	= $_SESSION['gift25'] ;
$gift50	= $_SESSION['gift50'] ;
$gift100	= $_SESSION['gift100'] ;
	
$pickup	= $_SESSION['pickup'] ;
$shipping	= $_SESSION['shipping'] ;
	
?>

<HTML>

<link rel="stylesheet" type="text/css" href="./css/main.css" />
<link rel="stylesheet" type="text/css" href="./css/price.css" />

<HEAD>
	<TITLE>Price Schedule</TITLE>
</HEAD>

<BODY>

<CENTER>
	<FORM action="price_quote.php" METHOD="POST" name="main_form">

	<TABLE class=price border=1>
		<TR>
			<TD colspan=4 class=header>
				Select the services that you want:
			</TD>
		</TR>
		<TR>
			<TD colspan=4 class=header>
				Basic Ripping:
			</TD>
		</TR>
		<TR>
			<TD class=label>
				&nbsp;
			</TD>
			<TD class=input nowrap>
				<input type="text" name="cds" size=5 value='<?php echo "$cds" ; ?>'> CDS
			</TD>
			<TD class=price>
				$1.25 per CD
			</TD>
			<TD class=description>
				Basic ripping of CDs to a digital format.
			</TD>
		</TR>
		<TR>
			<TD colspan=4 class=header>
				Media:
			</TD>
		</TR>
		<TR>
			<TD class=label>
				DVDs:
			</TD>
			<TD class=input>
				&nbsp;
			</TD>

			<TD class=price>
				Included
			</TD>

			<TD class=description>
				Your music will be returned to you on DVDs for permenant backup.
			</TD>
		</TR>
		<TR>
			<TD class=label>
				Hard Drive*:
			</TD>
			<TD class=input>
				<input type="checkbox" name="harddrive" value=harddrive <?php if($harddrive != '') echo 'checked' ; ?>> 
			</TD>
			<TD class=price>
				$125.00
			</TD>
			<TD class=desciption>
				Put your collection on a massive, external hard drive to easily move it 
				from computer to computer and allow for plug and playing your music collection.
			</TD>
		</TR>
		<TR>
			<TD class=label>
				CDs:
			</TD>
			<TD class=input>
				<input type="checkbox" name="cdmedia" value=cdmedia <?php if($cdmedia != '') echo 'checked' ; ?>> 
			</TD>
			<TD class=price>
				$25.00
			</TD>
			<TD class=desciption>
				Some people want their digital music on CD-ROMs because they do not have 
				a DVD drive or perfer CD media to the new larger DVD media.
			</TD>
		</TR>
		<TR>
			<TD colspan=4 class=header>
				Gift Certificates:
			</TD>
		</TR>
		<TR>
			<TD class=label>
				$25 Gift:
			</TD>
			<TD class=input>
				<input type="text" name="gift25" size=5 value='<?php echo "$gift25" ; ?>'> Certificates
			</TD>
			<TD class=price>
				$25.00 each
			</TD>
			<TD class=desciption>
				&nbsp;
			</TD>
		</TR>
		<TR>
			<TD class=label>
				$50 Gift:
			</TD>
			<TD class=input>
				<input type="text" name="gift50" size=5 value='<?php echo "$gift50" ; ?>'> Certificates
			</TD>
			<TD class=price>
				$50.00 each
			</TD>
			<TD class=desciption>
				&nbsp;
			</TD>
		</TR>
		<TR>
			<TD class=label>
				$100 Gift*:
			</TD>
			<TD class=input>
				<input type="text" name="gift100" size=5 value='<?php echo "$gift100" ; ?>'> Certificates
			</TD>
			<TD class=price>
				$100.00 each
			</TD>
			<TD class=desciption>
				This makes a fantastic gift to accompany any new iPod purchuse.
			</TD>
		</TR>
		<TR>
			<TD colspan=4 class=header>
				Shipping:
			</TD>
		</TR>
		<TR>
			<TD class=label>
				Pickup/Delivery*:
			</TD>
			<TD class=input>
				<input type="checkbox" name="pickup" value=pickup <?php if($pickup != '') echo 'checked' ; ?>> 
			</TD>
			<TD class=price>
				$40.00
			</TD>
			<TD class=desciption>
				Have Tune Cocoon come right to your door to pickup and drop off your media to avoid losing it when shipping.
			</TD>
		</TR>
		<TR>
			<TD class=label>
				Shipping:
			</TD>
			<TD class=input>
				<input type="checkbox" name="shipping" value=shipping <?php if($shipping != '') echo 'checked' ; ?>> 
			</TD>
			<TD class=price>
				Contact Us
			</TD>
			<TD class=desciption>
				Contact us after placing your order for shipping instructions.
			</TD>
		</TR>
		<TR>
			<TD colspan=4>
				<I>Recommended Services</I>
			</TD>
		</TR>
	</TABLE>
	
	<input type=submit name=submit value="Get a Quote">

	</FORM>
</CENTER>
</BODY>
</HTML>