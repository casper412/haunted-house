<?php

//Send an email to Tune Cocoon
function send_email()
{
	$name =  $_SESSION['first_name'] . " " . $_SESSION['last_name'] ;

	$body = "There is a new order.\n
		   Name: $name\n" ; 
			 
	$subject = "Order: $name";

	mail('matt@abqhacker.com', $subject, $body,
    	 "From: registration@tunecocon.com\nX-Mailer: PHP 4.x"); 
}

?>