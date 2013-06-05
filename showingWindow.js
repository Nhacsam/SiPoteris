/* Le truc juste au dessus du slideshow (si on change pas la disposition) */

#pragma strict

// dépendences
private var wVideoSettings : videoSettings ;


// Proriétés de l'objet
private var wPos : Rect ;
private var wZ : float ;

// objet
private var wObj : GameObject ;

// Texture
private var material : Material ;
private var wImgTex : Texture = null ;

// Types
enum WINDOWTYPES { NONE, IMG, VIDEO, VIDEORIGHT, VIDEOLEFT } ;
private var wType : WINDOWTYPES = WINDOWTYPES.NONE;

// Id de l'element en lecture
private var wId : int = -1;


// Video en lecture ?
private var wVideoIsPlaying : boolean = false ;

// Informations sur un éléments
class SLIDESHOWELMT extends System.ValueType{
  var type : WINDOWTYPES ;
  var path : String ;
  var size : Vector2 ;
  var id : int ;
 
  public function SLIDESHOWELMT( p : String, t : WINDOWTYPES, s : Vector2, id : int ){
     this.type = t;
     this.path = p;
	 this.size = s;
	 this.id = id ;
  }
}

// pour pouvoir zoomer sur la fenetre
private var wFullPos : Vector3 ;
private var wGUIPos : Vector3 ;
private var wFullScale : Vector3 ;
private var wGUIScale : Vector3 ;

private var wBeginTime : float ;
private var wTransitionLength : float = 1 ;

// machine d'état
enum W_STATE { NOTONGUI, ONGUI, ONZOOM, ONDEZOOM, ONFULL };
private var wState : W_STATE = W_STATE.NOTONGUI ;

// evenement activé ?
private var eventEnable : boolean ;




/*
 * Initialise les paramètre et crée le plan
 */
function InitWindow( pos : Rect, z : float ) {

	wPos = pos ;
	wZ = z ;
	wState = W_STATE.ONGUI ;
	wId = -1;
	
	wVideoSettings = gameObject.GetComponent("videoSettings");
	if( ! wVideoSettings)
		wVideoSettings = gameObject.AddComponent("videoSettings");
	
	placeRenderingPlane();
	material = wObj.renderer.material ;
	
	// affichage et activation des événement
	enableAll();
	// Au cas ou
	stopVideo();
}

function InitWindowFactor( pos : Rect, z : float ) {
	
	InitWindow( Rect(
							pos.x * camera.pixelWidth,
							pos.y * camera.pixelHeight,
							pos.width * camera.pixelWidth,
							pos.height * camera.pixelHeight
						), z);
}


/*
 * Supprime l'objet
 */
function destuctWindow() {
	wState = W_STATE.NOTONGUI;
	stopVideo();
	if( wObj)
		Destroy(wObj);
}




/*
 * Définit ce qui est affiché dans la fenetre
 * e : SLIDESHOWELMT
 */

function SetNewTextureObj( e ) {
	
	if( typeof(e) == SLIDESHOWELMT ) {
	
		var t : SLIDESHOWELMT = e ;
		SetNewTexture( t.path, t.type, Vector2.zero, t.id );
		
	} else {
		if( wObj)
			wObj.renderer.enabled = false ;
			
		Console.Warning('Empty SLIDESHOWELMT element given at SetNewTextureObj() ');
	}
}

function SetNewTexture ( path : String, type : WINDOWTYPES, size : Vector2, id : int ) {
	
	// l'objet affiché n'a pas changé
	if( id == wId )
		return ;
	else
		wId = id ;
	
	// erreur si chemin vide
	if(path == '' ) {
		Debug.LogWarning('Empty data path in SetTexture(' + path + ' ,' + type + ' ,' + size + ' ) ');
		wObj.renderer.enabled = false ;
		return ;
	}
	
	// Arret de la video si on était sur une video
	stopVideo();
	
	wType = type ;
	
	switch( wType ) {
		
		case WINDOWTYPES.VIDEORIGHT :
		case WINDOWTYPES.VIDEOLEFT :
		case WINDOWTYPES.VIDEO : // Si c'est une video
			
			// on retire du chemin StreamingAssets
			path = fileSystem.fromFolderPath( path, 'StreamingAssets' );
			
			Console.Info( 'Chargement de la video "' + path + '" sur la fenetre de la GUI');
			
			// Applique la video sur l'objet
			wVideoSettings.putVideo( wObj, path );
			wObj.renderer.enabled = true ;
			
			// inversion de la rotation
			setRotation();
			if( wType == WINDOWTYPES.VIDEO )
				wObj.transform.Rotate( Vector3( 0, 180, 0) );
			else if ( wType == WINDOWTYPES.VIDEORIGHT )
				wObj.transform.Rotate( Vector3( 0, 90, 0) );
			else if ( wType == WINDOWTYPES.VIDEOLEFT )
				wObj.transform.Rotate( Vector3( 0, 270, 0) );
			
			wVideoIsPlaying= true ;
			
			size = (size != Vector2.zero) ? size : wVideoSettings.VideoWH() ;
			break ;
		
		
		case WINDOWTYPES.IMG : // Si c'est une image
			
			// Charge la texture
			wImgTex = Resources.Load(path);
			
			// texture invalide
			if(! wImgTex) {
				Debug.LogWarning('Invalid image path in SetTexture(' + path + ' ,' + type + ' ,' + size + ' ) ');
				wObj.renderer.enabled = false ;
				return;
			}
			
			// application de la texture
			wObj.renderer.material.mainTexture = wImgTex ;
			wObj.renderer.enabled = true ;
			
			wObj.transform.Rotate( Vector3( 0, 180, 0) );
			wObj.transform.Rotate( Vector3( 0, 90, 0) );
			
			// réinitialise la rotation
			setRotation();
			// Calcul des dimensions 
			size = (size != Vector2.zero) ? size : Vector2( wImgTex.width, wImgTex.height ) ;
			
			
			
			break ;
	}
	
	
	ComputeGUIPosAndScale(size);
	ComputeFullPosAndScale(size);
	
	// Aplication des bonnes dimensions
	if( wState == W_STATE.ONFULL ) {
		
		wObj.transform.position = wFullPos;
		wObj.transform.localScale = wFullScale ;
		
	} else if ( wState == W_STATE.ONGUI ) {
		
		wObj.transform.position = wGUIPos;
		wObj.transform.localScale = wGUIScale ;
		
	}
		
	
	
}


/*
 * Stop la video en lecture si elle tourne
 */
private function stopVideo() {
	if( wVideoIsPlaying ) {
		wVideoSettings.stopVideo( wObj );
		wVideoIsPlaying= false ;
		wObj.renderer.material = material;
	}
}

/*******************************************************
**** Cacher / desactiver les evennements de l'objet ****
********************************************************/

/*
 * Affiche l'objet et active les evenements
 */
public function enableAll() {
	show() ;
	enableEvents() ;
}

/*
 * Cache l'objet et desactive les evenements
 */
public function disableAll() {
	hide() ;
	disableEvents() ;
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
 * Affiche l'objet
 */
public function show() {
	wObj.renderer.enabled = true ;
}

/*
 * Cache l'objet
 */
public function hide() {
	wObj.renderer.enabled = false ;
}

/*
 * Getters
 */
public function areEventEnabled() : boolean {
	return eventEnable ;
}
public function isHidden() : boolean {
	return !(wObj.renderer.enabled) ;
}



/*******************************
**** Dimentions et Position ****
********************************/

/*
 * crée et dimentionne le plan
 */
private function placeRenderingPlane() {
	
	// Dimensions
	
	var elmtsSize : Vector2 = getRealSize(	Vector2( wPos.width, wPos.height ),
											Vector2( wPos.x, wPos.y ),
											wZ, camera ) ;
	
	// Création
	wObj = new GameObject.CreatePrimitive(PrimitiveType.Plane);
	
	// Application des dimentions
	var size = wObj.renderer.bounds.size ;
	wObj.transform.localScale = Vector3( elmtsSize.x/size.x, 1, elmtsSize.y/size.z ) ;
	
	// rotation face à la caméra
	setRotation();
	
	// place l'objet
	wObj.transform.position =	camera.ScreenToWorldPoint(Vector3( wPos.center.x, camera.pixelHeight - wPos.center.y, wZ ) ) ;
	
	wObj.name = "Showing Window" ;
	
	// ajoute un renderer si tel n'est pas le cas
	var testRenderer = wObj.GetComponent(Renderer);
	if( !testRenderer)
		wObj.AddComponent(Renderer);
}

/*
 * Donne au plan la bonne rotation : face à la caméra
 */
private function setRotation() {
	wObj.transform.rotation = camera.transform.rotation ;
	wObj.transform.rotation *= Quaternion.AngleAxis(-90, Vector3( 1,0,0) );
	wObj.transform.rotation *= Quaternion.AngleAxis(180, Vector3( 0,1,0) );
}

/*
 * Calcul les dimension optimales pour entrer dans le conteneur
 * sans redimentionner l'image
 */
private function getOptimalSize( VideoDim : Vector2, container : Vector2 ) : Vector2 {
	
	// Gestion des erreurs
	if( VideoDim.x == 0 || VideoDim.y==0) {
		Console.HandledError('One of two composant of the dimension is null : VideoDim = '+VideoDim);
		return container ;
	}
	
	
	// calcul des ratios
	var videoRatio = VideoDim.y/VideoDim.x ;
	var ratio = container.y / container.x ;
	var optimalSize : Vector2 = new Vector2(0.0f,0.0f);
	
	
	if( videoRatio < ratio ) {
		
		// on colle en largeur
		optimalSize.x = container.x ;
		optimalSize.y = VideoDim.y * (  container.x/VideoDim.x );
		
	} else {
		
		// on colle en hauteur
		optimalSize.y = container.y ;
		optimalSize.x = VideoDim.x * ( container.y/VideoDim.y );
		
	}
	return optimalSize ;
}

/*
 * Récupère les dimension d'un objet par rapport à ses dimension sur
 * l'écran de la caméra et à sa  distance par rappot à celle ci
 */
static function getRealSize (size : Vector2, screenPos : Vector2, z : float, camera : Camera ) : Vector2 {
	
	var elmtsSize : Vector2 = new Vector2();
	elmtsSize.x = (camera.ScreenToWorldPoint(Vector3( screenPos.x, screenPos.y, z ) ) - camera.ScreenToWorldPoint(Vector3( screenPos.x + size.x, screenPos.y, z ) ) ).magnitude   ;
	elmtsSize.y = (camera.ScreenToWorldPoint(Vector3( screenPos.x, screenPos.y, z ) ) - camera.ScreenToWorldPoint(Vector3( screenPos.x, screenPos.y + size.y, z ) ) ).magnitude   ;
	
	return elmtsSize ;
}

/*
 * Calcul la position et l'echelle de l'objet en GUI
 */
private function ComputeGUIPosAndScale(size : Vector2) {
	
	// calcul de la position
	wGUIPos = camera.ScreenToWorldPoint(Vector3( wPos.center.x, camera.pixelHeight - wPos.center.y, wZ ) ) ;
	
	// récupère les dimension optimales
	var newSize = getOptimalSize(size, Vector2(wPos.width, wPos.height) );
	wGUIScale = size2scale( getRealSize( newSize, Vector2( wPos.x, wPos.y ), wZ, camera ) );
}

/*
 * Calcul la position et l'echelle de l'objet en plein écran
 */
private function ComputeFullPosAndScale(size : Vector2) {
	
	// calcul de la position
	wFullPos = camera.ScreenToWorldPoint( Vector3(camera.pixelWidth/2, camera.pixelHeight/2, wZ ) ) ;
	
	// récupère les dimension optimales
	var newSize = getOptimalSize(size, Vector2(camera.pixelWidth,  camera.pixelHeight) );
	wFullScale = size2scale( getRealSize( newSize, Vector2( camera.pixelWidth/2, camera.pixelHeight/2 ), wZ, camera ) );
}

/*
 * Converti une dimension ( en 2 dimensions ) en une echelle
 * directement applicble sur l'objet ( en 3 dimensions)
 */
private function size2scale( size : Vector2 ) : Vector3 {
	
	// tourne l'objet dans le sens des axes
	var rotation = wObj.transform.rotation ;
	wObj.transform.rotation = Quaternion();
	
	// lui assigne les bonnes dimensions
	var bounds = wObj.renderer.bounds.size ;
	var scale : Vector3 = Vector3( wObj.transform.localScale.x * size.x/bounds.x, wObj.transform.localScale.y, wObj.transform.localScale.z *size.y/bounds.z ) ;
	
	// replace l'objet
	wObj.transform.rotation = rotation ;
	
	return scale;
}



/************************************
**************** ZOOM ***************
*************************************/


/*
 * Ajoute les listener d'envenements
 */
function OnEnable(){
	Gesture.onSwipeE += onSwipe;
	
	Gesture.onShortTapE += onTap ;
	Gesture.onLongTapE += onLongTap ;
	Gesture.onDoubleTapE += onDoubleTap;
}

function OnDisable(){
	Gesture.onSwipeE -= onSwipe;
	
	Gesture.onShortTapE -= onTap ;
	Gesture.onLongTapE += onLongTap ;
	Gesture.onDoubleTapE -= onDoubleTap;
}

/*
 * MaJ de la position
 */
public function updateWindow() {
	
	if( wState == W_STATE.ONZOOM ) {
		
		// Si le déplacement est fini
		if( Time.time > wBeginTime + wTransitionLength ) {
			wState = W_STATE.ONFULL ;
		} else { // sinon
			
			// Calcul des valeurs intermédiaires
			wObj.transform.localScale = Vector3.Slerp( wGUIScale, wFullScale, (Time.time - wBeginTime ) / wTransitionLength );
			wObj.transform.position = Vector3.Slerp( wGUIPos, wFullPos, (Time.time - wBeginTime ) / wTransitionLength );
		}
		
	} else if( wState == W_STATE.ONDEZOOM ){
	
		// Si le déplacement est fini
		if( Time.time > wBeginTime + wTransitionLength ) {
			wState = W_STATE.ONGUI ;
			
			// réactive les autre éléments de la fenetre
			(gameObject.GetComponent( FullScreen ) as FullScreen ).enableOthers( this );
			
		} else { // sinon
			
			// Calcul des valeurs intermédiaires
			wObj.transform.localScale = Vector3.Slerp( wFullScale, wGUIScale, (Time.time - wBeginTime ) / wTransitionLength );
			wObj.transform.position = Vector3.Slerp( wFullPos, wGUIPos, (Time.time - wBeginTime ) / wTransitionLength );
		}
		
	}
	
}

/*
 * Gestion des evennements
 */

public function onSwipe( info : SwipeInfo ) {
	
	// La fonction s'interrompt si les événements sont désactivés
	if( !eventEnable )
		return ;
	
	// Si on est sur les video (2D / 3D)
	if( wState == W_STATE.NOTONGUI)
		return ;
	
	// Si le point de départ est dans la fenêtre
	if( clickOnWindow(info.startPoint) ) {
		
		var sens = 1 ;
		
		// On passe au suivant ou au précédent suivant le sens du balayage
		if( info.angle  < 90 || info.angle > 270 )
			(gameObject.GetComponent( FullScreen ) as FullScreen ).previousImg();
		else
			(gameObject.GetComponent( FullScreen ) as FullScreen ).nextImg();
	}
}

public function onTap( pos : Vector2 ) {
	
	// La fonction s'interrompt si les événements sont désactivés
	if( !eventEnable )
		return ;
	
	// Si on est sur les video (2D / 3D)
	if( wState == W_STATE.NOTONGUI)
		return ;
	
	if( clickOnWindow(pos) ) { 	// Si on a cliqué sur le plan
		SetUpZoom();			// On zoom
	} else {
		if( wState == W_STATE.ONFULL ) // Si on est en plein écran et qu'on a cliqué à coté
			SetUpZoom();				// On dezoom
	}
}

public function onLongTap( pos : Vector2 ) {
	
	// La fonction s'interrompt si les événements sont désactivés
	if( !eventEnable )
		return ;
	
	// Si on est sur les video (2D / 3D)
	if( wState == W_STATE.NOTONGUI)
		return ;
	
	if( clickOnWindow(pos) ) { 	// Si on a cliqué sur le plan
		SetUpZoom();			// on zoom ou dezoom
	} else {
		if( wState == W_STATE.ONFULL ) // Si on est en plein écran et qu'on a cliqué à coté
			SetUpZoom();				// On dezoom
	}
}

public function onDoubleTap( pos : Vector2 ) {
	
	// La fonction s'interrompt si les événements sont désactivés
	if( !eventEnable )
		return ;
	
	// Si on est sur les video (2D / 3D)
	if( wState == W_STATE.NOTONGUI)
		return ;
	
	if( clickOnWindow(pos) ) { 	// Si on a cliqué sur le plan
		SetUpZoom();			// on zoom ou dezoom
	} else {
		if( wState == W_STATE.ONFULL ) // Si on est en plein écran et qu'on a cliqué à coté
			SetUpZoom();				// On dezoom
	}
}

/*
 * Renvoie vrai si la position pos sur l'écran
 * correspond à la fenetre
 */
private function clickOnWindow (pos : Vector2) : boolean {
	var ray : Ray = camera.ScreenPointToRay(pos);
	var hit : RaycastHit = new RaycastHit() ;
	return wObj.collider.Raycast(ray, hit, 1000.0f)	;
}


/*
 * Lance le Zoom
 */
private function SetUpZoom () {
	
	if( wState == W_STATE.ONGUI || wState == W_STATE.ONFULL) {
		
		// Temps au démarrage
		wBeginTime = Time.time;
		
		// Cache les autres éléments de la GUI
		if( wState == W_STATE.ONGUI )
			(gameObject.GetComponent( FullScreen ) as FullScreen ).disableOthers( this );

		// Changement de l'état
		wState = ( wState == W_STATE.ONGUI  ) ? W_STATE.ONZOOM : W_STATE.ONDEZOOM ;
		
	}
}





