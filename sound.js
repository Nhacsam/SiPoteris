/* sound.js
Creation: 25/04/13 byte Kevin Guillaumond

Purpose: Manages the sound at the bottom left of the screen in 2D view
*/


#pragma strict

// borders in x-position of sound 
private var lBorder : int;
private var rBorder : int;

// border in y-position of sound
private var uBorder : int;
private var dBorder : int;

private var buttonSizeFactor : float = 0.5; // is <= 1. If 1, the button takes all the room available

private var customGUISkin : GUISkin;

private var playBtn : Texture;
private var pauseBtn : Texture;
private var currentBtn : Texture;

private var songName : String;

function Start () {
	placeMusic (Screen.height * 0.74 + 10, Screen.height/10, Screen.width/20, Screen.width * 0.45, "Bob_Marley-Jamming"); // Coordinates of the music layout. U D L R. The button is always a square
	/* 10 is the margin between text and music */
}

function Update () {

}

function OnGUI() {
	displayMusic();
}

function placeMusic (u, d, l, r, name) {

	gameObject.AddComponent("AudioSource");
	audio.clip = Resources.Load("Audio/" + name) as AudioClip;
	audio.Play();
	
	songName = name;
	gameObject.AddComponent("GUIText");	

	playBtn = Resources.Load("Pictures/play");
	pauseBtn = Resources.Load("Pictures/pause");
	currentBtn = pauseBtn;
	
	customGUISkin = Resources.Load("mySkin");
	
	if (buttonSizeFactor > 1)
		buttonSizeFactor = 1;
	
	uBorder = u;
	dBorder = d;
	lBorder = l;
	rBorder = r;
	
	audio.loop = true;
	
	if (!playBtn) {
        Debug.LogError("No texture for play button");
        return;
    }
    if (!pauseBtn) {
        Debug.LogError("No texture for pause button");
        return;
    }
}

function displayMusic() {
	var buttonSize = (Screen.height - uBorder - dBorder ) * buttonSizeFactor;  // size of the square
	GUI.skin = customGUISkin; // Transparent buttons
	
	/* The button is centered regarding the y axis */
	if (GUI.Button(Rect(lBorder, uBorder + (((buttonSize / buttonSizeFactor) - buttonSize) / 2), buttonSize, buttonSize), currentBtn)) { // Rect: left top width height
		if (currentBtn == pauseBtn) { // Sound playing
			currentBtn = playBtn;
			audio.Pause();
		}
		else {
			currentBtn = pauseBtn;
			audio.Play();
		}
	}
	
	/* TEEEEEEEEEEEEEST */
	if (GUI.Button(Rect(250, uBorder + (((buttonSize / buttonSizeFactor) - buttonSize) / 2), 300, buttonSize), "Changer musique :)")) {
		if (songName == "byebyebeautiful")
			changeMusic("Bob_Marley-Jamming");
		else
			changeMusic("byebyebeautiful");
 	}
	
	/* Name of the song */
	guiText.text = songName;
	guiText.pixelOffset = Vector2 (lBorder + buttonSize + 10, - (uBorder + buttonSize/(2*buttonSizeFactor)));
	guiText.anchor = TextAnchor.MiddleLeft;
		
}

function changeMusic(newName) {
	var audioIsPlaying = audio.isPlaying;
	songName = newName;
	audio.clip = Resources.Load("Audio/" + newName) as AudioClip;
	
	if (audioIsPlaying) {
		audio.Play();
		currentBtn = pauseBtn;
	}
	else {
		audio.Pause();
		currentBtn = playBtn;
	}
}