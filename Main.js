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

// Déplacement de la caméra
private var control : CameraControl ;			// Sur l'ipad
private var mouseLook : MouseLook ;				// Avec la souris


/*
 * Paramètres de l'application
 */
private var haveUniver : boolean ;
private var beginBy2D : boolean ;			// on commence par la vue 2D (sinon 3D)
private var have2DAnd3D : boolean ;			// on a une vue 2D et une vue 3D (sinon que la première)

private var soundEnable : boolean ;			// Les sons 3D sont activé

private var transitionToGUIType : String ;	// Type de transition vers la GUI : 'ZOOM', 'VIDEO'
private var zoomType2D : String ;			// Type d'effet de Zoom 2D <-> GUI
private var zoomType3D : String ;			// Type d'effet de Zoom 3D <-> GUI
private var zoomLength : float ;			// Logueur du Zoom





private var plane2D : GameObject;


/*
 * Au démargae de l'appli,
 * Instancie et initialise les éléments
 */
function Start () {
	
	/*
	 * Parse le fichier de configuration du système
	 */
	setDefaultSystemValues();
	getXML.getElementFromXML( 'system.xml', systemXmlWrapper ) ;
	
	Console.Test( 'haveUniver : "' + haveUniver +'"' ,50 );
	Console.Test( 'beginBy2D : "' + beginBy2D +'"' ,50 );
	Console.Test( 'have2DAnd3D : "' + have2DAnd3D +'"' ,50 );
	Console.Test( 'soundEnable : "' + soundEnable +'"' ,50 );
	Console.Test( 'transitionToGUIType : "' + transitionToGUIType +'"' ,50 );
	Console.Test( 'zoomType2D : "' + zoomType2D +'"' ,50 );
	Console.Test( 'zoomType3D : "' + zoomType3D +'"' ,50 );
	Console.Test( 'zoomLength : "' + zoomLength +'"' ,50 );
	
	
	
	/*
	 * Instanciate the objects
	 */
	Videos = gameObject.AddComponent("videoSettings") as videoSettings;
	createPolar = gameObject.AddComponent("createPolarMesh") as createPolarMesh;
	mesh3D = gameObject.AddComponent("createSphericMesh") as createSphericMesh;
	
	move = gameObject.AddComponent("moveSurface") as moveSurface;
	
	if( soundEnable )
		sound3D = gameObject.AddComponent("audio3D") as audio3D;
	
	Trans = gameObject.AddComponent("Transition2D3D") as Transition2D3D;
	
	
	Zoom = gameObject.AddComponent("Zoom") as Zoom;
	VideoFull= gameObject.AddComponent("FullScreen") as FullScreen;
	
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
	if( soundEnable )
		sound3D.initSound();
	
	// Initialise la transition 2D / 3D
	Trans.init();
	
	// parse le fichier et appelle la fonction correspondante
	getXML.getElementFromXML( 'xml_data', datasXmlWrapper ) ;
	
	// Initialise le Zoom avec les plans 2D. Type de zoom : on fonce vers le point (0,0,0) en tournant
	Zoom.Init(AllGO2D, zoomType2D ,Vector3.zero );
	Zoom.setTransitionTime(zoomLength);
	
	// Initialisation de l'interface.
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
	if( soundEnable )
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
		Zoom.changeType( zoomType2D, Vector3.zero );
	} else {
		Zoom.changeClickableElmts( AllGO3D );
		Zoom.changeType( zoomType3D, Vector3.zero );
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
 * Fonction de rappel envoyé dans le parsage du xml des datas
 * Récupère la contenue d'une balise du xml et 
 * l'envoie à la sous fonction correspondante
 */
function datasXmlWrapper( tagName : String, content : Hashtable ) {
	switch( tagName ) {
		
		case 'diane' :
		case 'acteon' :
		case 'middle' :
			 
			if(!content.ContainsKey( 'shape'))
				placeMeshHashPolar( content );
			else if( content['shape'] == 'polar' )
				placeMeshHashPolar( content );
			else
				placeMeshHashPolar( content );
			
			
			break ;
		
		case 'sound' :
			placeAudioHash( content );
			break ;
	}
}

/*
	*place piece of circle according to xml
	*init hashtable in the script attached to the plane
*/
function placeMeshHashPolar ( t : Hashtable ){
	
	/*
	 * Création des éléments clickable en 2D
	 */
	if (	plane2D						 &&
			t.ContainsKey( 'theta_min' ) &&
			t.ContainsKey( 'theta_max' ) &&
			t.ContainsKey( 'ratiormin' ) &&
			t.ContainsKey( 'ratiormax' ) &&
			t.ContainsKey( 'name' ) 	 ) {
		
		// crée des raccourcis
		var theta_min = float.Parse( t['theta_min'] ) ;
		var theta_max = float.Parse( t['theta_max'] ) ;
		var ratiormin = float.Parse( t['ratiormin'] ) ;
		var ratiormax = float.Parse( t['ratiormax'] ) ;
		
		// instanciation des éléments
		var obj = createPolar.placeMesh(	theta_min, theta_max ,
											ratiormin, ratiormax , t['name'] );
		
		// Ajout d'un script comprenant une extension des propriété et des methodes des plans clickable
		var s : scriptForPlane = obj.GetComponent("scriptForPlane");
		if( ! s)
			s  = obj.AddComponent ("scriptForPlane");
		s.InitScript( t );
		
		// Ajout de la position réelle du plan dans le script d'extension
		var p : Vector3 = createPolar.getTruePosition( 	theta_min, theta_max ,
														ratiormin, ratiormax , gameObject );
		s.InitPosPlane( p );
		
		// Ajout du point vers lequel le plan est orienté dans le script d'extension
		p = createPolar.getOrientedTo(	theta_min, theta_max ,
										ratiormin, ratiormax , gameObject );
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
	if(! soundEnable )
		return ;
	
	var g : GameObject = sound3D.createAudio( t );
	if( g )
		AllAudio3D.Push( g );
}


/*
 * Définie les valeurs par défaut des paramètres système
 */

function setDefaultSystemValues() {
	// on démarre dans l'affichage 2D, qui existe
	haveUniver = true ;
	beginBy2D = true ;
	
	// on peut switcher entre 2D et 3D
	have2DAnd3D = true ;
	
	// les sons dans la 3D sont activé
	soundEnable = true ;
	
	// transition vers la GUI : ZOOM
	transitionToGUIType = 'ZOOM' ;
	// Effet du zoom 
	zoomType2D = 'GO_ON_POINT_ROTATING' ;
	zoomType3D = 'GO_ON_PLANE' ;
	// durée du zoom : 1s
	zoomLength = 1.0 ;
}

/*
 * Fonction de rappel envoyé dans le parsage du xml paramètres système
 * Récupère la contenue d'une balise du xml et 
 * replis les attributs des paramètres
 */
function systemXmlWrapper( tagName : String, content : Hashtable ) {
	
	switch (tagName) {
		
		// Paramètre de <univer>
		case 'univer' :
			
			/*
			 * Note si on doit commencer par la 2D ou la 3D ou si on arrive direct
			 * dans l'interface graphique
			 * contenu entre <beginby> et </beginby>
			 * Valeurs possibles : '2D', '3D', 'NONE'
			 */
			if( content.ContainsKey( 'beginby' ) ) {
				switch( content['beginby'] ) {
					case '3D' :
						haveUniver = true ;
						beginBy2D = false ;
						break ;
					case 'NONE' :
						haveUniver = false ;
						break;
					case '2D' :
						haveUniver = true ;
						beginBy2D = true ;
						break ;
				}
			}
			
			// si <oneuniv/> alors on ne peux pas switcher entre 2D et 3D sinon on peux
			have2DAnd3D = ( content.ContainsKey( 'oneuniv' ) ) ? false : true ;
			
			// si <disablesound/> alors les sons en 3D sont désactivés, par défaut, ils ne le sont pas
			soundEnable = ( content.ContainsKey( 'disablesound' ) ) ? false : true ;
		break;
		
		// Paramètre de <transitiontogui>
		case 'transitiontogui' :
			
			/*
			 * Enregistre le type de la transition entre l'univers et la GUI
			 * contenu entre <type> et </type>
			 * Valeurs possibles : 'ZOOM', 'VIDEO'
			 */
			if( content.ContainsKey( 'type' ) ) {
				switch( content['type'] ) {
					case 'ZOOM' :
					case 'VIDEO' :
						transitionToGUIType = content['type'] ;
						break ;
				}
			}
			
			/*
			 * Enregistre le type de zoom contenu entre <zoomtype2D> et </zoomtype2D>
			 * et entre <zoomtype3D> et </zoomtype3D>
			 * utile que si <type>ZOOM</type>
			 * valeurs possibles : 'GO_ON_PLANE', 'GO_ON_POINT', 'GO_ON_PLANE_ROTATING', 
			 * 'GO_ON_POINT_ROTATING', 'LOOK_BEHIND', 'GO_AWAY_BACKWARD', 'GO_AWAY_FORWARD'
			 */
			if( content.ContainsKey( 'zoomtype2d' ) )
				zoomType2D = content['zoomtype2d'] ;
			
			if( content.ContainsKey( 'zoomtype3d' ) )
				zoomType3D = content['zoomtype3d'] ;
			
			/*
			 * Enregistre la durée du zoom (en seconde) contenu entre <zoomlength> et </zoomlength>
			 * utile que si <type>ZOOM</type>
			 * valeur par défaut : 1.0
			 */
			if( content.ContainsKey( 'zoomlength' ) ) {
				if( float.Parse(content['zoomlength']) != 'NaN' )
					zoomLength = float.Parse(content['zoomlength']) ;
			}
			
		break ;
	}
	
	
}



