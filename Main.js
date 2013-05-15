#pragma strict

private var myPlanes : GameObject[] ;

// instantiate scripts
private var xml : getXML;
private var createPolar : createPolarMesh;
private var move : moveSurface;



// array of GO - meshes over movie
var AllGO : Array = Array();


private var mouseLook : MouseLook ;
private var control : CameraControl ;

private var Videos : videoSettings ;
private var Zoom : Zoom ;

private var VideoFull : FullScreen ;



function Start () {

	// MouseLook :
	if( isOnIpad() ) {
		
		control = gameObject.AddComponent("CameraControl");
		control.enabled=false;
	
	} else {
		mouseLook = gameObject.AddComponent("MouseLook");
		mouseLook.enabled = false ;
	}
	
	
	/*
	 * Instanciate the objects
	 */
	
	Videos = gameObject.AddComponent("videoSettings") as videoSettings;
	Zoom = gameObject.AddComponent("Zoom") as Zoom;
	createPolar = gameObject.AddComponent("createPolarMesh") as createPolarMesh;
	xml = gameObject.AddComponent("getXML") as getXML;
	move = gameObject.AddComponent("moveSurface") as moveSurface;
	VideoFull= gameObject.AddComponent("FullScreen") as FullScreen;

	
	/*
	 * Inits
	 */	
			
		
	xml.InitXml("xml_data");
	
	// create plane and place camera
	var s : GameObject = Videos.videoSettings();
	
	// give access to this gameobject in createPolarMesh script
	createPolar.SetSurface(s);
	
	// create pieces of circle for Diane
	xml.getElementFromXML( placeMeshHash );

	
	//fin debug test
	Zoom.Init(AllGO , enableMouseLook);
	
	
	VideoFull.InitFullScreen();
	
	
	// Link
	Zoom.AddOnZoom( Videos.videoHDZoomON );
	Zoom.AddOnLeave( VideoFull.LeaveFullScreen );
	Zoom.AddOnLeave( Videos.videoHDZoomQuit );
	Zoom.AddOnEndZoom(VideoFull.EnterOnFullScreen);
	
	
	Zoom.AddOnZoom( switchFiealdOfView );
	Zoom.AddOnLeave( switchFiealdOfView );
	
	
	
	// Camera
	camera.backgroundColor = Color.black;
	CreateLight ();
	camera.fieldOfView  = 60 ;
	
	
	
	
}

function Update () {
	
	Zoom.UpDateZoom ();
	VideoFull.UpDateFullScreen();
	
//	sound.updateSounds(myPlanes);
	
	for( var i =0; i < AllGO.length; i++) {
	
		if(!Videos.getFlagEndVideo())
		move.moveSurface( AllGO[i], Videos.OnPlay() );
	
		if( Videos.getFlagEndVideo() ){
			move.resetPlane(AllGO[i]);
			Debug.Log("i am in" + Videos.getFlagEndVideo());
		}
	}
}

function enableMouseLook( b : boolean ) {
	/*
	if( isOnIpad() )
		control.enabled = b ;
	else
		mouseLook.enabled = b ;
	*/
}


function isOnIpad() :boolean {
	return ( SystemInfo.deviceType == DeviceType.Handheld );
}


function CreateLight () {
	
	gameObject.AddComponent(Light);
	light.type=LightType.Point;
	light.range=70;
	light.intensity=0.88;
	
}



function switchFiealdOfView() {
	camera.fieldOfView  = ( camera.fieldOfView == 80 ) ? 60 : 80 ;
}

/*
 * Appelle les fonctions des scripts gérant l'interface
 */
function OnGUI() {
	Videos.OnGUIVideoSetting();
	VideoFull.OnGUIFullScreen();
	Zoom.OnGUIZoom();
}




/*
	*place piece of circle according to xml
	*init hashtable in the sript attached to the plane
*/

function placeMeshHash ( t : Hashtable ){
	
	var obj = createPolar.placeMesh(	float.Parse(t['theta_min']) ,
										float.Parse( t['theta_max']) ,
										float.Parse( t['ratioRmin']) ,
										float.Parse( t['ratioRmax']) ,
										t['name'] );
	
	// add script to the plane
	var s : scriptForPlane = obj.GetComponent("scriptForPlane");
	if( ! s)
		s  = obj.AddComponent ("scriptForPlane");
	
	
	s.InitScript( t );
	if( t.ContainsKey( 'theta_min' ) && t.ContainsKey( 'theta_max' ) && t.ContainsKey( 'ratioRmin' ) && t.ContainsKey( 'name' ) && t.ContainsKey( 'ratioRmax' )) {
	
		var p : Vector3 = createPolar.getTruePosition( float.Parse( t['theta_min'] ) , float.Parse( t['theta_max'] ) , float.Parse( t['ratioRmin'] ) , float.Parse( t['ratioRmax'] ) , gameObject );
		s.InitPosPlane( p );
	}
	
	AllGO.Push(obj);
}

