
function roll(html, hover) 
{
	if(hover == true)
	{
		document.images[html].src="./images/" + html + "_hover.gif";
	}
	else
	{
		document.images[html].src="./images/" + html + ".gif";
	}
}
