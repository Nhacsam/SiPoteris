/*
credits.js
----------
Affiche les crédits après appui sur bouton dans la GUI
C'est simplement un textViewer, qui affiche le contenu du fichier Resources/defaultDatas/credits/credits
*/


#pragma strict

private var VideoFull : FullScreen;
private var slideshow  : slideShow ;
private var windows  : showingWindow ;
private var audioPlayer : sound ;
private var textViewer : text ;
private var strip : displayStrip;

/* Position et texture du bouton return */
private var myReturnRectangle : Rect;
private var myReturnTexture : Texture;

/* Chemin du fichier texte contenant les crédits */
private var pathCredits : String = "Resources/defaultDatas/credits/credits";

private var displayCredits : boolean = false;

private var audioWasPlaying : boolean = false;

function initCredits ( returnRectangle : Rect) {
	/* Lien avec FullScreen.js */
	VideoFull = gameObject.GetComponent("FullScreen") as FullScreen;
	if (!VideoFull)
		VideoFull = gameObject.AddComponent("FullScreen") as FullScreen;
	
	/* Création textViewer */
	textViewer = gameObject.AddComponent("text")	as text ;
	
	/* Liens avec les éléments de la GUI */
	strip = gameObject.GetComponent("displayStrip")	as displayStrip;
	windows = gameObject.GetComponent("showingWindow") as showingWindow;
	slideshow = gameObject.GetComponent("slideShow") as slideShow;
	
	gameObject.GetComponent("AudioSource");
	if (audio.isPlaying) {
		audioWasPlaying = true;
		audio.Pause();
	}
	else
		audioWasPlaying = false;
	
	/* Placement bouton */
	myReturnRectangle = returnRectangle;
	myReturnTexture = Resources.Load("GUI/back");
	
	/* Effacement de la GUI */
	VideoFull.hideGUI();
	if (strip)
		strip.disableAll();
	if (windows)
		windows.disableAll();
	if (slideshow)
		slideshow.disableAll();
	displayCredits = true;
	
	/* Retour GUI si pas de fichier texte, placement du texte sinon */
	if (fileSystem.getTextFromFile(fileSystem.getResourcesPath() + pathCredits ) == (-1))
		exitCredits();
	else
		textViewer.placeTextFactor(0.1, 0.1, 0.2, 0.2, fileSystem.getTextFromFile(fileSystem.getResourcesPath() + pathCredits)); // u d l r (margins) + Text to display

}

/* Getter */
function isDisplayed () {
	return displayCredits;
}

function OnGUICredits () {
	if (displayCredits) {
		if( GUI.Button( myReturnRectangle, myReturnTexture ) ) {
			exitCredits();
		}
		textViewer.OnGUIText();
	}
}

function exitCredits() {
	/* Réaffichage de la GUI */
	VideoFull.displayGUI();
	if (strip)
		strip.enableAll();
	if (windows)
		windows.enableAll();
	if (slideshow)
		slideshow.enableAll();
	displayCredits = false;
	
	Destroy(textViewer);
	
	if (audioWasPlaying)
		audio.Play();
}