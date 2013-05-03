#pragma strict

private var myPlanes : GameObject[] ;


private var xml : getXML;
private var createPolar : createPolarMesh;
private var move : moveSurface;

var AllGO : GameObject[];


private var mouseLook : MouseLook ;
private var control : CameraControl ;

private var Videos : videoSettings2 ;
private var Zoom : Zoom ;

private var VideoFull : FullScreen ;

//private var sound : controlAUDIO ;


function Start () {

	// MouseLook :
	if( isOnIpad() ) {
		
		control = gameObject.AddComponent("CameraControl");
		control.enabled=false;
	
	}
	
	
	/*
	 * Instanciate the objects
	 */
	
	Videos = gameObject.AddComponent("videoSettings2");
	Zoom = gameObject.AddComponent("Zoom");
	createPolar = gameObject.AddComponent("createPolarMesh");
	xml = gameObject.AddComponent("getXML");
	move = gameObject.AddComponent("moveSurface");
	VideoFull= gameObject.AddComponent("FullScreen");

	
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
	
	// create all meshes
	AllGO = createPolar.getGO(createPolar.AllPieceOfCircle);

	
	//fin debug test
	Zoom.Init(AllGO , enableMouseLook);
	
	
	VideoFull.InitFullScreen();
	
	
	// Link
	Zoom.AddOnZoom( Videos.videoHDZoomON );
	Zoom.AddOnLeave( VideoFull.LeaveFullScreen );
	Zoom.AddOnLeave( Videos.videoHDZoomQuit );
	Zoom.AddOnEndZoom(VideoFull.EnterOnFullScreen);
	
//	Zoom.AddOnZoom( changeLight );
//	Zoom.AddOnLeave( changeLight );
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
	move.moveSurface( AllGO );
//	sound.updateSounds(myPlanes);
	
}


function enableMouseLook( b : boolean ) {
	

	
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
/*
function changeLight() {
	light.type = ( light.type == LightType.Spot ) ? LightType.Point : LightType.Spot ;
	light.cookie = (light.cookie == null ) ? Resources.Load("camMask") : null ;
}*/

function switchFiealdOfView() {
	camera.fieldOfView  = ( camera.fieldOfView == 80 ) ? 60 : 80 ;
}

/*
	*place piece of circle according to xml
	*init hashtable in the sript attached to the plane
*/

function placeMeshHash ( t : Hashtable ){
	
	var obj = createPolar.placeMesh(float.Parse(t['theta_min']) , float.Parse( t['theta_max'] ) , float.Parse( t['ratioRmin']) , float.Parse( t['ratioRmax']) , t['name'] );
	createPolar.InitScript( obj , t );

}


