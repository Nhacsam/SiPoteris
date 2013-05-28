/*
Creation : 02/04/2013
Last update : 24/04/2013

Author : Fabien Daoulas

This script contains functions justificating a text.

Use: placeText(...) is called once, and displayText(...) is called at every frame afterwards

*/

/* text to display ===> I ASSUME ALL \t ARE PRECEDED BY \n */  
private var textToDisplay : String;
 
// array of rects containing the position of the GUILabel of each letter -- aboutLetter[i] is corresponding to textToDisplay[i]
private var letterSpots : Rect[];

// borders in x-position of text 
private var lBorder : int;
private var rBorder : int;

// border in y-position of text
private var uBorder : int;
private var dBorder : int;

// width of text
private var widthText : float;

/* width and height of a letter */
private var widthLetter : int = 11;
private var heightLetter : int = 20;

// spacing (interligne)
private var spacing : int = 25;

/* width of a tabulation (in spaces) */
private var widthTab = 4;

// rectangle of reference -- this is the place of the first letter at the top-left of the text
private var REF_RECT : Rect;

// style of letter
private var styleLetterMiddle : GUIStyle = new GUIStyle();

// values of i which corresponds to a move to the next line
private var moveToNext = new Array();

/* Indicates wether we need to justify the line or not */
private var toJustify = new Array();

// number of lines
private var nbLines : int = 0;

private var textInitialized : boolean = false;

// event and display activate or not
private var eventEnable : boolean ;
private var textIsHidden : boolean ;




/*
	*this function will create label for each letter and place at the right position them to justify the text
*/

function OnGUIText(){
	if( !textIsHidden )
		displayText();
}

private function initText(u: int, d: int, l: int, r: int) {

	letterSpots = new Rect[textToDisplay.Length];

	/* Calculate margin sizes */
	uBorder = u;
	dBorder = d;
	lBorder = l;
	rBorder = r;
		
	widthText = Screen.width - lBorder - rBorder;
	REF_RECT = Rect(lBorder, uBorder, widthLetter, heightLetter);
	
	// enable event and dispy the text
	enableAll();
	
}

/*
	*calculate the position of rectangle for each letter. Input: Coordinates of up left (1) and bottom right (2) corners
*/
function placeText(u: int, d: int, l: int, r: int, text: String) {
	
	if(!text) {
		textInitialized = false; // To disable dragging
		Debug.LogWarning('Empty text given');
		return ;
	}
	
	
	textToDisplay = text;
	initText(u, d, l, r);
	
	// this variable contains the number of spaces in a sentence
	var nbOfSpace : int;
	
	var rectLetter : Rect = REF_RECT;
	
	styleLetterMiddle.alignment = TextAnchor.MiddleCenter;
	styleLetterMiddle.normal.textColor = Color.white;
	
	/* The script below this one does not handle the case when the 1st character is \t. Let us do it now. */

	if (textToDisplay[0] == "\t")
		rectLetter.x += (widthTab-1) * widthLetter; // -1 because \t adds a space
	
	// for each letter
	for(var i : int = 0; i < textToDisplay.Length; i++){
		
		/* if the sentence does not reach the right edge AND the character is NOT \n */
		if ((rectLetter.x <= widthText + lBorder) && (textToDisplay[i] != "\n")){
			letterSpots[i] = rectLetter;
			// translate the label to draw a new letter
			rectLetter.x += widthLetter;
		}
		/* end of line */
		else {
			var cursor : int = i;
			rectLetter.x = REF_RECT.x;
			// to the next sentence
			rectLetter.y += spacing;
			
			if (textToDisplay[i] != "\n") {
				while(""+textToDisplay[cursor] !=" ") // get the beginning of the word
					cursor--;
				toJustify.push(true); // We do not need to justify that line
			}
			else {
				toJustify.push(false);
				if (i < (textToDisplay.Length-1) && textToDisplay[i+1] == "\t")
					rectLetter.x += (widthTab-1) * widthLetter; // -1 because \t adds a space
			}
			
			// get position of switch lines
			moveToNext.push(cursor);
			nbLines++;
			
			/* Rewrite the rewinded word ? */
			for(var j : int = cursor+1; j < i; j++){
				letterSpots[j].x = rectLetter.x;
				letterSpots[j].y = rectLetter.y;
				rectLetter.x +=widthLetter;
			}
			
			/* if a space is at the beginning of a sentence -> no space added. Same thing in case of \n */
			if (textToDisplay[i] != " " && textToDisplay[i] != "\n"){
				letterSpots[i] = rectLetter;
				rectLetter.x += widthLetter;
			}
			else
				letterSpots[i] = rectLetter;
				
		}
	}
	/* Justify certain lines of the text */
	for(i = 0; i < nbLines; i++) {
		if (toJustify[i])
			JustifyText(i);
	}
	
	textInitialized = true;

}

function placeTextFactor (u: float, d: float, l: float, r: float, text: String) {
	placeText(u*Screen.height, d*Screen.height, l*Screen.width, r*Screen.width, text);
}

/*
	*get number of spaces in numLine line
*/
function GetNumberOfSpaces(numLine : int){
	var numOfSpace : int = 0;
	
	var moveToNextInt : int = moveToNext[numLine];
	
	if(numLine == 0){
		for(var i : int = 0; i < moveToNextInt; i++)	
			if(textToDisplay[i] == " ")
				if(letterSpots[i].x > REF_RECT.x)
					numOfSpace++;
	}
	else{
		for(i = moveToNext[numLine-1]; i < moveToNextInt; i++)	
			if("" + textToDisplay[i] == " " && i != moveToNext[numLine-1])
					numOfSpace++;
	}
			
	return numOfSpace;
}

/*
	*calculate space between the last letter and the right edge
*/
function CalculateSpace(numLine : int){
	var moveToNextInt : int = moveToNext[numLine];
	return lBorder + widthText - letterSpots[moveToNextInt - 1].x;
}

/*
	*justify text by adding spaces between words
*/
function JustifyText(numLine : int){

	var nmbSpace : float = GetNumberOfSpaces(numLine);
	var lengthToRight : float = CalculateSpace(numLine);
	var spaceToAdd : float = lengthToRight/nmbSpace;
	var currentSpace : int = 0;
	
	/* Avoiding cast errors........ */
	var moveToNext0Int: int = moveToNext[0];
	var moveToNextInt: int = moveToNext[numLine];
	
	if(numLine == 0){
		for(var i : int = 0; i < moveToNext0Int; i++){
			if(textToDisplay[i] == " ")
				currentSpace++;
			else // move all letters
				letterSpots[i].x += spaceToAdd*currentSpace;
		}
	}
	else{
		/* Avoiding cast errors........ */
		var moveToNextIntMinus1: int = moveToNext[numLine - 1];
		
		for(i =  moveToNextIntMinus1; i < moveToNextInt; i++){
			if(textToDisplay[i] == " " && i != moveToNext[numLine-1])
				currentSpace++;
			else // move all letters
				letterSpots[i].x += spaceToAdd*currentSpace;
		}
	
	}
}
	
function displayText() {
	for (var i : int = 0; i < textToDisplay.Length; i++) {
		if (letterSpots[i].y >= uBorder && (letterSpots[i].y + heightLetter) <= Screen.height - dBorder)
				
			GUI.Label (letterSpots[i], ""+textToDisplay[i], styleLetterMiddle);
	}
}

function removeText() {
	disableAll();
	textInitialized = false;
}

	
/* Enable touch events */
function OnEnable(){
	Gesture.onDraggingE += onDragging;
}

/* Disable touch events */
function OnDisable(){
	Gesture.onDraggingE -= onDragging;
}

/* Scrolling text with dragging event ! (Finger KO Mouse OK) */
function onDragging(dragData : DragInfo) {
	if (textInitialized && eventEnable) {
		var block = false; // If true, you cannot scroll
		if ( letterSpots[0].y >= uBorder && dragData.delta.y < 0 ) // Blocking Up
			block = true;
		if ( letterSpots[textToDisplay.Length-1].y <= Screen.height - dBorder - heightLetter && dragData.delta.y > 0 ) // Blocking Down
			block = true;
			
		/* If finger/mouse on the text and if not blocked */	
		if (dragData.pos.x > lBorder && dragData.pos.x < Screen.width - rBorder && dragData.pos.y < Screen.height - uBorder && dragData.pos.y > dBorder && !block) {
			for (var i : int = 0; i < textToDisplay.Length; i++) {
				letterSpots[i].y -= dragData.delta.y/2;
			}
		}
	}
}




/*******************************************************
**** Cacher / desactiver les evennements de l'objet ****
********************************************************/

/*
 * Affiche l'objet et active les evenements
 */
public function enableAll() {
	show() ;
	enableEvents() ;
}

/*
 * Cache l'objet et desactive les evenements
 */
public function disableAll() {
	hide() ;
	disableEvents() ;
}

/*
 * Active les evenements
 */
public function enableEvents() {
	eventEnable = true ;
}

/*
 * Desactive les evenements
 */
public function disableEvents() {
	eventEnable = false ;
}

/*
 * Affiche l'objet
 */
public function show() {
	textIsHidden = false ;
}

/*
 * Cache l'objet
 */
public function hide() {
	textIsHidden = true ;
}

/*
 * Getters
 */
public function areEventEnabled() : boolean {
	return eventEnable ;
}
public function isHidden() : boolean {
	return textIsHidden ;
}


