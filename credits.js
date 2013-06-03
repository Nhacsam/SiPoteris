#pragma strict

private var VideoFull : FullScreen;
private var slideshow  : slideShow ;
private var windows  : showingWindow ;
private var audioPlayer : sound ;
private var textViewer : text ;
private var strip : displayStrip;

private var myReturnRectangle : Rect;
private var myReturnTexture : Texture;

private var displayCredits : boolean = false;

function initCredits ( returnRectangle : Rect) {
	VideoFull = gameObject.GetComponent("FullScreen") as FullScreen;
	if (!VideoFull)
		VideoFull = gameObject.AddComponent("FullScreen") as FullScreen;
		
	textViewer = gameObject.AddComponent("text")	as text ;
		
	strip = gameObject.GetComponent("displayStrip")	as displayStrip;
	windows = gameObject.GetComponent("showingWindow") as showingWindow;
	slideshow = gameObject.GetComponent("slideShow") as slideShow;
	
	gameObject.GetComponent("AudioSource");
	audio.Stop();
	
	myReturnRectangle = returnRectangle;
	myReturnTexture = Resources.Load("blue_left_arrow");
	
	VideoFull.hideGUI();
	if (strip)
		strip.disableAll();
	if (windows)
		windows.disableAll();
	if (slideshow)
		slideshow.disableAll();
	displayCredits = true;
	
	textViewer.placeTextFactor(0, 0, 0.25, 0.25, fileSystem.getTextFromFile(fileSystem.getResourcesPath() + "Resources/defaultDatas/credits/credits")); // u d l r (margins) + Text to display
	//textViewer.placeTextFactor(0, 0, 0.25, 0.25, "Ceci est un test de crédits pour tester la disposition, les accents, la justification, tout ce genre de choses !!! =D");

}

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
	VideoFull.displayGUI();
	if (strip)
		strip.enableAll();
	if (windows)
		windows.enableAll();
	if (slideshow)
		slideshow.enableAll();
	displayCredits = false;
	audio.Play();
}