#pragma strict



// Eléments cliquables
private var zClickableElmts : Array ;	// Liste des Elements cliquables
private var zSelected : GameObject ;	// élément sélectionné


// Machine d'état
enum ZOOM_STATES {	ONUNIV,			// Dans l'univers (plan video 2D + sphère 3D)
					ONGUI,			// Dans la GUI
					ONZOOM,			// En train de zoomer 	( ONUNIV->	ONGUI )
					ONDEZOOM};		// En train de dezoomer ( ONGUI	->	ONUNIV )
private var zState : ZOOM_STATES ;

// CallBacks appelés lors d'un changement d'état
private var zOnZoom : Array ;
private var zOnEndZoom : Array ;
private var zOnLeave : Array ;
private var zOnEndDezoom : Array ;


// Types de Zoom possibles
enum ZOOM_TYPE {
					GO_ON_PLANE,			// Fonce sur le plan
					GO_ON_POINT,			// Fonce sur le point
					GO_ON_PLANE_ROTATING,	// Fonce sur le plan en tournant
					GO_ON_POINT_ROTATING,	// Fonce sur le point en tournant
					LOOK_BEHIND,			// Regarde derrière lui
					GO_AWAY_BACKWARD,		// fait une marche arrière
					GO_AWAY_FORWARD			// Fait demis tour en se barrant
}
private var zType : ZOOM_TYPE ;

private var zDestinationPoint : Vector3 ;	// point de destination, pour GO_ON_POINT par ex



// paramètres du zoom
private var zTransitionTime : float = 1.0f ;	// temps de transition
private var zBeginTime : float = 0.0f ;			// horloge au début

private var zCameraInitialPos : Vector3 ;		// Positionnement au démarrage
private var zCameraInitialRot : Quaternion ;	// Rotation au démarrage

private var zCameraFinalPos : Vector3 ;			// Positionnement à la fin
private var zCameraFinalRot : Quaternion ;		// Rotation à la fin

private var zCameraBeginPos : Vector3 ;			// Positionnement dans l'univers
private var zCameraBeginRot : Quaternion ;		// Rotation dans l'univers

// événements
private var zEventEnable : boolean ;			// événement activé ?









/****************************************
 **** Communication avec l'exterieur ****
 ****************************************/

/*
 * Initialise le Module (constructeur)
 */
function Init( VideosMeshes : Array, type : ZOOM_TYPE, point : Vector3 ) {
	
	// Enregistrment des plans cliquables
	setClickableElmts( VideosMeshes ) ;
	
	// Enregistrement du type du zoom et du point de destination si besoins est
	changeType(type, point );
	
	// initialisation des tableaux de callback
	zOnZoom = new Array() ;
	zOnEndZoom = new Array() ;
	zOnLeave = new Array() ;
	zOnEndDezoom = new Array() ;
	
	// On initialise la machine d'état en dehors de
	// la GUI et on active les événemments
	toOnUniv() ;
	enableEvents();
}

/*
 * Mets à jours les calcul liés au zoom (Routine)
 */
function UpDateZoom () {
	
	// click de la souris (pour test sur mac)
	if( Input.GetMouseButtonDown(0) )
		OnTap(Input.mousePosition);
	
	switch( zState ) {
	
		// Si on est en train de zoomer
		case ZOOM_STATES.ONZOOM :
			
			// Conditions d'arrets
			if( camera.transform.position == zCameraFinalPos && camera.transform.rotation == zCameraFinalRot) {
				camera.transform.LookAt(zSelected.transform);
				toOnGUI();
				
			} else if ( Time.time > (zBeginTime + zTransitionTime) ){
				camera.transform.position = zCameraFinalPos ;
				camera.transform.LookAt(zSelected.transform);
				toOnGUI();
				
			} else {
				// Maj des positions
				UpdateZoomStep();
			}
			
		break;
	
		// Si on est en train de dezoomer
		case ZOOM_STATES.ONDEZOOM :
			
			// Conditions d'arrets
			if( camera.transform.position == zCameraFinalPos && camera.transform.rotation == zCameraFinalRot) {
				camera.transform.rotation = zCameraFinalRot ;
				toOnUniv();
				
			} else if ( Time.time > (zBeginTime + zTransitionTime) ){
				camera.transform.position = zCameraFinalPos ;
				camera.transform.rotation = zCameraFinalRot ;
				toOnUniv();
				
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
	zEventEnable = true ;
}

/*
 * Desactive les evenements
 */
public function disableEvents() {
	zEventEnable = false ;
}


/**
 * Setter de Callback
 */

function AddOnZoom ( f : function( GameObject ) ) {
	zOnZoom.push(f);
}
function AddOnEndZoom ( f : function( GameObject ) ) {
	zOnEndZoom.push(f);
}
function AddOnLeave ( f : function(GameObject) ) {
	zOnLeave.push(f);
}
function AddOnEndDezoom ( f : function(GameObject) ) {
	zOnEndDezoom.push(f);
}


/**
 * Gestion des éléments cliquables
 */

/*
 * Change les éléments cliquables
 */
public function setClickableElmts( e : Array ) {
	zClickableElmts = e ;
}
public function changeClickableElmts( e : Array ) { // équivalent 
	setClickableElmts(e);
}

/*
 * Ajoute un élément
 */
public function addClickableElmt( e : GameObject ) {
	zClickableElmts.Push(e);
}

/*
 * Ajoute des éléments
 */
public function addClickableElmts( e : Array ) {
	changeClickableElmts( zClickableElmts.Concat(e) );
}


/**
 * Gestion du type de transition
 */

/*
 * Setter du type de transition
 */
public function setType( t : ZOOM_TYPE ) {
	zType = t ;
}

/*
 * Getter du type de transition
 */
public function getType() : ZOOM_TYPE {
	return zType ;
}

/*
 * Change le type de transition
 * avec en 2ieme paramètre le point de destination
 * (utile pour GO_ON_POINT par ex )
 *
 * Si le point de destination est inutile pour le type
 * de tarnsition fournis, il n'est pas enregistré
 */
public function changeType( t : ZOOM_TYPE, p : Vector3 ) {
	// enregistrement du type
	setType(t);
	
	// enregistrement du point de destination si besoins
	if ( 	t == ZOOM_TYPE.GO_ON_POINT 				||
			t == ZOOM_TYPE.GO_ON_POINT_ROTATING 		) {
			
		zDestinationPoint = p ;
	}
}


/************************
 **** Machine d'état ****
 ************************/

/*
 * Démarre le Zoom
 */
function toOnZoom( obj : GameObject ) {
	
	// vérification de l'état courant
	if( zState != ZOOM_STATES.ONUNIV )
		Console.HandledError( 'State Machine Error : Must zoom from ONUNIV state' );
	else {
		
		// Appel des callbacks
		for( var j = 0; j < zOnZoom.length; j++){
			(zOnZoom[j] as function( GameObject ) )( obj ) ;
		}
		
		zSelected = obj ;
		
		// calcul des position pour le dezoom
		computeFinalPosAndRot();
		// Enregistrement du temps courant
		zBeginTime = Time.time ;
		
		// Changement de la machine d'état
		zState = ZOOM_STATES.ONZOOM ;
	}
}

/*
 * Se place sur la GUI
 */
function toOnGUI() {
	
	// Appel des callbacks
	if( zState == ZOOM_STATES.ONZOOM ) {
		for( var j = 0; j < zOnEndZoom.length; j++){
			(zOnEndZoom[j] as function( GameObject ) )( zSelected ) ;
		}
	}
	
	// Changement de la machine d'état
	zState = ZOOM_STATES.ONGUI ;
}

/*
 * Démarre le Dezoom
 */
function toOnDeZoom() {
	
	
	// calcul des position pour le dezoom
	computeFinalPosAndRot();
	// Enregistrement du temps courant
	zBeginTime = Time.time ;
	
	// Changement de la machine d'état
	zState = ZOOM_STATES.ONDEZOOM ;	
	
	// Appel des callbacks
	for( var j = 0; j < zOnLeave.length; j++){
		(zOnLeave[j] as function(GameObject) )( zSelected ) ;
	}
}

/*
 * Se place sur l'univers (hors de la GUI)
 */
private function toOnUniv () {
	
	// Appel des callbacks
	if( zState == ZOOM_STATES.ONDEZOOM ) {
		for( var j = 0; j < zOnEndDezoom.length; j++){
			(zOnEndDezoom[j] as function( GameObject ) )( zSelected ) ;
		}
	}
	
	// Changement de la machine d'état
	zState = ZOOM_STATES.ONUNIV ;
	
}


/*********************
 **** Déplacement ****
 *********************/

/*
 * Effectue une étape du ZOOM
 */
function UpdateZoomStep () {
	
	
	// Calcul du temps écoulé depuis le début
	var elapsedTime = Time.time - zBeginTime ;
	
	// Calcul de la nouvelle position
	camera.transform.position = Vector3.Slerp( zCameraInitialPos, zCameraFinalPos, elapsedTime/zTransitionTime) ;
	
	// Calcul de la nouvelle rotation
	camera.transform.rotation = Quaternion.Slerp( zCameraInitialRot, zCameraFinalRot, elapsedTime/zTransitionTime) ;
	
}

/************************
 **** Positionnement ****
 ************************/

/*
 * Calcul les positions initiales et finales du Zoom
 * En fonction du type de celui-ci
 */
private function computeFinalPosAndRot() {
	
	
	if( zState == ZOOM_STATES.ONUNIV ) {
		// Enregistrement des coordonnées dans l'univers
		zCameraBeginPos = camera.transform.position ;
		zCameraBeginRot = camera.transform.rotation ;
		
		// Enregistrement des états au début de la transition
		zCameraInitialPos = zCameraBeginPos ;
		zCameraInitialRot = zCameraBeginRot ;
	
	} else if ( zState == ZOOM_STATES.ONGUI ) {
		
		// On fini le dezoom sur les positions initales de la GUI
		zCameraFinalPos = zCameraBeginPos ;
		zCameraFinalRot = zCameraBeginRot ;
	}
	
	// On enregistre les coordonnées de la caméra
	// pour que les fonctions puissent la déplacer pour faire leurs calculs
	var CameraCurrentPos : Vector3 = camera.transform.position ;
	var CameraCurrentRot : Quaternion = camera.transform.rotation ;
	
	// Vas contenir les coordonnées calculées par les fonctions.
	// Elles doivent avoir une valeur de retour de la forme :
	// 		Array( position : Vector3, rotation : Quaternion )
	var ComputedCoord : Array ;
	
	// Choix de la fonction à appeler
	switch( zType ) {
	
		case ZOOM_TYPE.GO_ON_PLANE :			// Fonce sur le plan
			ComputedCoord = computeGoOnPlanePosAndRot();
			break;
			
		case ZOOM_TYPE.GO_ON_POINT :			// Fonce sur le point
			ComputedCoord = computeGoOnPointPosAndRot();
			break;
		
		case ZOOM_TYPE.GO_ON_PLANE_ROTATING :	// Fonce sur le plan en tournant
			ComputedCoord = computeGoOnPlaneRotatingPosAndRot();
			break;
		
		case ZOOM_TYPE.GO_ON_POINT_ROTATING :	// Fonce sur le point en tournant
			ComputedCoord = computeGoOnPointRotatingPosAndRot();
			break;
		
		case ZOOM_TYPE.LOOK_BEHIND :			// Regarde derrière lui
			ComputedCoord = computeLookBehindPosAndRot();
			break;
		
		case ZOOM_TYPE.GO_AWAY_BACKWARD :		// fait une marche arrière
			ComputedCoord = computeGoAwayBackwardPosAndRot();
			break;
		
		case ZOOM_TYPE.GO_AWAY_FORWARD :		// Fait demis tour en se barrant
			ComputedCoord = computeGoAwayForwardPosAndRot();
			break;
		
		default :
			Console.HandledError( "Value of zType("+zType+") is invalid.");
			ComputedCoord = computeGoOnPlanePosAndRot();		// Fonce sur le plan
			break;
	}
	
	// Erreur dans les calculs
	if(! ComputedCoord || ComputedCoord.length < 2) {
		Console.HandledError(	"Error in computing zoom pos and rot.\n" +
								"State = "+zState+"\n" +
								"Type = "+zType);
		zCameraInitialPos = zCameraBeginPos ;
		zCameraInitialRot = zCameraBeginRot ;
		zCameraFinalPos = zCameraBeginPos ;
		zCameraFinalRot = zCameraBeginRot ;
		return ;
	}
	
	// Choisi si on a calculé des positions finales ou initiales
	if( zState == ZOOM_STATES.ONUNIV ) {
		
		// Si on été dans l'univers, c'est les positions finales qui varient
		// en fonction du type de transition
		zCameraFinalPos = ComputedCoord[0] ;
		zCameraFinalRot = ComputedCoord[1] ;
		
	} else if ( zState == ZOOM_STATES.ONGUI ) {
		
		// Si on été dans la GUI, c'est les positions initiales qui varient
		// en fonction du type de transition
		zCameraInitialPos = ComputedCoord[0] ;
		zCameraInitialRot = ComputedCoord[1] ;
	}
	
	// On replace la caméra si elle a été bougé pendant les calculs
	camera.transform.position = CameraCurrentPos ;
	camera.transform.rotation = CameraCurrentRot ;
	
}




/*
 * Calcul les positions initiales et finales du Zoom
 * Pour le type : GO_ON_PLANE
 */
private function computeGoOnPlanePosAndRot() : Array {
	
	var forward : Vector3 = zSelected.transform.position - zCameraBeginPos ;
	var upwards : Vector3 = zSelected.transform.up ;
	return new Array( computeOnPlanePos(), Quaternion.LookRotation (forward , upwards) );
}

/*
 * Calcul les positions initiales et finales du Zoom
 * Pour le type : GO_ON_POINT
 */
private function computeGoOnPointPosAndRot() : Array {
	
	var forward : Vector3 = zDestinationPoint - zCameraBeginPos ;
	var upwards : Vector3 = camera.transform.up ;
	return new Array(zDestinationPoint,  Quaternion.LookRotation (forward , upwards)  );
}

/*
 * Calcul les positions initiales et finales du Zoom
 * Pour le type : GO_ON_PLANE_ROTATING
 */
private function computeGoOnPlaneRotatingPosAndRot() : Array {
	
	var forward : Vector3 = zSelected.transform.position - zCameraBeginPos ;
	var upwards : Vector3 = - zSelected.transform.up ;
	return new Array( computeOnPlanePos(), Quaternion.LookRotation (forward , upwards) );
}

/*
 * Calcul les positions initiales et finales du Zoom
 * Pour le type : GO_ON_POINT_ROTATING
 */
private function computeGoOnPointRotatingPosAndRot() : Array {
	var forward : Vector3 = zDestinationPoint - zCameraBeginPos ;
	var upwards : Vector3 = - camera.transform.up ;
	return new Array(zDestinationPoint,  Quaternion.LookRotation (forward , upwards)  );
}

/*
 * Calcul les positions initiales et finales du Zoom
 * Pour le type : LOOK_BEHIND
 */
private function computeLookBehindPosAndRot() : Array {
	
	var forward : Vector3 = zDestinationPoint - zCameraBeginPos ;
	var upwards : Vector3 = camera.transform.up ;
	return new Array( zCameraBeginPos,  Quaternion.LookRotation ( -forward , upwards)  );
}

/*
 * Calcul les positions initiales et finales du Zoom
 * Pour le type : GO_AWAY_BACKWARD
 */
private function computeGoAwayBackwardPosAndRot() : Array {
	
	
	return computeLookBehindPosAndRot();
}

/*
 * Calcul les positions initiales et finales du Zoom
 * Pour le type : GO_AWAY_FORWARD
 */
private function computeGoAwayForwardPosAndRot() : Array {
	
	
	return computeLookBehindPosAndRot();
}



/*
 * Calcule la position face à un plan permettant
 * de le voir en plein écran
 */
private function computeOnPlanePos() : Vector3 {
	
	var computedPos : Vector3 ;
	
	// on oriente la caméra vers le plan
	camera.transform.LookAt(zSelected.transform);
	
	var orientedTo : Vector3 = (zSelected.GetComponent('scriptForPlane') as scriptForPlane).getOrientedTo() ;
	// vecteur 0M ou O le centre du plan et M le centre de la sphère
	var axe = orientedTo - zSelected.transform.position ;
	
	// distance entre la caméra et le plan
	var CameraInitialDecal = axe.magnitude ;
	// vecteur unitaire relian le plan et la camera
	var normal : Vector3 = axe.normalized ;
	
	
	var rect = camera.pixelRect ;
	// point milieu haut de la caméra
	var top : Vector2 = new Vector2( 	rect.xMin + (rect.xMax - rect.xMin) / 2 , rect.yMin ) ;
	// point milieu gauche de la caméra
	var left : Vector2 = new Vector2( 	rect.xMin 								, rect.yMin + (rect.yMax - rect.yMin) / 2 ) ;
	
	
	
	var hit : RaycastHit = new RaycastHit() ;
	var i : float = 0 ;
	
	// On tire deux trait partant des deux points milieu haut et milieu gauche, et
	// on approche petit à petit la caméra du plan jusqu'a
	// qu'un des deux traits collisionne avec le plan
	do {
		
		computedPos = zSelected.transform.position + (CameraInitialDecal - i )*normal ;
		camera.transform.position = computedPos ;
		camera.transform.LookAt(zSelected.transform);
		
		i += 0.1 ;
		
		
	} while( 	!( 		zSelected.collider.Raycast( camera.ScreenPointToRay(top	) , hit, 1000.0f) ||
				 		zSelected.collider.Raycast( camera.ScreenPointToRay(left) , hit, 1000.0f) )
				&& i <= CameraInitialDecal ) ;
	
	Console.Test(camera.transform.position ,48);
	
	return computedPos ;
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
	if( !zEventEnable )
		return ;
	
	// On interronmpt la fonction si le click se fait par dessus
	// un éléments de GUI géré par un autre script
	if( (gameObject.GetComponent( 'Main' ) as Main ).isOnAGUIElmt( mousePos ) )
		return ;
	
	
	if( zState == ZOOM_STATES.ONUNIV ){
		
		var ray : Ray = camera.ScreenPointToRay(mousePos);
		var hit : RaycastHit = new RaycastHit() ;
		
		// Détecte l'objet cliqué
		for ( var i = 0; i < zClickableElmts.length; i++ ) {
			if( (zClickableElmts[i] as GameObject).collider.Raycast(ray, hit, 1000.0f) ) {
			
				toOnZoom( zClickableElmts[i] as GameObject );
				break ;
			} // if
		} // for
		
		
	} // if
	
}