#pragma strict

var Text : String = 'Nothing' ;


private var enable : boolean = true;


// CallBacks
private var OnZoom : Array ;
private var OnEndZoom : Array ;
private var OnLeave : Array ;


private var enableLook : function(boolean);

// Liste des Elements cliquables
private var Videos2D : Array ;
private var Videos3D : Array ;

// Mouse look
private var wasMouseLookEnable : boolean ;
private var wasCameraControlEnable : boolean ;


// Machine d'état
enum ZOOM_STATES {ONSPHERE, ONZOOM, ONVIDEO, ONDEZOOM};
private var stateMachine : ZOOM_STATES ;

// élément sélectionné
private var selected : GameObject ;


// paramètre du zoom
private var CameraInitialPos : Vector3 ;
private var CameraInitialRot : Vector3 ;

private var TransitionTime : float = 1.0f ;
private var beginTime : float = 0.0f ;


private var finalPos : Vector3 ;
private var finalRot : Vector3 ;

private var Trans :Transition2D3D;
private var control : CameraControl;
private var mouseLook: MouseLook;

/*
 * Ajoute les listener d'envenements
 */

function OnEnable(){
	Gesture.onShortTapE += OnTap;
	Gesture.onLongTapE += OnTap;
	Gesture.onDoubleTapE += OnTap;
}

function OnDisable(){
	Gesture.onShortTapE -= OnTap;
	Gesture.onLongTapE -= OnTap;
	Gesture.onDoubleTapE -= OnTap;
}




/*
 * Initialise le Module (constructeur)
 */

function Init( VideosMeshes2D : Array, VideosMeshes3D : Array, enableMouseLook : function(boolean) ) {
	
	Videos2D = VideosMeshes2D ;
	Videos3D = VideosMeshes3D ;
	
	OnZoom = new Array() ;
	OnEndZoom = new Array() ;
	OnLeave = new Array() ;	
	
	Trans = gameObject.GetComponent("Transition2D3D");
	if (!Trans)
		Trans = gameObject.AddComponent("Transition2D3D");
		
	mouseLook = gameObject.GetComponent("MouseLook");
	if (!mouseLook)	
		mouseLook = gameObject.AddComponent("MouseLook");
	
	control = gameObject.GetComponent("CameraControl");
	if (!control)	
		control = gameObject.AddComponent("CameraControl");

	control.enabled = false;
	
	CameraInitialPos = camera.transform.position ;
	
	enableLook = enableMouseLook ;
	
	toOnSphere() ;
	
	enableZoom();
	
}
 


/*
 * Setter de Callback
 */

function AddOnZoom ( f : function( GameObject ) ) {
	OnZoom.push(f);
}
function AddOnEndZoom ( f : function( GameObject ) ) {
	OnEndZoom.push(f);
}
function AddOnLeave ( f : function(GameObject) ) {
	OnLeave.push(f);
}


/*
 * Ennable, Disable
 */

function enableZoom() {
	enable = true ;
}

function disableZoom() {
	enable = false ;
}



/*
 * Gestion des Evenements
 */


function OnTap(mousePos : Vector2) {
	
	if( stateMachine == ZOOM_STATES.ONSPHERE ) {
		// Détecte l'objet cliqué
		for ( var i = 0; i < (Trans.isScene2D() ? Videos2D.length : Videos3D.length) ; i++ ) {
			var ray : Ray = camera.ScreenPointToRay(mousePos);
			var hit : RaycastHit = new RaycastHit() ;
			
			var Video : GameObject = Trans.isScene2D() ? Videos2D[i] : Videos3D[i] ;
			if( Video.collider.Raycast(ray, hit, 1000.0f) ) {
				toOnZoom(Video);
				break ;
			} // if
		} // for
		
		
	} // if
	
}

/*
 * Effectue les changements d'état de la machine
 */

function toOnZoom( obj : GameObject ) {
	
	if( stateMachine != ZOOM_STATES.ONSPHERE )
		Debug.LogError( 'State Machine Error : Must zoom from ONSPHERE state' );
	else {
		
		for( var j = 0; j < OnZoom.length; j++){
			(OnZoom[j] as function( GameObject ) )( obj ) ;
			
		}
		
		stateMachine = ZOOM_STATES.ONZOOM ;
		selected = obj ;
			
		enableLook(false);
		control.enabled = false;

	
		CameraInitialPos = camera.transform.position ;
		CameraInitialRot = camera.transform.eulerAngles ;
		beginTime = Time.time;
		
		ComputeFinalPos();
		ComputeFinalRot();
		
		
		
		
	}
}


function toOnVideo() {
	
	stateMachine = ZOOM_STATES.ONVIDEO ;
	
	for( var j = 0; j < OnEndZoom.length; j++){
		(OnEndZoom[j] as function( GameObject ) )( selected ) ;
	}
	
}


function toOnDeZoom() {
	
	stateMachine = ZOOM_STATES.ONDEZOOM ;
	
	
	
	for( var j = 0; j < OnLeave.length; j++){
		(OnLeave[j] as function(GameObject) )( selected ) ;
	}
	
	finalPos = CameraInitialPos ;
	finalRot = CameraInitialRot ;
	
	CameraInitialPos = camera.transform.position ;
	CameraInitialRot = camera.transform.eulerAngles ;

	beginTime = Time.time ;
	
}


function toOnSphere () {
	
	stateMachine = ZOOM_STATES.ONSPHERE ;
	
	//enableLook(true);

	
}

/*
 * Calcule les position et rotation finales optimales de la caméra
 * lors d'un zoom sur une structure
 */
function ComputeFinalPos()  {
	if (Trans.isScene2D())
		ComputeFinalPos2D();
	else
		ComputeFinalPos3D();
}

function ComputeFinalPos2D() {
	finalPos = Vector3 (0,5,0);
}

function ComputeFinalPos3D()  {
	
	
	var Pos = camera.transform.position;
	var Rot = camera.transform.rotation;
	
	camera.transform.LookAt(selected.transform);
	camera.fieldOfView=80;
	
	var CameraInitialDecal = 20 ;
	
	var axe = camera.transform.position - selected.transform.position ;
	var normal : Vector3 = axe.normalized ;                 
	
	var rect = camera.pixelRect ;
	var top : Vector2 = new Vector2( 	rect.xMin + (rect.xMax - rect.xMin) / 2 , rect.yMin ) ;
	var left : Vector2 = new Vector2( 	rect.xMin 								, rect.yMin + (rect.yMax - rect.yMin) / 2 ) ;
	
	
	
	var hit : RaycastHit = new RaycastHit() ;
	var i : float = 0 ;
	
	do {
		
		finalPos = selected.transform.position + (CameraInitialDecal - i )*normal ;
		camera.transform.position = finalPos ;
		
		i += 0.1 ;
		
		
	} while( 	!( 		selected.collider.Raycast( camera.ScreenPointToRay(top	) , hit, 1000.0f) ||
				 		selected.collider.Raycast( camera.ScreenPointToRay(left) , hit, 1000.0f) )
				&& i <= CameraInitialDecal ) ;
	
	
	camera.transform.position = Pos ;
	camera.transform.rotation = Rot ;
	
	
}

function ComputeFinalRot()  {
	if (Trans.isScene2D())
		ComputeFinalRot2D();
	else
		ComputeFinalRot3D();
}

function ComputeFinalRot2D() {
	finalRot = camera.transform.eulerAngles + Vector3 (0,180,0);

}


function ComputeFinalRot3D() {
	
	var Rot : Vector3 = camera.transform.eulerAngles ;
	
	camera.transform.LookAt(selected.transform);
	finalRot = camera.transform.eulerAngles;
	
	camera.transform.eulerAngles = Rot ;
}


/*
 * Effectue une étape du ZOOM
 */
function UpdateZoomStep () {
	
	var elapsedTime = Time.time - beginTime ;
	
	camera.transform.position = CameraInitialPos + (finalPos - CameraInitialPos)*elapsedTime/TransitionTime ;
				
				
	var Diff = ( finalRot - CameraInitialRot ) ;
				
	Diff.x = (Diff.x < -180) ? Diff.x + 360 : Diff.x ;
	Diff.y = (Diff.y < -180) ? Diff.y + 360 : Diff.y ;
	Diff.z = (Diff.z < -180) ? Diff.z + 360 : Diff.z ;
	
	Diff.x = (Diff.x > 180) ? Diff.x - 360 : Diff.x ;
	Diff.y = (Diff.y > 180) ? Diff.y - 360 : Diff.y ;
	Diff.z = (Diff.z > 180) ? Diff.z - 360 : Diff.z ;
				
	camera.transform.eulerAngles = CameraInitialRot + Diff*elapsedTime/TransitionTime ;
	
}




/*
 * Boutton return en full screen video
 */

function OnGUIZoom () {
}


/*
 * Mets à jours les calcul liés au zoom
 */


function UpDateZoom () {
	
	
	if( Input.GetMouseButtonDown(0) )
		OnTap(Input.mousePosition);
	
	if (!enable)
		return ;
	
	switch( stateMachine ) {
		
		
		case ZOOM_STATES.ONZOOM :
			
			if( camera.transform.position == finalPos ) {
				camera.transform.LookAt(selected.transform);
				toOnVideo();
				
			} else if ( Time.time > (beginTime + TransitionTime) ){
				
				camera.transform.position = finalPos ;
				camera.transform.LookAt(selected.transform);
				toOnVideo();
				
			} else {
				
				UpdateZoomStep();
			}
			
		break;
	
	
		case ZOOM_STATES.ONDEZOOM :
			
			if( camera.transform.position == finalPos ) {
				camera.transform.eulerAngles = finalRot ;
				
				toOnSphere();
				
			} else if ( Time.time > (beginTime + TransitionTime) ){
				
				camera.transform.position = finalPos ;
				camera.transform.eulerAngles = finalRot ;
				
				toOnSphere();
				
			} else {
				
				UpdateZoomStep();
			}
			
		break;
	}
	
}
