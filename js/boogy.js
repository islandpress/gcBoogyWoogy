/* BoogyWoogy browser 
	v.02 Aug. 17, 2017

	This is an early, prototype demo of some of the basic services of the gCommons API. 
	
	
	
	The laughable source code is here: https://github.com/dweinberger/TBD.
	
	There's a version of it live at http://hyperorg.com/programs/greencommons/boogywoogybrowser/boogywoogy.html
	
	David Weinberger
	Aug. 17, 2017
	david@weinberger.org

	Dual licensed under the MIT license (below) and GPL license.

	MIT License

	Copyright (c) 2017 David Weinberger

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



*/

// Globals. Yes, globals, dammit. I said I'm a hobbyist!


var gFrozen = false;

function Book(img,title,author,subjects,year,gcID,abs,toc){
	this.img = img;
	this.title = title;
	this.author = author;
	this.subjects=subjects;
	this.year = year;
	this.gcID=gcID;
	this.abstract = abs;
	this.toc = toc;
}

function Square(x,y,bookid,direction,searchnumber){
	this.x = x;
	this.y = y;
	this.direction = direction;
	this.searchnumber = searchnumber;
}

var numbOfRows = 13;
var numbOfCols = 13;

var gClickedBox = [-1, -1];
var gHoverbox = [-1, -1];
var gsearchnumber = -1;
var gslidervalue = -1;
var books = new Array();
var gbookline = new Array();
var gbookgrid = [];
var grid = []; 
var searchArray = [];
var gcolorctr = 0;
// background and foreground pairs:
var colors = [["#FFCC66","#800000"],["#66FFCC","#000080"],["#CC66FF","#004080"],
			  ["#66CCFF","#000080"],["#FF6FCF","#800000"],["#000000","#FFFFFF"],
			  ["#FF6666","#520101"],["#FFFF66","#158409"],["#66FF66","#008080"],
			  ["#66FFFF","#000080"],["#6666FF","#000000"],["#800000","#FFFF66"],
			  ["#FF0000","#FFFFFF"],["#008000","#CCFF66"],["#000080","#FFFF66"],
			  ["#800080","#FFCC66"],["#008040","#FFFF00"],["#FF88D2","#4E147D"],
			  ["#00FFFF","#000080"],["#4C4C4C","#FFFFFF"],["#9E9E9E","#370101"]];

function init(){

	// -- Lay out the grid  
	var gridtop = outerdiv.style.top;
	var gridleft = outerdiv.style.left;

	var x,y,i, j, div,id;
	var spacer = 10; // spacer between inner boxes
	// set starting point

	var ptop =  spacer;
	var pleft = gridleft + spacer;
	var ctr = -1;
	for (i=0; i < 13 ; i++){
		for (j=0;j < 13; j ++) {
			ctr++;
		   // create new div
		   div = document.createElement('div');
		   div.setAttribute("class","b");
		   var id = i + ":" + j;
		   //div.setAttribute("onhover","hoverPopUp('" + id + "')");
		   div.setAttribute("onclick","fetchARow('" + i + "','" + j + "')");
		   //div.setAttribute("ondblclick","showBib('" + i + "','" + j + "')");
		   var whichbox = getBoxNumber(i, j);
		   div.setAttribute("searchnumber", "-1");
		   div.setAttribute("id",id);
		   div.setAttribute("x",i);
		   div.setAttribute("y",j);
		   //div.innerHTML = ctr;	 
		   // create inner frame?	 
		   outerdiv.appendChild(div);
		   // add info to grid array
		   var box = {};
		   box.x = i;
		   box.y = j;
		   box.bookid = "";
		   box.direction="";
		   grid.push(box);
		   // initialize the bookgrid
		   gbookgrid.push(box);
		   }
	   // create a clear float to wrap the line
	   div = document.createElement("div");
	   $(div).css("clear","both");
	   outerdiv.appendChild(div);
	  }
  
	
	// randomize backgrounds (with associated font colors)	
	colors = randomizeArray(colors);
	
	$('.b').hover(function(e){
		var x=$(this).attr("x");
		var y= $(this).attr("y");
		gHoverbox = [x,y];
		if (isFilledBox(x,y)){
			launchCatCard(this);
		}
	});
	



	//--- set slider values
	
	// STRICTEST subjects matching keyword 
	// STRICT  keyword search for the subject
	// SORTOF Take first non-stop word of title and do keyword search
	// WEAK: take last subject for keyword search

	
	$("#slider").bind("slider:changed", function (event, data) {
	// The currently selected value of the slider
		// alert(data.value);
		// set to global
		var slideval = data.value;
		if (slideval < 0.25){
			$("#slidertext").html("STRICTEST");
			$("#slidertext").css({"color":"black","font-weight":"300"});	
		}
		if ((slideval >= 0.22) && (slideval < 0.5)) {
			$("#slidertext").html("STRICT");
			$("#slidertext").css({"color":"#404040","font-weight":"400"});
		}
		if ((slideval >= 0.5) && (slideval < 0.75)){
			$("#slidertext").html("SORTOF");
			$("#slidertext").css({"color":"#782C37","font-weight":"600"});
		}
		if (slideval >= 0.75){
			$("#slidertext").html("WILDCARD");
			$("#slidertext").css({"color":"red","fontWeight":"800"});
		}
	});
	// set the slider to default
	$("#slider").simpleSlider("setValue", 0.0);
	

// Enter key freezes the board
// CR freezes board if mouse is hovering over a filled box//https://stackoverflow.com/questions/8813051/determine-which-element-the-mouse-pointer-is-on-top-of-in-javascript
$("body").keypress(function(e){
    	var elements = document.querySelectorAll(':hover');
    	// gets all elements stacked, with the most specific at the end
    	var el = elements[elements.length - 1];
    	var elclass = $(el).hasClass("title") ||$(el).hasClass("horizontal") || $(el).hasClass("vertical") ;
    	if ( elclass){
			if (e.which === 13)
			{
				freezeBoard();
				event.preventDefault();
			}
		}
    }
);
	
	// pressing enter submits the search
	$("#searchbox").keypress(function(e){
		if (e.which === 13){
				startSearch();
				$("#containerdiv").focus(); // remove focus
				event.preventDefault();
		}
	});

	
	// arrow keys control the detail box (carcard)
	$(document).keydown(function(e){
		//
// 			return false;
// 		}
		// only do this if the new square is filled
		var r = gClickedBox[0];
		var c = gClickedBox[1];
		var box = document.getElementById(r + ":" + c);
		switch (e.which){
		
		case 37: // left
			c = c -1;
			if (c < 0) { return}
			box = document.getElementById(r + ":" + c);
			if ($(box).attr("searchnumber") != "-1"){
				launchCatCard(box);
			}
			break;
		case 38: // up
			r = r -1;
			if (r < 0) { return}
			box = document.getElementById(r + ":" + c);
			if ($(box).attr("searchnumber") != "-1"){
				launchCatCard(box);
			}
			break;
		case 39: // right
			c = c + 1;
			if (c > 12) { return}
			box = document.getElementById(r + ":" + c);
			if ($(box).attr("searchnumber") != "-1"){
				launchCatCard(box);
			}
			break;
		case 40: // down
			r = r + 1;
			if (c > 12) { return}
			box = document.getElementById(r + ":" + c);
			if ($(box).attr("searchnumber") != "-1"){
				launchCatCard(box);
			}
			break;
		case 27: // Escape key
			$("#catcarddiv").hide(200);
			break;
		}
	});
	
	// for debugging:
	//startSearch();
	
}

function showBib(i,j){
	// get box
	var b = document.getElementById( i + ":" + j);
	if ( $(b).html() == ""){
		return
	}
	var boxindex = getBoxNumber(i, j);
	var bk = gbookgrid[boxindex];
	
}

function startSearch(){
	// pressed the keyword search button
	
	// get the search term
	var searchterm = $("#searchbox").val();
	if (searchterm == ""){ // error check
		alert("Enter a subject to search for");
		return
	}
	var r = false;
	// Do any squares have a horizontal or vertical class? If so, there are books on the grid
	// so we need to do an entire reset
	var horiz = $(".horizontal");
	var vert = $(".vertical");
	if ((horiz.length > 0) || (vert.length > 0)){
		r = confirm("Doing this search will clear the entire grid. Continue?");
		if (r){
			resetGrid();
		}
		else{
			return;
		}
	}
	// track the searches themselves
	searchArray.push({searchnumber : 0, subjterm : "", keyterm: searchterm, degree : "Initial keyword search"});
	
	// get some books, noting that this is the first search
	fetchItems("-1");
	$("#containerdiv").focus(); // remove focus from the searchbox so enter key works elsewhere
}


//---- Build the URI for the API query
function buildSearchTerm(booknumb,subjects,slidervalue){

	
	// strictest: keyword search for first subject
	// strict: second subject as keyword
	// sortof: last subject as keyword
	// wildcard: first word of title as keyword
	var term = "";

	switch (slidervalue){
			case "STRICTEST":
				if ( ($.isArray(gbookgrid[booknumb]["subjects"])) && (gbookgrid[booknumb]["subjects"][0] !== undefined  ) ){
					term = gbookgrid[booknumb]["subjects"][0];
				}
				else { 	// Sleazy: If GC returns no subject, 
						// just use the search term
					term = $("#searchbox").val();
				}
				searchArray.push({searchnumber : gsearchnumber, subjterm : term, keyterm: "", degree : "Strictest"});
				break;
			case "SORTOF":
				// get last subject and do subject search
				if ( ($.isArray(gbookgrid[booknumb]["subjects"])) && (gbookgrid[booknumb]["subjects"][1] !== undefined  ) ){
					var z =  gbookgrid[booknumb]["subjects"].length;
					z = z - 1;
					term = gbookgrid[booknumb]["subjects"][z];
				}
				else { // if LibCloud returned no subject
					term = $("#searchbox").val();
				}
				typeofsearch = "STRICT";
				searchArray.push({searchnumber : gsearchnumber, subjterm : term, keyterm: "", degree : "Strict"});
				break;
			case "STRICT":
				// get the first subject, do keyword search
				if ( ($.isArray(gbookgrid[booknumb]["subjects"])) && (gbookgrid[booknumb]["subjects"] !== undefined  )  ){
					var z = gbookgrid[booknumb]["subjects"].length;
					term = gbookgrid[booknumb]["subjects"][z - 1];
				}
				else { // if no subjects
					term = $("#searchbox").val();
				}
				var p = term.indexOf(" ");
				if (p > -1){
					term = term.substr(0,p);
				}
				typeofsearch = "SORTOF";
				searchArray.push({searchnumber : gsearchnumber, subjterm : "", keyterm: term, degree : "SORT OF"});
				break; 
				
			
			case "WILDCARD":
				// get first nonstopword from title
				var title = gbookgrid[booknumb]["title"];
				term = firstNonStopword(title);
				// it's all stop words
				if (term == ""){
					term = gbookgrid[booknumb]["subjects"][0];
				}
				typeofsearch = "WILDCARD";
				searchArray.push({searchnumber : gsearchnumber, subjterm : "", keyterm: term, degree : "Kevin Bacon"});
				break;
			}
				
				return term;
				

}

function fetchItems(clickedBox_xy){
	// clickedBox_xy: grid coords of the box the user clicked that got us here
	// if first search, then bookid = -1 and subject = value of searchbox
	

	
	
	var term;
	 // first time search?
	if (clickedBox_xy == "-1"){
		term = $("#searchbox").val();
		var typeofsearch = "KEYWORD";
		// get random starting points.
		var aa = Math.floor(Math.random() * 13);
		var bb = Math.floor(Math.random() * 13);
 		clickedBox_xy = [aa,bb];
 		//x`clickedBox_xy = [1,1];
 		var subjects = new Array;
	}
	// click on a filled-in box
	else {
		var r = clickedBox_xy[0];
		var c = clickedBox_xy[1]
		var booknumb = getBoxNumber(r,c);
		var subjects = gbookgrid[booknumb]["subjects"];
		
		
		// get slider value
		var slidervalue = $("#slidertext").text();
		// build the search term
		var term = buildSearchTerm(booknumb,subjects, slidervalue);
	}
		
	// spinner waiting
	$("#waiting").show("fast");
	
	// do the search, get some books, parse the json, get an array of books for this line, display the line
		$.ajax({
			type: "POST",
			data: {searchterm  : term},
			 url: './php/boogy.php',
			 success: function(r,mode){
			 		$("#waiting").hide("fast");
					gsearchnumber++;
					parseAndLoadBookLine(r);
					layOutLine(clickedBox_xy);           
				},
			error: function(r,mode){
				alert("Oops. Query failed. Click somewhere else.");
				$("#waiting").hide("fast");
			}
	  });
 
}

function parseAndLoadBookLine(resp){
	var jbooks = JSON.parse(resp); // turn the response into json
  	jsonIntoRecord(jbooks); // turn it into an array of books; creates global gbookline
}

function jsonIntoRecord(jsn){
	// converts json into an array that will be a line of books (gbookline)
	
	;
	gbookline= []; // init the bookline
	var items = jsn.data;
	
	for (var i=0; i < items.length; i++){
			var tempbook = new Book(); // to hold each book as created from json
			
			// use jquery library to get arrays of items we care about
			var subjarray = items[i].attributes.tags;
			tempbook["subjects"] = subjarray;
			if ("creators" in items[i].attributes.metadata){
				var autharray =  items[i].attributes.metadata.creators;
				tempbook["author"] = autharray;
			}
			else{
				tempbook["author"] = "na";
			}
			var titlearray =  items[i].attributes.title;
			tempbook["title"] = titlearray;
			var gcID = items[i].id;
			tempbook["gcID"] = gcID;
			var ddate = items[i].attributes.published_at;
			ddate = ddate.substr(0,10); // get rid of hour
			tempbook["date"] = ddate;
			var aabstract =items[i].attributes.short_content;
			tempbook["abstract"] = aabstract;
			tempbook["type"] = items[i].attributes.resource_type;
			var tags =items[i].attributes.tags;
			tempbook["subjects"] = tags;
			
		
		// add this to gbookline
		gbookline.push(tempbook);	
	}
	
	// randomize the length of the line, just for visual appeal
	if (gbookline.length > 4){
		var randlen = (Math.floor(Math.random() * 5) + 1) + 4; // i know this isn't optimal
		gbookline = gbookline.slice(0,randlen);
	}
	
}
  

function getBoxNumber(r,c){
	// convert row and column into index
	
	var res =  (parseInt(r) * 13) + parseInt(c);
	return parseInt(res)
}

function layOutLine(clickedBox){
	// Display the contents of bookline, i.e., the items returned by the query
	
	// clickedbox = x and y of the box that was clicked
	var r = clickedBox[0];
	var c = clickedBox[1];

	// what direction is the box currently going in?
	var boxnumber = getBoxNumber(r,c);
	var gridbox = gbookgrid[boxnumber];
	var direction = gridbox["direction"];
	switch (direction){
		case "": 
   			direction = "HORIZONTAL";
   			break;
   		case "HORIZONTAL":
   			direction = "VERTICAL";
   			break;
   		case "VERTICAL":
   			direction = "HORIZONTAL"
   			break;
   	}
   
   	// remove catcard
	$("#catcarddiv").hide(200);

	// ----- do the layout	
	
	// get array of which squares to fill
	
	// for each of the items in gbookline
	//	to fit the line of books onto the grid, we alternate the sides of the startbox
	//	we're building on. If there's no room on one side, then we switch to the other.
	var turnA = true; // which side are we building on?
	var newr,newc;
	var edges = [];  // the two squares -- on on either side -- we might fill with an item
	var colorPair = colors[gcolorctr]; // get the color for this box
	gcolorctr++; // increase the counter into the color array
	if (gcolorctr > colors.length){gcolorctr=0;} // start again in the color array if necessary
	
	// go down the gbookline array of fetched items
	for (var i=0; i< gbookline.length; i++){
		// get title and author
		var strtitle = gbookline[i]["title"];
		// truncate the displayed title if necessary
		if (strtitle.length > 35){strtitle = strtitle.substr(0,35) + "...";}
		// create a single string out of the title array. It will be shown in the hover box
		var hiddentitle = gbookline[i]["title"];
		var strauthor = gbookline[i]["author"];
		// create a single string out of the title array. It will be shown in the hover box
		var displayText = "<span class='title' title='" + hiddentitle + "\n" + strauthor + "'>" + strtitle + "</span>";
		// try going either way alternately until we hit an obstacle
		if (direction == "HORIZONTAL"){
			// get left and right free spaces
			edges = getNextOpenSquare(r,c,"HORIZONTAL");
			// if it's the first search, forcefeed it. Otherwise it leaves a hole
			if ( (i==0) && (gsearchnumber == 0) ){
				edges = [c,c];
			}
			if (turnA){
				if (edges[0] == -1){ // if can't go left, then go right
					newc = edges[1];
				}
				else{
					newc = edges[0];
				}
			}
			else {
				if (edges[1] == -1) { // if can't go right, then go left
					newc = edges[0];
				}
				else {
					newc = edges[1];
				}
			}
			turnA = !turnA; // flip the direction for next move
			// if there's a legit move, do it
			if (newc != -1){
				// get the div box
				var divbox = document.getElementById(r + ":" + newc);
				// put content into the box
				$(divbox).removeClass("vertical");
				$(divbox).addClass("horizontal");
				divbox.setAttribute("searchnumber",gsearchnumber);
				divbox.setAttribute("gcId",gbookline[i]["gcID"]);
				divbox.style.backgroundColor = colorPair[0];
				divbox.style.color = colorPair[1];
				// get random duration for fade
				var fadetime = Math.floor(Math.random() * ((1100-100)+1) + 100);
				$(divbox).hide().html(displayText).slideToggle(fadetime);
				var booknumber = getBoxNumber(r,newc);
				gbookgrid[booknumber]["direction"] = "HORIZONTAL";
				gbookgrid[booknumber]["subjects"] = gbookline[i]["subjects"];
				gbookgrid[booknumber]["title"] = gbookline[i]["title"];
				gbookgrid[booknumber]["author"] = gbookline[i]["author"];
				gbookgrid[booknumber]["searchnumber"] = gsearchnumber;
				gbookgrid[booknumber]["gcId"] = gbookline[i]["gcID"];
				gbookgrid[booknumber]["date"] = gbookline[i]["date"];
				gbookgrid[booknumber]["abstract"] = gbookline[i]["abstract"];
			}
				
		}
		if (direction == "VERTICAL"){
			// get next up and down free spaces
			edges = getNextOpenSquare(r,c,"VERTICAL");	
					
			if (turnA){
				if (edges[0] == -1){ // if can't go down, then go up
					newr = edges[1];
				}
				else{
					newr = edges[0];
				}
			}
			else {
				if (edges[1] == -1) { // if can't go up, then go down
					newr = edges[0];
				}
				else {
					newr = edges[1];
				}
			}
			turnA = !turnA; // flip the direction for next move
			// if there's a legit move, do it
			if (newr != -1){
				// get the div box
				var divbox = document.getElementById(newr + ":" + c);
				// put content into the box
				$(divbox).removeClass("horizontal");
				$(divbox).addClass("vertical");
				divbox.setAttribute("searchnumber",gsearchnumber);
				divbox.setAttribute("gcId",gbookline[i]["gcID"]);
				divbox.style.backgroundColor = colorPair[0];
				divbox.style.color = colorPair[1];
				var fadetime = Math.floor(Math.random() * ((1000-200)+1) + 200);
				$(divbox).hide().html(displayText).fadeIn(fadetime);
				var booknumber = getBoxNumber(newr,c);
				gbookgrid[booknumber]["direction"] = "VERTICAL";
				gbookgrid[booknumber]["subjects"] = gbookline[i]["subjects"];
				gbookgrid[booknumber]["title"] = gbookline[i]["title"];
				gbookgrid[booknumber]["author"] = gbookline[i]["author"];
				gbookgrid[booknumber]["searchnumber"] = gsearchnumber;
				gbookgrid[booknumber]["gcId"] = gbookline[i]["gcID"];
				gbookgrid[booknumber]["date"] = gbookline[i]["date"];
				gbookgrid[booknumber]["abstract"] = gbookline[i]["abstract"];
			}	
		}
	}
	// Visibly mark the clicked-on box so the user can see it
	divbox = document.getElementById(r + ":" + c);
	// if it's the first one, scroll to it
	if (gsearchnumber == 0){
		//$(divbox).scrollintoview();
	}
	$("#containerdiv").focus();
	


	var scrollTo = document.getElementById( r + ":" + c);
	$('html, body').animate({
				scrollTop: $(scrollTo).offset().top + 'px'
				}, 'slow'); 
	

}

function getNextOpenSquare(r,c,direction){
	// when laying out a line, find the next two boxes (up and down or left and right) that can
	// be filled in. If a box can't be filled in, return -1
	
	var leftc = -1, rightc = -1, upc = -1, downc = -1
	// get search number of starting square so we can skip it
	var startsq = getBoxNumber(r,c);
	var startbox = document.getElementById(r + ":" + c);
	var startsearchnumber = startbox.getAttribute("searchnumber");
	
	//-------- HORIZONTAL
	var i, thisSearchNumber, thisbox;
	if (direction == "HORIZONTAL"){
		// get left by walking up to starting col from the left edge (c = 0) 
		for (i=0; i < c; i++){
			thisbox = document.getElementById(r + ":" + i);
			thisSearchNumber = thisbox.getAttribute("searchnumber");
			// is this box already taken by this search?
			if (thisSearchNumber != gsearchnumber){
				leftc = i;
			}
		}
		// get rightc by walking from right edge to clicked box
		for (i=12; i > c; i--){
			thisbox = document.getElementById(r + ":" + i);
			thisSearchNumber = thisbox.getAttribute("searchnumber");
			// is this box already taken by this search?
			if (thisSearchNumber != gsearchnumber){
				rightc = i;
			}
		}
		return [leftc,rightc];
	}
	
	//--------- VERTICAL
	if (direction == "VERTICAL"){
		// get upc by walking down from top edge to starting row 
		for (i=0; i < r; i++){
			thisbox = document.getElementById(i + ":" + c);
			thisSearchNumber = thisbox.getAttribute("searchnumber");
			// is this box already taken by this search?
			if (thisSearchNumber != gsearchnumber){
				upc = i;
			}
		}
		// get downc by walking up from bottom to starting row
		for (i=12; i > r; i--){
			thisbox = document.getElementById(i + ":" + c);
			thisSearchNumber = thisbox.getAttribute("searchnumber");
			// is this box already taken by this search?
			if (thisSearchNumber != gsearchnumber){
				downc = i;
			}
		}
	}
	return [upc,downc];
}


function fetchARow(x,y){
	// get new books, unless we got here through an arrow key while 
	// the catalog card is open
	
	// is this a box already filled?
	if ( isFilledBox(x,y)  == false){
		return;
	}
	clickedABox(x,y); // mark the box as clicked
	
	//if ($("#catcarddiv").is(':visible') !== true) {
		fetchItems([x,y]);
	//}
}

function freezeBoard(){
	gFrozen = !gFrozen;
	if (gFrozen){
	 $("#notice").slideDown();
	}
	else {
	$("#notice").slideUp(); //("slide", { direction: "left" });
	}
}

function isFilledBox(x,y){
	// does the box have content?
	var div = document.getElementById(x + ":" + y);
	var res = ( ($(div).hasClass("title")) || ($(div).hasClass("horizontal")) || ($(div).hasClass("vertical")));
	return res;
}

function clickedABox(x,y){
	// clicked on an element so mark it

	// get the div
	var div = document.getElementById(x + ":" + y);
	
	if ( isFilledBox(x,y) == false){
		return;
	}
	// turn off border on all non-clicked
	$("div").removeClass("clicked");
	// turn on border
	$(div).addClass("clicked");
	gClickedBox = [x,y];
}

function firstNonStopword(s){
	// get first nonstopword from a string, or ""
	
	// turn it into an Array
	var words = s.split(" ");
	var done = false;
	var i = 0;
	while (done==false){
		word = words[i];
		if (checkStopWord(word) == false){
			term = word;
			done = true;
		}
		else {
			i++;
			if  (i >= words.length){
				done = true;
				term = "";
			}
		}
		
	}

 return term

}


function randomizeArray(o){
	// thanks http://css-tricks.com/snippets/javascript/shuffle-array/
	   for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
	
	
}

function resetQuestion(){
	var r = confirm("Clear the entire grid?");
	if (r){	
		$("#searchbox").val("");
		resetGrid();
	}
}

function resetGrid(){	
	$("#outerdiv").html("");
	gsearchnumber = -1;
	gslidervalue = 0;
	books = new Array();
	gbookline = new Array();
	gbookgrid = [];
	grid = []; 
	searchArray = [];
	gcolorctr = 0;
	$("#catcarddiv").hide();
	init();
 }
 
function toggleButtons(which){
	// manage the buttons that show instructions and about info.
	
	if (which == "explanation"){ // explan is visible, so turn it off
		if ($("#explanation").is(':visible')){
			$('#explanation').slideUp(300);
			//$('#about').slideDown(300);
			$("#instructionsbutton").removeClass("on");
			$("#instructionsbutton").addClass("off");
		}
		else {
			$('#explanation').slideDown(300);
			$('#about').slideUp(300);
			$("#instructionsbutton").addClass("on");
			$("#instructionsbutton").removeClass("off");
			$("#aboutbutton").removeClass("on").addClass("off");
			$('#sliderdiv').slideUp(300);
			$("#sliderbutton").removeClass("on").addClass("off");
		}
	}
	if (which == "about"){
		if ($("#about").is(':visible')){
			$('#about').slideUp(300);
			//$('#explanation').slideDown(300);
			$("#aboutbutton").removeClass("on").addClass("off");
			//$("#explanationbutton").addClass("on");
		}
		else {
			$('#about').slideDown(300);
			$('#explanation').slideUp(300);
			$("#aboutbutton").removeClass("off").addClass("on");
			$("#instructionsbutton").addClass("off");
		}
	}
	if (which == "slider"){
		if ($("#sliderdiv").is(':visible')){
			$('#sliderdiv').slideUp(300);
			$("#sliderbuttonbutton").removeClass("on").addClass("off");
		}
		else {
			$('#sliderdiv').slideDown(300);
			$('#explanation').slideUp(300);
			$("#sliderbutton").removeClass("off").addClass("on");
			$("#instructionsbutton").addClass("off");
			$("#aboutbutton").addClass("off");
		}
	 }
}

function launchCatCard(box){
	// displays the inplace card with more info.
	
	// do nothing if the board is frozen by a doubleclick on a box
	if (gFrozen){
		return
	}

	// -- get the boxnumber
	var pos = $(box).offset();
	var boxtop = pos["top"]; 
	var boxleft = pos["left"];
	var r = parseInt(box.getAttribute("x"));
	var c = parseInt(box.getAttribute("y"));
	var boxnumb = getBoxNumber(r,c);
	//boxnumb = 14; // DEBUG
	
	if (gbookgrid[boxnumb].direction =="" ){
		return;
	}
	// set this as the clicked box
	clickedABox(r,c);
	
	// -- create the content
	var contdiv = document.getElementById("cardcont");
	
	// title
	var title="";
	 if (gbookgrid[boxnumb]["title"] !== undefined){
 		$("#cardtitle").html(gbookgrid[boxnumb]["title"]);
 	}
 	// add link
 	var linkspan = document.createElement("span");
 	$(linkspan).attr({"class" : "catlinkclass"});
 	$(linkspan).html("<a href='https://greencommons.herokuapp.com/resources/" + gbookgrid[boxnumb].gcId + "' target='_blank'>&nbsp;link</a>");
 	$("#cardtitle").append(linkspan);
	
	// year
	if (gbookgrid[boxnumb]["date"] !== undefined){
		$("#carddatespan").html(" [" + gbookgrid[boxnumb]["date"] + "]");
	}
	
	// author
	var author="";
	if (gbookgrid[boxnumb]["author"] !== undefined){
		$("#cardauthorspan").html(gbookgrid[boxnumb]["author"]);
	}
	// publisher
	var publisher="";
	if (gbookgrid[boxnumb]["publisher"] !== undefined){
		$("#cardpublisherspan").html(gbookgrid[boxnumb]["publisher"]);
	}
	
	// abstract
	if ( (gbookgrid[boxnumb]["abstract"] !== undefined) && (gbookgrid[boxnumb]["abstract"] !=="")){
		if ($.isArray(gbookgrid[boxnumb]["abstract"])){
			var abs = gbookgrid[boxnumb]["abstract"].join("<P>");
		}
		else{
			var abs = gbookgrid[boxnumb]["abstract"];
		}
	
	}
	else{
		abs = "No abstract.";
	}
	$("#cardabstract").html(abs);
	if (abs !== "No abstract."){
		$("#cardabstract").slideDown(abs);
	}
	else{
		$("#cardabstract").slideUp(abs);
	}
	
	// subjects
	$("#cardtopics").html("");
	if (gbookgrid[boxnumb]["subjects"].length > 0){
		for (var k=0; k < gbookgrid[boxnumb]["subjects"].length; k++){
			// replace spaces with +
			var tagraw = gbookgrid[boxnumb]["subjects"][k];
			var tag = tagraw.replace(/ /g, "+");
			var sp = document.createElement("span");
			$(sp).attr({"class" : "catsubjspan"});
			var html = "<a href=\"https://greencommons.herokuapp.com/search?query=%23" + 
				tag + "\" " +
				"target=\"_blank\">" + 
				gbookgrid[boxnumb]["subjects"][k] + "</a>";
			$(sp).html(html);
			
			$("#cardtopics").append(sp);
		}
	
	}
	
	
	// get color of the clicked cardheight
	var clickedbox = document.getElementById(r + ":"  + c);
	var targetbgcolor = $(clickedbox).css("background-color");
	var targetcolor = $(clickedbox).css("color");
	
	// add link
	$("#linkToGC").attr("href","#");
	
	
	
	// show it
	var catcard = document.getElementById("catcarddiv");
	
	$("#cardtitle").css({ backgroundColor : targetbgcolor, color : targetcolor});
	// $(catcard).css({left : cardleft});
// 	$(catcard).animate({top : cardtop + "px"});
	$(catcard).show(300);
	
	
}

function gotoStacklife(el){
}


  

