#pragma strict


/* dépendances */
private var slideshow  : slideShow ;
private var windows  : showingWindow ;
private var audioPlayer : sound ;
private var textViewer : text ;
private var strip : displayStrip;


/* On est en mode plein écran ? */
private var onFullScreen : boolean ;


/* isolation de l'élément par rapport à la sphère complete */
private var isolate : boolean = true ;
private var toMove : Vector3 = new Vector3( -2000, -2000, -2000) ;


/* Position et rotation quand au début */
private var VideoInitialPos : Vector3 ;
private var VideoInitialRot : Vector3 ;
private var CameraInitialPos : Vector3 ;
private var CameraInitialOrthographic : boolean ;


// A appeller pour sortir
private var toOnDeZoom : function() ;


/* Variables qui régissent la disposition du full screen en proportion de la hauteur / largeur (donc entre 0 et 1) */
/* Le point (0,0) est en bas à gauche. */
private var marginTop : float = 0.9;
private var marginBottom : float = 0.1;
private var marginLeft : float = 0.05;
private var marginRight : float = 0.95;

private var textTop : float = marginTop;
private var textBottom : float = 0.26;
private var textLeft : float = marginLeft;
private var textRight : float = 0.45;

private var musicTop : float = textBottom - 0.05;
private var musicBottom : float = marginBottom;
private var musicLeft : float = marginLeft;
private var musicRight : float = textRight;

private var stripTop : float = 1-((1-marginTop)/4); // Le strip prend en hauteur la moitié de la marge du haut
private var stripBottom : float = 1-(3*(1-marginTop)/4);
private var stripLeft : float = 0.55;
private var stripRight : float = marginRight;

private var pictureTop : float = textTop;
private var pictureBottom : float = textBottom;
private var pictureLeft : float = stripLeft;
private var pictureRight : float = stripRight;

private var slideTop : float = musicTop;
private var slideBottom : float = musicBottom;
private var slideLeft : float = stripLeft;
private var slideRight : float = marginRight;



/*
 * Initialisation des variables
 */

function InitFullScreen( ) {
	
	slideshow =		gameObject.AddComponent("slideShow")		as slideShow ;
	windows =		gameObject.AddComponent("showingWindow")	as showingWindow ;
	audioPlayer =	gameObject.AddComponent("sound")			as sound ;
	textViewer =	gameObject.AddComponent("text")				as text ;
	//strip = 		gameObject.AddComponent("displayStrip")		as displayStrip;
	
	onFullScreen = false ;
	

}

function OnGUIFullScreen(){
	
	if( onFullScreen ) {
		
		var Rectangle : Rect = new Rect(0,Screen.height-50,50,50) ;
		var returnTexture : Texture = Resources.Load("blue_left_arrow");
		if( GUI.Button( Rectangle, returnTexture ) ) {
			Debug.Log( 'Sortie de l\'interface demandée' );
		
			if( toOnDeZoom )
				toOnDeZoom();
			else
				Debug.LogWarning('Callback de dezoom non renseigné dans FullScreen.' + 
				'\nNote : setter is public function SetLeaveCallback( f : function() )');
		}
		audioPlayer.OnGUISound();
		textViewer.OnGUIText();
	}

}



/*
 * Maj des éléments
 */
function UpDateFullScreen() {
	
	if( onFullScreen ) {
		
		slideshow.UpDateSlideShow();
		
		windows.SetNewTextureObj( slideshow.getCurrentAssociedInfo() );
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
	
	
	var margin : Vector2 = new Vector2(	0, 0.04 );
	
	
	var Datas : scriptForPlane = Video.GetComponent('scriptForPlane');
	
	
	
	var slideShowImgs : Array = Datas.getImages();
	var slideShowMin : Array = Datas.getMiniatures();
	var slideShowElmt : SLIDESHOWELMT ;
	
	
	/* Initialisation de tous les éléments du full screen */
	slideshow.InitSlideShowFactor(slideShowImgs.length, Rect( slideLeft , slideBottom , slideRight - slideLeft , slideTop - slideBottom), 20);
	windows.InitWindowFactor( Rect( pictureLeft , 1-pictureTop , pictureRight-pictureLeft, pictureTop-pictureBottom), 60 );
	
	textViewer.placeTextFactor(1-textTop, textBottom, textLeft, 1-textRight, Datas.getText()); // u d l r (margins) + Text to display
	audioPlayer.placeMusicFactor (1-musicTop, musicBottom, musicLeft, 1-musicRight, Datas.getSounds() ); // Coordinates of the music layout. U D L R. The button is always a square
	
	//strip.initStrip( Rect( -Screen.width/2 , 0 , 2*Screen.width , Screen.height ) , Rect( Screen.width*stripLeft , 0 , (stripRight-stripLeft)*Screen.width , Screen.height/8 ) );
	
	for (var i = 0; i < slideShowImgs.length; i++ ) {
		slideShowElmt = new SLIDESHOWELMT(		slideShowImgs[i],
												WINDOWTYPES.IMG,
												Vector2.zero 	) ;
		
		slideshow.AddElmt(		fileSystem.getAssociatedMin( slideShowImgs[i], slideShowMin ),
								slideShowElmt 									);
	}
	
	Datas.getVideos();
		
}

function LeaveFullScreen( Video : GameObject ) {
	
	// Restitution des positions
	Video.transform.position = VideoInitialPos ;
	Video.transform.eulerAngles = VideoInitialRot;
	camera.transform.position = CameraInitialPos ;
	camera.orthographic = CameraInitialOrthographic ;
	
	audioPlayer.removeMusic();
	textViewer.removeText();
	
	slideshow.destuctSlideShow();
	windows.destuctWindow();
	
	onFullScreen = false ;
}



