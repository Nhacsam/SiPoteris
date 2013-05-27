/*
	*Creation : 29/04/2013
	*Author : Fabien Daoulas
	*Last update : 27/05/2013
	
	This script displays in full screen the picture on which the user tapped 
*/

// states engine
enum STATES_OF_STRIP { STATE_IN , STATE_OUT , MOVE , ZOOM_IN , ZOOM_OUT};
private var states : STATES_OF_STRIP = STATES_OF_STRIP.STATE_OUT;

// plane for video  /  screen
private var videoScreen : GameObject;

// ratio of plane
private var ratioPlane : float;

// about dragging
	private var dragging : boolean = false;
	// info about dragging event
	private var dragInf : DragInfo;

private var window : showingWindow;
private var videoSet : videoSettings;
private var zoom : Zoom;

// rect state out
private var rectOUT : Rect;

// position of camera before zoom
private var posCam : Vector3;

// about moving picture to the center
	// speed
	private var speedX : float;
	private var speedY : float;
	// if true strip move to the center
	private var enable_move : boolean = false;
	// first time in updateMove_center
	private var firstTimeMove : boolean = true;
	// speed, position...
	private var posStart : Vector3;
	private var objOnMove : Vector2;
	private var posObj : Vector2;
	// rect at the end of move to the center
	private var rectEndMove : Rect;
	
// about zooming in
	// speed when zooming in
	private var zoomSpeed : float;
	// rect when zooming in
	private var rectZoomIn : Rect;
	// end zoom
	private var end_zoom : boolean = false;
	// position of camera at the start of zoom in move
	private var posStartZoom : Vector3;
	
// about move - tells you if you are in zooming in phase (move + zoomin) or zooming out phase (zoomout + move)
private var move_in : boolean = false;
private var move_out : boolean = false;


// events are enable ?
private var eventEnable : boolean = false;


/**************** listeners ****************/

function OnEnable(){

	Gesture.onShortTapE += OnTap;
	Gesture.onDraggingE += OnDrag;
	
}

function OnDisable(){

	Gesture.onShortTapE -= OnTap;
	Gesture.onDraggingE -= OnDrag;
	
}

/**************** after events ****************/

/*
	*action after event tap
*/
function OnTap( v : Vector2 ){
	if( eventEnable && videoScreen != null ){
		var ray : Ray = camera.ScreenPointToRay( v );
		var hit : RaycastHit = new RaycastHit();

		if( videoScreen.collider.Raycast( ray , hit , 2000.0f ) && states == STATES_OF_STRIP.STATE_OUT ){
			moveCameraToDisplay();
			move_in = true;
			move_out = false;
			enable_move = true;
			end_zoom = false;
			firstTimeMove = true;
			posStart = camera.WorldToScreenPoint( videoScreen.transform.position );
			manageStates();
		}

		if( states == STATES_OF_STRIP.STATE_IN ) {
			end_zoom = false;
			move_in = false;
			move_out = true;
			manageStates();
		}
	}
}

/*
	*action after event drag
*/
private function OnDrag( dragInfo : DragInfo ){
	if( states == STATES_OF_STRIP.STATE_IN && eventEnable){
		dragging = true;
		dragInf = dragInfo;
		manageStates();
	}
}

////////////////////////
/////states machine/////
////////////////////////

/*
	*manage states of states machines
*/
private function manageStates(){

	if( enable_move && states == STATES_OF_STRIP.STATE_OUT ){
		states = STATES_OF_STRIP.MOVE;
	}
	if( !enable_move && states == STATES_OF_STRIP.MOVE && move_in ){
		states = STATES_OF_STRIP.ZOOM_IN;
	}
	if( end_zoom && states == STATES_OF_STRIP.ZOOM_IN ){
		states = STATES_OF_STRIP.STATE_IN;
	}
	if( !end_zoom && states == STATES_OF_STRIP.STATE_IN ){
		states = STATES_OF_STRIP.ZOOM_OUT;
	}
	if( end_zoom && states == STATES_OF_STRIP.ZOOM_OUT ){
		states = STATES_OF_STRIP.MOVE;
		enable_move = true;
	}
	if( states == STATES_OF_STRIP.MOVE && !enable_move && move_out )
		states = STATES_OF_STRIP.STATE_OUT;
	
	bigDaddy();
	
}

/*
	*do what have to be done according to the value of states
*/
private function bigDaddy(){
	switch( states ){
			case states.STATE_OUT : 
				// place camera at the right position
				camera.transform.position = posCam;
				// replace plane near (-2000,-2000,-2000)
				videoScreen.transform.position = camera.ScreenToWorldPoint( Vector3( 	rectOUT.x + rectOUT.width/2, 
																			rectOUT.y + rectOUT.height/2, 
																			camera.nearClipPlane));
				(gameObject.GetComponent( FullScreen ) as FullScreen ).enableOthers( this );
				break;
			case states.MOVE :
				enable_move = true;
				(gameObject.GetComponent( FullScreen ) as FullScreen ).disableOthers( this );
				break;
			case states.ZOOM_IN :
				break;
			case states.STATE_IN :
				if( dragging )
					dragPlane(dragInf);
				//runMovie( "ALLdiane" );
				break;
			case states.ZOOM_OUT :
				//stopMovie();
				videoScreen.transform.position = camera.ScreenToWorldPoint( Vector3( Screen.width/2 , Screen.height/2 , camera.nearClipPlane + 0.1 ) );
				break;
		}
}

/////////////////////***************************** update ***************************************////////////////////////////
/////////////////////***************************** update ***************************************////////////////////////////

function updateStrip(){
	// for strip on GUI
	if( move_in && states == STATES_OF_STRIP.MOVE ){
		var middle : Vector2 = Vector2( Screen.width/2 , Screen.height/2 );
		Update_MOVE( middle );
	}
	
	if( states == STATES_OF_STRIP.ZOOM_IN )
		Update_ZOOM_IN();
	
	if( states == STATES_OF_STRIP.ZOOM_OUT )
		Update_ZOOM_OUT();
		
	if( states == STATES_OF_STRIP.MOVE && move_out ){
		var v : Vector3 = getPosStart();
		Update_MOVE( Vector2(v.x,v.y) );
	}
}

/////////////////////***************************** mise en place du plan ***************************************////////////////////////////
/////////////////////***************************** mise en place du plan ***************************************////////////////////////////

/*
	*on the event OnFullScreen this method is called
*/
function InitVideoScreen( ratio : float , r : Rect ){
	// init state of the state machine
	states = STATES_OF_STRIP.STATE_OUT;
	ratioPlane = ratio;

	rectOUT = computeRect( ratioPlane , r );
	
	createStripPlane( rectOUT );
	enableAll();
}

/*
	*calculate new rect 
	*ratio = width/height
*/
private function computeRect( ratio : float , r : Rect ) : Rect {
	var newR : Rect;
	var ratioMax : float = r.width/r.height;
	
	// resize plane to fit ratio
	if( ratio >= 1 ){
		newR.width = r.width;
		newR.height = newR.width/ratio;
		
		if( newR.height > r.height ){
			newR.height = r.height;
			newR.width = newR.height*ratio;
		}
	}
	if( ratio < 1 ){
		newR.height = r.height;
		newR.width = newR.height*ratio;
		
		if( newR.width > r.width ){
			newR.width = r.width;
			newR.height = newR.width/ratio;
		}
	}

	// replace plane
	newR.x = r.x + r.width/2 - newR.width/2;
	newR.y = r.y + r.height/2 - newR.height/2;
	
	return newR;
}


/*
	*get rect to place the plane on the screen
	*and create a plane
*/
private function createStripPlane( r : Rect ){
	window = 		gameObject.GetComponent("showingWindow") as showingWindow;
	videoSet = 		gameObject.GetComponent("videoSettings") as videoSettings;
	
	// create plane
	videoScreen = new GameObject.CreatePrimitive( PrimitiveType.Plane );
	videoScreen.name = "stripPlane";
	
	// extend plane
	var elmtsSize : Vector2 = window.getRealSize(	Vector2( r.width , r.height ),
												Vector2( r.x , r.y ),
												camera.nearClipPlane + 0.1, 
												camera ) ;
	
	var size = videoScreen.renderer.bounds.size ;
	videoScreen.transform.localScale = Vector3( elmtsSize.x/size.x, 
												1, 
												elmtsSize.y/size.z ) ;
	
	// set position of plane
	videoScreen.transform.position = camera.ScreenToWorldPoint( Vector3( r.x + r.width/2 , r.y + r.height/2 , camera.nearClipPlane + 0.1 ) );
	videoScreen.transform.rotation = camera.transform.rotation;
	videoScreen.transform.rotation *= Quaternion.AngleAxis(-90, Vector3( 1,0,0) );
	videoScreen.transform.rotation *= Quaternion.AngleAxis(180, Vector3( 0,1,0) );
	
	// test and set renderer
	var testRenderer = videoScreen.GetComponent(Renderer);
	if( !testRenderer)
		videoScreen.AddComponent(Renderer);

	videoScreen.renderer.material.mainTexture = Resources.Load( "dianeIm" );
}

/*
	*move camera 
	*and extend plane
	*when onTap event occured
*/
private function moveCameraToDisplay(){
	posCam = camera.transform.position;
	camera.transform.position = Vector3( -4000 , -4000 , -4000 );
	videoScreen.transform.position = camera.ScreenToWorldPoint( Vector3( 	rectOUT.x + rectOUT.width/2, 
																			rectOUT.y + rectOUT.height/2, 
																			camera.nearClipPlane));
}

/*
	*on display mode, extend screen to fit the full screen
*/
private function changeSizeScreen( ratio : float , r : Rect ){
	var newR : Rect = computeRect( ratio , r );
	var rot = videoScreen.transform.rotation;
	videoScreen.transform.rotation = Quaternion();
	
	// extend plane
	var size : Vector3 = videoScreen.renderer.bounds.size;
	var elmtsSize : Vector2 = window.getRealSize(	Vector2( newR.width , newR.height ),
												Vector2( newR.x , newR.y ),
												camera.nearClipPlane + 0.1, 
												camera ) ;
	videoScreen.transform.localScale = Vector3( videoScreen.transform.localScale.x*elmtsSize.x/size.x, 
												videoScreen.transform.localScale.y, 
												videoScreen.transform.localScale.z*elmtsSize.y/size.z ) ;
	videoScreen.transform.rotation = rot;
}

/////////////////////////////////////////////////////////////////////////////
/////about moving the plane to a position for example : middle of screen/////
/////////////////////////////////////////////////////////////////////////////

/*
	*all that have to be done in move_center state
*/
function Update_MOVE( v : Vector2 ){
	movePicture( v );
}

/*
	*move plane to the position desired
	*xmin on the left of screen
	*ymin on the bottom of screen
*/
private function movePicture( v : Vector2 ){

	if( firstTimeMove ){
		objOnMove = Vector2( posStart.x , posStart.y );
		firstTimeMove = false;
	}
	
	posObj = positionOfRect( objOnMove , v );
	initSpeedMove( objOnMove , v );
	
		switch ( posObj.x ){
			case 1 : // obj on the right
						if( speedX > 0.09 ){
							objOnMove.x = objOnMove.x - posObj.x*speedX;
							objOnMove.y = objOnMove.y - posObj.y*speedY;
							videoScreen.transform.position = camera.ScreenToWorldPoint( Vector3(objOnMove.x, 
																								objOnMove.y, 
																								camera.nearClipPlane + 0.1) );
						}
						else{
							objOnMove.y = v.y;
							objOnMove.x = v.x;
							videoScreen.transform.position = camera.ScreenToWorldPoint( Vector3(objOnMove.x, 
																								objOnMove.y, 
																								camera.nearClipPlane + 0.1) );
							rectEndMove = getRectPlane();
							enable_move = false;
						}
				break;
			case -1 :// obj on the left
						if( speedX > 0.09 ){
							objOnMove.x = objOnMove.x - posObj.x*speedX;
							objOnMove.y = objOnMove.y - posObj.y*speedY;
							videoScreen.transform.position = camera.ScreenToWorldPoint( Vector3(objOnMove.x, 
																								objOnMove.y, 
																								camera.nearClipPlane + 0.1) );
						}
						else{
							objOnMove.y = v.y;
							objOnMove.x = v.x;
							videoScreen.transform.position = camera.ScreenToWorldPoint( Vector3(objOnMove.x, 
																						objOnMove.y, 
																						camera.nearClipPlane + 0.1) );
							rectEndMove = getRectPlane();
							enable_move = false;
						}
				break;
		}
	manageStates();
}

/*
	*inform you about the position of the picture compared to the point finalPos
*/
private function positionOfRect( posObj : Vector2 , finalPos : Vector2 ) : Vector2 {

	var vec : Vector2;

	if( posObj.x - finalPos.x < 0 ){// if object is on the left of the final position
		vec.x = -1;
	}
	else{// on the right
		vec.x = 1;
	}
		
	if( posObj.y - finalPos.y < 0 ){// object below
		vec.y = -1;
	}
	else{// object on top
		vec.y = 1;
	}

	return vec;
	
}

/*
	*init speed when moving to a point on the screen
*/
private function initSpeedMove( obj : Vector2 , desired : Vector2 ){
	speedX = Mathf.Abs( obj.x - desired.x ) / 20;
	speedY = Mathf.Abs( obj.y - desired.y ) / 20;
}

//////////////////////////////////////////////////////////////////////////////////
/////about zooming in on the plane to make the picture fit 2/3 of the screen /////
//////////////////////////////////////////////////////////////////////////////////

/*
	*all that have to be done in zooming_in state
*/
function Update_ZOOM_IN(){
	var r : Rect = getRectPlane();
	initSpeedZoom( r.y , Screen.height/6 );

	resizePlane( ratioPlane , 1 );
	
	if( r.y < Screen.height/6 )
		end_zoom = true;

	manageStates();
}

/*
	*widen the plane
	*ratio is the ratio of the plane
*/
private function resizePlane( ratio : float , InOrOut : float ){
	var rect : Rect = getRectPlane();
	
	rect.height += InOrOut*zoomSpeed;
	rect.width += InOrOut*zoomSpeed*ratio;
	rect.x = Screen.width/2 - rect.width/2;
	rect.y = Screen.height/2 - rect.height/2;

	changeSizeScreen( ratio , rect );
}
/*
	*init speed when zooming in/out
*/
private function initSpeedZoom( actual : float , desired : float ){
	zoomSpeed = Mathf.Abs(actual/(desired-actual));
	if( zoomSpeed > 10 )// maximize speed
		zoomSpeed = 10;
}

///////////////////////////////////////////////////////////
/////about dragging plane when movie is on full screen/////
///////////////////////////////////////////////////////////

/*
	*move the plane on drag event
*/
private function dragPlane( dI : DragInfo ){
	var r : Rect = getRectPlane();
	if( !(r.x > 0 && dI.delta.x > 0 || r.x + r.width < Screen.width && dI.delta.x < 0 ))
			videoScreen.transform.position.x += dI.delta.x;
}

////////////////////////////////////////
/////about zooming out on the plane/////
////////////////////////////////////////

/*
	*all that have to be done in zooming_out state
*/
function Update_ZOOM_OUT(){
	var r : Rect = getRectPlane();
	initSpeedZoom( r.y , rectEndMove.y );
	
	if( r.y + zoomSpeed >= rectEndMove.y ){
		changeSizeScreen( ratioPlane , rectEndMove );
		end_zoom = true;
	}
	else
		resizePlane( ratioPlane , -1 );

	manageStates();
}

///////////////////////////////////
/////run / stop video on plane/////
///////////////////////////////////

function runMovie( name : String ){
	
	videoSet.putVideo( videoScreen , name );

}

function stopMovie(){
	videoSet.stopVideo( videoScreen );
}

///////////////////////////////////////////////
/////destruct when leaving full screen mode/////
///////////////////////////////////////////////

function destructStrip(){
	disableAll();
	Destroy( videoScreen );
}

/////////////////////////////////////////////
/////getter, setter, additionnal methods/////
/////////////////////////////////////////////

function getMove(){
	return enable_move;
}

function getMoveOut(){
	return move_out;
}

function getMoveIn(){
	return move_in;
}

function getStates(){
	return states;
}

function getPosStart(){
	return posStart;
}

/*
	*return rect where the plane is on screen
*/
private function getRectPlane() : Rect {
	var r : Rect;
	
	var rot = videoScreen.transform.rotation;
	videoScreen.transform.rotation = Quaternion();
	
	// coordinates of the point on bottom left of the plane - world coordinate										
	var BL : Vector3 = videoScreen.renderer.bounds.min;
	var TR : Vector3 = videoScreen.renderer.bounds.max;
	
	// into screen coordinates
	var screenBL : Vector3 = camera.WorldToScreenPoint(BL);
	var screenTR : Vector3 = camera.WorldToScreenPoint(TR);
	
	// build rect descripting where is the plane into screen coordinates
	r = Rect( screenBL.x , Screen.height - screenTR.y , Mathf.Abs(-screenBL.x + screenTR.x) , Mathf.Abs( -screenBL.y + screenTR.y ) );
	
	videoScreen.transform.rotation = rot;
	
	return r;
}

/*
	*compute rectangle to place the plane at the right place on screen
*/
function placeStripFactor( stripTop : float , stripBottom :float , stripLeft : float , stripRight : float ) : Rect{
	var r : Rect;
	r.height = Screen.height * (stripTop-stripBottom);
	r.width = Screen.width * (stripRight-stripLeft);
	r.x = Screen.width * stripLeft;
	r.y = Screen.height * stripBottom;
	return r;
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
}

/*
 * Cache l'objet et desactive les evenements
 */
public function disableAll() {
	hide() ;
	disableEvents() ;
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
	videoScreen.renderer.enabled = true ;
}

/*
 * Cache l'objet
 */
public function hide() {
	videoScreen.renderer.enabled = false ;
}

/*
 * Getters
 */
public function areEventEnabled() : boolean {
	return eventEnable ;
}
public function isHidden() : boolean {
	return !(videoScreen.renderer.enabled) ;
}


