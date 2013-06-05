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

private var buttonSizeFactor : float = 0.60; // is <= 1. If 1, the button takes all the room available

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

// event and display activate or not
private var eventEnable : boolean ;
private var soundIsHidden : boolean ;

private var chooseNextSoundRandomly: boolean = true;

private var repeatButton : Texture;


function OnGUISound() {
	if( !soundIsHidden )
		displayMusic();
}


function placeMusic (u: int, d: int, l: int, r: int, tab: Array) { // 4 margins + an array of sound names (with path from folder Resources)

	nbSounds = tab.length;
	
	if (nbSounds == 0)
		return;
	
	/* Init array of sound names */
	tabOfSounds = tab;
	currentIndex = 0;
		
	gameObject.AddComponent("AudioSource");
	audio.clip = Resources.Load(tab[0]) as AudioClip;
	audio.Play();
	
	enableAll();
	
	playBtn = Resources.Load("Pictures/play");
	pauseBtn = Resources.Load("Pictures/pause");
	currentBtn = pauseBtn;
	
	customGUISkin = Resources.Load("mySkin");
	
	repeatButton = Resources.Load("Pictures/repeat_music");
	
	if (buttonSizeFactor > 1)
		buttonSizeFactor = 1;
	
	uBorder = u;
	dBorder = d;
	lBorder = l;
	rBorder = r;
	
	soundNameStr = fileSystem.getName(tab[0]);
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

function placeMusicFactor (u: float, d: float, l: float, r: float, tab: Array) {
	placeMusic(u*Screen.height, d*Screen.height, l*Screen.width, r*Screen.width, tab);
}

function displayMusic() {

	/* Do not display anything for music if play btn is not loaded or if there is no sound to play */	
	if( !playBtn || (nbSounds == 0))
		return;
	
	var buttonSize = (Screen.height - uBorder - dBorder ) * buttonSizeFactor;  // size of the square
	GUI.skin = customGUISkin; // Transparent buttons

	/* The button is centered regarding the y axis */
	if (GUI.Button(Rect(lBorder, uBorder + (((buttonSize / buttonSizeFactor) - buttonSize) / 2), buttonSize, buttonSize), currentBtn) && eventEnable ) { // Rect: left top width height
		if (currentBtn == pauseBtn) { // Sound playing
			currentBtn = playBtn;
			audio.Pause();
		}
		else {
			currentBtn = pauseBtn;
			audio.Play();
		}
	}
		
	/* Test bouton changer musique, amené à disparaitre un jour */
	if (GUI.Button(Rect( Screen.width-rBorder-buttonSize, uBorder + (((buttonSize / buttonSizeFactor) - buttonSize) / 2), buttonSize, buttonSize), repeatButton) && eventEnable) {
		changeMusic("");
	}
		
		/* Name of the song */
		
	GUI.Label( Rect(lBorder + buttonSize + 10,
					uBorder + buttonSize/(2*buttonSizeFactor) - widthLetter,
					Screen.width - lBorder - rBorder,
					heightLetter
					),
			soundNameStr);
}

/* If soundName = "", the function chooses the next sound to play (random or not). If not, plays the sound named soundName */
function changeMusic(soundName) {
	var audioIsPlaying = audio.isPlaying;
	var newSoundPath = ""; // Path of the new sound to play
	
	/*
	* Select the name of the next sound
	*/
	if (soundName != "")
		newSoundPath = soundName;		
	else { // if no soundName, select the next sound to play
		if (!chooseNextSoundRandomly) {
			if (currentIndex == nbSounds - 1) { // end of playlist
					newSoundPath = tabOfSounds[0];
					currentIndex = 0;
				}
				else {
					newSoundPath = tabOfSounds[currentIndex+1];
					currentIndex++;
				}
		} // end if not random
		else { // chosoe next sound randomly
			var randomIndex = Mathf.Floor(Random.Range(0, nbSounds - 0.01));
			newSoundPath = tabOfSounds[randomIndex];
		}
	}
	
	/*
	* Load and play the selected sound
	*/
	audio.clip = Resources.Load(newSoundPath) as AudioClip;
	soundNameStr = fileSystem.getName(newSoundPath);
	
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
	disableAll();
	
	if(audio)
		audio.Stop();
	
	Destroy(GetComponent(GUIText));
	Destroy(GetComponent("AudioSource"));
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
	audio.Play();
}

/*
 * Cache l'objet et desactive les evenements
 */
public function disableAll() {
	hide() ;
	disableEvents();
	audio.Pause();
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
	soundIsHidden = false ;
}

/*
 * Cache l'objet
 */
public function hide() {
	soundIsHidden = true ;
}

/*
 * Getters
 */
public function areEventEnabled() : boolean {
	return eventEnable ;
}
public function isHidden() : boolean {
	return soundIsHidden ;
}
