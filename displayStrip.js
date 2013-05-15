/*
	*Creation : 29/04/2013
	*Author : Fabien Daoulas
	*Last update : 06/05/2013
	
	This script displays in full screen the picture on which the user tapped 
*/

// actual state of swipping the strip
private var actual_zoom : float = 1;

// rect where the picture is displayed
private var rctOfPicture : Rect;

// rect state in
private var rectIN : Rect;

// rect state out
private var rectOUT : Rect;

// states engines
enum STATES_OF_STRIP { STATE_IN , STATE_OUT , SWIPE_IN , SWIPE_OUT , ON_DRAG , MOVE_CENTER , ZOOM_IN};

private var states : STATES_OF_STRIP;

// if true picture is switching from STATE_OUT to STATE_IN (and vice & versa)
private var enable_move : boolean = false;
private var disable_move : boolean = false;

// about dragging
	// if true states = ON_DRAG
	private var dragging : boolean = false;

	// info about dragging event
	private var dragInf : DragInfo;
	
	// rect during dragging
	private var rectDRAG : Rect = rectIN;
	
	// if rect out of the screen
	private var stopDragging : boolean = false;

// about moving picture to the center
	// speed
	private var speedX : float;
	private var speedY : float;
	
	// position of the rectangle (above ? , on the left?...)
	private var posRect : Vector2;
// about zooming in
	// speed
	private var speedWidth : float;
	private var speedHeight : float;
	// first time (init speed)
	private var firstTime : boolean = true;
	// init video
	private var VideoInit:boolean = true;
	// plane for video  /  screen
	private var videoScreen : GameObject;

	private var onFullScreen : boolean = false;

	private var grr:boolean = true;
	
	
private var fullScreen : FullScreen;

/**************** listeners ****************/

function OnEnable(){

	Gesture.onShortTapE += OnTap;
	Gesture.onDraggingE += OnDrag;
	
}

function OnDisable(){

	Gesture.onShortTapE -= OnTap;
	Gesture.onDraggingE -= OnDrag;
	
}

/**************** init ****************/

/*
	*start strip
*/
function initStrip ( rIn : Rect , rOut : Rect ) {
		
	rectIN = rIn;
	rectOUT = rOut;
		
	states = STATES_OF_STRIP.STATE_OUT;
	posRect = positionOfRect();
	initSpeed();
	onFullScreen = true;

	
}

/*
	*disable gui when user leaves the full screen mode
*/
function removeStrip(){
	
	onFullScreen = false;

}

/*
	*gui of strip
*/
function OnGUIStrip(){

	if( onFullScreen ){
		switch( states ){
			case states.STATE_OUT : 
					rctOfPicture = displayStrip( rectOUT , "dianeIm" );
					rectDRAG = rectIN;
					if( !VideoInit ){
					stopVideo(videoScreen);
					VideoInit=true;
					}
					/*
					if(grr){
					var test = new GameObject.CreatePrimitive(PrimitiveType.Plane);
					test.name ="videoScreen";
					test.transform.localScale=Vector3(88,8,8);
					test.transform.position = Vector3(-2000,-2000,-2000);
					test.transform.Rotate(180,0,0);
					grr=false;
					}*/
				break;
			case states.STATE_IN :
					rctOfPicture = displayStrip( rectDRAG , "dianeIm" );
					if( VideoInit ){
					putVideo(videoScreen,"ALLdiane");
					VideoInit=false;
					}
				break;
			case states.ON_DRAG :
					moveScreen( dragInf );
					//r = calcRect_OnDrag( dragInf );
					//displayStrip( r , "dianeIm" );
					dragging = false;
					manageStates();
				break;
			case states.MOVE_CENTER :
					movePicture();
					rctOfPicture = displayStrip( rctOfPicture , "dianeIm" );
					manageStates();
				break;	
			case states.ZOOM_IN :
					if( firstTime ){
						firstTime = false;
						initSpeedZoomIn( rctOfPicture );
					}
					rctOfPicture = zoomInPicture( rctOfPicture );
					rctOfPicture = displayStrip( rctOfPicture , "dianeIm" );
					manageStates();
				break;
		}
	}
}


/**************** after events ****************/

/*
	*action after event tap
*/
function OnTap( v : Vector2 ){
	
	var ray : Ray = getRay( v );
	var hit : RaycastHit = new RaycastHit();
	
	
	if( videoScreen.collider.Raycast( ray , hit , 2000.0f ) )
		moveCameraToDisplay();
	
	
	
	
	/*
	var value : boolean = OnRect( rctOfPicture , v );
	
	if( (states != STATES_OF_STRIP.SWIPE_OUT || states != STATES_OF_STRIP.SWIPE_IN || states != STATES_OF_STRIP.STATE_IN) && value )
		enable_move = true;
		
	if( states == STATES_OF_STRIP.STATE_IN && value ){
		enable_move = false;
		disable_move = true;
	}
	manageStates();*/
	
}

/*
	*action after event drag
*/
private function OnDrag( dragInfo : DragInfo ){
	
	if( states == STATES_OF_STRIP.STATE_IN )
		dragging = true;
		
	dragInf = dragInfo;

	manageStates();
}

/**************** methods ****************/

/*
	*tap on rectangle?
*/
private function OnRect( r : Rect , v : Vector2 ) : boolean {

	if( v.x > r.x && v.x < r.x + r.width && v.y < Screen.height - r.y && v.y > Screen.height - r.y - r.height ){
		return true;
	}
	else{
		return false;
	}
}

/*
	*display strip in the rectangle
*/
private function displayStrip( r : Rect , name : String ) : Rect {
	
	var t : Texture = Resources.Load( name );
	
	GUI.DrawTexture( r , t , ScaleMode.ScaleToFit );
	
	return r;
}

/*
	*move the screen on drag
*/
private function moveScreen( dI: DragInfo){

	if(  ! (videoScreen.transform.position.x < -2250 && videoScreen.transform.position.x > -1750)){
	
	videoScreen.transform.position.x += dI.delta.x;
	}
}

/*
	*move the picture to the center of the screen
	
	****prepare zooming in move****
	
*/
private function movePicture(){
	
	switch ( posRect.x ){
		case -1 : 
				if( rctOfPicture.x + rctOfPicture.width / 2 > Screen.width / 2 ){
					rctOfPicture.x = rctOfPicture.x + posRect.x*speedX;
					rctOfPicture.y = rctOfPicture.y + posRect.y*speedY;
				}
				else{
					rctOfPicture.y = Screen.height/2 - rctOfPicture.height/2;
					rctOfPicture.x = Screen.width/2 - rctOfPicture.width/2;
					enable_move = false;
				}
			break;
		case 1 :
				if( rctOfPicture.x + rctOfPicture.width / 2 < Screen.width / 2 ){
					rctOfPicture.x = rctOfPicture.x + posRect.x*speedX;
					rctOfPicture.y = rctOfPicture.y + posRect.y*speedY;
				}
				else{
					rctOfPicture.y = Screen.height/2 - rctOfPicture.height/2;
					rctOfPicture.x = Screen.width/2 - rctOfPicture.width/2;
					enable_move = false;
				}
			break;
	}
	
}

/*
	*zoom in a picture at the center of a screen
*/
private function zoomInPicture( r : Rect ) : Rect{

	var end_zoom : boolean = false;

	if( r.height < Screen.height ){
	
		r.height += speedHeight;
		r.y -= speedHeight / 2;
		
		r.width += speedWidth;
		r.x -= speedWidth / 2;
		
	}
	else{
		end_zoom = true;
	}
	
	if( end_zoom )
		states = STATES_OF_STRIP.STATE_IN;
	
	return r;
}

/*
	*init distance between actual rectangle and the center of the screen
*/
private function initSpeed(){
	
	speedX = Mathf.Abs( rectOUT.x + rectOUT.width/2 - Screen.width/2 ) / 50;
	speedY = Mathf.Abs( rectOUT.y + rectOUT.height/2 - Screen.height/2 ) / 50;
	
}

/*
	*calculate the difference between rectIN and rect at the center of the screen
*/
private function initSpeedZoomIn( r : Rect ){

	speedHeight = ( Screen.height - r.height ) / 100;
	speedWidth = ( Screen.width - r.width ) / 100;

}

/*
	*inform you about the position of the picture compared to the center of the screen
*/
private function positionOfRect() : Vector2{

	var v : Vector2;

	if( rectOUT.x + ( rectOUT.width / 2 ) - Screen.width/2 < 0 ){
		v.x = 1;
	}
	else{
		v.x = -1;
	}
		
	if( rectOUT.y + ( rectOUT.height / 2 ) - Screen.height/2 < 0 ){
		v.y = 1;
	}
	else{
		v.y = -1;
	}

	return v;
	
}

/*
	*create a rectangle to fit the picture
	*ratio = width/height
*/
private function createRect( ratio : float , v : Vector2 , height : float ){

	var r : Rect = Rect( v.x , v.y , height*ratio , height );
	
	return r;
	
}


/**************** states machines ****************/



/*
	*manage states of states machines
*/
private function manageStates(){

	if( enable_move && states == STATES_OF_STRIP.STATE_OUT )
		states = STATES_OF_STRIP.MOVE_CENTER;
		
	if( !enable_move && states == STATES_OF_STRIP.MOVE_CENTER )
		states = STATES_OF_STRIP.ZOOM_IN;
	
	if( disable_move && states == STATES_OF_STRIP.STATE_IN ){
		states = STATES_OF_STRIP.STATE_OUT;
		disable_move = false;
	}

	if( dragging )
		states = STATES_OF_STRIP.ON_DRAG;
		
	if( !dragging && states == STATES_OF_STRIP.ON_DRAG )
		states = STATES_OF_STRIP.STATE_IN;
}



/////////////////////***************************** mise en place du plan ***************************************////////////////////////////

/*
	*on the event OnFullScreen this methos is called
*/
function InitVideoScreen(){

	createStripPlane( 0.1 , Rect( Screen.width / 2 , Screen.height / 2 , Screen.width / 4 , Screen.height / 4 ) );

}

/*
	*get ratio of picture
	*get rect to place the plane on the screen
	*and create a plane
*/
private function createStripPlane( ratio : float , r : Rect ){

	videoScreen = new GameObject.CreatePrimitive( PrimitiveType.Plane );
	
	// set position of plane
	videoScreen.transform.position = camera.ScreenToWorldPoint( Vector3( r.x + r.width/2 , r.y + r.height/2 , camera.nearClipPlane ) );
	videoScreen.transform.up = -videoScreen.transform.up;
	videoScreen.transform.localRotation.eulerAngles = Vector3( 0 , 0 , 180 ); 
	videoScreen.renderer.material.mainTexture = Resources.Load( "dianeIm" );
	
	// put the plane at the right ratio
	var v : Vector3 = videoScreen.transform.localScale;
	v.x = v.x/ratio;
	v.y = v.y*ratio;
	videoScreen.transform.localScale = v;
	
	// extend plane
	videoScreen.transform.localScale = videoScreen.transform.localScale * 10;
}

/*
	*get ray on tap
*/
private function getRay( v : Vector2 ) : Ray {

	var origin : Vector3 = Vector3( v.x , v.y , 0 );

	// get ray going from origin to camera
	var ray : Ray = camera.ScreenPointToRay( origin );
	
	return ray;
	
}

/*
	*move camera 
	*and extend plane
	*when onTap event occured
*/
private function moveCameraToDisplay(){
	
	camera.transform.position = Vector3( -4000 , -4000 , -4000 );
	
	videoScreen.transform.position = camera.ScreenToWorldPoint( Vector3( Screen.width / 2 , Screen.height / 2 , camera.nearClipPlane ) );
	
	//putVideo(  videoScreen , "SIPO_full" );
	
}



/*
* Set the parameters for the video (see the plug to know how to do it)
*/
function putVideo( focus : GameObject , nom : String ){
	
	// plugin config
	var iOS = GameObject.Find("iOS");
	var MovieController =GameObject.Find( "MovieController" );
	  
 	var controllerIOS:ForwardiOSMessages;
	controllerIOS = iOS.GetComponent("ForwardiOSMessages");
 
	var controllerScene:SceneController;
	controllerScene = MovieController.GetComponent("SceneController");
	
    focus.AddComponent("PlayFileBasedMovieDefault");
    focus.renderer.material = Resources.Load("Video");
    
	controllerScene.movieClass[1] =  focus.GetComponent("PlayFileBasedMovieDefault");
	controllerScene.movieClass[1].movieIndex=1;
	controllerScene.movieName[1] = nom + ".mov";
	controllerIOS.movie[1]=focus.GetComponent("PlayFileBasedMovieDefault");
	
	
	var controllerMovie:PlayFileBasedMovieDefault;
	controllerMovie=focus.GetComponent("PlayFileBasedMovieDefault");
	controllerMovie.PlayMovie(nom + ".mov");
	
}

/*
* not used for now
*/
function stopVideo(focus: GameObject){

	var controllerMovie:PlayFileBasedMovieDefault;
	controllerMovie=focus.GetComponent("PlayFileBasedMovieDefault");
	controllerMovie.StopMovie ();

}
