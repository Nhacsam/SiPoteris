#pragma strict

/* 
* script setting de paramters of the videos and initiate the 2D and 3D scenes


number of lines : 430
*/


//ref to the screen 2D
private var plane2D : GameObject;
//ref to the sphere 3D
private var sphere3D:GameObject;
private var sphere3D_pos : Vector3;
//tells if the buttons are to be displayed or not to the Transition 2D3D when we go in full screen interface
private var button:boolean = true;
//ref to the script
private var Trans:Transition2D3D;

//controlers for the plugin video
private var controllerIOS:ForwardiOSMessages;
private var controllerScene2D3D:SceneController;
private var controllerScene2:SceneController;
private var MovieController2:GameObject;
private var MovieController:GameObject;
private var iOS : GameObject;
// parameters for the final transition

/*
private var rotInit;
private var startRotation;
private var endRotation;
private var rate = 0.7;
private var t = 0.0;
*/

/*
*	parameters to chose which scene you want to see first
*	and if you want to disable the other view.
*/
private var firstView2D:boolean = true;
private var otherView:boolean = true;


/*
* functions.
*/

function OnPlay(){

	return button;

}


/*
*function to set the parameters of the 2D scene
*/
function videoSettings (beginBy2D : boolean, have2DAnd3D : boolean) {
	
	firstView2D = beginBy2D ;
	otherView = have2DAnd3D ;
	

	Trans = gameObject.GetComponent("Transition2D3D") as Transition2D3D;
	//instantiate plugin
	iOS = new GameObject(); 
	iOS.transform.position= Vector3(10,0,0);
	iOS.name="iOS";
	iOS.AddComponent("ForwardiOSMessages");
 	
	controllerIOS = iOS.GetComponent("ForwardiOSMessages");
	controllerIOS.movie = new PlayHardwareMovieClassPro[2]; 
	
	MovieController = new GameObject(); 
	MovieController.transform.position= Vector3(10,0,0);
	MovieController.name="MovieController";
	MovieController.AddComponent("SceneController");       
	
	controllerScene2D3D = MovieController.GetComponent("SceneController");      
	controllerScene2D3D.movieClass = new PlayHardwareMovieClassPro[1];
	controllerScene2D3D.movieName = new  String[1];
	controllerScene2D3D.seekTime = new float[1];
	
	
	
	//set camera and scene(s)
	var rot:Quaternion=Quaternion.identity;	
	if(firstView2D){
		camera.transform.position=Vector3(0,-10,0);
		camera.transform.Rotate(Vector3(270,180,0));
		generateScene2D();		
		//set the scene
		plane2D.AddComponent("PlayFileBasedMovieDefault");
		controllerScene2D3D.movieClass[0] =  plane2D.GetComponent("PlayFileBasedMovieDefault");
		controllerScene2D3D.movieClass[0].movieIndex = 0;
		controllerScene2D3D.movieName[0] ="finalv3.mov";
		//set iOS forwarding
		controllerIOS.movie[0]=plane2D.GetComponent("PlayFileBasedMovieDefault");		
		if(otherView){
			generateScene3D();
			/*
			var parentTransform = sphere3D.transform;
			parentTransform.parent = sphere3D.transform; 	    
			parentTransform = plane2D.transform;    	    
			parentTransform.parent = sphere3D.transform;
			*/
			sphere3D.renderer.enabled = false;
		}
	
	}
	else{
		camera.transform.position=Vector3(0,0.7,0);
		camera.transform.Rotate(Vector3(270,180,0));
		generateScene3D();
		//set the scene
		sphere3D.AddComponent("PlayFileBasedMovieDefault");
		controllerScene2D3D.movieClass[0] =  sphere3D.GetComponent("PlayFileBasedMovieDefault");
		controllerScene2D3D.movieClass[0].movieIndex = 0;
		controllerScene2D3D.movieName[0] ="finalv3.mov";
		//set iOS forwarding
		controllerIOS.movie[0]=sphere3D.GetComponent("PlayFileBasedMovieDefault");
		if(otherView){
			generateScene2D();	
			/*
			var parentTransform = sphere3D.transform;
			parentTransform.parent = sphere3D.transform; 	    
			parentTransform = plane2D.transform;    	    
			parentTransform.parent = sphere3D.transform;
			*/
			plane2D.renderer.enabled= false; 
		}
	}
   
		
	if(!plane2D)return null;
	else return plane2D;
}

/*
* create 2D plane
*/

function generateScene2D(){

	plane2D = GameObject.CreatePrimitive(PrimitiveType.Plane);
    plane2D.transform.localScale=Vector3(1.1,1.1,1.1);
    plane2D.name = "screen";
    plane2D.transform.Rotate(Vector3(0,0,180));
    plane2D.transform.position = Vector3(0,0,0);
  	plane2D.renderer.material = Resources.Load("movieMat/MovieTexture");
  
	Destroy(plane2D.collider);
	/*
	rotInit=plane2D.transform.rotation;
	startRotation = plane2D.transform.rotation;
	endRotation = plane2D.transform.rotation * Quaternion.Euler(180,0,0);
	*/

}
/*
* create 3D sphere
*/
function generateScene3D(){

	var rot:Quaternion=Quaternion.identity;
	sphere3D_pos = Vector3(0,2,0);
	//load .fbx sphere on scene
	sphere3D=Instantiate(Resources.Load("blenderImports/lastv2"),sphere3D_pos,rot);
	Destroy(sphere3D.GetComponent("Animator"));
	//set it at the right position
	sphere3D.transform.Rotate(-90,310,0);
	sphere3D.transform.localScale = Vector3(1000,1000,1000);
	sphere3D.renderer.material = Resources.Load("movieMat/MovieTexture");
	//sphere3D.renderer.material.mainTexture = Resources.Load("test");
}



//called in Transition2D3D
function changeSettings(b:boolean){

	plane2D.renderer.enabled =!b;
	sphere3D.renderer.enabled = b;
}



/*
* Pause video while interface 
*/

function videoHDZoomON (plane : GameObject){


	button=false;
	var controllerMovie:PlayFileBasedMovieDefault;	
	//pause movie
	if(firstView2D)
	controllerMovie=plane2D.GetComponent("PlayFileBasedMovieDefault");
	else controllerMovie=sphere3D.GetComponent("PlayFileBasedMovieDefault");
	controllerMovie.PauseMovie ();

}

/*
* Resume video when leaving interface 
*/

function videoHDZoomQuit(plane : GameObject){

	var controllerMovie:PlayFileBasedMovieDefault;
	//resume movie
	if(firstView2D)
	controllerMovie=plane2D.GetComponent("PlayFileBasedMovieDefault");
	else controllerMovie=sphere3D.GetComponent("PlayFileBasedMovieDefault");
	controllerMovie.ResumeMovie ();
	
	button=true;
}


/*
* Set the parameters for the video (see the plug to know how to do it), here the video is supposed to be in the format .mov
*/
function putVideo( focus: GameObject, nom : String, sound: boolean){

	if(!iOS){
	iOS = new GameObject(); 
	iOS.transform.position= Vector3(10,0,0);
	iOS.name="iOS";
	iOS.AddComponent("ForwardiOSMessages");
	controllerIOS = iOS.GetComponent("ForwardiOSMessages");
	controllerIOS.movie = new PlayHardwareMovieClassPro[2]; 
	}
	controllerIOS = iOS.GetComponent("ForwardiOSMessages");
	
	if(!MovieController2){
	MovieController2 = new GameObject(); 
	MovieController2.transform.position= Vector3(10,0,0);
	MovieController2.name = "MovieControllerBis";
	MovieController2.AddComponent("SceneController");          
	}
	controllerScene2 = MovieController2.GetComponent("SceneController");
	
	if(!controllerScene2.movieClass){
	controllerScene2.movieClass = new PlayHardwareMovieClassPro[1];
	controllerScene2.movieName = new  String[1];
	controllerScene2.seekTime = new float[1];
	}
	
	if(!focus.GetComponent("PlayFileBasedMovieDefault"))focus.AddComponent("PlayFileBasedMovieDefault");
  	focus.renderer.material = Resources.Load("movieMat/Movie3");
	controllerIOS.movie[1] = focus.GetComponent("PlayFileBasedMovieDefault"); 
	var temp: PlayFileBasedMovieDefault =  focus.GetComponent("PlayFileBasedMovieDefault");
	temp.enabled = true;  
	controllerScene2.movieClass[0] =  focus.GetComponent("PlayFileBasedMovieDefault");
	controllerScene2.movieClass[0].movieIndex = 1;
	controllerScene2.movieName[0] = nom + ".mov";

	controllerScene2.movieClass[0].PlayMovie(nom +".mov",sound);

	return true;
	
}

function creditsVideo( focus: GameObject, nom : String, sound: boolean){

	if(!iOS){
	iOS = new GameObject(); 
	iOS.transform.position= Vector3(10,0,0);
	iOS.name="iOS";
	iOS.AddComponent("ForwardiOSMessages");
	controllerIOS = iOS.GetComponent("ForwardiOSMessages");
	controllerIOS.movie = new PlayHardwareMovieClassPro[2]; 
	}
	controllerIOS = iOS.GetComponent("ForwardiOSMessages");
	
	if(!MovieController2){
	MovieController2 = new GameObject(); 
	MovieController2.transform.position= Vector3(10,0,0);
	MovieController2.name = "MovieControllerBis";
	MovieController2.AddComponent("SceneController");          
	}
	controllerScene2 = MovieController2.GetComponent("SceneController");
	
	if(!controllerScene2.movieClass){
	controllerScene2.movieClass = new PlayHardwareMovieClassPro[1];
	controllerScene2.movieName = new  String[1];
	controllerScene2.seekTime = new float[1];
	}
	
	if(!focus.GetComponent("PlayFileBasedMovieDefault"))focus.AddComponent("PlayFileBasedMovieDefault");
  	focus.renderer.material = Resources.Load("movieMat/Movie2");
	controllerIOS.movie[1] = focus.GetComponent("PlayFileBasedMovieDefault"); 
	var temp: PlayFileBasedMovieDefault =  focus.GetComponent("PlayFileBasedMovieDefault");
	controllerScene2.movieClass[0] =  focus.GetComponent("PlayFileBasedMovieDefault");
	controllerScene2.movieClass[0].movieIndex = 1;
	controllerScene2.movieName[0] = nom + ".mov";

	controllerScene2.movieClass[0].PlayMovie(nom +".mov",sound);

	return true;
	
}

/*
* To stop the video put with putvideo (also release memory)
*/
function stopVideo(focus: GameObject){
	
	if(focus!= null && focus.GetComponent("PlayFileBasedMovieDefault")){
	var temp:PlayFileBasedMovieDefault = focus.GetComponent("PlayFileBasedMovieDefault");
	controllerScene2.movieClass[0] =  focus.GetComponent("PlayFileBasedMovieDefault");
	controllerScene2.movieClass[0].StopMovie();
	focus.renderer.enabled = false;
	controllerScene2.movieClass[0].videoShutter();
	}
	/*
	{
	controllerScene2.movieClass[0] = focus.GetComponent("PlayFileBasedMovieDefault");
	controllerScene2.movieClass[0].StopMovie();
	//controllerScene2.movieClass[0].moviePlaying();
	Destroy(focus.GetComponent("PlayFileBasedMovieDefault"));
	}*/

	

}

/*
* return a flag to know the video has finished
*/
function getFlagEndVideo(){
	var controllerScene:SceneController;
	controllerScene = MovieController.GetComponent("SceneController");
	return controllerScene.movieClass[0].isMovieFinished();
	//Trans.endingEnable();
	//return true;
}

function EndFlagOff(){

	var controllerScene:SceneController;
	controllerScene = MovieController.GetComponent("SceneController");
	controllerScene.movieClass[0].moviePlaying();
}

/*
* fonction de test de chargement d'une nouvelle video
*/
/*
private var planetest:GameObject;

function test(){
	if(!planetest){
	planetest=GameObject.CreatePrimitive(PrimitiveType.Plane);
	planetest.transform.eulerAngles=Vector3(180,0,0);
	planetest.transform.position=Vector3(2,-2,0);
	planetest.name= "planetest";}
	putVideo( planetest , "Diane1");

}*/


//revoi largeur et hauteur de la video
public function VideoWH() : Vector2 {
	var controllerScene:SceneController;
	controllerScene = MovieController2.GetComponent("SceneController");
	return controllerScene.movieClass[0].movieWH();

}


//active l'ending
function effectsOnEnd(){

	if(getFlagEndVideo()){
	
		Trans.endingEnable();
		if(light.type!=LightType.Point){
		light.type=LightType.Point;
		light.cookie=null;
		}
	}

}

/*
* alternative ending effect
*/

/*
function endTransition(){

	t += Time.deltaTime * rate;
	plane2D.transform.rotation = Quaternion.Slerp(startRotation, endRotation, t);

	if(t >= 1.0) {
		
		if( startRotation == rotInit ) {
		
			t = 0;
			startRotation = plane2D.transform.rotation ;
			endRotation = plane2D.transform.rotation * Quaternion.Euler(180,0,0);
			return false ;
		}
		
		return true;
	}

	return false;
}*/

/*
 * get sphere3D_pos
*/
function getSpherePos() : Vector3{
	return sphere3D_pos;
}

function GetOtherView(){

	return otherView;

}

function GetFirstView(){

	return firstView2D;
}

function isVideoReady(){

	return controllerScene2.movieClass[0].videoIsReady();
}
