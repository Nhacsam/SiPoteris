/* sound.js
Creation: 25/04/13 by Kevin Guillaumond

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

private var soundNameStr: String;

/* Sounds to play */
private var nbSounds: int;
private var tabOfSounds: Array;

/* Index of song currently playing, starting 0 */
private var currentIndex: int;

/* width and height of a letter */
private var widthLetter : int = 11;
private var heightLetter : int = 20;

private var onFullScreen : boolean;




function OnGUI() {
	displayMusic();
}


function placeMusic (u: int, d: int, l: int, r: int, tab: Array) { // 4 margins + an array of sound names

	nbSounds = tab.length;
	
	if (nbSounds == 0)
		return;
	
	/* Init array of sound names */
	tabOfSounds = tab;
	currentIndex = 0;
		
	onFullScreen = true;

	gameObject.AddComponent("AudioSource");
	audio.clip = Resources.Load("Audio/" + tab[0]) as AudioClip;
	audio.Play();
	
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
	
	soundNameStr = tab[0];
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
	
	if( !playBtn || (nbSounds == 0))
		return;
	
	var buttonSize = (Screen.height - uBorder - dBorder ) * buttonSizeFactor;  // size of the square
	GUI.skin = customGUISkin; // Transparent buttons
	
	if (onFullScreen) {
	
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
		if (GUI.Button(Rect(lBorder + 3 * buttonSize, /* test */ buttonSize + /* fin test */uBorder + (((buttonSize / buttonSizeFactor) - buttonSize) / 2), 200, buttonSize), "Changer musique :)")) {
			//var randomIndex = Math.floor(Math.random()*nbSounds);
			
						
			if (currentIndex == nbSounds - 1) { // end of playlist
				changeMusic(tabOfSounds[0]);
				currentIndex = 0;
			}
			else {
				changeMusic(tabOfSounds[currentIndex+1]);
				currentIndex++;
			}
	 	}
		
		/* Name of the song */
		GUI.Label( Rect(lBorder + buttonSize + 10,
						uBorder + buttonSize/(2*buttonSizeFactor) - widthLetter,
						Screen.width - lBorder - rBorder,
						heightLetter
						),
					soundNameStr);
	}
}

function changeMusic(newName) {
	var audioIsPlaying = audio.isPlaying;
	soundNameStr = newName;
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

function removeMusic() {
	onFullScreen = false;
	audio.Stop();
	Destroy(GetComponent(GUIText));
}