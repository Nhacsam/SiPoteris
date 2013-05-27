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
private var wImgTex : Texture = null ;

// Types
enum WINDOWTYPES { NONE, IMG, VIDEO } ;
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
var wFullPos : Vector3 ;
var wGUIPos : Vector3 ;
var wFullScale : Vector3 ;
var wGUIScale : Vector3 ;

var wBeginTime : float ;
var wTransitionLength : float = 1 ;

// machine d'état
enum W_STATE { NOTONGUI, ONGUI, ONZOOM, ONDEZOOM, ONFULL };
private var wState : W_STATE = W_STATE.NOTONGUI ;







/*
 * Ajoute les listener d'envenements
 */

function OnEnable(){
	Gesture.onShortTapE += onTap ;
	Gesture.onDoubleTapE += onDoubleTap;
}

function OnDisable(){
	Gesture.onShortTapE -= onTap ;
	Gesture.onDoubleTapE -= onDoubleTap;
}






function InitWindow( pos : Rect, z : float ) {

	wPos = pos ;
	wZ = z ;
	wState = W_STATE.ONGUI ;
	
	wVideoSettings = gameObject.GetComponent("videoSettings");
	if( ! wVideoSettings)
		wVideoSettings = gameObject.AddComponent("videoSettings");
	
	placeRenderingPlane();
	
	// Retient la position du plan dans la GUI
	wGUIPos = wObj.transform.position ;
	wGUIScale = wObj.transform.localScale ;
	
	// Calcul celle qu'il aurait en plein écran
	ComputeFullPos();
}

function InitWindowFactor( pos : Rect, z : float ) {
	
	InitWindow( Rect(
							pos.x * camera.pixelWidth,
							pos.y * camera.pixelHeight,
							pos.width * camera.pixelWidth,
							pos.height * camera.pixelHeight
						), z);
}



function destuctWindow() {
	wState = W_STATE.NOTONGUI;
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
	
	wType = type ;
	
	switch( wType ) {
	
		case WINDOWTYPES.VIDEO :
			
			var tofind : String =  'StreamingAssets/' ;
			var found = path.IndexOf( tofind ) ;
			if( found != -1 )
				path = path.Substring( found + tofind.length ) ;
			
			Console.Info( 'Chargement de la video "' + path + '" sur la fenetre de la GUI');
			
			
			//chageObjSizeToOptimal(size);
			//wVideoSettings.putVideo( wObj, path );
			wVideoIsPlaying= true ;
			break ;
		
		
		case WINDOWTYPES.IMG :
			
			if( wVideoIsPlaying ) {
				wVideoSettings.stopVideo( wObj );
				wObj.renderer.enabled = true ;
				wVideoIsPlaying= false ;
			}
			
			wImgTex = Resources.Load(path);
			
			if(! wImgTex) {
				Debug.LogWarning('Invalid image path in SetTexture(' + path + ' ,' + type + ' ,' + size + ' ) ');
				wObj.renderer.enabled = false ;
				return;
			}
			
			size = (size != Vector2.zero) ? size : Vector2( wImgTex.width, wImgTex.height ) ;
			

			
			Console.Test(size, 1);
			//chageObjSizeToOptimal(size);
			
			wObj.renderer.material.mainTexture = wImgTex ;
			wObj.renderer.enabled = true ;
			
			
			break ;
		
		
	}
	
	
}


/*
	 * crée et dimentionne le plan
	 */
private function placeRenderingPlane() {
	
	// Dimensions
	
	var elmtsSize : Vector2 = getRealSize(	Vector2( wPos.width, wPos.height ),
											Vector2( wPos.x, wPos.y ),
											wZ, camera ) ;
	
	// Création et position
	wObj = new GameObject.CreatePrimitive(PrimitiveType.Plane);
	
	// Application des dimentions
	var size = wObj.renderer.bounds.size ;
	wObj.transform.localScale = Vector3( elmtsSize.x/size.x, 1, elmtsSize.y/size.z ) ;
	
	wObj.transform.rotation = camera.transform.rotation ;
	wObj.transform.rotation *= Quaternion.AngleAxis(-90, Vector3( 1,0,0) );
	wObj.transform.rotation *= Quaternion.AngleAxis(180, Vector3( 0,1,0) );
	
	wObj.transform.position =	camera.ScreenToWorldPoint(Vector3( wPos.center.x, camera.pixelHeight - wPos.center.y, wZ ) ) ;
	
	wObj.name = "Showing Window" ;
	
	var testRenderer = wObj.GetComponent(Renderer);
	if( !testRenderer)
		wObj.AddComponent(Renderer);
	
	
}



private function getOptimalSize( VideoDim : Vector2 ) : Vector2 {
	
	
	var videoRatio = VideoDim.y/VideoDim.x ;
	var ratio = wPos.height / wPos.width ;
	var optimalSize : Vector2 = new Vector2(0.0f,0.0f);
	
	
	if( videoRatio < ratio ) {
		
		// on colle en largeur
		optimalSize.x = wPos.width ;
		optimalSize.y = VideoDim.y * (  wPos.width/VideoDim.x );
		
	} else {
		
		// on colle en hauteur
		optimalSize.y = wPos.height ;
		optimalSize.x = VideoDim.x * (  wPos.height/VideoDim.y );
		
	}
	return optimalSize ;
}


static function getRealSize (size : Vector2, screenPos : Vector2, z : float, camera : Camera ) : Vector2 {
	
	var elmtsSize : Vector2 = new Vector2();
	elmtsSize.x = (camera.ScreenToWorldPoint(Vector3( screenPos.x, screenPos.y, z ) ) - camera.ScreenToWorldPoint(Vector3( screenPos.x + size.x, screenPos.y, z ) ) ).magnitude   ;
	elmtsSize.y = (camera.ScreenToWorldPoint(Vector3( screenPos.x, screenPos.y, z ) ) - camera.ScreenToWorldPoint(Vector3( screenPos.x, screenPos.y + size.y, z ) ) ).magnitude   ;
	
	return elmtsSize ;
}

private function chageObjSizeToOptimal( size : Vector2 ) {
	
	var newSize = getOptimalSize(size);
	newSize = getRealSize( newSize, Vector2( wPos.x, wPos.y ), wZ, camera ) ;
	
	
	var rotation = wObj.transform.rotation ;
	wObj.transform.rotation = Quaternion();
	
	var bounds = wObj.renderer.bounds.size ;
	wObj.transform.localScale= Vector3( wObj.transform.localScale.x * newSize.x/bounds.x, wObj.transform.localScale.y, wObj.transform.localScale.z *newSize.y/bounds.z ) ;
	
	wObj.transform.rotation = rotation ;
}




/************************************
**************** ZOOM ***************
*************************************/

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

public function onTap( pos : Vector2 ) {
	
	// SI on est sur les video (2D / 3D)
	if( wState == W_STATE.NOTONGUI)
		return ;
	
	if( clickOnWindow(pos) ) { 	// Si on a cliqué sur le plan
		//SetUpZoom();			// On change l'image
	} else {
		if( wState == W_STATE.ONFULL ) // Si on est en plein écran et qu'on a cliqué à coté
			SetUpZoom();				// On dezoom
	}
}

public function onDoubleTap( pos : Vector2 ) {
	
	// SI on est sur les video (2D / 3D)
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
 * Calcul la position et l'echelle de l'objet en plein écran
 */
private function ComputeFullPos() {
	wFullPos = camera.ScreenToWorldPoint( Vector3(camera.pixelWidth/2, camera.pixelHeight/2, wZ ) ) ;
	
	
	var size = wObj.renderer.bounds.size ;
	var elmtsSize : Vector2 = getRealSize(	Vector2( size.x * camera.pixelHeight/size.z , camera.pixelHeight ),
											Vector2( wFullPos.x, wFullPos.y ),
											wFullPos.z, camera ) ;
		
	wFullScale = Vector3( wObj.transform.localScale.x * elmtsSize.x/size.x, 1, wObj.transform.localScale.z * elmtsSize.y/size.z ) ;
	
}




/*
 * Lance le Zoom
 */
private function SetUpZoom () {
	
	if( wState == W_STATE.ONGUI ) {
	
		wState = W_STATE.ONZOOM ;
		wBeginTime = Time.time;
		
	} else if( wState == W_STATE.ONFULL ){
	
		wState = W_STATE.ONDEZOOM ;
		wBeginTime = Time.time;
		
	}
}





