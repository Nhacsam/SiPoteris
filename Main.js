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

private var createPolar : createPolarMesh;		// Crée les plans cliquables en 2D avec une forme de morceaux de disque
private var mesh3D : createSphericMesh;			// Crée les plans cliquables en 3D avec une forme de morceaux de sphère
private var meshRect : createRectMesh;			// Crée les plans cliquables en 2D

private var autoPlacer : placeAuto;				// permet de placer automatiquement les plans rectangle

private var move : moveSurface;					// Déplace les plans de manière à qu'il suive la video
private var sound3D : audio3D;					// Gere les sons dans la visualisation 3D 
private var Trans :Transition2D3D;				// Gère la transition 2D <-> 3D

private var Zoom : Zoom ;						// Gère le click sur les plans et les trasitions qui en découlent
private var GUI : FullScreen ;					// Gere la GUI qui s'affiche après avoir cliqué dans un plan

// Déplacement de la caméra
private var control : CameraControl ;			// Sur l'ipad
private var mouseLook : MouseLook ;				// Avec la souris


/*
 * Paramètres de l'application
 */
private var haveUniver : boolean ;			// on passe directe à l'interface ?
private var beginBy2D : boolean ;			// on commence par la vue 2D (sinon 3D)
private var have2DAnd3D : boolean ;			// on a une vue 2D et une vue 3D (sinon que la première)

private var placeRectAuto : boolean ;		// Place automatiquement les plans rectangles
private var fieldOfView2D : float ;			// Champ de vision de la camera en 2D
private var fieldOfView3D : float ;			// Champ de vision de la camera en 3D

private var soundEnable : boolean ;			// Les sons 3D sont activé

private var transitionToGUIType : String ;	// Type de transition vers la GUI : 'ZOOM', 'VIDEO'
private var zoomType2D : String ;			// Type d'effet de Zoom 2D <-> GUI
private var zoomType3D : String ;			// Type d'effet de Zoom 3D <-> GUI
private var zoomLength : float ;			// Logueur du Zoom

private var lang  : String ;				// Langue de la GUI : Valeurs possibles : 'fr', 'en'



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
	
	
	Console.Info( 'Application chargée en '+ lang );
	
	/*
	 * Si on a que l'interface, on l'instancie vite fait et on squezze le reste
	 */
	if( !haveUniver ) {
		GUI= gameObject.AddComponent("FullScreen") as FullScreen;
		GUI.InitFullScreen( lang );
		
		var obj : GameObject = new GameObject() ;
		var s : scriptForPlane = obj.AddComponent ("scriptForPlane");
		s.InitScript( new Hashtable() );
		if( ! isOnIpad() )
			s.getHandler().createParsedFile();
		
		CameraConfigGUI();
		
		GUI.EnterOnFullScreen(obj);
		return;
	}
	
	
	/*
	 * Instanciate the objects
	 */
	Videos = gameObject.AddComponent("videoSettings") as videoSettings;
	
	if( (beginBy2D || have2DAnd3D) && !placeRectAuto )		// Si on a la 2D
		createPolar = gameObject.AddComponent("createPolarMesh") as createPolarMesh;
	
	if( (!beginBy2D || have2DAnd3D) && !placeRectAuto)		// Si on a la 3D
		mesh3D = gameObject.AddComponent("createSphericMesh") as createSphericMesh;
	
	if( placeRectAuto)
		autoPlacer = gameObject.AddComponent("placeAuto") as placeAuto;
	
	// 3D and 2D, create rectangles
	meshRect = gameObject.AddComponent("createRectMesh") as createRectMesh;
	
	
	move = gameObject.AddComponent("moveSurface") as moveSurface;
	
	if( soundEnable )	// Si on a du son
		sound3D = gameObject.AddComponent("audio3D") as audio3D;
	
	if( have2DAnd3D )	// Si on a la 2D et la 3D
		Trans = gameObject.AddComponent("Transition2D3D") as Transition2D3D;
	
	
	Zoom = gameObject.AddComponent("Zoom") as Zoom;
	GUI= gameObject.AddComponent("FullScreen") as FullScreen;
	
	if( !beginBy2D || have2DAnd3D ) {	// Si on a la 3D
		control = gameObject.AddComponent("CameraControl") as CameraControl;
		mouseLook = gameObject.AddComponent("MouseLook") as MouseLook;
	}
	
	
	/*
	 * Initialisation des objets
	 */
	 
	// create plane
	plane2D = Videos.videoSettings(beginBy2D, have2DAnd3D);
	// give access to this gameobject in createPolarMesh script
	if(plane2D && createPolar){
		createPolar.SetSurface(plane2D);
	}
	if(plane2D && meshRect) {
		meshRect.SetSurface(plane2D);
	}
	
	// Initialise le script permettant de placer automatiquement les plans
	if( placeRectAuto)
		autoPlacer.InitPlacer();
	
	// Initialise le script gérant les sons
	if( sound3D )
		sound3D.initSound();
	
	// Initialise la transition 2D / 3D
	if( Trans )
		Trans.init(fieldOfView2D, fieldOfView3D);
	
	// parse le fichier et appelle la fonction correspondante
	getXML.getElementFromXML( 'xml_data', datasXmlWrapper ) ;
	
	if( placeRectAuto )
		autoPlacer.compute( placeRectHash );
	
	
	// Initialise le Zoom avec les plans qui vont bien.
	if( beginBy2D )
		Zoom.Init(AllGO2D, zoomType2D ,Vector3.zero );
	else
		Zoom.Init(AllGO3D, zoomType3D ,Vector3.zero );
	Zoom.setTransitionTime(zoomLength);
	
	// Affiche les plan ou non
	hideObj( !beginBy2D );
	
	// Initialisation de l'interface.
	GUI.InitFullScreen( lang );
	 
	 
	 
	 
	 
	
	/*
	 * Création des liens entre les objets
	 */
	 
	// Au Zoom vers l'iterface graphique
	Zoom.AddOnZoom( Videos.videoHDZoomON );			// mis en pause de la video
	Zoom.AddOnZoom( disableMouseLook );				// mis en pause de la video
	
	if( Trans )
		Zoom.AddOnZoom( Trans.flagExit );			// ?????????????????????????????
	
	// Quand on repart de l'iterface graphique
	Zoom.AddOnLeave( GUI.LeaveFullScreen );			// Détruit l'interface
	Zoom.AddOnLeave( Videos.videoHDZoomQuit );		// Relance la video
	Zoom.AddOnLeave( CameraConfigTrans );			// Camera en mode transition
	
	// Quand le zoom est fini : quand on arrive sur l'interface
	Zoom.AddOnEndZoom(CameraConfigGUI);				// Paramètrage de la caméra et de la lumière
	Zoom.AddOnEndZoom(GUI.EnterOnFullScreen);		// Construction de l'interface graphique
	
	
	// Quand le dezoom est fini : quand on retourne dans l'univers
	if( Trans )
		Zoom.AddOnEndDezoom( Trans.flagExit );			// ?????????????????????????????
	Zoom.AddOnEndDezoom( CameraConfigUnivComputed );	// Restitution de la caméra et de la lumière
	
	
	// Au click sur le boutton retour de l'interface
	GUI.SetLeaveCallback( Zoom.toOnDeZoom );	// Dezoom vers l'univers
	
	// A la fin ou au début de la transition 2D/3D
	if( Trans ) {
		Trans.AddOnBeginTrans( disableMouseLook );
		Trans.AddOnBeginTrans( hideObj );
		
		Trans.AddOnEndTrans( changeZoomPlane );			// Changement des plans clickables
		Trans.AddOnEndTrans( CameraConfigUniv );		// Changement des paramètre de caméra
	}
	
	
	// Paramètrage de la caméra
	CameraConfigUniv( beginBy2D );
	
	
}


/*
 * Appelée à chaque frame
 * met à jour les éléments
 */
function Update () {
	
	GUI.UpDateFullScreen();				// maj de l'interface
	if( !haveUniver )						// si on a que l'interface, on update pas le reste
		return ;
	
	if( Trans )
		Trans.UpdateTrans() ; 				// maj des transitions 2D/3D
	
	Zoom.UpDateZoom() ;						// maj du Zoom
	
	if( sound3D )
		sound3D.updateSounds( !isOn2D(), AllAudio3D );	// maj des sons 3D
	
	
	// Déplacement des plan en 2D (si il y en a)
	for( var i =0; i < AllGO2D.length; i++) {
	
		if(!Videos.getFlagEndVideo() && !placeRectAuto)
			move.moveSurface( AllGO2D[i] as GameObject, Videos.OnPlay() ) ;
		else
			move.resetPlane(AllGO2D[i] as GameObject);
		
		if(placeRectAuto)
			move.keepRotation( AllGO2D[i] );
	}
	
	for( i = 0; i < AllGO3D.length; i++) {
		move.rotateY_3D( AllGO3D[i] as GameObject, true ) ;
		move.rotateX_3D( AllGO3D[i] as GameObject, true ) ;
		move.rotateZ_3D( AllGO3D[i] as GameObject, true ) ;
		
		if(placeRectAuto)
			move.keepRotation( AllGO3D[i] );
		
		var s = ((AllGO3D[i] as GameObject ).GetComponent("scriptForPlane") as scriptForPlane) ;
		s.InitPosPlane( (AllGO3D[i] as GameObject ).transform.position );
		
	}
}


/*
 * Désactive les mouvements de la caméra
 */
public function enableMouseLook() {
	if( isOnIpad() ) {
	
		if( control )
			control.enabled = isOn2D() ? false : true;
			
		if( mouseLook )
			mouseLook.enabled = false ;
	}
	else {
	
		if( mouseLook )
			mouseLook.enabled = isOn2D() ? false : true;
			
		if( control )
			control.enabled = false ;
	}
}

/*
 * Active les mouvements de la caméra
 */
public function disableMouseLook() {
	if( control )
		control.enabled = false;
	
	if( mouseLook )
		mouseLook.enabled = false ;
}

/*
 * Revoie vrai si on est en 2D
 */
public function isOn2D() {
	
	if( Trans ) {
		return Trans.isScene2D() ;
	} else {
		
		if( !haveUniver || have2DAnd3D ) {
			Console.CriticalError(	"Une erreur est survenue dans le main, détectée dans CameraConfigUnivComputed.\n" +
									"Trans : NULL, haveUniver : " + haveUniver +", have2DAnd3D : "+have2DAnd3D);
			return true ;
		} else
			return beginBy2D;
	}
	
}



/*
 * Change les plans clickables dans le zoom
 * ainsi que l'animation de zoom
 */
public function changeZoomPlane( is2D : boolean ) {
	
	if( is2D ) {
		Zoom.changeClickableElmts( AllGO2D );
		Zoom.changeType( zoomType2D, Vector3.zero );
	} else {
		Zoom.changeClickableElmts( AllGO3D );
		Zoom.changeType( zoomType3D, Vector3.zero  );
	}
}


/*
 * Cache les plans non concerné si besoins
 */
public function hideObj( from2D : boolean ) {
	
	var i : int = 0 ;
	
	if( !from2D ) {
		for( i = 0; i < AllGO3D.length; i ++)
			(AllGO3D[i] as GameObject).renderer.enabled = false ;
		for( i = 0; i < AllGO2D.length; i ++)
			(AllGO2D[i] as GameObject).renderer.enabled = ((AllGO2D[i] as GameObject ).GetComponent("scriptForPlane") as scriptForPlane).getVisible() ;
		
	} else {
		for( i = 0; i < AllGO3D.length; i ++)
			(AllGO3D[i] as GameObject).renderer.enabled = ((AllGO2D[i] as GameObject ).GetComponent("scriptForPlane") as scriptForPlane).getVisible() ;
		for( i = 0; i < AllGO2D.length; i ++)
			(AllGO2D[i] as GameObject).renderer.enabled = false ;
		
	}
	
	
}


/*
 * Renvoie true si pos est sur un élément de type gui de l'interface
 * (pour ne pas mettre deux événements sur un click au même endroit)
 */
public function isOnAGUIElmt( pos : Vector2) {
	
	if(Trans)
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
 * Configure la caméra et la lumière
 * pour l'univer en calculant lui même si on est en 2D ou 3D
 */
public function CameraConfigUnivComputed() {
	CameraConfigUniv(isOn2D());
}


/*
 * Configure la caméra et la lumière
 * pour l'univer ( 2D et 3D )
 */
public function CameraConfigUniv( is2D : boolean) {
	
	CameraSharedConfig();
	if( is2D ) {
	
		camera.orthographic = false ;
		camera.fieldOfView  = fieldOfView2D ;
		light.type=LightType.Point;
		light.intensity=0.88;
		light.cookie=null ;
		
		// desactive le déplacement de la caméra
		disableMouseLook();
		
	} else {
		
		camera.orthographic = false ;
		camera.fieldOfView  = fieldOfView3D ;
		//light
		light.type=LightType.Spot;
		light.intensity=0.88;
		
		//light.cookie=Resources.Load("camMask");
		light.spotAngle=50;
		
		// active le déplacement de la caméra
		enableMouseLook();
	}

}

/*
 * Configure la caméra et la lumière
 * pour la GUI
 */
public function CameraConfigGUI() {
	
	CameraSharedConfig();
	
	camera.orthographic = true ;
	gameObject.light.type = LightType.Directional ;
	gameObject.light.intensity = 0.4 ;
	
	light.cookie=null ;
	
	// desactive le déplacement de la caméra
	disableMouseLook();
}

/*
 * Configure la caméra et la lumière
 * pendant les transitions
 */
public function CameraConfigTrans() {
	
	CameraConfigUnivComputed();
	camera.orthographic = false ;
	
	// desactive le déplacement de la caméra
	disableMouseLook();
}


/*
 * Configure les paramètre commun de la caméra
 * entre 2D, 3D et GUI
 */
private function CameraSharedConfig() {
	
	camera.backgroundColor = Color.black ;
	camera.farClipPlane = 60 ;
	camera.nearClipPlane = 0.01 ;
	
	if( ! light)
		gameObject.AddComponent(Light);
	
	light.range=70;
}

/*
 * Appelle les fonctions des scripts gérant l'interface
 */
function OnGUI() {
	
	if( Trans )
		Trans.OnGUI2D3D();
	
	GUI.OnGUIFullScreen();
}





/*
 * Fonction de rappel envoyé dans le parsage du xml des datas
 * Récupère la contenue d'une balise du xml et 
 * l'envoie à la sous fonction correspondante
 */
public function datasXmlWrapper( tagName : String, content : Hashtable ) {
	switch( tagName ) {
		
		case 'sound' :
			placeAudioHash( content );
			break ;
		
		
		case 'diane' :
		case 'acteon' :
		case 'middle' :
			if( placeRectAuto )
					autoPlacer.addPlane( content );
			else if(!content.ContainsKey( 'shape'))
				placeMeshHashPolar( content );
			else if( content['shape'] == 'polar' )
				placeMeshHashPolar( content );
			else if( content['shape'] == 'rectangle' )
				placeRectHash( content, null );
			else
				placeMeshHashPolar( content );
			
			
			break ;
		default :
			 
			 if( placeRectAuto )
					autoPlacer.addPlane( content );
			else if(!content.ContainsKey( 'shape'))
				placeMeshHashPolar( content );
			else if( content['shape'] == 'polar' )
				placeMeshHashPolar( content );
			else if( content['shape'] == 'rectangle' )
				placeRectHash( content, null );
			else
				placeMeshHashPolar( content );
			
			
			break ;
	}
}

/////////////////////////////////////////////////////////////////////////
/////Create and place gameobject (meshes, sound..) in 2D and 3D view/////
/////////////////////////////////////////////////////////////////////////

/*
	*place piece of circle according to xml
	*init hashtable in the script attached to the plane
*/
private function placeMeshHashPolar ( t : Hashtable ){
	
	/*
	 * Création des éléments clickable en 2D
	 */
	if ( createPolar ) {
		
		// instanciation des éléments
		var obj = createPolar.placeMesh( t );
		if(obj){// if obj has been created
			// Ajout d'un script comprenant une extension des propriété et des methodes des plans clickable
			var s : scriptForPlane = obj.GetComponent("scriptForPlane") as scriptForPlane;
			if( ! s)
				s  = obj.AddComponent ("scriptForPlane") as scriptForPlane;
			s.InitScript( t );
		
			// Ajout de la position réelle du plan dans le script d'extension
			var p : Vector3 = createPolar.getTruePosition( t , gameObject );
			s.InitPosPlane( p );
		
			// Ajout du point vers lequel le plan est orienté dans le script d'extension
			p = createPolar.getOrientedTo( t , gameObject );
			s.InitOrientedTo( p );
			
			// configure les plan comme étant invisible
			if( obj.name.IndexOf("0") != -1 )
				s.setVisible(true);
		
			// add new gameobject to array
			AllGO2D.Push( obj );
		
			// génère les fichiers comprenant l'architecture des ressources
			// si on est sur l'ordinateur
			if( ! isOnIpad() )
				s.getHandler().createParsedFile();
		}//if
	}//if
	
	/*
	 * Création des éléments clickable en 3D
	 */
	if( mesh3D ){
		// instanciation des éléments
		var obj3D = mesh3D.placeMesh3D( t );
		
		if(obj3D){//if obj3D has been created
			// Ajout d'un script comprenant une extension des propriété et des methodes des plans clickable
			var s3D : scriptForPlane = obj3D.GetComponent("scriptForPlane") as scriptForPlane;
			if( ! s3D)
				s3D  = obj3D.AddComponent ("scriptForPlane") as scriptForPlane;
			s3D.InitScript( t );
		
			// Ajout de la position réelle du plan dans le script d'extension
			s3D.InitPosPlane( obj3D.transform.position );
		
			// Ajout du point vers lequel le plan est orienté dans le script d'extension
			s3D.InitOrientedTo( mesh3D.getOrientedTo() );
			
			// configure les plan comme étant invisible
			s3D.setVisible(true);
		
			// add new gameobject to array
			AllGO3D.Push( obj3D );
		
			// génère les fichiers comprenant l'architecture des ressources
			// si on est sur l'ordinateur
			if( ! isOnIpad() )
				s3D.getHandler().createParsedFile();
		}//if
	}//if
}

/*
	*place plane according to the xml
*/
public function placeRectHash( t : Hashtable, texturePath : String ){
	
	if( meshRect ){
		var obj2D : GameObject = meshRect.createRect2D( t , texturePath );
		var obj3D : GameObject = meshRect.createRect3D( t , texturePath );
		
		if(obj2D){// check if the plane is created and init script for plane
			var s2 : scriptForPlane = obj2D.GetComponent("scriptForPlane") as scriptForPlane;
			if( ! s2)// if no script found, scriptforplane is added to the gameobject
				s2 = obj2D.AddComponent ("scriptForPlane") as scriptForPlane;
				
			// init variables of script
			s2.InitScript( t );
		
			// Ajout de la position réelle du plan dans le script d'extension
			s2.InitPosPlane( obj2D.transform.position );
			
			// configure les plan comme étant invisible si pas de texture
			s2.setVisible( (texturePath != null) );
		
			// Ajout du point vers lequel le plan est orienté dans le script d'extension
			var p = meshRect.getOrientedTo( t , gameObject );
			s2.InitOrientedTo( p );
				
			AllGO2D.Push( obj2D );
			
			// génère les fichiers comprenant l'architecture des ressources
			// si on est sur l'ordinateur
			if( ! isOnIpad() )
				s2.getHandler().createParsedFile();
		}//if
		
		if(obj3D){// check if the plane is created and init script for plane
			var s3 : scriptForPlane = obj3D.GetComponent("scriptForPlane") as scriptForPlane;
			if( ! s3)// if no script found, scriptforplane is added to the gameobject
				s3 = obj3D.AddComponent ("scriptForPlane") as scriptForPlane;
				
			// init variables of script
			s3.InitScript( t );
			
			// Ajout de la position réelle du plan dans le script d'extension
			s3.InitPosPlane( obj3D.transform.position );
			
			// configure les plan comme étant invisible
			s3.setVisible( (texturePath != null) );
			
			// Ajout du point vers lequel le plan est orienté dans le script d'extension
			s3.InitOrientedTo( Videos.getSpherePos() );
			
			AllGO3D.Push( obj3D );
		
			// génère les fichiers comprenant l'architecture des ressources
			// si on est sur l'ordinateur
			if( ! isOnIpad() )
				s3.getHandler().createParsedFile();
		}//if
	}//if
}


/*
	*create and place sound in 3D
*/
private function placeAudioHash ( t : Hashtable ){
	
	if(! sound3D )
		return ;
	
	var g : GameObject = sound3D.createAudio( t );
	if( g )
		AllAudio3D.Push( g );
}


/*
 * Définie les valeurs par défaut des paramètres système
 */

private function setDefaultSystemValues() {
	// on démarre dans l'affichage 2D, qui existe
	haveUniver = true ;
	beginBy2D = true ;
	
	// on peut switcher entre 2D et 3D
	have2DAnd3D = true ;
	
	// Les plans sont poisitionnnés automatiquements
	placeRectAuto = false ;
	
	// Champ de vision de la camera
	fieldOfView2D = 60.0 ;
	fieldOfView3D = 35.0 ;
	
	// les sons dans la 3D sont activé
	soundEnable = true ;
	
	// transition vers la GUI : ZOOM
	transitionToGUIType = 'ZOOM' ;
	// Effet du zoom 
	zoomType2D = 'GO_ON_POINT_ROTATING' ;
	zoomType3D = 'GO_ON_PLANE' ;
	// durée du zoom : 1s
	zoomLength = 1.0 ;
	
	// Langue de la GUI
	lang = 'fr' ;
}

/*
 * Fonction de rappel envoyé dans le parsage du xml paramètres système
 * Récupère la contenue d'une balise du xml et 
 * replis les attributs des paramètres
 */
public function systemXmlWrapper( tagName : String, content : Hashtable ) {
	
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
			
			/*
			 * Enregistre le champ de vision de la camera contenu entre <fieldOfView2D> et </fieldOfView2D>
			 * valeur par défaut : 40.0
			 */			
			if( content.ContainsKey( 'fieldofview2d' ) ) {
				if( float.Parse(content['fieldofview2d']) != 'NaN' )
					fieldOfView2D = float.Parse(content['fieldofview2d']) ;
			}
			
			/*
			 * Enregistre le champ de vision de la camera contenu entre <fieldOfView3D> et </fieldOfView3D>
			 * valeur par défaut : 40.0
			 */	
			if( content.ContainsKey( 'fieldofview3d' ) ) {
				if( float.Parse(content['fieldofview3d']) != 'NaN' )
					fieldOfView3D = float.Parse(content['fieldofview3d']) ;
			}
			
			// si <placeRectAuto/> alors les plans rectangulaires sont placés automatiquement
			placeRectAuto = ( content.ContainsKey( 'placerectauto' ) ) ? true : false ;
			
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
						transitionToGUIType = content['type'];
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
		
		// Paramètre de <GUI>
		case 'gui' :
			
			if( content.ContainsKey( 'lang' )  ) {
				
				if( content['lang'] == 'fr' || content['lang'] == 'en' )
					lang = content['lang'] ;
			}
		break ;
	}
	
	
}



