#pragma strict



private var MovieController:GameObject;
private var iOS:GameObject;
private var scene2D:boolean;
//ref to the screen 2D
private var plane2D = GameObject.CreatePrimitive(PrimitiveType.Plane);
//ref to the sphere 3D
private var sphere3D:GameObject;

//to access accelerometer
private var control:CameraControl;
private var button:boolean=true;


function OnPlay(){

	return button;

}


//function to set the parameters of the 2D scene
function videoSettings () {

	control = gameObject.AddComponent("CameraControl");
	control.enabled=false;
	//instantiate
	iOS = new GameObject(); 
	iOS.name="iOS";
	iOS.AddComponent("ForwardiOSMessages");
 	var controllerIOS:ForwardiOSMessages;
	controllerIOS = iOS.GetComponent("ForwardiOSMessages");
	controllerIOS.movie = new PlayHardwareMovieClassPro[2]; 
	
	MovieController = new GameObject(); 
	MovieController.name="MovieController";
	MovieController.AddComponent("SceneController");       
	var controllerScene:SceneController;
	controllerScene = MovieController.GetComponent("SceneController");      
	controllerScene.movieClass = new PlayHardwareMovieClassPro[2];
	controllerScene.movieName = new  String[2];
	controllerScene.seekTime = new float[2];
	
	
	scene2D=true;
	//set camera
	var rot:Quaternion=Quaternion.identity;	
	
	this.transform.position=Vector3(0,-10,0);
	this.transform.Rotate(Vector3(270,180,0));

	//generate the 2 scenes
	generateScene2D();
	generateScene3D();	
	     
	//set iOS forwarding
	controllerIOS.movie[0]=plane2D.GetComponent("PlayFileBasedMovieDefault");
	     
	//set the scene
	controllerScene.movieClass[0] =  plane2D.GetComponent("PlayFileBasedMovieDefault");
	controllerScene.movieClass[0].movieIndex=0;
	controllerScene.movieName[0] ="SIPO_full.mov";
		
	var parentTransform = sphere3D.transform;
	parentTransform.parent = sphere3D.transform; 	    
	parentTransform = plane2D.transform;    	    
	parentTransform.parent = sphere3D.transform;
	
	sphere3D.renderer.enabled = false;

	
	return plane2D;
}

function generateScene2D(){

    plane2D.transform.localScale=Vector3(1.1,1.1,1.1);
    plane2D.name="screen";
    plane2D.transform.Rotate(Vector3(180,180,0));
    plane2D.transform.position = Vector3(0,0,0);
    plane2D.AddComponent("PlayFileBasedMovieDefault");
  	plane2D.renderer.material = Resources.Load("MovieHD");
  	plane2D.renderer.material.mainTexture= Resources.Load("final4k");
  
        




}

function generateScene3D(){

	var rot:Quaternion=Quaternion.identity;
	//load .fbx sphere on scene
	sphere3D=Instantiate(Resources.Load("NewSphere"),Vector3(0,1,0),rot);
	//set it at the right position
	sphere3D.transform.Rotate(-90,0,0);
	sphere3D.transform.localScale=Vector3(500,500,500);
	sphere3D.renderer.material = Resources.Load("MovieHD");
	
}


function  OnGUI(){



if(button){


if(!button)	GUI.Label(Rect(Screen.width/4 +70 , Screen.height-33, camera.pixelWidth , camera.pixelHeight),"Click anywhere on the plane to get further information.");

  	if (GUI.Button(new Rect(0, 0, 100, 100), scene2D ? "3D view" : "2D view" ))
  		 {
				Change2D3D();   
  		  }
    
    }
        
}



function videoHDZoomON (plane : GameObject){


	button=false;
	var controllerMovie:PlayFileBasedMovieDefault;	
	//pause movie
	controllerMovie=plane2D.GetComponent("PlayFileBasedMovieDefault");
	controllerMovie.PauseMovie ();

}



function videoHDZoomQuit(plane : GameObject){

	var controllerMovie:PlayFileBasedMovieDefault;
	//resume movie
	controllerMovie=plane2D.GetComponent("PlayFileBasedMovieDefault");
	controllerMovie.ResumeMovie ();
	button=true;
	light.type=LightType.Point;
	light.range=70;
	light.intensity=0.88;
	
}



function Change2D3D(){

	
	if(scene2D){	
	plane2D.renderer.enabled=false;
	sphere3D.renderer.enabled=true;
	cameraTransition();

	control.enabled=true;
 	
	}
	else{
	control.enabled=false;
	sphere3D.renderer.enabled=false;
	plane2D.renderer.enabled=true;
	cameraTransition();

	}

	scene2D=!scene2D;

} 


/**
* Camera switch 2D/3D
*/
function cameraTransition(){

	if(scene2D){
	var pos= camera.transform.rotation;
	this.transform.position=Vector3(0,0,0);
	this.transform.Rotate(Vector3(0,0,0));
	
	//light
	light.type=LightType.Spot;
	light.range=70;
	light.intensity=0.88;
	light.cookie=Resources.Load("camMask");
	light.spotAngle=50;
	//gameObject.AddComponent("MouseLook");
	}
	
	else{
	light.type=LightType.Point;
	light.cookie=null;
	//Destroy(gameObject.GetComponent("MouseLook"));
	this.transform.position=Vector3(0,-10,0);
	camera.transform.rotation = pos;
	this.transform.Rotate(Vector3(270,180,0));
	}
	
}

function putVideo( focus: GameObject, nom : String){

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

function stopVideo(focus: GameObject){

	var controllerMovie:PlayFileBasedMovieDefault;
	controllerMovie=focus.GetComponent("PlayFileBasedMovieDefault");
	controllerMovie.StopMovie ();

}


function getFlagEndVideo(){
	var controllerScene:SceneController;
	controllerScene = MovieController.GetComponent("SceneController");  
	return controllerScene.movieClass[0].movieFinished;
	
}