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


private var Videos : videoSettings ;
private var Zoom : Zoom ;

private var VideoFull : FullScreen ;

private var mesh3D : createSphericMesh;

private var Trans :Transition2D3D;

private var control:CameraControl;
private var mouseLook : MouseLook ;


function Start () {
	
	//print('hello world');
	//Debug.Log('hello world');

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

	
	/*
	 * Inits
	 */	
			
		
	xml.InitXml("xml_data");
	Trans.init(enableMouseLook);

	
	// create plane and place camera
	var s : GameObject = Videos.videoSettings();
	
	// give access to this gameobject in createPolarMesh script
	createPolar.SetSurface(s);
	
	// create pieces of circle for Diane
	xml.getElementFromXML( placeMeshHash );

	
	//fin debug test
	Zoom.Init(AllGO2D, AllGO3D, enableMouseLook);
	
	
	VideoFull.InitFullScreen();
	
	
	// Link
	Zoom.AddOnZoom( Videos.videoHDZoomON );
	Zoom.AddOnLeave( VideoFull.LeaveFullScreen );
	Zoom.AddOnLeave( Videos.videoHDZoomQuit );
	Zoom.AddOnEndZoom(VideoFull.EnterOnFullScreen);
	
	
	
	Zoom.AddOnLeave( switchFieldOfView );
	
	VideoFull.SetLeaveCallback( Zoom.toOnDeZoom );
	
	// Camera
	camera.backgroundColor = Color.black;
	CreateLight ();
	camera.fieldOfView  = 60 ;
	
	
}

function Update () {
	
	Trans.Update2D3D();
	Zoom.UpDateZoom ();
	VideoFull.UpDateFullScreen();
	
//	sound.updateSounds(myPlanes);
	
	for( var i =0; i < AllGO2D.length; i++) {
	
		if(!Videos.getFlagEndVideo())
		move.moveSurface( AllGO2D[i], Videos.OnPlay() );
	
		if( Videos.getFlagEndVideo() ){
			move.resetPlane(AllGO2D[i]);
			Debug.Log("reset plane" + i + Videos.getFlagEndVideo());
		}
	}
	
}

function enableMouseLook( b : boolean ) {
	if( isOnIpad() )
		control.enabled = b ;
	else
		mouseLook.enabled = b ;
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



function switchFieldOfView() {
	camera.fieldOfView  = ( camera.fieldOfView == 80 ) ? 60 : 80 ;
}



/*
 * Appelle les fonctions des scripts gérant l'interface
 */
function OnGUI() {
	Trans.OnGUIVideoSetting();
	VideoFull.OnGUIFullScreen();
	Zoom.OnGUIZoom();
}


/*
	*place piece of circle according to xml
	*init hashtable in the sript attached to the plane
*/

function placeMeshHash ( t : Hashtable ){
	
	var obj = createPolar.placeMesh(	float.Parse( t['theta_min'] ) ,
										float.Parse( t['theta_max']) ,
										float.Parse( t['ratioRmin']) ,
										float.Parse( t['ratioRmax']) ,
										t['name'] );
	
	var obj3D = mesh3D.placeMesh3D( t );
	
	
	var s : scriptForPlane = obj.GetComponent("scriptForPlane");
	if( ! s)
		s  = obj.AddComponent ("scriptForPlane");
		
	var s3D : scriptForPlane = obj3D.GetComponent("scriptForPlane");
	if( ! s3D)
		s3D  = obj3D.AddComponent ("scriptForPlane");
	
	s.InitScript( t );
	s3D.InitScript( t );
	
	if( t.ContainsKey( 'theta_min' ) && t.ContainsKey( 'theta_max' ) && t.ContainsKey( 'ratioRmin' ) && t.ContainsKey( 'name' ) && t.ContainsKey( 'ratioRmax' )) {
	
		var p : Vector3 = createPolar.getTruePosition( float.Parse( t['theta_min'] ) , float.Parse( t['theta_max'] ) , float.Parse( t['ratioRmin'] ) , float.Parse( t['ratioRmax'] ) , gameObject );
		s.InitPosPlane( p );
	}
	
	if( ! isOnIpad() )
		s.createParsedFile();
	
			
	AllGO2D.Push( obj );
	AllGO3D.Push( obj3D );
}

