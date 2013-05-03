/*
Creation : 02/04/2013
Last update : 24/04/2013

Author : Fabien Daoulas

This script contains functions justificating a text.

Use: placeText(...) is called once, and displayText(...) is called at every frame afterwards

*/

/* text to display ===> I ASSUME ALL \t ARE PRECEDED BY \n */  
private var textToDisplay : String = "Dans le couloir.\n\tLéodagan : Qu’est c’que c’est qu’cette lubie d’vous faire construire une table ?\n\tPerceval : D’autant qu’y en déjà une dans la salle à manger !\n\tArthur : Là c’est une table ronde. Pour que les chevaliers de Bretagne se réunissent autour. Toute façon autant vous y faire parce qu’à partir de maintenant on va s’appeler « les chevaliers de la table ronde ».\n\tPerceval : Les chevaliers de la table ronde ???\n\tLéodagan : Encore une chance qu’on se soit pas fait construire un buffet à vaisselle !\nArthur hausse les épaules et s’en va.\nDans la salle Arthur regarde la nouvelle table ronde. Il est appuyé dessus.\n\tArthur : Non, non elle est bien. (Pas convaincu) Elle est bien. (Se lève) pff… Elle est bien mais j’voyais d’la pierre moi.\n\tBreccan (qui nettoie ses outils après avoir fini de faire la table) : Sire, on en a déjà parlé de la pierre ! J’peux pas monté une pierre d’une toise et demi dans un escalier à colimaçon ! (Arthur hausse les épaules) Eh j’suis pas magicien !\n\tBohort : C’est … C’est pas désagréable le bois.\n\tBreccan : D’autant qu’là j’vous ai mis d’la qualité ! Mettons pour un banquet, bon, si y a cinq ou six dames qui veulent un p’tit peu bagnauder (mdr je connais pas ce mot…) là-dessus elle bougera pas !\n\tArthur : Non, non mais c’est pas tellement l’ambiance…\n\tBreccan : Oh ben ça après moi pour le détail je sais pas…\n\tPerceval : C’est pas tant l’bois qui me dérange moi. C’est plutôt l’cuir.\n\tKaradoc : Ca fait un p’tit peu atelier d’cousette.\n\tArthur : Eh ouais, ouais, ouais… Et ouais, c’est pas faux.\n\tBreccan : Le cuir ça restera toujours le cuir. Le cuir ça traverse les âges, les frontières, les modes. D’autant qu’là j’vous ai pas mis d’la vache moisie, attention ! C’est d’la tannerie d’luxe ! Assemblée au crochet d’six. Y a des heures de main d’œuvre derrière !\n\tPerceval : Non mais faut prendre l’habitude, c’est tout.\n\tBreccan : Par contre faudra faire gaffe en mangeant. Parce que là j’vous ai fait un traitement à l’huile de porc pour imperméabiliser mais si y a des taches de jus d’viande c’est foutu.\n\tArthur : Non mais on va pas manger d’sus non plus.\n\tBreccan : Après pour le détail ça je sais pas moi…";

// array of rects containing the position of the GUILabel of each letter -- aboutLetter[i] is corresponding to textToDisplay[i]
private var letterSpots : Rect[] = new Rect[textToDisplay.Length];

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

function Start(){

	placeText(Screen.height/10, Screen.height * 0.26, Screen.width/20, Screen.width * 0.55); // u d l r
}

/*
	*this function will create label for each letter and place at the right position them to justify the text
*/

function OnGUI(){
	displayText();
}

private function initText(u: int, d: int, l: int, r: int) {

	/* Calculate margin sizes */
	uBorder = u;
	dBorder = d;
	lBorder = l;
	rBorder = r;
	
	widthText = Screen.width - lBorder - rBorder;
	REF_RECT = Rect(lBorder, uBorder, widthLetter, heightLetter);
	
	/* Enable Input Touch */
	OnEnable();

}

/*
	*calculate the position of rectangle for each letter. Input: Coordinates of up left (1) and bottom right (2) corners
*/
function placeText(u, d, l, r) {

	initText(u, d, l, r);

	// this variable contains the number of spaces in a sentence
	var nbOfSpace : int;
	
	var rectLetter : Rect = REF_RECT;
	
	styleLetterMiddle.alignment = TextAnchor.MiddleCenter;
	styleLetterMiddle.normal.textColor = Color.white;
	
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
				if (textToDisplay[i+1] == "\t")
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
	var moveToNextIntMinus1: int = moveToNext[numLine - 1];
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
	
/* Enable touch events */
function OnEnable(){
	//Gesture.onSwipeE += OnSwipe;
	Gesture.onDraggingE += onDragging;
}

/* Disable touch events */
function OnDisable(){
	//Gesture.onSwipeE -= OnSwipe;
	Gesture.onDraggingE -= onDragging;
}

/* Scrolling text with swipe event ! (Finger OK Mouse KO)*/
function OnSwipe(swipeData : SwipeInfo) {
	Debug.Log("Direction: " + swipeData.direction);
	
	var block = false; // If true, you cannot scroll
	if ( letterSpots[0].y >= uBorder && swipeData.direction.y < 0 ) // Blocking Up
		block = true;
	if ( letterSpots[textToDisplay.Length-1].y <= Screen.height - dBorder - heightLetter && swipeData.direction.y > 0 ) // Blocking Down
		block = true;

	/* If finger/mouse on the text and if not blocked */	
	if (swipeData.startPoint.x > lBorder && swipeData.startPoint.x < Screen.width - rBorder && swipeData.startPoint.y > uBorder && swipeData.startPoint.y < Screen.height - dBorder && !block) {
		for (var i : int = 0; i < textToDisplay.Length; i++) {
			letterSpots[i].y -= swipeData.direction.y;
		}
	}
}

/* Scrolling text with dragging event ! (Finger KO Mouse OK) */
function onDragging(dragData : DragInfo) {
	var block = false; // If true, you cannot scroll
	if ( letterSpots[0].y >= uBorder && dragData.delta.y < 0 ) // Blocking Up
		block = true;
	if ( letterSpots[textToDisplay.Length-1].y <= Screen.height - dBorder - heightLetter && dragData.delta.y > 0 ) // Blocking Down
		block = true;
		
	/* If finger/mouse on the text and if not blocked */	
	if (dragData.pos.x > lBorder && dragData.pos.x < Screen.width - rBorder && dragData.pos.y < Screen.height - uBorder && dragData.pos.y > dBorder && !block) {
		for (var i : int = 0; i < textToDisplay.Length; i++) {
			letterSpots[i].y -= dragData.delta.y;
		}
	}
}	
	
