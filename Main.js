#pragma strict


// array of GO - meshes over movie in 2D
var AllGO2D : Array = Array();
// array of GO - meshes over movie in 3D
var AllGO3D : Array = Array();
// array of GO - audiosources in 3D
var AllAudio3D : Array = Array();


/*
 * Dépendances : Scripts appelés dans le main
 */
private var Videos : videoSettings ;			// Gère l'ajout, le démarage, l'arret, ... des videos ( + la sphère3D et le plan 2D -_-" )
private var createPolar : createPolarMesh;		// Crée les plan cliquables en 2D avec une forme de morceaux de disque
private var mesh3D : createSphericMesh;			// Crée les plan cliquables en 3D avec une forme de morceaux de sphère

private var move : moveSurface;					// Déplace les plans de manière à qu'il suive la video
private var sound3D : audio3D;					// Gere les sons dans la visualisation 3D 
private var Trans :Transition2D3D;				// Gère la transition 2D <-> 3D

private var Zoom : Zoom ;						// Gère le click sur les plans et les trasitions qui en découlent
private var VideoFull : FullScreen ;			// Gere la GUI qui s'affiche après avoir cliqué dans un plan
private var xml : getXML;						// Ouvre le fichier xml et le parse

// Déplacement de la caméra
private var control : CameraControl ;			// Sur l'ipad
private var mouseLook : MouseLook ;				// Avec la souris

private var plane2D : GameObject;


/*
 * Au démargae de l'appli,
 * Instancie et initialise les éléments
 */
function Start () {
	
	/*
	 * Instanciate the objects
	 */
	Videos = gameObject.AddComponent("videoSettings") as videoSettings;
	createPolar = gameObject.AddComponent("createPolarMesh") as createPolarMesh;
	mesh3D = gameObject.AddComponent("createSphericMesh") as createSphericMesh;
	
	move = gameObject.AddComponent("moveSurface") as moveSurface;
	sound3D = gameObject.AddComponent("audio3D") as audio3D;
	Trans = gameObject.AddComponent("Transition2D3D") as Transition2D3D;
	
	
	Zoom = gameObject.AddComponent("Zoom") as Zoom;
	VideoFull= gameObject.AddComponent("FullScreen") as FullScreen;
	xml = gameObject.AddComponent("getXML") as getXML;
	
	control = gameObject.AddComponent("CameraControl") as CameraControl;
	mouseLook = gameObject.AddComponent("MouseLook") as MouseLook;
	
	
	/*
	 * Initialisation des objets
	 */
	 
	// create plane
	plane2D = Videos.videoSettings();
	// give access to this gameobject in createPolarMesh script
	if(plane2D)
		createPolar.SetSurface(plane2D);
	
	// Initialise le script gérant les sons
	sound3D.initSound();
	
	// Initialise la transition 2D / 3D
	Trans.init();
	
	// Initialise le parseur xml
	xml.InitXml("xml_data");
	
	// parse le fichier et appelle les fonction correspondante
	var func : Hashtable = new Hashtable() ;
	func['diane'] = placeMeshHash ;		//création des éléments clickables
	func['acteon'] = placeMeshHash ;
	func['middle'] = placeMeshHash ;
	func['sound'] = placeAudioHash ;	// création des sons
	xml.getElementFromXML( func );		// lance le parsage
	
	
	
	// Initialise le Zoom avec les plans 2D. Type de zoom : on fonce vers le point (0,0,0) en tournant
	Zoom.Init(AllGO2D, ZOOM_TYPE.GO_ON_POINT_ROTATING ,Vector3.zero );
	
	// Initialisation de l'iterface.
	VideoFull.InitFullScreen();
	 
	 
	 
	 
	 
	
	/*
	 * Création des liens entre les objets
	 */
	 
	// Au Zoom vers l'iterface graphique
	Zoom.AddOnZoom( Videos.videoHDZoomON );			// mis en pause de la video
	Zoom.AddOnZoom( Trans.flagExit );				// ?????????????????????????????
	
	// Quand on repart de l'iterface graphique
	Zoom.AddOnLeave( VideoFull.LeaveFullScreen );	// Détruit l'interface
	Zoom.AddOnLeave( Videos.videoHDZoomQuit );		// Relance la video
	
	// Quand le zoom est fini : quand on arrive sur l'interface
	Zoom.AddOnEndZoom(VideoFull.EnterOnFullScreen);	// Construction de l'interface graphique
	
	// Quand le dezoom est fini : quand on retourne dans l'univers
	Zoom.AddOnEndDezoom( Trans.flagExit );			// ?????????????????????????????
	
	// Gestion de l'activation / desactivation des mouvements de caméra
	// avec la souris dans l'interface graphique
	Zoom.AddOnZoom(disableMouseLook);
	Zoom.AddOnEndDezoom(enableMouseLook);
	
	// Au click sur le boutton retour de l'interface
	VideoFull.SetLeaveCallback( Zoom.toOnDeZoom );	// Dezoom vers l'univers
	
	// A la fin de la transition 2D/3D
	Trans.AddOnEndTrans( changeZoomPlane );			// Changement des plans clickables
	
	
	// Paramètrage de la caméra
	CameraConfig();
}


/*
 * Appelée à chaque frame
 * met à jour les éléments
 */
function Update () {
	
	Trans.UpdateTrans() ; 				// maj des transitions 2D/3D
	Zoom.UpDateZoom() ;					// maj du Zoom
	VideoFull.UpDateFullScreen();		// maj de l'interface
	sound3D.updateSounds( AllAudio3D );	// maj des sons 3D
	
	// Déplacement des plan en 2D
	for( var i =0; i < AllGO2D.length; i++) {
	
		if(!Videos.getFlagEndVideo())
			move.moveSurface( AllGO2D[i], Videos.OnPlay() ) ;
		else
			move.resetPlane(AllGO2D[i]);
	}
	
}


/*
 * Désactive les mouvements de la caméra
 */
function enableMouseLook() {
	if( isOnIpad() ) {
		control.enabled = Trans.isScene2D() ? false : true;
	}
	else {	
		mouseLook.enabled = Trans.isScene2D() ? false : true;
	}
}

/*
 * Active les mouvements de la caméra
 */
function disableMouseLook() {
	if( isOnIpad() ) {
		control.enabled = false;
	}
	else {	
		mouseLook.enabled = false ;
	}
}

/*
 * Change les plans clickables dans le zoom
 * ainsi que l'animation de zoom
 */
function changeZoomPlane( is2D : boolean ) {
	
	if( is2D ) {
		Zoom.changeClickableElmts( AllGO2D );
		Zoom.changeType( ZOOM_TYPE.GO_ON_POINT_ROTATING, Vector3.zero );
	} else {
		Zoom.changeClickableElmts( AllGO3D );
		Zoom.changeType( ZOOM_TYPE.GO_ON_PLANE, Vector3.zero );
	}
}

/*
 * Renvoie true si pos est sur un élément de type gui de l'interface
 * (pour ne pas mettre deux événements sur un click au même endroit)
 */
function isOnAGUIElmt( pos : Vector2) {
	
	if( Trans.isInButton(pos) )
		return true ;
	
	return false ;
}


/*
 * Renvoie vrai si on est sur l'ipad
 * (les fonction statics ne marchant pas ici
 * a cause du nom du fichier (à renommer ?)
 * la fonction à été copiée dans d'autres fichiers)
 */
static function isOnIpad() : boolean {
	return ( SystemInfo.deviceType == DeviceType.Handheld );
}

/*
 * Configure la caméra
 */
private function CameraConfig() {
	
	camera.backgroundColor = Color.black ;
	camera.fieldOfView  = 60 ;
	camera.farClipPlane = 60 ;
	camera.nearClipPlane = 0.01 ;
	
	CreateLight ();
	
	// active ou ppas le déplacement de la caméra
	// en fonction de la scene en cours
	if( Videos.GetFirstView() )
		disableMouseLook();
	else
		enableMouseLook();
}


/*
 * Crée la lumière éclairant les objets
 */
function CreateLight () {
	
	gameObject.AddComponent(Light);
	light.type=LightType.Point;
	light.range=70;
	light.intensity=0.88;
	
}

/*
 * Appelle les fonctions des scripts gérant l'interface
 */
function OnGUI() {
	Trans.OnGUI2D3D();
	VideoFull.OnGUIFullScreen();
}


/*
	*place piece of circle according to xml
	*init hashtable in the script attached to the plane
*/
function placeMeshHash ( t : Hashtable ){
	
	/*
	 * Création des éléments clickable en 2D
	 */
	if (	plane2D						 &&
			t.ContainsKey( 'theta_min' ) &&
			t.ContainsKey( 'theta_max' ) &&
			t.ContainsKey( 'ratioRmin' ) &&
			t.ContainsKey( 'ratioRmax' ) &&
			t.ContainsKey( 'name' ) 	 ) {
		
		// crée des raccourcis
		var theta_min = float.Parse( t['theta_min'] ) ;
		var theta_max = float.Parse( t['theta_max'] ) ;
		var ratioRmin = float.Parse( t['ratioRmin'] ) ;
		var ratioRmax = float.Parse( t['ratioRmax'] ) ;
		
		// instanciation des éléments
		var obj = createPolar.placeMesh(	theta_min, theta_max ,
											ratioRmin, ratioRmax , t['name'] );
		
		// Ajout d'un script comprenant une extension des propriété et des methodes des plans clickable
		var s : scriptForPlane = obj.GetComponent("scriptForPlane");
		if( ! s)
			s  = obj.AddComponent ("scriptForPlane");
		s.InitScript( t );
		
		// Ajout de la position réelle du plan dans le script d'extension
		var p : Vector3 = createPolar.getTruePosition( 	theta_min, theta_max ,
														ratioRmin, ratioRmax , gameObject );
		s.InitPosPlane( p );
		
		// Ajout du point vers lequel le plan est orienté dans le script d'extension
		p = createPolar.getOrientedTo(	theta_min, theta_max ,
										ratioRmin, ratioRmax , gameObject );
		s.InitOrientedTo( p );
		
		// add new gameobject to array
		AllGO2D.Push( obj );
		
		// génère les fichiers comprenant l'architecture des ressources
		// si on est sur l'ordinateur
		if( ! isOnIpad() )
			s.createParsedFile();
		
	}
	
	/*
	 * Création des éléments clickable en 3D
	 */
	// if( plane3D ) {  -- Pourrait être utile non ?
		
		// instanciation des éléments
		var obj3D = mesh3D.placeMesh3D( t );
		
		// Ajout d'un script comprenant une extension des propriété et des methodes des plans clickable
		var s3D : scriptForPlane = obj3D.GetComponent("scriptForPlane");
		if( ! s3D)
			s3D  = obj3D.AddComponent ("scriptForPlane");
		s3D.InitScript( t );
		
		// Ajout de la position réelle du plan dans le script d'extension
		s3D.InitPosPlane( obj3D.transform.position );
		
		// Ajout du point vers lequel le plan est orienté dans le script d'extension
		s3D.InitOrientedTo( mesh3D.getOrientedTo() );
	
		if( ! isOnIpad()  && plane2D)
			s.createParsedFile();
		
		// add new gameobject to array
		AllGO3D.Push( obj3D );
		
		// génère les fichiers comprenant l'architecture des ressources
		// si on est sur l'ordinateur
		if( ! isOnIpad() )
			s3D.createParsedFile();
	// }
}

/*
	*create and place sound in 3D
*/
function placeAudioHash ( t : Hashtable ){
	var g : GameObject = sound3D.createAudio( t );
	if( g )
		AllAudio3D.Push( g );
}
