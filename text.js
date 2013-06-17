#pragma strict
/*
Creation : 02/04/2013
Last update : 11/06/2013

Author : Fabien Daoulas / Kevin Guillaumond

Use: placeText(...) is called once, and displayText(...) is called at every frame afterwards

*/

/*
*	Text to display
*	I ASSUME ALL \t ARE PRECEDED BY \n (all other \t will be ignored, except if first character)
*	Multiple tags must be separated by NOTHING: e.g. <tag1><tag2> is fine, <tag1><tag2> is NOT
*	Not tag at the end !
*/  
private var textToDisplay : String;

/*
*	Dépendances
*/
private var slideshow  : slideShow ;


/*
*	Layout
*/
private var lBorder : int;
private var rBorder : int;
private var uBorder : int;
private var dBorder : int;

private var widthText : float;

private var widthLetter : int = 11;
private var heightLetter : int = 20;
private var spacing : int = 25; // between lines
private var widthTab = 4; // width of a tabulation (in spaces)
private var styleLetterMiddle : GUIStyle = new GUIStyle(); // style of letter

private var indexFirstChar : int ; // Index of the first character displayed (0 except if it is '<')

private var upArrow : Texture; // Showing possible scrolling
private var downArrow : Texture; // Idem


/*
*	Placing the text
*/
private var letterSpots : Rect[]; // array of rects containing the position of the GUILabel of each letter -- aboutLetter[i] is corresponding to textToDisplay[i]
private var displayChar : boolean[]; // TRUE if we display the char
private var REF_RECT : Rect; // rectangle of reference -- this is the place of the first letter at the top-left of the text
private var moveToNext : Array ; // values of i which corresponds to a move to the next line
private var toJustify : Array ; // Indicates for each line wether we need to justify it or not
private var nbLines : int ;
private var myTags : Array ; // Strings: All the tags (e.g: <iAmATag>) in the text
private var myTagIndexes : Array ; // Integers: All the indexes of (the first characters after) the tags


/*
*	Events
*/
private var eventEnable : boolean ;
private var textIsHidden : boolean ;
private var coefDragging : float = 1.0 ; // How fast is the dragging ?

private var textInitialized : boolean = false;


/*
 * Animation
 */
private var gapToMove : float ;
private var coefSpeed : float = 70.0 ; // % /s
private var constSpeed : float = 7.0 ; // line /s

/*
*	This function will create label for each letter and place at the right position them to justify the text
*/

private function initText(u: int, d: int, l: int, r: int) {

	letterSpots = new Rect[textToDisplay.Length];
	displayChar = new boolean [textToDisplay.Length];
	for (var i : int = 0; i < textToDisplay.length; i++)
		displayChar[i] = true;
	
	/* Calculate margin sizes */
	uBorder = u;
	dBorder = d;
	lBorder = l;
	rBorder = r;
		
	widthText = Screen.width - lBorder - rBorder;
	REF_RECT = Rect(lBorder, uBorder, widthLetter, heightLetter);
	
	upArrow = Resources.Load("Pictures/up_arrow");
	downArrow = Resources.Load("Pictures/down_arrow");
	
	/* Reset values */	
	indexFirstChar = 0;
	moveToNext = new Array();
	toJustify = new Array();
	nbLines  = 0;
	myTags = new Array();
	myTagIndexes = new Array ();
	slideshow =	gameObject.GetComponent("slideShow") as slideShow;
	
	enableAll(); // enable event and dispy the text
}

/*
*	Calculate the position of rectangle for each letter. Input: Coordinates of up left (1) and bottom right (2) corners
*/
function placeText(u: int, d: int, l: int, r: int, text: String) {
	
	if(!text) {
		textInitialized = false; // To disable dragging
		Debug.LogWarning('Empty text given');
		return ;
	}
	
	gapToMove = 0.0 ;
	textToDisplay = text;
	initText(u, d, l, r);
		
	var nbOfSpace : int; // contains the number of spaces in a sentence
	
	var rectLetter : Rect = REF_RECT;
	
	styleLetterMiddle.alignment = TextAnchor.MiddleCenter;
	styleLetterMiddle.normal.textColor = Color.white;
	
	var firstTimeInWhileLoop = true;
	
	/* For each letter */
	for(var i : int = 0; i < textToDisplay.Length; i++){
	
		/* If the current character is '<', let the extractTag function handle the tag */
		while (textToDisplay[i] == "<") {
			var tempTag : String = "";
			tempTag = extractTag(i);
			
			if (tempTag != "") {
				
				/* Index of the character after the tag in the text. If it is a "<", it must be the character after the next tag, etc. */
				var index : int = i;
				do {
					while (textToDisplay[index] != ">") { // Go to the end of the tag
						index++;
						if (index >= textToDisplay.Length-1) // EOF
							return;
					}
					index++;
				} while ( textToDisplay[index] == "<" ); // If there is another tag just after
				myTagIndexes.push(index); // It is the first character of the tag, we will later turn it into the character just after the tag
				
				
				/* Do not display the tag */
				for (var k : int = i; k < i+tempTag.Length; k++)
					displayChar[k] = false;
				i+=tempTag.Length;
				
				myTags.push(tempTag);
			}
			else if (i < textToDisplay.Length-1)
				i++; // Do not stay in the loop...
			else
				break; // end of text
			
			/* If first char is "<" and we are handling the first (group of) tag(s), then the first displayed character is the next one ! */
			if (textToDisplay[0] == "<" && firstTimeInWhileLoop)
				indexFirstChar = i;
		}
		
		/* Case when text begins with one or several tags, then \t */
		if (firstTimeInWhileLoop && textToDisplay[i] == "\t")
			rectLetter.x += (widthTab-1) * widthLetter; // -1 because \t adds a space
		
		firstTimeInWhileLoop = false;

		/*
		*	if the sentence does not reach the right edge AND the character is NOT \n
		*/
		if ((rectLetter.x <= widthText + lBorder) && (textToDisplay[i] != "\n")){
			letterSpots[i] = rectLetter;
			rectLetter.x += widthLetter; // translate the label to draw a new letter
		}
		
		/* 
		*	end of line, either if the text reaches the right edge or we find a \n
		*/
		else {
			var cursor : int = i;
			rectLetter.x = REF_RECT.x;
			rectLetter.y += spacing; // to the next sentence
			
			if (textToDisplay[i] != "\n") { // if we reach the end of the line while the sentence is not over (no \n found)
				while(textToDisplay[cursor] !=" " && cursor > 0) // get the beginning of the word
					cursor--;
				toJustify.push(true); // We do need to justify that line
			}
			
			else {
				toJustify.push(false);
				if (i < (textToDisplay.Length-1) && textToDisplay[i+1] == "\t")
					rectLetter.x += (widthTab-1) * widthLetter; // -1 because \t adds a space
			}
			
			/* get position of switch lines */
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
*	Get number of spaces in line numLine
*/
function GetNumberOfSpaces(numLine : int){
	var numOfSpace : int = 0;
	
	var endLine : int = moveToNext[numLine]; // real end is endLine-1
	
	if(numLine == 0){
		for(var i : int = 0; i < endLine; i++) {	
			if(textToDisplay[i] == " ") {
				if(letterSpots[i].x > REF_RECT.x)
					numOfSpace++;
			}
		}
	}
	else{
		var debutLigne : int = moveToNext[numLine-1]; // index of the beginning of the line
		for(i = debutLigne; i < endLine; i++) {
			if(textToDisplay[i] == " " && i != debutLigne)
				numOfSpace++;
		}
	}
			
	return numOfSpace;
}

/*
*	Calculate space between the last letter and the right edge
*/
function CalculateSpace(numLine : int){
	var moveToNextInt : int = moveToNext[numLine];
	if (!moveToNextInt)
		return lBorder + widthText;
	else
		return lBorder + widthText - letterSpots[moveToNextInt - 1].x;
}

/*
*	Justify text by adding spaces between words
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

/*
*	Input: index of a '<' Output: The entire tag, or "" if there is no '>'
*/
function extractTag(i : int) {
	var myTag : String = "";
	var j : int = i; // to run through tab
	
	while (textToDisplay[j] != ">") {
		if (j >= textToDisplay.Length-1) { // if the tag never ends
			Console.CriticalError("There is a fake beginning of tag at index #" + i + " of the texte which statrs with \"" + textToDisplay.Substring(0,25) + "\"");
			return "";
		}
		if (textToDisplay[j+1] == "<")
			Console.Warning("Problem parsing tags: several \"<\" in a row");
		j++;
	}
	
	/*
	*	Substring(i,j) does not work so let's improvise a little bit
	*/
	for (var k=i; k<=j; k++)
		myTag += textToDisplay[k];
		
	return myTag;
}

/*
*	Takes a SLIDESHOWELMT, turns it into a tag and calls toTag function which will scroll the text
*/
function takeSSelement (s : SLIDESHOWELMT) {
	toTag("<" + fileSystem.getName(s.path) + ">");
}

/*
*	Scroll the text until the tag <myTag>
*	Does not change scrolling if <myTag> does not exist
*	When the text is initialized, an array of all the tags is created
*/
function toTag (myTag: String) {
	var tagNumber = (-1);
	for (var i : int = 0; i < myTags.length; i++) {
		if (myTags[i] == myTag) {
			tagNumber = i;
			break;
		}
	}
	
	if (tagNumber == (-1))
		return;
	
	var index : int = myTagIndexes[tagNumber]; // Index of the character after myTag in the text
	var gap = letterSpots[index].y - uBorder + gapToMove;
	
	if (gap > ((letterSpots[textToDisplay.Length-1].y + gapToMove - uBorder) - ( Screen.height - uBorder - dBorder ) ) + heightLetter) // gap < height of text - height of screen, we scroll to max
		gap = (letterSpots[textToDisplay.Length-1].y + gapToMove - uBorder) - ( Screen.height - uBorder - dBorder ) + heightLetter;
	
	gapToMove -= gap ;
}

/*
*	Tag in input, the function removes the < >
*/
function tagToName (tag : String) {
	var bufferTag : String = "";
	for (var i=1; i<tag.Length-1; i++)
		bufferTag += tag[i];
	return bufferTag;
}

/*
*	 Two functions to display the text
*/
function OnGUIText(){
	if( !textIsHidden && textInitialized)
		displayText();
}

function displayText() {
	transitionMove();
	replaceOutOfBoundText();
	
	for (var i : int = indexFirstChar; i < textToDisplay.Length; i++) {
		if (letterSpots[i].y >= uBorder && (letterSpots[i].y + heightLetter) <= Screen.height - dBorder && displayChar[i])
			GUI.Label (letterSpots[i], ""+textToDisplay[i], styleLetterMiddle);
	}
	
	/* Arrows to show possible scrolling */
	if (letterSpots[indexFirstChar].y < uBorder)
		GUI.Label ( Rect (lBorder - 15, uBorder - 15, 15, 15), upArrow);
	if (letterSpots[textToDisplay.Length-1].y > Screen.height - dBorder - heightLetter)
		GUI.Label ( Rect (lBorder - 15, Screen.height - dBorder, 15, 15), downArrow);
}

function removeText() {
	disableAll();
	textInitialized = false;
}

/*
 * Déplace le texte pour les transitions ///////////////////////////////////////////////////////
 */
private function transitionMove() {
	
	// si ya rien à faire, on ne s'attarde pas
	if(gapToMove == 0 )
		return ;
	
	// calcul de la vitesse en fonction de ce qu'il reste à déplacer
	var sens = (gapToMove > 0 ) ? 1 : -1 ;
	var speed = gapToMove*coefSpeed/100 + constSpeed*sens ;
	var elapsedTime = Time.deltaTime ;
	
	// maj de ce qu'il reste à bouger
	gapToMove -= speed*elapsedTime ;
	
	// si on a changé de signe
	if(gapToMove > 0 && sens < 0 ) {
		speed = 0 ;
		gapToMove = 0 ;
		
	} else if(gapToMove < 0 && sens > 0 ) {
		speed -= gapToMove/elapsedTime ;
		gapToMove = 0 ;
	}
	
	// déplacement des lettres
	for (var j : int = 0; j < textToDisplay.Length; j++) {
		letterSpots[j].y += speed*elapsedTime ;
	}
	
}


/*
 * S'assure que le texte n'a pas été trop scrollé et le replace sinon
 */
private function replaceOutOfBoundText() {
	
	var gap : float ;
	
	if ( letterSpots[textToDisplay.Length-1].y <= Screen.height - dBorder - heightLetter) {// Blocking Down
		gap = Screen.height - dBorder - heightLetter - letterSpots[textToDisplay.Length-1].y;
		if (gap > heightLetter / 2) { // Then we have to realign the text
			for (var k : int = 0; k < textToDisplay.Length; k++) {
				letterSpots[k].y += gap;
			}
		}
	}
	
	if ( letterSpots[indexFirstChar].y >= uBorder) {// Blocking Up
		gap = letterSpots[indexFirstChar].y - uBorder;
		if (gap > heightLetter / 2) { // Then we have to realign the text
			for (var j : int = 0; j < textToDisplay.Length; j++) {
				letterSpots[j].y -= gap;
			}
		}
	}
}

/***********************
	Dealing with events
***********************/


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

	if (	textInitialized && eventEnable 	// évenements activé
			&& gapToMove == 0				// pas en mouvement
			&& isIn(dragData.pos) ) {		// souris dans le texte
		
		var block = false; // If true, you cannot scroll
		var gap : float = 0; // gap between the top (resp bottom) of the text, and the top (resp bottom) of the frame
		
		if ( 	(letterSpots[indexFirstChar].y >= uBorder && dragData.delta.y < 0) || // Blocking Up
				( letterSpots[textToDisplay.Length-1].y <= Screen.height - dBorder - heightLetter && dragData.delta.y > 0) ) {// Blocking Down
				block = true;
		}
		
		/* If finger/mouse on the text and if not blocked */	
		if (!block) {
			for (var i : int = 0; i < textToDisplay.Length; i++) {
				letterSpots[i].y -= dragData.delta.y * coefDragging;
			}
		}
		replaceOutOfBoundText();
		
		/* Looking for the tag highest placed, in the top half of the frame */
		for (var l : int = 0; l < myTags.length; l++) {
			/* If we find the tag */
			if ( letterSpots[myTagIndexes[l]].y > uBorder && letterSpots[myTagIndexes[l]].y < uBorder + 2 * heightLetter) {
				if (slideshow) {
					slideshow.goTo(tagToName(myTags[l]));
					Console.Test('slideshow.goTo(tagToName( '+myTags[l]+' )) ;' ,103 );
				}
				break;
			}
		}
	}
}

/*
 * True if pos is in text
 */
public function isIn( pos : Vector2 ) : boolean {
	
	return (	pos.x > lBorder &&
			 	pos.x < Screen.width - rBorder &&
				pos.y < Screen.height - uBorder &&
				pos.y > dBorder ) ;
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


