#pragma strict

//camera transition parameters
private var TransitionTime : float = 1.0f ;
private var beginTime : float = 0.0f ;

private var CameraInitialPos : Vector3 ;
private var CameraInitialRot : Vector3 ;

private var finalPos : Vector3 ;
private var finalRot : Vector3 ;

private var enable:boolean = false;
private var done:boolean = false;

//to access accelerometer
private var control:CameraControl;
private var button:boolean=true;
private var Videos:videoSettings;




function init(){

	control = gameObject.AddComponent("CameraControl");
	Videos= gameObject.GetComponent("videoSettings") as videoSettings;
	control.enabled=false;
}

/*
* reset camera parameters on switching 2D/3D
*/
function Change2D3D(){

	
	
	if(Videos.isScene2D()==true){	
		Videos.changeSettings(true);
		Zoom.currently2D(true);
		cameraTransition();
	}
	else{
		control.enabled=false;
		Videos.changeSettings(false);
		Zoom.currently2D(false);
		cameraTransition();

	}

	Videos.switchScene();
	

} 



/**
* Camera switch 2D/3D
*/
function cameraTransition(){

	beginTime=Time.time;
	


	if(Videos.isScene2D()==true){
	var rot= camera.transform.localEulerAngles;
	camera.transform.eulerAngles=Vector3(270,0,0);
	//camera.transform.Rotate(Vector3(270,0,0));
	enable=true;
	done=false;
	

	//this.transform.position=Vector3(0,0,0);
	//this.transform.Rotate(Vector3(0,0,0));
	
	//light
	light.type=LightType.Spot;
	light.range=70;
	light.intensity=0.88;
	light.cookie=Resources.Load("camMask");
	light.spotAngle=50;

	}
	else{
	light.type=LightType.Point;
	light.cookie=null;

	camera.transform.position=Vector3(0,-10,0);
	camera.transform.localEulerAngles=rot;
	camera.transform.Rotate(Vector3(270,180,0));
	}
	
}

private var next:boolean = false;

function Update2D3D(){

	Debug.Log("update 2d 3d");
	
	
	if (!enable)
		return ;
	
	
	if(Videos.isScene2D()==false && !done){

			camera.transform.position.y += 0.1/TransitionTime;
		
			if(camera.transform.position.y >= 0 )  {done = true; next=true;}
	}
	
	if(Videos.isScene2D()==false && next){

		camera.transform.Rotate(Vector3(1,0,0));
	Debug.Log(camera.transform.eulerAngles);
		if(camera.transform.eulerAngles.x >= 358 ){enable=false;control.enabled=true;}
	}
	
	
}


function isEnableTrans(){
	return enable;
}