#pragma strict

//camera transition parameters
private var TransitionTime : float = 1.0f ;
private var beginTime : float = 0.0f ;

private var CameraInitialPos : Vector3 ;
private var CameraInitialRot : Vector3 ;

private var finalPos : Vector3 ;
private var finalRot : Vector3 ;

private var enable:boolean = false;
private var enableEnding:boolean = false;
private var done:boolean = false;

//to access accelerometer
private var control:CameraControl;
private var mouseLook : MouseLook ;

private var button:boolean=true;
private var Videos:videoSettings;

private var scene2D : boolean=true;
private var display:boolean=true;
//instantiate items
function init(){

	mouseLook = gameObject.AddComponent("MouseLook");
	control = gameObject.AddComponent("CameraControl");
	Videos= gameObject.GetComponent("videoSettings") as videoSettings;
	control.enabled=false;
	mouseLook.enabled=false;
}



//setter for enable at the end of the video, called in videosettings
function endingEnable(){
	enableEnding=true;
}


/*
* button switcher interface 2D/3D and directions
*/

function  OnGUI2D3D(){

	

	if(display && !enable &&  !enableEnding){
		
		GUI.Label(Rect(Screen.width/2 +315 , Screen.height-60, camera.pixelWidth , camera.pixelHeight),"Click anywhere on the screen \n   to get further information.");
			
 	 	if (GUI.Button(new Rect( 0, Screen.height-100, 100, 100), scene2D ? "3D view" : "2D view" ))
			{
				Change2D3D();
				   
			}
  	  
    }
        
}

/*
* reset camera parameters on switching 2D/3D
*/
function Change2D3D(){

	end=false;
	
	if(scene2D){	
	Videos.changeSettings(true);
	cameraTransition();
	}
	else{
	control.enabled=false;
	mouseLook.enabled = false ;
	Videos.changeSettings(false);
	cameraTransition();

	}

	switchScene();
	

} 



/**
* Camera switch 2D/3D
*/
function cameraTransition(){

	if(scene2D){
		var rot= camera.transform.localEulerAngles;
		camera.transform.eulerAngles=Vector3(270,0,0);
		enable=true;
		done=false;
		
	}
	else{
		light.type=LightType.Point;
		light.cookie=null;
		camera.transform.position=Vector3(0,-10,0);
		camera.transform.eulerAngles=rot;
		camera.transform.Rotate(Vector3(270,180,0));
	}
	
}


private var next:boolean = false;
private var end:boolean =false;

//called at everyframe, function generating transition
function Update2D3D(){

	display=Videos.OnPlay();

	if (!enable)
		return ;

	control.DetachGyro();

	if(!scene2D && !done){

		camera.transform.position.y += 0.1/TransitionTime;
		if(camera.transform.position.y >= 0 )  {done = true; next=true;}
	}
	if(!scene2D && next){

		camera.transform.Rotate(Vector3(1,0,0));
		if(camera.transform.eulerAngles.x >= 358 ){
			enable=false;
			finalSettings();
			if( isOnIpad() ) {
		
				control.enabled=true;
	
			} else {
				mouseLook.enabled = true ;
			}	
			control.AttachGyro();}
	}
	
	
}

function UpdateEnding(){

	if (!enableEnding)
		return ;

	if(end==false && enableEnding==true){
	
	
		if(Videos.endTransition()==true){enableEnding=false;end=true;}

	}

}

//adjust final settings at the end of the transition
function finalSettings(){

	//light
	light.type=LightType.Spot;
	light.range=70;
	light.intensity=0.88;
	light.cookie=Resources.Load("camMask");
	light.spotAngle=50;
}


//called in Transition2D3D
function switchScene(){
	scene2D=!scene2D;
}

//getter for other functions in other scripts
function isScene2D(){
	return scene2D;
}



static function isOnIpad() : boolean {
	return ( SystemInfo.deviceType == DeviceType.Handheld );
}
