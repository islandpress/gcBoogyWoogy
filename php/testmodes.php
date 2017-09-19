<?php
	
ini_set('display_errors','On');
error_reporting(E_ALL);

function debugPrint($s){
	if (1==1){
		//error_log($s);
		echo "<p>$s</p>";
	}
}

//https://greencommons.herokuapp.com/api/v1/search?format=json&q=air$searchterm&q.parser=structured

$origsearchterm = "ocean";
$searchtype = $_REQUEST['searchtype'];
$tags = ["water","dirt","animals"];
$searchtype = "SORTOF";

// strictest: keyword search
//strict: first subject as keyword
//sortof: second subject as keyword
//wildcard: first word of title as keyword

debugPrint("term: $origsearchterm type: $searchtype degree: $degree");

// replace problematic characters
$s1 = str_replace(array('\\','|', '/', '-','*',',','?','%'), "", $origsearchterm);
// replace the multiple contiguous spaces left (or urlencode gives  multipole +
$s2 = preg_replace('#\s+#', ' ', $s1);
// make it safe for web passage
$searchterm = urlencode($s2);

debugPrint("searchterm after str_replace: $searchterm");
// sample:
// http://api.lib.harvard.edu/v2/items.json?subject=peanuts




if ($searchtype == "STRICTEST"){
	$queryurl = "https://greencommons.herokuapp.com/api/v1/search?format=json&q=" . $searchterm . "&q.parser=structured";
	debugPrint("KEYWORD: $queryurl");
}

if ($searchtype == "STRICT"){


}





	$ch = curl_init(); 
	//curl_setopt($ch, CURLOPT_URL, $queryurl);
	// Return the transfer as a string 
	//curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
	
// 		curl_setopt_array($ch, array(
// 			CURLOPT_RETURNTRANSFER => 1,
// 			CURLOPT_URL => $queryurl
// 		));
// 		$ret = curl_exec($ch); 
// 	debugPrint("RET: $ret");
// 	$recorddecoded = json_decode($ret);
// 	
// 	
	curl_close($ch);

$ret = file_get_contents($queryurl);
debugPrint("ret = $ret");

echo $ret;

?>