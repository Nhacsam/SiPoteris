/* Le truc juste au dessus du slideshow (si on change pas la disposition) */

#pragma strict

// dépendences
//private var wVideoSettings : videoSettings ;


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

// VIdeo en lecture ?
private var wVideoIsPlaying : boolean = false ;

// Informations sur un éléments
class SLIDESHOWELMT extends System.ValueType{
  var type : WINDOWTYPES ;
  var path : String ;
  var size : Vector2 ;
 
  public function SLIDESHOWELMT(p : String, t : WINDOWTYPES, s : Vector2){
     this.type = t;
     this.path = p;
	 this.size = s;
  }
}





function InitWindow( pos : Rect, z : float ) {

	wPos = pos ;
	wZ = z ;
	
	/*wVideoSettings = gameObject.GetComponent("videoSettings");
	if( ! wVideoSettings)
		wVideoSettings = gameObject.AddComponent("videoSettings");
	*/
	placeRenderingPlane();
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
		SetNewTexture( t.path, t.type, t.size);
		
	} else {
		wObj.renderer.enabled = false ;
		Debug.LogWarning('Empty SLIDESHOWELMT element given at SetNewTextureObj() ');
	}
}




function SetNewTexture ( path : String, type : WINDOWTYPES, size : Vector2 ) {
	
	// erreur si chmain vide
	if(path == '' ) {
		Debug.LogWarning('Empty data path in SetTexture(' + path + ' ,' + type + ' ,' + size + ' ) ');
		wObj.renderer.enabled = false ;
		return ;
	}
	
	wType = type ;
	
	switch( wType ) {
	
		case WINDOWTYPES.VIDEO :
			
			chageObjSizeToOptimal(size);
			//wVideoSettings.putVideo( wObj, path );
			wVideoIsPlaying= true ;
			break ;
		
		
		case WINDOWTYPES.IMG :
			
			if( wVideoIsPlaying ) {
				//wVideoSettings.stopVideo( wObj );
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
			chageObjSizeToOptimal(size);
			
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
	wObj.transform.localScale= Vector3( elmtsSize.x/size.x, 1, elmtsSize.y/size.z ) ;
	
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




