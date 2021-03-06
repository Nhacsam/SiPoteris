#pragma strict

/*
Transition2D3D.js

number of lines : 340


*/

//camera transition parameter
private var TransitionTime : float = 10.0f ;

//signals allowing the transition 2D3D and ending
private var enable:boolean = false;
private var enableEnding:boolean = false;
private var done:boolean = false;
private var done2:boolean = false;
private var done3:boolean = false;
private var lightFlag:boolean = false;
//to access accelerometer
private var control:CameraControl;

private var zoom: Zoom;

private var Videos:videoSettings;

private var rot;
private var scene2D : boolean = true;

/* Coordinates of the 2D/3D button */
private var buttonUp : int = Screen.height * 0.85;
private var buttonLeft : int = Screen.width * 0.05;
private var buttonHeight : int = Screen.height * 0.12;
private var buttonWidth : int = Screen.height * 0.12;
private var exitFinished: boolean = true;

// CallBacks appelés lors d'un changement de vue
private var OnBeginTrans : Array ;
private var OnEndTrans : Array ;

// champ de vision de la cam en 2D et en 3D
private var fieldOfView2D : float ;
private var fieldOfView3D : float ;

private var letterStyle : GUIStyle; // style of text
private var letterStyleButton : GUIStyle; // style of the text in the button

//instantiate items
function init(fieldOfView_2D : float , fieldOfView_3D : float ){
	
	control = gameObject.GetComponent("CameraControl");
	if (!control)	
		control = gameObject.AddComponent("CameraControl");
	
	zoom = gameObject.GetComponent("Zoom");
	if (!zoom)	
		zoom = gameObject.AddComponent("Zoom");
	Videos = gameObject.GetComponent("videoSettings") as videoSettings;
	
	control.enabled = false ;
	
	scene2D = Videos.GetFirstView();
	
	fieldOfView2D = fieldOfView_2D ;
	fieldOfView3D = fieldOfView_3D ;
	
	letterStyle = new GUIStyle();
	letterStyle.fixedHeight = Screen.height / 30; // Recopié salement de text.js
	letterStyle.fixedWidth = Screen.width / 125; // pareil
	letterStyle.normal.textColor = Color.white;
	if (isOnIpad())
		letterStyle.fontSize = 27; // Default: 13
	
	letterStyleButton = new GUIStyle (letterStyle);
	letterStyleButton.alignment = TextAnchor.MiddleCenter;

	
	// Initialisation des Callback
	OnBeginTrans = new Array();
	OnEndTrans = new Array();
}

// update the transitions statements
public function UpdateTrans() {
	Update2D3D();
	Update3D2D();
	UpdateEnding();
}



//setter for enable at the end of the video, called in videosettings
function endingEnable(){
	enableEnding=true;
}


/*
* button switcher interface 2D/3D and directions
*/

function  OnGUI2D3D(){

	if(Videos.OnPlay() && !enable && exitFinished){
	
		var Rectangle : Rect = new Rect(Screen.width * 0.8 , Screen.height * 0.9, camera.pixelWidth , camera.pixelHeight);	
		GUI.Label(Rectangle,"Click anywhere on the screen \n   to get further information.", letterStyle);
		
		if(Videos.GetOtherView()){		
 	 		if (GUI.Button(new Rect(buttonLeft, buttonUp, buttonWidth, buttonHeight), " ")) {
				zoom.disableEvents();
				Change2D3D();
				//Videos.test();
				}
			GUI.Label(new Rect(buttonLeft + 0.5 * buttonWidth - 0.5 * letterStyleButton.fixedWidth, buttonUp + 0.5 * buttonHeight - 0.5 * letterStyleButton.fixedHeight, buttonWidth, buttonHeight), scene2D ? "3D View" : "2D View", letterStyleButton );
		}	
    }
        
}

/*
* Tests if pos is inside the 2D / 3D button 
*/
function isInButton (pos : Vector2) {
	return ( pos.x > buttonLeft && pos.x < buttonLeft + buttonWidth && pos.y > Screen.height - buttonUp - buttonHeight && pos.y < Screen.height - buttonUp);
}

/*
* reset camera parameters on switching 2D/3D
*/
function Change2D3D(){

	end=false;
	cameraTransition();
	switchScene();
	

} 



/**
* Camera switch 2D/3D
*/
function cameraTransition(){

	if(scene2D){

		rot= camera.transform.eulerAngles;
		lightFlag=false;
		enable=true;
		done=false;
		next=false;
		done2=false;
		done3=false;
		
		
	}
	else{
		rot= Vector3(270,180,0);
		camera.transform.eulerAngles=Vector3(0,0,0);
		enable=true;
		done=false;
		next=false;
		done2=false;
		done3=false;
		lightFlag=false;
		
		light.type=LightType.Point;
		light.cookie=null;
		
	}
	
	Console.Info('Début de la transition 2D-3D');
	// Appel des callbacks
	for( var j = 0; j < OnBeginTrans.length; j++){
		(OnBeginTrans[j] as function( boolean ) )( scene2D ) ;
	}
	
}


private var next:boolean = false;
private var end:boolean =false;

//called at everyframe, function generating transition
function Update2D3D(){

	if (!enable)
		return ;

	control.DetachGyro();
	
	//decrease light intensity
	if(!scene2D && !lightFlag){
	
		light.intensity-=0.02;
		if(light.intensity <= 0.04)lightFlag=true;
	}
	//load the pshere and reincrease light
	if(!scene2D && !done && lightFlag){
		camera.fieldOfView = fieldOfView3D ;
		Videos.changeSettings(true);
		camera.transform.eulerAngles=Vector3(270,0,0);
		if(light.intensity <= 0.88)light.intensity+=0.02;
		camera.transform.position.y += 1/TransitionTime;
		if(camera.transform.position.y >= 0.7 )  {done = true; next=true;}
	}
	if(!scene2D && next && done){

		camera.transform.Rotate(Vector3(10,0,0)/TransitionTime);
		if(camera.transform.eulerAngles.x >= 358 ){
			enable=false;
			
			(gameObject.GetComponent("Main") as Main).enableMouseLook();
			
			control.AttachGyro();
			zoom.enableEvents();
			
			Console.Info('Fin de la transition 2D->3D');
			// Appel des callbacks
			for( var j = 0; j < OnEndTrans.length; j++){
				(OnEndTrans[j] as function( boolean ) )( scene2D ) ;
			}
		}
	}
	
}


function Update3D2D(){

	if (!enable)
		return ;

	control.DetachGyro();

	//decrease light intensity
	if(scene2D && !done){
		light.intensity-=0.02;
		camera.transform.Rotate(Vector3(-10,0,0)/TransitionTime);
		if(camera.transform.eulerAngles.x <= 270 )  {done = true;}
	}
	
	if(scene2D && !done2){
	
		camera.transform.Rotate(Vector3(0,10,0)/TransitionTime);
		
		if(camera.transform.eulerAngles.x >= 180 )  {done2 = true; next=true;}
	
	}
	//load the plane 
	if(scene2D && next ){
		camera.fieldOfView = fieldOfView2D ;
		
		if(camera.transform.position.y >= -10)camera.transform.position.y -= 1/TransitionTime;
		else{done3=true;
		camera.transform.eulerAngles=rot;	
		Videos.changeSettings(false);	
		}	
		
	}
	//reincrease light
	if(scene2D && done3){
		if(light.intensity <= 0.88)light.intensity+=0.02;
		else {
			enable=false;
			zoom.enableEvents();
			
			Console.Info('Fin de la transition 2D<-3D');
			// Appel des callbacks
			for( var j = 0; j < OnEndTrans.length; j++){
				(OnEndTrans[j] as function( boolean ) )( scene2D ) ;
			}
		}
	
	}

}


function UpdateEnding(){

	Videos.effectsOnEnd();

	if (!enableEnding)
		return ;
				
	if(!end && !lightFlag){
	
		light.intensity-=0.02;
		if(light.intensity <= 0.04)lightFlag=true;
	}
	
	if(!end && lightFlag){	
		light.intensity+=0.02;
		if(light.intensity >= 0.88){enableEnding=false;end=true;zoom.enableEvents();Videos.EndFlagOff();}
	}
}

//called in Transition2D3D
function switchScene(){
	scene2D=!scene2D;
}

//getter for other functions in other scripts
function isScene2D(){
	return scene2D;
}

//called in DeZoom state
function flagExit(){
	exitFinished=!exitFinished;
	return exitFinished;

}

static function isOnIpad() : boolean {
	return ( SystemInfo.deviceType == DeviceType.Handheld );
}

// decrease light
function fonduDown(){
	
	if(light.intensity <= 0.04)return;
	else light.intensity-=0.02;
}

//increase light
function fonduUp(){
	
	if(light.intensity >= 0.88)return;
	else light.intensity+=0.02;
}

/**
 * Setter de Callback
 */

function AddOnBeginTrans ( f : function( boolean ) ) {
	OnBeginTrans.push(f);
}
function AddOnEndTrans ( f : function( boolean ) ) {
	OnEndTrans.push(f);
}
