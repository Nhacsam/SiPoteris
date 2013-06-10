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

private var audioWasPlaying : boolean = false;

function initCredits ( returnRectangle : Rect) {
	VideoFull = gameObject.GetComponent("FullScreen") as FullScreen;
	if (!VideoFull)
		VideoFull = gameObject.AddComponent("FullScreen") as FullScreen;
		
	textViewer = gameObject.AddComponent("text")	as text ;
		
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
	
	myReturnRectangle = returnRectangle;
	myReturnTexture = Resources.Load("GUI/back");
	
	VideoFull.hideGUI();
	if (strip)
		strip.disableAll();
	if (windows)
		windows.disableAll();
	if (slideshow)
		slideshow.disableAll();
	displayCredits = true;
	
	if (fileSystem.getTextFromFile(fileSystem.getResourcesPath() + "Resources/defaultDatas/credits/credits") == (-1))
		exitCredits();
	else
		textViewer.placeTextFactor(0.1, 0.1, 0.2, 0.2, fileSystem.getTextFromFile(fileSystem.getResourcesPath() + "Resources/defaultDatas/credits/credits")); // u d l r (margins) + Text to display

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
	
	Destroy(textViewer);
	
	if (audioWasPlaying)
		audio.Play();
}