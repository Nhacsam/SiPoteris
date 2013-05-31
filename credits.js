#pragma strict

private var VideoFull : FullScreen;
private var textViewer : text;

private var myReturnRectangle : Rect;
private var myReturnTexture : Texture;

private var displayCredits : boolean = false;

function initCredits ( returnRectangle : Rect) {
	VideoFull = gameObject.GetComponent("FullScreen") as FullScreen;
	if (!VideoFull)
		VideoFull = gameObject.AddComponent("FullScreen") as FullScreen;
		
	textViewer = gameObject.GetComponent("text")	as text ;
	if (!textViewer)
		textViewer = gameObject.AddComponent("text")	as text ;
	
	myReturnRectangle = returnRectangle;
	myReturnTexture = Resources.Load("blue_left_arrow");;
	
	VideoFull.hideGUI();
	displayCredits = true;
	
	textViewer.placeTextFactor(0, 0, 0.5, 0.5, fileSystem.getTextFromFile(fileSystem.getResourcesPath() + "Resources/defaultDatas/credits/credits")); // u d l r (margins) + Text to display

}

function isDisplayed () {
	return displayCredits;
}

function OnGUICredits () {
	if (displayCredits) {
		if( GUI.Button( myReturnRectangle, myReturnTexture ) ) {
			exitCredits();
		}
		//textViewer.OnGUIText();
	}
}

function exitCredits() {
	VideoFull.displayGUI();
	displayCredits = false;
}