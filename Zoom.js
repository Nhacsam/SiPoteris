#pragma strict

// CallBacks
private var OnZoom : Array ;
private var OnEndZoom : Array ;
private var OnLeave : Array ;
private var OnEndDezoom : Array ;

private var enableLook : function(boolean);

// Liste des Elements cliquables
private var Videos2D : Array ;
private var Videos3D : Array ;


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

private var dezooming: boolean = false;



private var eventEnable : boolean ;





/****************************************
 **** Communication avec l'exterieur ****
 ****************************************/

/*
 * Initialise le Module (constructeur)
 */
function Init( VideosMeshes2D : Array, VideosMeshes3D : Array, enableMouseLook : function(boolean) ) {
	
	// Enregistrment des plans cliquables
	Videos2D = VideosMeshes2D ;
	Videos3D = VideosMeshes3D ;
	
	// initialisation des tableaux de callback
	OnZoom = new Array() ;
	OnEndZoom = new Array() ;
	OnLeave = new Array() ;
	OnEndDezoom = new Array() ;
	
	// Récupération du composant de transition 2D3D
	Trans = gameObject.GetComponent("Transition2D3D");
	if (!Trans)
		Trans = gameObject.AddComponent("Transition2D3D");
	
	// savegarde de la position de la caméra
	CameraInitialPos = camera.transform.position ;
	
	// savegarde du callback pour l'activation / desactivation du mouselook
	enableLook = enableMouseLook ;
	
	// On initialise la machine d'état en dehors de
	// la GUI et on active les événemments
	toOnSphere() ;
	enableEvents();
	
}


/*
 * Mets à jours les calcul liés au zoom
 */
function UpDateZoom () {
	
	switch( stateMachine ) {
	
		// Si on est en train de zoomer
		case ZOOM_STATES.ONZOOM :
			
			// Conditions d'arrets
			if( camera.transform.position == finalPos ) {
				camera.transform.LookAt(selected.transform);
				toOnVideo();
				
			} else if ( Time.time > (beginTime + TransitionTime) ){
				camera.transform.position = finalPos ;
				camera.transform.LookAt(selected.transform);
				toOnVideo();
				
			} else {
				// Maj des positions
				UpdateZoomStep();
			}
			
		break;
	
		// Si on est en train de dezoomer
		case ZOOM_STATES.ONDEZOOM :
			
			// Conditions d'arrets
			if( camera.transform.position == finalPos ) {
				camera.transform.eulerAngles = finalRot ;
				toOnSphere();
				
			} else if ( Time.time > (beginTime + TransitionTime) ){
				camera.transform.position = finalPos ;
				camera.transform.eulerAngles = finalRot ;
				toOnSphere();
				
			} else {
				// Maj des positions
				UpdateZoomStep();
			}
			
		break;
	}
	
}

/*
 * Active les evenements
 */
public function enableEvents() {
	eventEnable = true ;
}

/*
 * Desactive les evenements
 */
public function disableEvents() {
	eventEnable = false ;
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
function AddOnEndDezoom ( f : function(GameObject) ) {
	OnEndDezoom.push(f);
}



/************************
 **** Machine d'état ****
 ************************/

/*
 * Démarre le Zoom
 */
function toOnZoom( obj : GameObject ) {
	
	// vérification de l'état courant
	if( stateMachine != ZOOM_STATES.ONSPHERE )
		Console.HandledError( 'State Machine Error : Must zoom from ONSPHERE state' );
	else {
		
		// Appel des callbacks
		for( var j = 0; j < OnZoom.length; j++){
			(OnZoom[j] as function( GameObject ) )( obj ) ;			
		}
		
		// Changement de la machine d'état
		stateMachine = ZOOM_STATES.ONZOOM ;
		selected = obj ;
		
		// Désactive le mouseLook
		enableLook(false);
		
		// Enregistrement des états au début de la transition
		CameraInitialPos = camera.transform.position ;
		CameraInitialRot = camera.transform.eulerAngles ;
		beginTime = Time.time;
		
		// Calcul des états de fin
		ComputeFinalPos();
		ComputeFinalRot();
	}
}

/*
 * Se place sur la GUI
 */
function toOnVideo() {
	
	// Appel des callbacks
	if( stateMachine == ZOOM_STATES.ONZOOM ) {
		for( var j = 0; j < OnEndZoom.length; j++){
			(OnEndZoom[j] as function( GameObject ) )( selected ) ;
		}
	}
	
	// Changement de la machine d'état
	stateMachine = ZOOM_STATES.ONVIDEO ;
}

/*
 * Démarre le Dezoom
 */
function toOnDeZoom() {
	
	dezooming = true;
	
	// Changement de la machine d'état
	stateMachine = ZOOM_STATES.ONDEZOOM ;	
	
	// Appel des callbacks
	for( var j = 0; j < OnLeave.length; j++){
		(OnLeave[j] as function(GameObject) )( selected ) ;
	}
	
	// Enregistrement des états au début de la transition
	CameraInitialPos = camera.transform.position ;
	CameraInitialRot = camera.transform.eulerAngles ;
	beginTime = Time.time ;
	
	// Calcul des états de fin
	finalPos = CameraInitialPos ;
	finalRot = CameraInitialRot ;
}

/*
 * Se place sur l'univers (hors de la GUI)
 */
function toOnSphere () {
	
	// Appel des callbacks
	if( stateMachine == ZOOM_STATES.ONDEZOOM ) {
		dezooming = false;
		
		for( var j = 0; j < OnEndZoom.length; j++){
			(OnEndDezoom[j] as function( GameObject ) )( selected ) ;
		}
	}
	
	// Changement de la machine d'état
	stateMachine = ZOOM_STATES.ONSPHERE ;
	
	// Réactive le mouseLook
	enableLook(true);
	
}

/*
 * getter
 */
function isDezooming () {
	return dezooming;
}


/*********************
 **** Déplacement ****
 *********************/

/*
 * Effectue une étape du ZOOM
 */
function UpdateZoomStep () {
	
	// Calcul du temps écoulé depuis le début
	var elapsedTime = Time.time - beginTime ;
	
	// Calcul de la nouvelle position
	camera.transform.position = Vector3.Slerp( CameraInitialPos, CameraInitialPos, elapsedTime/TransitionTime) ;
	
	// calcul de la nouvelle rotation, en passant par le plus cours chemin
	var Diff = ( finalRot - CameraInitialRot ) ;
	
	Diff.x = (Diff.x < -180) ? Diff.x + 360 : Diff.x ;
	Diff.y = (Diff.y < -180) ? Diff.y + 360 : Diff.y ;
	Diff.z = (Diff.z < -180) ? Diff.z + 360 : Diff.z ;
	
	Diff.x = (Diff.x > 180) ? Diff.x - 360 : Diff.x ;
	Diff.y = (Diff.y > 180) ? Diff.y - 360 : Diff.y ;
	Diff.z = (Diff.z > 180) ? Diff.z - 360 : Diff.z ;
				
	camera.transform.eulerAngles = CameraInitialRot + Diff*elapsedTime/TransitionTime ;
	
}


/************************
 **** Positionnement ****
 ************************/

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


/********************
 **** Evénements ****
 ********************/

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
 * Gestion du click
 */
function OnTap(mousePos : Vector2) {
	
	
	// On interronmpt la fonction si les évenements sont désactivé
	if( !eventEnable )
		return ;
	
	if( stateMachine == ZOOM_STATES.ONSPHERE && !Trans.isInButton(mousePos) ) {
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