<?php

require('../vendor/autoload.php');

// search at varying degrees of strictness.
// Because the API doesn't yet allow tag search,
// all of these are keyword searches. The differences
// have to do with keywords:

// strictest: keyword search for first subject
// strict: second subject as keyword
// sortof: last subject as keyword
// wildcard: first word of title as keyword
	
ini_set('display_errors','On');
error_reporting(E_ALL);

function debugPrint($s){
	if (1==0){
		error_log($s);
	}
}

//https://greencommons.herokuapp.com/api/v1/search?format=json&q=air$searchterm&q.parser=structured

$origsearchterm = $_REQUEST['searchterm'];
// $searchtype = $_REQUEST['searchtype'];
// $degree = $_REQUEST['degree'];


//debugPrint("term: $origsearchterm type: $searchtype degree: $degree");

// replace problematic characters
$s1 = str_replace(array('\\','|', '/', '-','*',',','?','%'), "", $origsearchterm);
// replace the multiple contiguous spaces left (or urlencode gives  multipole +
$s2 = preg_replace('#\s+#', ' ', $s1);
// make it safe for web passage
$searchterm = urlencode($s2);

debugPrint("searchterm after str_replace: $searchterm");
// sample:
// http://api.lib.harvard.edu/v2/items.json?subject=peanuts


	$queryurl = "https://greencommons.herokuapp.com/api/v1/search?format=json&q=" . $searchterm . "&q.parser=structured";
	
	debugPrint("KEYWORD: $queryurl");


$ret = file_get_contents($queryurl);
debugPrint("ret = $ret");

echo $ret;

?>