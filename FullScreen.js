#pragma strict


// dépendances
private var slideshow  : slideShow ;
private var windows  : showingWindow ;


private var onFullScreen : boolean ;


// isolation de l'élément par rapport à la sphère complete
private var isolate : boolean = true ;
private var toMove : Vector3 = new Vector3( -2000, -2000, -2000) ;

// Position et rotation quand au début
private var VideoInitialPos : Vector3 ;
private var VideoInitialRot : Vector3 ;
private var CameraInitialPos : Vector3 ;
private var CameraInitialOrthographic : boolean ;



/*
 * Ajoute les listener d'envenements
 */

function OnEnable(){
	Gesture.onSwipeE += OnSwipe;
	Gesture.onDraggingE += OnDrag;
	Gesture.onPinchE += OnPinch ;// zoom
		
	Gesture.onShortTapE += OnTap;
	Gesture.onLongTapE += OnTap;
	Gesture.onDoubleTapE += OnTap;
	
	
}


function OnDisable(){
	Gesture.onSwipeE -= OnSwipe;
	Gesture.onDraggingE -= OnDrag;
	Gesture.onPinchE -= OnPinch ;// zoom
		
	Gesture.onShortTapE -= OnTap;
	Gesture.onLongTapE -= OnTap;
	Gesture.onDoubleTapE -= OnTap;
}






/*
 * Initialisation des variables
 */

function InitFullScreen( ) {
	
	slideshow = gameObject.AddComponent("slideShow") as slideShow ;
	windows = gameObject.AddComponent("showingWindow") as showingWindow ;
	
	onFullScreen = false ;
}


/*
 * Maj des éléments
 */


function UpDateFullScreen() {
	
	if( onFullScreen ) {
		
		slideshow.UpDateSlideShow();
		
		windows.SetNewTexture( slideshow.getCurrentAssociedInfo(), WINDOWTYPES.IMG, Vector2(260, 390));
		
	}
	
}







/*
 * Les CallBack des entrée et sorties
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
	
	camera.orthographic = true ;
	gameObject.light.type = LightType.Directional ;
	gameObject.light.intensity = 0.4 ;
	
	var margin : Vector2 = new Vector2(	0, 0.04 );
	
	
	
	var lol : Array = new Array() ;
	
	lol.Push("lol_imgs/akali");
	lol.Push("lol_imgs/cho");
	lol.Push("lol_imgs/garen");
	lol.Push("lol_imgs/irelia");
	lol.Push("lol_imgs/janna");
	lol.Push("lol_imgs/kata");
	lol.Push("lol_imgs/leesin");
	lol.Push("lol_imgs/leona");
	lol.Push("lol_imgs/lux");
	lol.Push("lol_imgs/panthe");
	lol.Push("lol_imgs/shen");
	lol.Push("lol_imgs/sona");
	lol.Push("lol_imgs/vi");
	
	
	//slideshow.InitSlideShowFactor(lol.length, Rect( 0.55 + margin.x , 0.1 + margin.y , 0.4 - 2*margin.x , 0.16 - 2*margin.y), 20);
	
	slideshow.InitSlideShowFactor(lol.length, Rect( 0.55 + margin.x , 0.1 + margin.y , 0.4 - 2*margin.x , 0.18 - 2*margin.y), 20);
	windows.InitWindowFactor( Rect( 0.55 + margin.x , 0.1 + margin.y , 0.4 - 2*margin.x , 0.64 - 2*margin.y), 20 );
	
	
	windows.SetNewTexture( "RocketBunnies", WINDOWTYPES.VIDEO, Vector2(2,1) );
	
	for (var i = 0; i < lol.length; i++ )
		slideshow.AddElmt( (lol[i] as String) + "_min", lol[i] );
	
	
	onFullScreen = true ;
	
}

function LeaveFullScreen( Video : GameObject ) {
	
	// Restitution des positions
	Video.transform.position = VideoInitialPos ;
	Video.transform.eulerAngles = VideoInitialRot;
	camera.transform.position = CameraInitialPos ;
	camera.orthographic = CameraInitialOrthographic ;
	
	onFullScreen = false ;
}










/*
 * Les Callbacks de gestion des événemments
 */


function OnSwipe ( info : SwipeInfo) {
	
}



function OnDrag ( info : DragInfo) {
}


// Zoom avec les doigts
function OnPinch ( amp : float ) {

}


// Click
function OnTap (pos : Vector2 ) {

}







