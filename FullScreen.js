#pragma strict


/* dépendances */
private var slideshow  : slideShow ;
private var windows  : showingWindow ;
private var audioPlayer : sound ;
private var textViewer : text ;
private var strip : displayStrip;
private var myCredits : credits;


/* On est en mode plein écran ? */
private var onFullScreen : boolean;

// Doit on afficher le(s) boutton(s) géré par fullscreen
private var GUIIsHidden : boolean;

/*	quand on rentre dans l'update pour la premiere fois*/
private var firstTimeInUpdate : boolean = true;

/* isolation de l'élément par rapport à la sphère complete */
private var isolate : boolean = true ;
private var toMove : Vector3 = new Vector3( -2000, -2000, -2000) ;


/* Position et rotation quand au début */
private var VideoInitialPos : Vector3 ;
private var VideoInitialRot : Vector3 ;
private var CameraInitialPos : Vector3 ;
private var CameraInitialOrthographic : boolean ;
private var CameraInitialLightType ;
private var CameraInitialLightIntesity : float ;


// A appeller pour sortir
private var toOnDeZoom : function() ;


/* Variables qui régissent la disposition du full screen en proportion de la hauteur / largeur (donc entre 0 et 1) */
/* Le point (0,0) est en bas à gauche. */
private var marginTop : float = 0.95;
private var marginBottom : float = 0.1;
private var marginLeft : float = 0.05;
private var marginRight : float = 0.95;

private var stripTop : float = marginTop;
private var stripBottom : float = stripTop - 0.05;
private var stripLeft : float = marginLeft;
private var stripRight : float = marginRight;

private var textTop : float = stripBottom - 0.05;
private var textBottom : float = 0.26;
private var textLeft : float = marginLeft;
private var textRight : float = 0.45;

private var musicTop : float = textBottom - 0.05;
private var musicBottom : float = marginBottom;
private var musicLeft : float = marginLeft + 0.028; // Permet aussi de changer la taille des boutons
private var musicRight : float = textRight;

private var pictureTop : float = textTop;
private var pictureBottom : float = textBottom;
private var pictureLeft : float = 0.55;
private var pictureRight : float = stripRight;

private var slideTop : float = musicTop;
private var slideBottom : float = musicBottom;
private var slideLeft : float = pictureLeft;
private var slideRight : float = marginRight;



/*
 * Initialisation des variables
 */

function InitFullScreen( ) {
	
	slideshow =		gameObject.AddComponent("slideShow")		as slideShow ;
	windows =		gameObject.AddComponent("showingWindow")	as showingWindow ;
	audioPlayer =	gameObject.AddComponent("sound")			as sound ;
	textViewer =	gameObject.AddComponent("text")				as text ;
	strip = 		gameObject.AddComponent("displayStrip")		as displayStrip;
	myCredits = 	gameObject.AddComponent("credits")			as credits;
	
	onFullScreen = false ;
	
}

function OnGUIFullScreen(){
	
	if( onFullScreen ) {
	
		if( !GUIIsHidden) {
			var returnRectangle : Rect = new Rect(0,Screen.height-Screen.width*musicLeft,Screen.width*musicLeft,Screen.width*musicLeft);
			var returnTexture : Texture = Resources.Load("blue_left_arrow");
			
			var creditsRectangle : Rect = new Rect(Screen.width-Screen.width*musicLeft,Screen.height-Screen.width*musicLeft,Screen.width*musicLeft,Screen.width*musicLeft);
			var creditsTexture : Texture = Resources.Load("Pictures/credits");
			
			if( GUI.Button( returnRectangle, returnTexture ) ) {
				Debug.Log( 'Sortie de l\'interface demandée' );
			
				if( toOnDeZoom )
					toOnDeZoom();
				else
					Debug.LogWarning('Callback de dezoom non renseigné dans FullScreen.' + 
					'\nNote : setter is public function SetLeaveCallback( f : function() )');
			} // end bouton retour
			
			if( GUI.Button( creditsRectangle, creditsTexture ) ) {
				myCredits.initCredits(returnRectangle);
			}
			
			audioPlayer.OnGUISound();
			textViewer.OnGUIText();
		} // end if GUI showed
		
		if (myCredits.isDisplayed())
			myCredits.OnGUICredits();
	}

}



/*
 * Maj des éléments
 */
function UpDateFullScreen() {
	
	if( onFullScreen ) {
		slideshow.UpDateSlideShow();
		windows.SetNewTextureObj( slideshow.getCurrentAssociedInfo() );
		windows.updateWindow();
		strip.updateStrip();
	}
}


/*
 * Accesseur du pointeur du callback
 * lançant le dezoom
 */
public function SetLeaveCallback( f : function() ) {
	toOnDeZoom = f ;
}





/*
 * Les CallBack des entrées et sorties
 */
function EnterOnFullScreen( Video : GameObject ) {
	
	// On retient les positions initiale pour pouvoir les restituer
	VideoInitialPos = Video.transform.position ;
	VideoInitialRot = Video.transform.eulerAngles ;
	CameraInitialPos = camera.transform.position ;
	CameraInitialOrthographic = camera.orthographic ;
	
	CameraInitialLightType = gameObject.light.type ;
	CameraInitialLightIntesity = gameObject.light.intensity ;
	// On déplace le tout pour l'isoler ds autres éléments
	if( isolate ) {
		camera.transform.position += toMove ;
		//Video.transform.position += toMove ;
	}
	
	// Configuration de la camera et de la lumière
	camera.orthographic = true ;
	gameObject.light.type = LightType.Directional ;
	gameObject.light.intensity = 0.4 ;
	
	onFullScreen = true ;
	
		
	/*
	 * Récupération des données
	 */
	var Datas : scriptForPlane = Video.GetComponent('scriptForPlane');
	
	var stripPath : String = Datas.getStripImg();
	
	var slideShowImgs : Array = Datas.getImages();
	var slideShowMin : Array = Datas.getMiniatures();
	var slideShowVideo : Array = Datas.getVideos();
	
	var slideShowTempElmt : SLIDESHOWELMT ;
	var slideShowElmts : Array = Array() ;
	var id : int = 1 ;
	
	// Remplis un tableau d'éléments pour le slideshow et la fenètre
	for (var i = 0; i < slideShowImgs.length; i++ ) {
		
		slideShowTempElmt = new SLIDESHOWELMT	(	slideShowImgs[i],
													WINDOWTYPES.IMG,
													Vector2.zero,
													id );
		
		slideShowElmts.Push( new Array( 	fileSystem.getAssociatedMin( slideShowImgs[i], slideShowMin ),
											slideShowTempElmt ) );
		id++ ;
	}
	for (i = 0; i < slideShowVideo.length; i++ ) {
		
		
		// On verifie qu'il y a une miniature associé à la video
		var min = fileSystem.getAssociatedMin( slideShowVideo[i], slideShowMin ) ;
		if( min == slideShowVideo[i])
			continue;
		
		slideShowTempElmt = new SLIDESHOWELMT	(	slideShowVideo[i],
													WINDOWTYPES.VIDEO,
													Vector2.zero,
													id );
		
		slideShowElmts.Push( new Array(min, slideShowTempElmt) );
		id++ ;
	}
	
	/* Initialisation de tous les éléments du full screen */
	
	try { // On teste s'il y a un strip du bon format ou pas
	strip.InitVideoScreen( stripPath , strip.placeStripFactor( stripTop , stripBottom , stripLeft , stripRight ) );
	}
	
	catch (str) {
		Console.Warning(str);
		textTop = marginTop;
		pictureTop = marginTop;
	}
	
	slideshow.InitSlideShowFactor(slideShowElmts.length, Rect( slideLeft , slideBottom , slideRight - slideLeft , slideTop - slideBottom), 20);
	windows.InitWindowFactor( Rect( pictureLeft , 1-pictureTop , pictureRight-pictureLeft, pictureTop-pictureBottom), 20 );
	
	textViewer.placeTextFactor(1-textTop, textBottom, textLeft, 1-textRight, Datas.getText()); // u d l r (margins) + Text to display
	audioPlayer.placeMusicFactor (1-musicTop, musicBottom, musicLeft, 1-musicRight, Datas.getSounds() ); // Coordinates of the music layout. U D L R. The button is always a square
	
	Console.Test( Datas.getStripVideo() ,45);
	
	
	// On donne les infos au slideShow
	for (i = 0; i < slideShowElmts.length; i++ ) {
		var tempArray = slideShowElmts[i] as Array ;
		slideshow.AddElmt(tempArray[0], tempArray[1] );
	}
	
}

function LeaveFullScreen( Video : GameObject ) {
	
	// Restitution des positions
	Video.transform.position = VideoInitialPos ;
	Video.transform.eulerAngles = VideoInitialRot;
	camera.transform.position = CameraInitialPos ;
	camera.orthographic = CameraInitialOrthographic ;
	
	gameObject.light.type  = CameraInitialLightType ;
	gameObject.light.intensity  = CameraInitialLightIntesity ;


	audioPlayer.removeMusic();
	textViewer.removeText();
	
	slideshow.destuctSlideShow();
	windows.destuctWindow();
	
	// for strip
	strip.destructStrip();
	firstTimeInUpdate = true;
	
	onFullScreen = false ;
}


/*
 * Affiche et active le(s) boutton(s) géré par fullscreen
 */
public function displayGUI() {
	GUIIsHidden = false;
}

/*
 * Cache et désactive le(s) boutton(s) géré par fullscreen
 */
public function hideGUI() {
	GUIIsHidden = true;
}

/*
 * Cache et désactive les objet de la GUI sauf celui envoyé en parametre
 */
function disableOthers( elemt ) {
	
	if( typeof(elemt) != slideShow )
		slideshow.disableAll();
	if( typeof(elemt) != showingWindow )
		windows.disableAll();
	if( typeof(elemt) != text )
		textViewer.disableAll();
	if( typeof(elemt) != sound )
		audioPlayer.disableAll();
	if( typeof(elemt) != displayStrip )
		strip.disableAll();
	if( typeof(elemt) != typeof(this) )
		hideGUI();

}

/*
 * Affiche et active les objet de la GUI sauf celui envoyé en parametre
 */
function enableOthers( elemt ) {
	
	if( typeof(elemt) != slideShow )
		slideshow.enableAll();
	if( typeof(elemt) != showingWindow )
		windows.enableAll();
	if( typeof(elemt) != text )
		textViewer.enableAll();
	if( typeof(elemt) != sound )
		audioPlayer.enableAll();
	if( typeof(elemt) != displayStrip )
		strip.enableAll();
	if( typeof(elemt) != typeof(this) )
		displayGUI();
}


/*
 * Déplace le slideshow
 */
public function nextImg() {
	slideshow.next( !slideshow.isHidden() );
}
public function previousImg() {
	slideshow.previous( !slideshow.isHidden() );
}



/*
	*getter
*/ 
function getOnFullScreen(){
	return onFullScreen;
}

