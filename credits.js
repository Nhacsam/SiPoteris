#pragma strict
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
private var videoSet : videoSettings;

/* Position, texture et skin du bouton return */
private var myReturnRectangle : Rect;
private var myReturnTexture : Texture;
private var mySkin : GUISkin;

/* Chemin du fichier texte contenant les crédits */
private var pathCredits : String = "Resources/defaultDatas/credits/credits";

private var displayCredits : boolean = false;

private var audioWasPlaying : boolean = false;

private var VideoIsLoading : boolean;

private var screenIsSet : boolean;

private var firstWarning : boolean;//to avoid spamming console

private var videoScreen : GameObject;

/*disposition des éléments des crédits en pourcentage de l'écran*/
private var margin_center : float = 0.1;
private var margin_right : float = 0.05;
private var margin_left : float = 0.05;
private var margin_top : float = 0.10;
private var margin_bot : float = 0.15;
private var margin_bot_button : float = 0.03;
private var number_logo : int = 3;// five logos will be displayed
private var margin_betw_media : float = 0.015; // déterminer suivant le nombre de médias
private var width_logo : float = (0.5 - margin_right - margin_center/2 - margin_betw_media);// 2 columns
private var height_logo : float = (0.5 - margin_bot_button - margin_betw_media)/3;//2 : two lines

/* position of plane along z axis */
private var z_coor : float = 20;

/*tableau contenant les noms des logos*/
private var logoPath : String[];
/*tableau contenant la position des logos sous forme de rectangle*/
private var logoRect : Rect[];


//////////////
/////INIT/////
//////////////

function initCredits ( returnRectangle : Rect) {
	/* Lien avec FullScreen.js */
	VideoFull = 	gameObject.GetComponent("FullScreen") as FullScreen;
	if (!VideoFull)
		VideoFull = gameObject.AddComponent("FullScreen") as FullScreen;

	/* Création textViewer */
	textViewer = 	gameObject.AddComponent("text")	as text ;
	
	/* Liens avec les éléments de la GUI */
	strip = 		gameObject.GetComponent("displayStrip")		as displayStrip;
	windows = 		gameObject.GetComponent("showingWindow") 	as showingWindow;
	slideshow = 	gameObject.GetComponent("slideShow")		as slideShow;
	videoSet = 		gameObject.GetComponent("videoSettings") 	as videoSettings;
	
	// manage audio of GUI
	audioPlayer =	gameObject.GetComponent("AudioSource")		as sound;
	audioWasPlaying = false;
	if( audio ) {
		if (audio.isPlaying) {
			audioWasPlaying = true;
			audio.mute = true;
		}
	}
			

	/* Placement bouton */
	myReturnRectangle = returnRectangle;
	myReturnTexture = Resources.Load("GUI/back");
	
	/* Bouton transparent */
	mySkin = new GUISkin ();
	mySkin.button.normal.background = null;
	
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
		textViewer.placeTextFactor( margin_top , margin_bot , margin_left , 0.5 , fileSystem.getTextFromFile(fileSystem.getResourcesPath() + pathCredits)); // u d l r (margins) + Text to display

	/*init nom des logos*/
	logoPath = new String[number_logo];
	logoPath[0] = "LFKS";
	logoPath[1] = "ZKM";
	logoPath[2] = "EMSE";
	
	/*init rect des logos*/
	logoRect = new Rect[number_logo];
	logoRect[0] = Rect( (	0.5 + margin_center/2)*Screen.width , 
							(1 - margin_bot_button - 3*height_logo - 2*margin_betw_media - margin_betw_media)*Screen.height , 
							width_logo*Screen.width , 
							height_logo*Screen.height );
	logoRect[1] = Rect( (	0.5 + margin_center/2)*Screen.width , 
							(1 - margin_bot_button - 2*height_logo - margin_betw_media)*Screen.height  , 
							width_logo*Screen.width, 
							height_logo*Screen.height );
	logoRect[2] = Rect( (	0.5 + margin_center/2)*Screen.width ,
							(1 - margin_bot_button - height_logo)*Screen.height  , 
							width_logo*Screen.width , 
							height_logo*Screen.height );

	/* init bool */
	VideoIsLoading = false;
	screenIsSet = false;
	firstWarning = true;
	
	/*init plane where movie is displayed*/
	initScreen();
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
		// display text
		textViewer.OnGUIText();
		
		// display logos
		for( var i = 0 ; i < logoPath.length ; i++ )
			displayLogo( 	logoRect[i],
							logoPath[i]);
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
	
	Destroy(videoScreen);
	
	if (audioWasPlaying)
		audio.mute = false;
}

/*
	*test video loaded in update
*/
function updateCredits(){
	if( VideoIsLoading ) {
		if( videoSet.isVideoReady() && !screenIsSet ) {// loading is finished
			var r : Rect = Rect( 	(0.5 + margin_center/2)*Screen.width , 
									(0.5 + margin_betw_media)*Screen.height , 
									(0.5 - margin_right - margin_center/2)*Screen.width , 
									(0.5 - margin_top - margin_betw_media )*Screen.height );
		
			var v : Vector2 = videoSet.VideoWH();
			var ratio : float = v.x/v.y;
				
			// calculate a new rectangle that fit the ratio of movie
			var newR : Rect = strip.optimalSize( ratio , r );
			// set parameters of screen
			setScreen( newR , videoScreen );
			
			// enable renderer
			videoScreen.renderer.enabled = true;
			
			// to avoid doing this at each call of update
			screenIsSet = true;
		}
	}
}

/*
	*display logo on credits screen
*/
private function displayLogo( r : Rect , path : String ){
	// load logo and test if texture exists and has the right type
	try {
		var texture = Resources.Load("defaultDatas/credits/logos/"+path , Texture2D);
	} catch( e) {
		texture = null;
	}
	
	if( texture ){// check if path is not empty
			// get ratio of asset
			var ratio : float = (texture as Texture).width/(texture as Texture).height;
			// calculate a new rectangle
			var newR : Rect = strip.optimalSize( ratio , r );
			GUI.DrawTexture( newR , texture as Texture );
	}
	else{
		if( firstWarning ){
			// avoid to spam console
			firstWarning = false;
			Console.Warning("No path available for logos or type of file is not texture2D - logo");
		}
	}
}

/*
	*init screen
*/
private function initScreen(){
	// load asset
	var path : String = "defaultDatas/credits/zkm_movie";
	
	if( !videoScreen ){
		// create gameobject for movie
		videoScreen = new GameObject.CreatePrimitive( PrimitiveType.Plane );
	
		// name
		videoScreen.name = "GUI_creditMovie";
	}
	
	// load movie
	videoSet.creditsVideo( videoScreen , path , true);
	
	VideoIsLoading = true;
}

/*
	*create plane on the top right of screen
	*a movie is displayed there
*/
private function setScreen( r : Rect , videoScreen : GameObject ){
	// name
	videoScreen.name = "GUI_creditMovie";
	
	var rotation = videoScreen.transform.rotation ;
	videoScreen.transform.rotation = Quaternion();
	
	// extend plane
	var elmtsSize : Vector2 = windows.getRealSize(	Vector2( r.width , r.height ),
													Vector2( r.x , r.y ),
													z_coor, 
													camera ) ;
	
	var size = videoScreen.renderer.bounds.size ;
	videoScreen.transform.localScale = Vector3( videoScreen.transform.localScale.x * elmtsSize.x/size.x, 
												1, 
												videoScreen.transform.localScale.z * elmtsSize.y/size.z ) ;
	
	// set position of plane
	videoScreen.transform.position = camera.ScreenToWorldPoint( Vector3( r.x + r.width/2 , r.y + r.height/2 , z_coor ) );
	videoScreen.transform.rotation = camera.transform.rotation;
	videoScreen.transform.rotation *= Quaternion.AngleAxis(-90, Vector3( 1,0,0) );
	videoScreen.transform.rotation *= Quaternion.AngleAxis(0, Vector3( 0,1,0) );
}








