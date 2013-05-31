/*
	*Creation : 29/04/2013
	*Author : Fabien Daoulas
	*Last update : 29/05/2013
	
	This script displays in full screen the picture on which the user tapped 
*/

private var window : showingWindow;
private var videoSet : videoSettings;

// states engine
enum STATES_OF_STRIP { STATE_IN , STATE_OUT , ZOOM_IN , ZOOM_OUT};
private var states : STATES_OF_STRIP = STATES_OF_STRIP.STATE_OUT;

// plane for video  /  screen
private var videoScreen : GameObject;

// ratio of plane
private var ratioPlane : float;

// rect when on gui
private var rectOUT : Rect;

// when the zoom started
private var zoomStart : float;

// scale at start and on full mode
private var outScale : Vector3;
private var inScale : Vector3;

// position at start and on full mode
private var inPos : Vector3;
private var outPos : Vector3;

// position of plane along z axis
private var z_coor : float = 20;

// length of zoom
private var zoomLength : float = 2;




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
		if( ( videoScreen.collider.Raycast( ray , hit , 2000.0f ) && states == STATES_OF_STRIP.STATE_OUT) || states == STATES_OF_STRIP.STATE_IN )
			initZoom();
	}
}

/*
	*action after event drag
*/
function OnDrag( dragInfo : DragInfo ){
	if( states == STATES_OF_STRIP.STATE_IN && eventEnable){
		dragPlane( dragInfo );
	}
}

/////////////////////////
/////initialize zoom/////
/////////////////////////

private function initZoom(){
	if( states == STATES_OF_STRIP.STATE_OUT ){
		// the fullscreen elements are disabled
		(gameObject.GetComponent( FullScreen ) as FullScreen ).disableOthers( this );
		states = STATES_OF_STRIP.ZOOM_IN;
		zoomStart = Time.time;
	}
	if( states == STATES_OF_STRIP.STATE_IN ){
		states = STATES_OF_STRIP.ZOOM_OUT;
		zoomStart = Time.time;
	}
}

///////////////////////
/////set the plane/////
///////////////////////

/*
	*on the event OnFullScreen this method is called
*/
function InitVideoScreen( path : String , r : Rect ){
	// init state of the state machine
	states = STATES_OF_STRIP.STATE_OUT;
	var texture = Resources.Load( path );
	if( path ){
		if( typeof( texture ) == typeof(Texture) || typeof( texture ) == typeof(Texture2D) ){
			// get ratio of strip
			ratioPlane = (texture as Texture).width/(texture as Texture).height;
				
			rectOUT = optimalSize( ratioPlane , r );
			createStripPlane( path , rectOUT );
	
			// compute scale and position when plane is widen
			getInParameters();
			enableAll();
		}
		else{
			videoScreen = new GameObject.CreatePrimitive( PrimitiveType.Plane );
			videoScreen.name = "GUI_stripPlane";
			disableAll();
			Console.Warning("File is typeof "+typeof(texture)+" whereas it should be typeof Texture or Texture2D");
		}
	}
	else
		Console.Warning("No file found here ");
		
}

/*
	*get rect to place the plane on the screen
	*and create a plane
*/
private function createStripPlane( path : String , r : Rect ){
	window = 		gameObject.GetComponent("showingWindow") as showingWindow;
	videoSet = 		gameObject.GetComponent("videoSettings") as videoSettings;
	
	// create plane
	videoScreen = new GameObject.CreatePrimitive( PrimitiveType.Plane );
	videoScreen.name = "GUI_stripPlane";
	
	// extend plane
	var elmtsSize : Vector2 = window.getRealSize(	Vector2( r.width , r.height ),
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
	
	// set position and scale when plane is out
	outPos = videoScreen.transform.position;
	outScale = videoScreen.transform.localScale;
	
	// test and set renderer
	var testRenderer = videoScreen.GetComponent(Renderer);
	if( !testRenderer)
		videoScreen.AddComponent(Renderer);
	
	// add texture to the plane
	videoScreen.renderer.material.mainTexture = Resources.Load( path );
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

/*
	*calculate new rect 
	*ratio = width/height
*/
private function optimalSize( ratio : float , r : Rect ) : Rect {
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

////////////////////////////////
/////get position and scale/////
////////////////////////////////

private function getInParameters(){
	// position of plane when state is state_in
	inPos = camera.ScreenToWorldPoint( Vector3(camera.pixelWidth/2, camera.pixelHeight/2, 20 ) ) ;
	
	var rotation = videoScreen.transform.rotation ;
	videoScreen.transform.rotation = Quaternion();
	// no scale modifications with rotation up
	var size = videoScreen.renderer.bounds.size ;
	var elmtsSize : Vector2 = window.getRealSize(	Vector2( size.x * camera.pixelHeight/size.z , camera.pixelHeight ),
											Vector2( inPos.x, inPos.y ),
											inPos.z, camera ) ;
	// scale of plane when state is state_in
	inScale = Vector3( videoScreen.transform.localScale.x * elmtsSize.x/size.x, 1, videoScreen.transform.localScale.z * elmtsSize.y/size.z ) ;

	videoScreen.transform.rotation = rotation ;
}



////////////////
/////update/////
////////////////

function updateStrip(){
	if( states == STATES_OF_STRIP.ZOOM_IN )
		Update_ZOOM_IN();
	
	if( states == STATES_OF_STRIP.ZOOM_OUT )
		Update_ZOOM_OUT();
}

//////////////////////////////////////////////////////////////////////////////////
/////about zooming in on the plane to make the picture fit 2/3 of the screen /////
//////////////////////////////////////////////////////////////////////////////////

/*
	*all that have to be done in zooming_in state
*/
function Update_ZOOM_IN(){
	if( Time.time > zoomStart + zoomLength )
			states = STATES_OF_STRIP.STATE_IN ;
	else{
		videoScreen.transform.localScale = Vector3.Slerp( outScale, inScale, (Time.time - zoomStart ) / zoomLength );
		videoScreen.transform.position = Vector3.Slerp( outPos, inPos, (Time.time - zoomStart ) / zoomLength );
	}
}

////////////////////////////////////////
/////about zooming out on the plane/////
////////////////////////////////////////

/*
	*all that have to be done in zooming_out state
*/
function Update_ZOOM_OUT(){
	if( Time.time > zoomStart + zoomLength ){
			videoScreen.transform.localScale = outScale;
			videoScreen.transform.position = outPos;
			// the fullscreen elements are enabled
			(gameObject.GetComponent( FullScreen ) as FullScreen ).enableOthers( this );
			states = STATES_OF_STRIP.STATE_OUT;
	}
	else{
		videoScreen.transform.localScale = Vector3.Slerp( inScale, outScale, (Time.time - zoomStart ) / zoomLength );
		videoScreen.transform.position = Vector3.Slerp( inPos, outPos, (Time.time - zoomStart ) / zoomLength );
	}
}

///////////////////////////////////////////////////////////
/////about dragging plane when movie is on full screen/////
///////////////////////////////////////////////////////////

/*
	*slide the plane on drag event
*/
private function dragPlane( dI : DragInfo ){
	var r : Rect = getRectPlane();
	var screenPos : Vector3 = camera.WorldToScreenPoint( videoScreen.transform.position );
	if( !(r.x > 0 && dI.delta.x > 0 || r.x + r.width < Screen.width && dI.delta.x < 0 )){
		screenPos.x += dI.delta.x;
		videoScreen.transform.position = camera.ScreenToWorldPoint( screenPos );
	}
}

////////////////////////////////////////
//////additionnale method/////
////////////////////////////////////////

/*
	*return rect where the plane is on screen
*/
private function getRectPlane() : Rect {
	var r : Rect;
	
	// coordinates of the point on bottom left of the plane - world coordinate
	var BL : Vector3 = Vector3(	videoScreen.transform.position.x - videoScreen.renderer.bounds.size.x/2 , 
								videoScreen.transform.position.y , 
								videoScreen.transform.position.z - videoScreen.renderer.bounds.size.z/2 );
	// coordinates of the point on bottom right of the plane - world coordinate
	var TR : Vector3 = Vector3(	videoScreen.transform.position.x + videoScreen.renderer.bounds.size.x/2 , 
								videoScreen.transform.position.y , 
								videoScreen.transform.position.z + videoScreen.renderer.bounds.size.z/2 );
	// into screen coordinates
	var screenBL : Vector3 = camera.WorldToScreenPoint(BL);
	var screenTR : Vector3 = camera.WorldToScreenPoint(TR);
	
	// build rect descripting where is the plane into screen coordinates
	r = Rect( screenBL.x , Screen.height - screenTR.y , -screenBL.x + screenTR.x , -screenBL.y + screenTR.y );
	
	return r;
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

////////////////////////////////////////////////
/////destruct when leaving full screen mode/////
////////////////////////////////////////////////

function destructStrip(){
	disableAll();
	if(videoScreen)
		Destroy( videoScreen );
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
	if(videoScreen)	
		videoScreen.renderer.enabled = true ;
}

/*
 * Cache l'objet
 */
public function hide() {
	if(videoScreen)	
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
