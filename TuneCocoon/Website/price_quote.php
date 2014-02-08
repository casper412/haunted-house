<?php 

//Check the value is an integer
function IsInt ($x) 
{
   return (is_numeric($x) ? intval($x) == $x : false);
}

session_start() ;

$cds 		= $_POST['cds'] ;
$harddrive	= $_POST['harddrive'] ;
$cdmedia	= $_POST['cdmedia'] ;
	
$gift25	= $_POST['gift25'] ;
$gift50	= $_POST['gift50'] ;
$gift100	= $_POST['gift100'] ;
	
$pickup	= $_POST['pickup'] ;
$shipping	= $_POST['shipping'] ;
	

//Check Types
if(! IsInt($cds))
{
	$cds = 0 ;
}

if(! IsInt($gift25))
{
	$gift25 = 0 ;
}
if(! IsInt($gift50))
{
	$gift50 = 0 ;
}
if(! IsInt($gift100))
{
	$gift100 = 0 ;
}

//Store them back to the session
$_SESSION['cds'] = $cds ;

$_SESSION['harddrive'] = $harddrive;
$_SESSION['cdmedia']   = $cdmedia ;
	
$_SESSION['gift25'] 	= $gift25	;
$_SESSION['gift50'] 	= $gift50	;
$_SESSION['gift100']	= $gift100	;
	
$_SESSION['pickup'] 	= $pickup 	;
$_SESSION['shipping']  	= $shipping	;
	
?>

<HTML>

<link rel="stylesheet" type="text/css" href="./css/main.css" />
<link rel="stylesheet" type="text/css" href="./css/price.css" />
<HEAD>
	<TITLE>Price Quote</TITLE>
</HEAD>
<BODY>
	<TABLE class=price border=1>
		<TR>
			<TD colspan=3 class=header>
				Your Services:
			</TD>
		</TR>
		<TR>
			<TD colspan=3 class=header>
				Basic Ripping:
			</TD>
		</TR>
		<TR>
			<TD class=label>
				&nbsp;
			</TD>
			<TD class=input nowrap>
				<?php echo "$cds" ?> CDs 
			</TD>
			<TD class=price>
				$<?php $basic = 1.25 * $cds ; printf ("%02.02f", $basic); $subtotal = $basic ;?>
			</TD>
		</TR>
		<TR>
			<TD colspan=3 class=header>
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
		</TR>
		<TR>
			<TD class=label>
				Hard Drive:
			</TD>
			<TD class=input>
				<?php if($harddrive != '') 
						echo 'Add Hard Drive' ; 
					else
						echo '&nbsp;' ?>
			</TD>
			<TD class=price>
				<?php if($harddrive != '') 
					{
						echo '$125.00' ; 
						$subtotal += 125 ; 
					}
					else
						echo '$0.00' ;?>
			</TD>
		</TR>
		<TR>
			<TD class=label>
				CDs:
			</TD>
			<TD class=input>
				<?php if($cdmedia != '') 
						echo 'Add CD Media' ; 			
					else
						echo '&nbsp;' ?>
			</TD>
			<TD class=price>
				<?php if($cdmedia != '') 
					{
						echo '$25.00';
						$subtotal += 25 ; 
					}
					else
						echo '$0.00' ; ?>
			</TD>
		</TR>
		<TR>
			<TD colspan=3 class=header>
				Gift Certificates:
			</TD>
		</TR>
		<TR>
			<TD class=label>
				$25 Gift:
			</TD>
			<TD class=input>
				<?php echo "$gift25" ?> Certificates
			</TD>
			<TD class=price>
				$<?php $basic = 25 * $gift25 ; printf ("%02.02f", $basic); $subtotal += $basic; ?>
			</TD>
		</TR>
		<TR>
			<TD class=label>
				$50 Gift:
			</TD>
			<TD class=input>
				<?php echo "$gift50" ?> Certificates
			</TD>
			<TD class=price>
				$<?php $basic = 50 * $gift50 ; printf ("%02.02f", $basic); $subtotal += $basic; ?>
			</TD>
		</TR>
		<TR>
			<TD class=label>
				$100 Gift:
			</TD>
			<TD class=input>
				<?php echo "$gift100" ?> Certificates
			</TD>
			<TD class=price>
				$<?php $basic = 100 * $gift100 ; printf ("%02.02f", $basic); $subtotal += $basic; ?>
			</TD>
		</TR>
		<TR>
			<TD colspan=3 class=header>
				Shipping:
			</TD>
		</TR>
		<TR>
			<TD class=label>
				Pickup/Delivery:
			</TD>
			<TD class=input>
				<?php if($pickup != '') 
						echo 'Pickup My CDs' ;
					else
						echo '&nbsp;' ?>
			</TD>
			<TD class=price>
				<?php if($pickup != '') 
					{
						echo '$40.00' ;
						$subtotal += 40 ; 
					}
					else
						echo '$0.00' ; ?>
			</TD>
		</TR>
		<TR>
			<TD class=label>
				Shipping:
			</TD>
			<TD class=input>
				<?php if($shipping != '') 
						echo 'I will ship my CDs' ;
					else
						echo '&nbsp;' ?>
			</TD>
			<TD class=price>
				<?php if($shipping != '') 
						echo 'Contact Us' ; 
					else
						echo '&nbsp;' ?>
			</TD>
		</TR>
		<TR>
			<TD class=label colspan=2>
				Subtotal:
			</TD>
			<TD class=price>
				$<?php printf ("%02.02f", $subtotal); ?> 	
				<BR><a href="./order_form.php">Place Your Order</a>
			</TD>
		</TR>
	</TABLE>
</BODY>
</HTML>