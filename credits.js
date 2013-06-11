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

/* Position et texture du bouton return */
private var myReturnRectangle : Rect;
private var myReturnTexture : Texture;

/* Chemin du fichier texte contenant les crédits */
private var pathCredits : String = "Resources/defaultDatas/credits/credits";

private var displayCredits : boolean = false;

private var audioWasPlaying : boolean = false;

/*disposition des éléments des crédits en pourcentage de l'écran*/
private var margin_center : float = 0.1;
private var margin_right : float = 0.1;
private var margin_left : float = 0.1;
private var margin_top : float = 0.1;
private var margin_bot : float = 0.1;
private var number_logo : int = 5;// five logos will be displayed
private var margin_betw_media : float = 0.05; // déterminer suivant le nombre de médias
private var width_logo : float = 0.5 - margin_right - margin_center/2;
private var height_logo : float = (0.5 - margin_bot - 4*margin_betw_media)/number_logo;

/* position of plane along z axis */
private var z_coor : float = 20;

/*tableau contenant les noms des logos*/
private var logoPath : String[] = new String[number_logo];

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
	videoSet = 		gameObject.GetComponent("videoSettings") as videoSettings;
	
	// manage audio of GUI
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
		textViewer.placeTextFactor( margin_top , margin_bot , margin_left , 0.5 , fileSystem.getTextFromFile(fileSystem.getResourcesPath() + pathCredits)); // u d l r (margins) + Text to display

	/*init nom des logos*/
	logoPath[0] = "EMSE";
	logoPath[1] = "LFKS";
	logoPath[2] = "ZKM";
	logoPath[3] = "MP2013";
	logoPath[4] = "softPredictions";
	
	/*init plane where mivie is displayed*/
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
			displayLogo( 	1 - ( margin_bot + i*( height_logo + margin_betw_media ) ),
							0.5 + margin_center/2,
							width_logo,
							height_logo,
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
	
	if (audioWasPlaying)
		audio.Play();
}


/*
	*display logo on credits screen
*/
private function displayLogo( bot : float , left : float , w : float , h : float , path : String ){
	// rectangle where the logo is displayed
	var r  : Rect = Rect( Screen.width*left , Screen.height*bot , Screen.width*w , Screen.height*h );
	// load logo
	var texture = Resources.Load("defaultDatas/credits/logos/"+path);
	
	if( path ){// check if path is not empty
		if( typeof( texture ) == typeof(Texture) || typeof( texture ) == typeof(Texture2D) ){// check if the asset has the right type
			// get ratio of asset
			var ratio : float = (texture as Texture).width/(texture as Texture).height;
			// calculate a new rectangle
			var newR : Rect = strip.optimalSize( ratio , r );
			GUI.DrawTexture( newR , texture as Texture );
		}
		else
			Console.Warning( "File is typeof "+typeof(texture)+" whereas it should be typeof Texture or Texture2D" );
	}
	else
		Console.Warning("No path available for logos");
}

/*
	*init screen
*/
private function initScreen(){
	var r : Rect = Rect( (0.5 + margin_center/2)*Screen.width , ( 0.5 + margin_betw_media)*Screen.height , width_logo*Screen.width , (0.5 - margin_top - margin_betw_media )*Screen.height );
	
	// load asset
	var path : String = "StreamingAssets/defaultDatas/credits/zkm_movie";
	
	// create gameobject for movie
	var videoScreen : GameObject = new GameObject.CreatePrimitive( PrimitiveType.Plane );
	
	// load movie
	videoSet.putVideo( videoScreen , path );
	
	// get ratio of movie
	var v : Vector2 = videoSet.VideoWH();
	var ratio : float = v.x/v.y;
	
	// calculate a new rectangle that fit the ratio of movie
	var newR : Rect = strip.optimalSize( ratio , r );
	Debug.Log("r   " + newR);
	// set parameters of screen
	setScreen( newR , videoScreen );
	
}

/*
	*create plane on the top right of screen
	*a movie is displayed there
*/
private function setScreen( r : Rect , videoScreen : GameObject ){
	
	// name
	videoScreen.name = "GUI_creditMovie";
	
	// extend plane
	var elmtsSize : Vector2 = windows.getRealSize(	Vector2( r.width , r.height ),
													Vector2( r.x , r.y ),
													z_coor, 
													camera ) ;
	
	var size = videoScreen.renderer.bounds.size ;
	videoScreen.transform.localScale = Vector3( elmtsSize.x/size.x, 
												1, 
												elmtsSize.y/size.z ) ;
	
	// set position of plane
	videoScreen.transform.position = camera.ScreenToWorldPoint( Vector3( r.x + r.width/2 , r.y + r.height/2 , z_coor ) );
	videoScreen.transform.rotation = camera.transform.rotation;
	videoScreen.transform.rotation *= Quaternion.AngleAxis(-90, Vector3( 1,0,0) );
	videoScreen.transform.rotation *= Quaternion.AngleAxis(180, Vector3( 0,1,0) );
	
	// test and set renderer
	var testRenderer = videoScreen.GetComponent(Renderer);
	if( !testRenderer)
		videoScreen.AddComponent(Renderer);
}








