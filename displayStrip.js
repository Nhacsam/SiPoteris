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
private var enable : boolean = false;
private var enable_move : boolean = false;
private var disable_move : boolean = false;

// about dragging
	// if true states = ON_DRAG
	private var dragging : boolean = false;

	// info about dragging event
	private var dragInf : DragInfo;
	
	// rect during dragging
	private var rectDRAG : Rect = rectIN;

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
	// video screen
	private var videoScreen:GameObject;

	private var onFullScreen : boolean = false;



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
					rctOfPicture = displayStrip( rectOUT , "lol_imgs/akali" );
					rectDRAG = rectIN;
					VideoInit = true;
				break;
			case states.STATE_IN :
					rctOfPicture = displayStrip( rectDRAG , "lol_imgs/akali" );
					if( VideoInit ){
					putVideo(videoScreen,"lala");
					VideoInit=false;
					}
				break;
			case states.SWIPE_IN : 
					var r  : Rect = calcRect();
					rctOfPicture = displayStrip( r , "lol_imgs/akali" );
			case states.SWIPE_OUT :
					r = calcRect();
					rctOfPicture = displayStrip( r , "lol_imgs/akali" );
				break;
			case states.ON_DRAG :
					r = calcRect_OnDrag( dragInf );
					displayStrip( r , "lol_imgs/akali" );
					dragging = false;
					manageStates();
				break;
			case states.MOVE_CENTER :
					movePicture();
					rctOfPicture = displayStrip( rctOfPicture , "lol_imgs/akali" );
					manageStates();
				break;	
			case states.ZOOM_IN :
					if( firstTime ){
						firstTime = false;
						initSpeedZoomIn( rctOfPicture );
					}
					rctOfPicture = zoomInPicture( rctOfPicture );
					rctOfPicture = displayStrip( rctOfPicture , "lol_imgs/akali" );
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
	
	var value : boolean = OnRect( rctOfPicture , v );
	
	if( (states != STATES_OF_STRIP.SWIPE_OUT || states != STATES_OF_STRIP.SWIPE_IN || states != STATES_OF_STRIP.STATE_IN) && value ){
	
		//enable = true;
		enable_move = true;
		
	}
	if( states == STATES_OF_STRIP.STATE_IN && value ){
		enable_move = false;
		disable_move = true;
	}
	manageStates();
	
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
	*calculate the new rectangle between STATE_OUT and STATE_IN 
	
	****for swiping move****
	
*/ 
private function calcRect() : Rect {
	
	var r : Rect = Rect( rectIN.x + 2*rectIN.x * actual_zoom , rectIN.y , rectIN.width , rectIN.height );
	
	switch( states ){
		case states.SWIPE_IN :
				if( actual_zoom >= 0)
					actual_zoom -= 0.004;
				else{
					actual_zoom = 0;
					enable = false;
					manageStates();
				}
			break;
		case states.SWIPE_OUT :
				if( actual_zoom <= 1 )
					actual_zoom += 0.004;
				else{
					actual_zoom = 1;
					enable = false;
					manageStates();
				}
			break;
	}
	
	return r;
	
}

/*
	*calculate new rectangle on event OnDrag
*/
private function calcRect_OnDrag( dI : DragInfo ){

	var r : Rect = rectDRAG;
	
	
	if( !( r.x > 0 || r.x + r.width < Screen.width ) )
		r.x = r.x + dI.delta.x;
	else{
		if( r.x > 0)
			r.x = 0;
		if( r.x + r.width < Screen.width )
			r.x = Screen.width - r.width;
	}
	
	rectDRAG = r;

	return r;
	
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

	/***** zoom in move *****/
	if( enable_move && states == STATES_OF_STRIP.STATE_OUT )
		states = STATES_OF_STRIP.MOVE_CENTER;
		
		
	/***** end zoom in move *****/

	if( enable && states == STATES_OF_STRIP.STATE_OUT ){
		states = STATES_OF_STRIP.SWIPE_IN;
	}
		/***************/
	if( enable && (states == STATES_OF_STRIP.STATE_IN || states == STATES_OF_STRIP.ON_DRAG ) ){
		states = STATES_OF_STRIP.SWIPE_OUT;
		dragging = false;
	}
		/***************/
	if( !enable && states == STATES_OF_STRIP.SWIPE_IN ){
		states = STATES_OF_STRIP.STATE_IN;
	}
	if( !enable_move && states == STATES_OF_STRIP.MOVE_CENTER ){
		states = STATES_OF_STRIP.ZOOM_IN;
	}
	
	if( disable_move && states == STATES_OF_STRIP.STATE_IN ){
		states = STATES_OF_STRIP.STATE_OUT;
		disable_move = false;
	}

	if( !enable && states == STATES_OF_STRIP.SWIPE_OUT ){
		states = STATES_OF_STRIP.STATE_OUT;
	}
		/***************/
		
	/***** for all moves *****/
	if( dragging )
		states = STATES_OF_STRIP.ON_DRAG;
		
	if( !dragging && states == STATES_OF_STRIP.ON_DRAG )
		states = STATES_OF_STRIP.STATE_IN;
}


/*
* Set the parameters for the video (see the plug to know how to do it)
*/
function putVideo( focus: GameObject, nom : String){

	focus = new GameObject.CreatePrimitive(PrimitiveType.Plane);
	focus.name ="videoScreen";
	focus.transform.localScale=Vector3(11,1,1);
	focus.transform.position = Vector3(-2000,-2000,-2000);

	var access:videoSettings2 = gameObject.GetComponent("videoSettings2");
	var iOS = access.iOS;
	var MovieController = access.MovieController;
	  
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