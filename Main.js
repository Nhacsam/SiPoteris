#pragma strict

private var myPlanes : GameObject[] ;

// instantiate scripts
private var xml : getXML;
private var createPolar : createPolarMesh;
private var move : moveSurface;



// array of GO - meshes over movie in 2D
var AllGO2D : Array = Array();
// array of GO - meshes over movie in 3D
var AllGO3D : Array = Array();
// array of GO - audiosources in 3D
var AllAudio3D : Array = Array();


private var Videos : videoSettings ;
private var Zoom : Zoom ;

private var VideoFull : FullScreen ;

private var mesh3D : createSphericMesh;

private var Trans :Transition2D3D;

private var control:CameraControl;
private var mouseLook : MouseLook ;

private var sound3D : audio3D;

private var textViewer: text;

private var plane2D : GameObject;

function Start () {
	
	/*
	 * Instanciate the objects
	 */
	
	Videos = gameObject.AddComponent("videoSettings") as videoSettings;
	Zoom = gameObject.AddComponent("Zoom") as Zoom;
	createPolar = gameObject.AddComponent("createPolarMesh") as createPolarMesh;
	xml = gameObject.AddComponent("getXML") as getXML;
	move = gameObject.AddComponent("moveSurface") as moveSurface;
	VideoFull= gameObject.AddComponent("FullScreen") as FullScreen;
	mesh3D = gameObject.AddComponent("createSphericMesh") as createSphericMesh;
	Trans = gameObject.AddComponent("Transition2D3D") as Transition2D3D;
	control = gameObject.AddComponent("CameraControl") as CameraControl;
	mouseLook = gameObject.AddComponent("MouseLook") as MouseLook;
	sound3D = gameObject.AddComponent("audio3D") as audio3D;
	
	/*
	 * Inits
	 */
	xml.InitXml("xml_data");
	Trans.init();

	sound3D.initSound();
	// create plane and place camera
	plane2D = Videos.videoSettings();
	Trans.init();
	// give access to this gameobject in createPolarMesh script
	if(plane2D)
		createPolar.SetSurface(plane2D);
	
	// create pieces of circle for Diane
	var func : Hashtable = new Hashtable() ;
	func['diane'] = placeMeshHash ;
	func['acteon'] = placeMeshHash ;
	func['middle'] = placeMeshHash ;
	func['sound'] = placeAudioHash ;
	
	xml.getElementFromXML( func );

	
	//fin debug test
	Zoom.Init(AllGO2D, ZOOM_TYPE.GO_AWAY_BACKWARD ,Vector3.zero );
	
	
	VideoFull.InitFullScreen();
	
	
	// Link
	Zoom.AddOnZoom( Videos.videoHDZoomON );
	Zoom.AddOnZoom(Trans.flagExit);
	Zoom.AddOnLeave( VideoFull.LeaveFullScreen );
	Zoom.AddOnLeave( Videos.videoHDZoomQuit );
	Zoom.AddOnEndZoom(VideoFull.EnterOnFullScreen);
	Zoom.AddOnEndDezoom( Trans.flagExit );
	
	Zoom.AddOnZoom(disableMouseLook);
	Zoom.AddOnEndDezoom(enableMouseLook);
	
	VideoFull.SetLeaveCallback( Zoom.toOnDeZoom );
	
	Trans.AddOnEndTrans( changeZoomPlane );
	
	
	// Camera
	camera.backgroundColor = Color.black;
	CreateLight ();
	camera.fieldOfView  = 60 ;
	camera.farClipPlane = 60;
	camera.nearClipPlane = 0.01;
	
	disableMouseLook();
}

function Update () {
	
	Trans.Update2D3D();
	Trans.Update3D2D();
	Zoom.UpDateZoom ();
	VideoFull.UpDateFullScreen();
	Trans.UpdateEnding();
	
	sound3D.updateSounds( AllAudio3D );
	
	for( var i =0; i < AllGO2D.length; i++) {
	
		if(!Videos.getFlagEndVideo())
		move.moveSurface( AllGO2D[i], Videos.OnPlay() );
	
		if( Videos.getFlagEndVideo() ){
			move.resetPlane(AllGO2D[i]);
		}
	}
	
}

function enableMouseLook() {
	if( isOnIpad() ) {
		control.enabled = Trans.isScene2D() ? false : true;
	}
	else {	
		mouseLook.enabled = Trans.isScene2D() ? false : true;
	}
}

function disableMouseLook() {
	if( isOnIpad() ) {
		control.enabled = false;
	}
	else {	
		mouseLook.enabled = false ;
	}
}


function changeZoomPlane( is2D : boolean ) {
	
	if( is2D ) {
		Zoom.changeClickableElmts( AllGO2D );
		Zoom.changeType( ZOOM_TYPE.GO_ON_POINT_ROTATING, Vector3.zero );
	} else {
		Zoom.changeClickableElmts( AllGO3D );
		Zoom.changeType( ZOOM_TYPE.GO_ON_PLANE, Vector3.zero );
	}
}

function isOnAGUIElmt( pos : Vector2) {
	
	if( Trans.isInButton(pos) )
		return true ;
	
	return false ;
}




static function isOnIpad() : boolean {
	return ( SystemInfo.deviceType == DeviceType.Handheld );
}


function CreateLight () {
	
	gameObject.AddComponent(Light);
	light.type=LightType.Point;
	light.range=70;
	light.intensity=0.88;
	
}

/*
 * Appelle les fonctions des scripts gérant l'interface
 */
function OnGUI() {
	Trans.OnGUI2D3D();
	VideoFull.OnGUIFullScreen();
	//GUI.Label(Rect(Screen.width/2, Screen.height-60, camera.pixelWidth , camera.pixelHeight),"TEST");
}


/*
	*place piece of circle according to xml
	*init hashtable in the script attached to the plane
*/
function placeMeshHash ( t : Hashtable ){
	// 2D meshes
	if(plane2D){
		var obj = createPolar.placeMesh(	float.Parse( t['theta_min'] ) ,
										float.Parse( t['theta_max']) ,
										float.Parse( t['ratioRmin']) ,
										float.Parse( t['ratioRmax']) ,
										t['name'] );
										
		var s : scriptForPlane = obj.GetComponent("scriptForPlane");
		if( ! s)
			s  = obj.AddComponent ("scriptForPlane");
		s.InitScript( t );
		if( t.ContainsKey( 'theta_min' ) && t.ContainsKey( 'theta_max' ) && t.ContainsKey( 'ratioRmin' ) && t.ContainsKey( 'name' ) && t.ContainsKey( 'ratioRmax' )) {
	
			var p : Vector3 = createPolar.getTruePosition( float.Parse( t['theta_min'] ) , float.Parse( t['theta_max'] ) , float.Parse( t['ratioRmin'] ) , float.Parse( t['ratioRmax'] ) , gameObject );
			s.InitPosPlane( p );
			p = createPolar.getOrientedTo( float.Parse( t['theta_min'] ) , float.Parse( t['theta_max'] ) , float.Parse( t['ratioRmin'] ) , float.Parse( t['ratioRmax'] ) , gameObject );
		s.InitOrientedTo( p );
		}
		// add new gameobject to array
		AllGO2D.Push( obj );
	}
	
	// 3D meshes
	var obj3D = mesh3D.placeMesh3D( t );
	
	var s3D : scriptForPlane = obj3D.GetComponent("scriptForPlane");
	if( ! s3D)
		s3D  = obj3D.AddComponent ("scriptForPlane");
	s3D.InitScript( t );
	
	s3D.InitPosPlane( obj3D.transform.position );
	
	s3D.InitOrientedTo( mesh3D.getOrientedTo() );
	
	if( ! isOnIpad() )
		s.createParsedFile();
		
	AllGO3D.Push( obj3D );
}

/*
	*create and place sound in 3D
*/
function placeAudioHash ( t : Hashtable ){
	var g : GameObject = sound3D.createAudio( t );
	if( g )
		AllAudio3D.Push( g );
}
