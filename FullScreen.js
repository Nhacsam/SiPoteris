#pragma strict


/* dépendances */
private var slideshow  : slideShow ;
private var windows  : showingWindow ;
private var audioPlayer : sound ;
private var textViewer : text ;
private var strip : displayStrip;
private var myCredits : credits;

private var customGUISkin : GUISkin;

/* On est en mode plein écran ? */
private var onFullScreen : boolean;

// Doit on afficher le(s) boutton(s) géré par fullscreen
private var GUIIsHidden : boolean;

/*	quand on rentre dans l'update pour la premiere fois*/
private var firstTimeInUpdate : boolean = true;

/* isolation de l'élément par rapport à la sphère complete */
private var isolate : boolean = true ;
private var toMove : Vector3 = new Vector3( -2000, -2000, -2000) ;

// Donnée pour la GUI
private var Datas : dataFolderHandler ;

// pour l'ecran de chargement
private var LoadObj : GameObject = null ;
private var FrameElapsedSinceGUIInitialized : int = -1 ;

/* Position et rotation quand au début */
private var VideoInitialPos : Vector3 ;
private var VideoInitialRot : Vector3 ;
private var CameraInitialPos : Vector3 ;


// A appeller pour sortir
private var toOnDeZoom : function() ;

// Textures des bouttons
private var returnTexture : Texture;
private var creditsTexture : Texture;
private var langTexture : Texture;

// Miniature par défaut des video :
private var defaultVideoIcon : String = 'Pictures/play' ;


// Langue courante de l'application
private var lang : String ;

/* Variables qui régissent la disposition du full screen en proportion de la hauteur / largeur (donc entre 0 et 1) */
/* Le point (0,0) est en bas à gauche. */
/* Attention aux dépendances ! */

private var hauteurStripSlide : float = 8.0; // % de la hauteur de l'écran
private var sizeButtons : float = hauteurStripSlide / 100; // Taille boutons = hauteur strip = hauteur slide

private var marginTop : float = 0.97;
private var marginBottom : float = 0.03;
private var marginLeft : float = 0.05;
private var marginRight : float = 0.95;

private var stripTop : float = marginTop;
private var stripBottom : float = stripTop - hauteurStripSlide/100;
private var stripLeft : float = marginLeft;
private var stripRight : float = marginRight;

private var musicBottom : float = marginBottom;
private var musicTop : float = marginBottom + sizeButtons;
private var musicLeft : float = marginLeft + sizeButtons/2;
private var musicRight : float = 0.48 - sizeButtons;

private var textTopWithStrip : float = stripBottom - 0.05;
private var textTopWithoutStrip : float = marginTop;
private var textBottom : float = musicTop + 0.05;
private var textLeft : float = marginLeft;
private var textRight : float = musicRight + sizeButtons;

private var pictureTopWithStrip : float = textTopWithStrip ;
private var pictureTopWithoutStrip : float = textTopWithoutStrip ;
private var pictureBottom : float = textBottom;
private var pictureLeft : float = 0.52;
private var pictureRight : float = stripRight;

private var slideBottom : float = marginBottom;
private var slideTop : float = slideBottom + hauteurStripSlide/100;
private var slideLeft : float = pictureLeft;
private var slideRight : float = marginRight;

private var sizeButtonsPix : int = sizeButtons * Screen.height; // Taille boutons = hauteur strip = hauteur slide
private var returnRectangle : Rect = new Rect(Screen.width*marginLeft, Screen.height*(1-marginBottom)-sizeButtonsPix, sizeButtonsPix, sizeButtonsPix);
private var creditsRectangle : Rect = new Rect(Screen.width*textRight-sizeButtonsPix, Screen.height*(1-marginBottom)-sizeButtonsPix, sizeButtonsPix, sizeButtonsPix);
private var langRectangle : Rect = new Rect(Screen.width*textRight-2*sizeButtonsPix, Screen.height*(1-marginBottom)-sizeButtonsPix, sizeButtonsPix, sizeButtonsPix);

private var textTop : float ;
private var pictureTop : float ;


/*
 * Initialisation des variables
 */
function InitFullScreen( Initlang  : String ) {
	
	// Ajout des composant nécessaires
	slideshow =		gameObject.AddComponent("slideShow")		as slideShow ;
	windows =		gameObject.AddComponent("showingWindow")	as showingWindow ;
	audioPlayer =	gameObject.AddComponent("sound")			as sound ;
	textViewer =	gameObject.AddComponent("text")				as text ;
	strip = 		gameObject.AddComponent("displayStrip")		as displayStrip;
	myCredits = 	gameObject.AddComponent("credits")			as credits;
	
	// initialise l'état de la GUI
	onFullScreen = false ;
	
	// Initialisation des textures des bouttons
	returnTexture = Resources.Load('GUI/back');
	if (!returnTexture)
		Console.Warning("Pas de texture pour le bouton return");
		
	creditsTexture = Resources.Load("Pictures/credits");
	if (!creditsTexture)
		Console.Warning("Pas de texture pour le bouton crédits");
		
	customGUISkin = Resources.Load("mySkin");
	
	// Configure la langue par défaut
	lang = Initlang ;
	switchLang( false );
}

/*
 * Affiche les boutton et les élément de GUI 2D
 */
function OnGUIFullScreen(){
	
	// si en plein écran
	if( onFullScreen ) {
	
		GUI.skin = customGUISkin; // Transparent buttons
		
		// Si visible
		if( !GUIIsHidden) {
			
			// boutton de retour associé au callback du Zoom
			if( toOnDeZoom ) {
				if( GUI.Button( returnRectangle, returnTexture ) ) {
					Debug.Log( 'Sortie de l\'interface demandée' );
					toOnDeZoom();
				}
			} // end bouton retour
			
			// Boutton de crédit
			if( GUI.Button( creditsRectangle, creditsTexture ) ) {
				myCredits.initCredits(returnRectangle);
			}
			
			// Boutton de langue
			if( GUI.Button( langRectangle, langTexture ) ) {
				switchLang( true ) ;
			}
			
			// Lecteur audio et texte
			audioPlayer.OnGUISound();
			textViewer.OnGUIText();
		} // end if GUI showed
		
		// Affichage des crédit suivant l'état des crédits
		if (myCredits.isDisplayed())
			myCredits.OnGUICredits();
	}

}



/*
 * Maj des éléments
 */
function UpDateFullScreen() {
	
	// Maj du nombre de frame écoulé depuis le lancement de la fonction CreateGUI
	if( FrameElapsedSinceGUIInitialized >= 0 )
		FrameElapsedSinceGUIInitialized++ ;
	
	// SI on est dans la GUI mais que les objet n'ont pas encore été initialisé
	if( onFullScreen && LoadObj && LoadObj.renderer.enabled && FrameElapsedSinceGUIInitialized < 0) {
		CreateGUI();		// On les initialise
		disableOthers('');	// On les désactive pendant quelques frames
		FrameElapsedSinceGUIInitialized = 0 ;
	
	// Si les éléments on été initialisé, et que les quelques frame ne sont pas encore écoulé
	} else if ( onFullScreen && LoadObj && LoadObj.renderer.enabled && FrameElapsedSinceGUIInitialized < 20 ) {
		disableOthers('');	// On s'assure que rien n'est réapparu
		
	// Si les éléments on été initialisé, après quelques frames ... (permet de cacher quelques glitchs
	} else if ( onFullScreen && LoadObj && LoadObj.renderer.enabled && FrameElapsedSinceGUIInitialized > 20 ) {
		LoadObj.renderer.enabled = false ;		// on retire l'écran de chargement
		enableOthers('');						// On affiche le reste
	
	//Si on est en plein écran et que tout est initialisé
	} else if( onFullScreen ) {
		// On met à jour les éléments
		slideshow.UpDateSlideShow();
		windows.SetNewTextureObj( slideshow.getCurrentAssociedInfo() );
		windows.updateWindow();
		strip.updateStrip();
	}
	// update of credits
	if (myCredits.isDisplayed())
		myCredits.updateCredits();
}


/*
 * Accesseur du pointeur du callback
 * lançant le dezoom
 */
public function SetLeaveCallback( f : function() ) {
	toOnDeZoom = f ;
}

/*
 * Commence l'initialisation de la GUI et affiche l'écran de chargement
 */
public function EnterOnFullScreen(Video : GameObject ) {
	
	// On retient les positions initiale pour pouvoir les restituer
	VideoInitialPos = Video.transform.position ;
	VideoInitialRot = Video.transform.eulerAngles ;
	CameraInitialPos = camera.transform.position ;
	
	// On déplace le tout pour l'isoler des autres éléments
	if( isolate ) {
		camera.transform.position += toMove ;
	}
	
	// met à jour l'état
	onFullScreen = true ;
	
	// on récupère le gestionnaire des dossiers et fichiers de resources
	Datas = ( Video.GetComponent('scriptForPlane') as scriptForPlane ).getHandler();
	
	// Création et affichage de l'écran de chargement
	CreateLoadingPlane();
	LoadObj.renderer.enabled = true ;
	hideGUI();
}


/*
 * Initialise les éléments de la GUI
 */
function CreateGUI() {
		
	/*
	 * Récupération des données
	 */
	var stripPath : String = Datas.getStripImg();
	var slideShowElmts : Array = createSlideshowDatas();
		
	/*
	 * Initialisation de tous les éléments du full screen
	 */
	
	// On teste s'il y a un strip du bon format
	textTop = textTopWithStrip;
	pictureTop = textTopWithStrip;
	try {
		// On affiche le strip si c'est bon
		strip.InitVideoScreen( stripPath , strip.placeStripFactor( stripTop , stripBottom , stripLeft , stripRight ) );
	} catch (str) {
		// On décale le reste sinon
		Console.Warning(str);
		textTop = textTopWithoutStrip;
		pictureTop = textTopWithoutStrip;
	}
	
	// Initialisation du slideshow et de la fenêtre
	slideshow.InitSlideShowFactor(slideShowElmts.length, Rect( slideLeft , slideBottom , slideRight - slideLeft , slideTop - slideBottom), 20);
	windows.InitWindowFactor( Rect( pictureLeft , 1-pictureTop , pictureRight-pictureLeft, pictureTop-pictureBottom), 20 );
	
	// Initialisation du texte et de l'audio
	textViewer.placeTextFactor(1-textTop, textBottom, textLeft, 1-textRight, Datas.getText( lang )); // u d l r (margins) + Text to display
	audioPlayer.placeMusicFactor (1-musicTop, musicBottom, musicLeft, 1-musicRight, Datas.getSounds() ); // Coordinates of the music layout. U D L R. The button is always a square
	
	// On donne les infos au slideShow
	for (var i: int = 0; i < slideShowElmts.length; i++ ) {
		var tempArray = slideShowElmts[i] as Array ;
		slideshow.AddElmt(tempArray[0], tempArray[1] );
	}
	
	windows.AddOnChangeCallback(textViewer.takeSSelement);
}


/*
 * Supprime/Cache tous les éléments de la fenêtre
 */
function LeaveFullScreen( Video : GameObject ) {
	
	// Restitution des positions
	Video.transform.position = VideoInitialPos ;
	Video.transform.eulerAngles = VideoInitialRot;
	camera.transform.position = CameraInitialPos ;

	// Suppression de l'audio et du texte
	audioPlayer.removeMusic();
	textViewer.removeText();
	
	// Suppression de la fenêtre et du slideshow
	slideshow.destuctSlideShow();
	windows.destuctWindow();
	
	// Suppression du strip
	strip.destructStrip();
	
	// remet à zeor les états
	firstTimeInUpdate = true;
	onFullScreen = false ;
	FrameElapsedSinceGUIInitialized = -1 ;
}


/*
 * Crée un plan avec la texture de chargement
 */
private function CreateLoadingPlane() {
	
	// Création
	if( !LoadObj) {
		LoadObj = new GameObject.CreatePrimitive(PrimitiveType.Plane);
		
		LoadObj.name = "LOADING" ;
	
		// ajoute un renderer si tel n'est pas le cas
		var testRenderer = LoadObj.GetComponent(Renderer);
		if( !testRenderer)
			LoadObj.AddComponent(Renderer);
	
		LoadObj.renderer.material.mainTexture = Resources.Load('GUI/Loading') ;
	}
	
	// positionnement
	LoadObj.transform.position = camera.ScreenToWorldPoint( Vector3(camera.pixelWidth/2, camera.pixelHeight/2, 50 ) ) ;
	
	LoadObj.transform.rotation = new Quaternion();
	
	// Application des dimentions
	var boundsize = LoadObj.renderer.bounds.size ;
	var size = showingWindow.getRealSize( Vector2(camera.pixelWidth,  camera.pixelHeight), Vector2( camera.pixelWidth/2, camera.pixelHeight/2 ), 50, camera ) ;
	var scale = LoadObj.transform.localScale ;
	LoadObj.transform.localScale  = Vector3(scale.x* size.x/boundsize.x, scale.y ,scale.z* size.y/boundsize.z );
	
	// rotation
	LoadObj.transform.rotation = camera.transform.rotation ;
	LoadObj.transform.rotation *= Quaternion.AngleAxis(-90, Vector3( 1,0,0) );
	LoadObj.transform.rotation *= Quaternion.AngleAxis(180, Vector3( 0,1,0) );
	
}


/*
 * Crée et renvoie le tableau de SLIDESHOWELMT pour le slideshow
 */
private function createSlideshowDatas() : Array {
	
	// Récupération des données
	var slideShowImgs : Array = Datas.getImages();
	var slideShowMin : Array = Datas.getMiniatures();
	var slideShowVideo : Array = Datas.getVideos();
	var slideShowVideoRight : Array = Datas.getVideosRight();
	var slideShowVideoLeft : Array = Datas.getVideosLeft();
	
	// Déclaration des variables
	var slideShowTempElmt : SLIDESHOWELMT ;
	var slideShowElmts : Array = Array() ;
	var id : int = 1 ;
	
	/*
	 *  Remplis un tableau d'éléments pour le slideshow et la fenètre
	 *  Avec chaque type de donnée
	 */
	
	// Pour les Images
	for (var i = 0; i < slideShowImgs.length; i++ ) {
		// On récupère la miniature associé à l'image
		var min = fileSystem.getAssociatedMin( slideShowImgs[i], slideShowMin ) ;
		// On crée un SLIDESHOWELMT
		slideShowTempElmt = new SLIDESHOWELMT	(	slideShowImgs[i],
													WINDOWTYPES.IMG,
													Vector2.zero, id,
													(min == slideShowImgs[i]) );
		if( i == 0) // la première image est pe utilisé dans l'univer (voir placeAuto)
			slideShowTempElmt.alsoUseAway = true ;
		// finalisation
		slideShowElmts.Push( new Array( min, slideShowTempElmt ) );
		id++ ;
	}
	
	// Pour les Video droites
	for (i = 0; i < slideShowVideo.length; i++ ) {
		// Si il n'y a pas de miniature associé à la video, on met celle par défaut
		min = fileSystem.getAssociatedMin( slideShowVideo[i], slideShowMin ) ;
		if( min == slideShowVideo[i])
			min = defaultVideoIcon ;
		// On crée un SLIDESHOWELMT
		slideShowTempElmt = new SLIDESHOWELMT	(	slideShowVideo[i],
													WINDOWTYPES.VIDEO,
													Vector2.zero, id, false );
		// finalisation
		slideShowElmts.Push( new Array(min, slideShowTempElmt) );
		id++ ;
	}
	
	// Pour les Video orientés à droite
	for (i = 0; i < slideShowVideoRight.length; i++ ) {
		// Si il n'y a pas de miniature associé à la video, on met celle par défaut
		min = fileSystem.getAssociatedMin( slideShowVideoRight[i], slideShowMin ) ;
		if( min == slideShowVideoRight[i])
			min = defaultVideoIcon ;
		// On crée un SLIDESHOWELMT
		slideShowTempElmt = new SLIDESHOWELMT	(	slideShowVideoRight[i],
													WINDOWTYPES.VIDEORIGHT,
													Vector2.zero, id, false );
		// finalisation
		slideShowElmts.Push( new Array(min, slideShowTempElmt) );
		id++ ;
	}
	
	// Pour les Video orientés à gauche
	for (i = 0; i < slideShowVideoLeft.length; i++ ) {
		// Si il n'y a pas de miniature associé à la video, on met celle par défaut
		min = fileSystem.getAssociatedMin( slideShowVideoLeft[i], slideShowMin ) ;
		if( min == slideShowVideoLeft[i])
			min = defaultVideoIcon ;
		// On crée un SLIDESHOWELMT
		slideShowTempElmt = new SLIDESHOWELMT	(	slideShowVideoLeft[i],
													WINDOWTYPES.VIDEOLEFT,
													Vector2.zero, id, false );
		// finalisation
		slideShowElmts.Push( new Array(min, slideShowTempElmt) );
		id++ ;
	}
	slideShowElmts.Sort(nameLesserThan);
	return slideShowElmts ;
}


/*
 * Renvoie vrai si le nom du fichier 1
 * est avant dans l'ordre alphabétique que le 2
 * Les données passé sont au même format que les éléments
 * du taleau de la fonction createSlideshowDatas
 */
static function nameLesserThan( p1 : Array , p2 : Array ) : int {
	
	var file1emlt : SLIDESHOWELMT = p1[1] ;
	var file2emlt : SLIDESHOWELMT = p2[1] ;
	
	var file1 : String = file1emlt.path ;
	var file2 : String = file2emlt.path ;
	
	return String.Compare( fileSystem.getName(file1), fileSystem.getName(file2)) ;
}


/*
 * Change la langue courante en fonction de sa valeur
 */
public function switchLang( changeCurrent : boolean ) {
	
	// suivant la langue en cours
	switch(lang) {
		
		case 'fr' :
			// si il faut qu'on change la langue en cours ou pas
			if( changeCurrent )
				changeLangToEn() ;	// met en anglais
			else
				changeLangToFr() ;	// met en français
				
			break ;
		
		case 'en' :
			// si il faut qu'on change la langue en cours ou pas
			if( changeCurrent )
				changeLangToFr() ;	// met en français
			else
				changeLangToEn() ;	// met en anglais
				
			break ;
		
		// si invalide
		default :
			lang = 'en' ;			// met en anglais
			changeLangToEn() ;
			break ;
	}
}

/*
 * Met la GUI en français
 */
public function changeLangToFr() {
	// changement du paramètre
	lang = 'fr' ;
	
	// changement du boutton
	if( langTexture )
		Resources.UnloadAsset( langTexture );
	
	langTexture = Resources.Load("GUI/en");
	if (!langTexture)
		Console.Warning("Pas de texture avec le drapeau britanique pour le bouton de langue");
	
	// changement du texte
	if( textViewer && onFullScreen ) {
	
		textViewer.removeText();
		textViewer.placeTextFactor(1-textTop, textBottom, textLeft, 1-textRight, Datas.getText( lang ));
	
	}
}

/*
 * Met la GUI en englais
 */
public function changeLangToEn() {
	// changement du paramètre
	lang = 'en' ;
	
	// changement du boutton
	if( langTexture )
		Resources.UnloadAsset( langTexture );
	
	langTexture = Resources.Load("GUI/fr");
	if (!langTexture)
		Console.Warning("Pas de texture avec le drapeau français pour le bouton de langue");
	
	// changement du texte
	if( textViewer && onFullScreen ) {
	
		textViewer.removeText();
		textViewer.placeTextFactor(1-textTop, textBottom, textLeft, 1-textRight, Datas.getText( lang ));
	
	}
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

