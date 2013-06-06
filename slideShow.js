#pragma strict


// Position du slideShow
private var position : Rect ;
private var z : float ;

// Elements mobiles affiché
private var mobilesElmts : GameObject[] ;
private var effNbElmts : int ;

// informations liés aux éléments (utile uniquemment au parent)
private var elmtsInfo : Array ;

private var elmtsSize : Vector2 = new Vector2(10, 10);
private var decal : Vector2 ;

// ou on en est dans les mouvements
private var currentPage : int  = 0;
private var effectiveCurrentPage : int = currentPage ;



// Pour le déplacement progressif des éléments
private var transitionTime : float = 0.3f ;
private var beginTime : float ;

private var InitialElmtsPos : Vector3[] ;
private var InitialElmtsRot : Quaternion[] ;

private var isMoving : boolean ;

private var speed : float = 0 ;
private var useSpeed : boolean = true ;
private var frictionFactor : float = 0.5 ;
private var lastTime : float = 0;

private var delta : float = 0 ;
private var isDragging : boolean = false ;


// propriété du rendu
private var maxByHalfLine : int = 3  ; 	// Nb d'elmts visible de chaque cotès du central
private var toBg : boolean = true ; 	// rotation vers l'arrière ? (ou vers l'avant)
private var spacingFactor : float = 1.7 ; // Espacement des elmts


// Evenement activés ou non
private var eventEnable : boolean = false ;




/****************************************
 **** Communication avec l'exterieur ****
 ****************************************/


/*
 * Initialisation des variables
 */
function InitSlideShow( nbOfElmts : int, Pos : Rect, Z : float  ) {
	
	// enregistrement des données
	position = Pos ;
	z = Z ;
	
	// décalage lié au fait que les coordonées des plan correpondent aux centres de ceux-ci
	decal = new Vector2( 0, Pos.yMax - Pos.yMin);
	decal /= 2 ;
	
	// calcul des dimensions des elmts
	elmtsSize = showingWindow.getRealSize(	Vector2( Pos.height, Pos.height ),
								Vector2( Pos.x, Pos.y ),
								Z, camera ) ;
				
	// Création des elmts
	mobilesElmts = new GameObject[ nbOfElmts ] ;
	elmtsInfo = new Array( nbOfElmts );
	
	isMoving = false ;
	effNbElmts = 0 ;
	currentPage = 0;
	enableAll();
}

/*
 * Initialisation avec les positions en facteur entre 0 et 1
 * plutot que en pixel
 */
function InitSlideShowFactor ( nbOfElmts : int, pos : Rect, Z : float ) {
	
	InitSlideShow( nbOfElmts, 	Rect(
										pos.x * camera.pixelWidth,
										pos.y * camera.pixelHeight,
										pos.width * camera.pixelWidth,
										pos.height * camera.pixelHeight
								)
					, Z);
}

/*
 * Destruction du slideShow
 */
function destuctSlideShow() {
	
	for(var i = 0 ; i < mobilesElmts.length; i++) {
		
		
		if( mobilesElmts[i]  ) {
			if( mobilesElmts[i].renderer )
				if(mobilesElmts[i].renderer.material )
					if( mobilesElmts[i].renderer.material.mainTexture )
						Resources.UnloadAsset( mobilesElmts[i].renderer.material.mainTexture );
			
			Destroy( mobilesElmts[i] );
		}
	}
	effNbElmts = 0 ;
	
	
}


/*
 * Maj des éléments
 */
function UpDateSlideShow() {
	
	
	// positions et rotations finales
	var pos = GetElmtsPosition();
	var rot = GetElmtsRotation();
	
	var i = 0 ;
	
	// Si on est pas en mvt, on place directement les objets
	if( ! isMovingUpdate() ) {
		
		InitialElmtsPos = null ;
		InitialElmtsRot = null ;
		
		effectiveCurrentPage = currentPage ;
		
		for( i = 0 ; i < effNbElmts; i++) {
			mobilesElmts[i].transform.position = pos[i] ;
			mobilesElmts[i].transform.rotation = rot[i] ;
		}
		
	} else {
		// Sinon on les déplace petit à petit
		moveGradualy(pos, rot);
	}
		
}


/*
 * Récupère les infos du plan courant
 */
function getCurrentAssociedInfo() {

	if( elmtsInfo )
		if( elmtsInfo.length > effectiveCurrentPage && effNbElmts > effectiveCurrentPage)
			return elmtsInfo[ effectiveCurrentPage ];
	return null ;
}


/*
 * Ajoute des infos au dernier élément
 */
public function AddElmt( texture : String, info ) : boolean {
	
	
	if( effNbElmts > mobilesElmts.length-1 ) {
		effNbElmts = mobilesElmts.length ;
		Console.HandledError( "Too many elmts given in slideShow" );
		return false ;
	}
	
	try {
		var imgTex : Texture2D = Resources.Load(texture, Texture2D);
	} catch(e) {
		imgTex = null ;
	}
	if( ! imgTex) {
		Debug.LogWarning('Invalid image path in AddElmt : ' + texture);
		return;
	}
	
	
	AddElmtPlane( effNbElmts );
	
	elmtsInfo[ effNbElmts ] = info ;
	
	
	mobilesElmts[ effNbElmts].renderer.material.mainTexture = imgTex ;
	
	
	effNbElmts++ ;
	
	return true ;
}


/*
 * déplace le slideShow ver l'élément suivant
 */
public function next( slowly : boolean ) {
	
	if( slowly ) {
		decalLeft();
		useSpeed = false ;
		delta = 0 ;
	} else {
		if (currentPage < effNbElmts-1 )
			currentPage++ ;
	}
}

/*
 * déplace le slideShow ver l'élément précédent
 */
public function previous( slowly : boolean ) {
	
	if( slowly ) {
		decalRight();
		useSpeed = false ;
		delta = 0 ;
	} else {
		if (currentPage > 0 )
			currentPage-- ;
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
	for( var i = 0 ; i < effNbElmts; i++) {
		mobilesElmts[i].renderer.enabled = true ;
	}
}

/*
 * Cache l'objet
 */
public function hide() {
	for( var i = 0 ; i < effNbElmts; i++) {
		mobilesElmts[i].renderer.enabled = false ;
	}
}

/*
 * Getters
 */
public function areEventEnabled() : boolean {
	return eventEnable ;
}
public function isHidden() : boolean {
	if( effNbElmts > 0 )
		return !(mobilesElmts[0].renderer.enabled) ;
	else
		return false ;
}



/****************************************
 ******** Gestion des événements ********
 ****************************************/

/*
 * Ajoute les listener d'envenements
 */

function OnEnable(){
	Gesture.onSwipeE += OnSwipe;
	Gesture.onDraggingE += OnDrag;
		
	//Gesture.onShortTapE += OnTap;
	Gesture.onLongTapE += OnTap;
	Gesture.onDoubleTapE += OnTap;
	
	Gesture.onUpE += onUp ;
	
}


function OnDisable(){
	Gesture.onSwipeE -= OnSwipe;
	Gesture.onDraggingE -= OnDrag;
		
	//Gesture.onShortTapE -= OnTap;
	Gesture.onLongTapE -= OnTap;
	Gesture.onDoubleTapE -= OnTap;

	Gesture.onUpE -= onUp ;
}

/*
 * Les Callbacks de gestion des événements
 */

// Balaiement
function OnSwipe ( info : SwipeInfo ) {
	
	// La fonction s'interrompt si les événements sont désactivés
	if( !eventEnable)
		return ;
	 
	// Si le point de départ est dans le slideshow et pas celui d'arrivé
	if( position.Contains(info.startPoint) && !position.Contains(info.endPoint) ) {
		
		var sens = 1 ;
		
		// On décale à droite ou à gauche suivant le sens du balayage
		if( info.angle  < 90 || info.angle > 270 ) {
			decalRight();
			sens = 1 ;
		} else {
			decalLeft();
			sens = -1 ;
		}
		
		// On lui donne une vitesse
		speed =  sens*Mathf.Log(info.speed)/2 ;
		useSpeed = true ;
		
	}
}

// Déplacement
function OnDrag ( info : DragInfo) {
	
	// La fonction s'interrompt si les événements sont désactivés
	if( !eventEnable)
		return ;
	
	// Si le doigt est dans le slideshow
	if( position.Contains(info.pos) ) {
			
		isMoving = false ;
		
		
		// parramètre de départ
		if( ! isDragging ) {
			
			if( info.delta.x > 0  && currentPage > 0 ) // vers la droite
				decalRight();
				
			else if( info.delta.x > 0 ) { // vers la droite et 1er élément
				delta = GetDistance() ;
				
			} else if(currentPage < effNbElmts -1 ) { // vers la gauche
				currentPage ++ ;
				decalRight();
				delta = GetDistance() ;
		
			} else { // vers la gauche et dernier élément
				decalRight();
				delta = 0 ;
			}
		}
		
		// ajout du décalage du doigt
		delta += info.delta.x ;
			
			
		// On a passé une limite
		if( delta > GetDistance() ) { // précédent
			
			if ( currentPage == 0 ) // 1er
				delta = GetDistance() ;
			else {
				delta -= GetDistance() ;
				decalRight();
			}
			
			
		} else if (delta <0 ) { // suivant
			
			if ( currentPage == effNbElmts -2) { // dernier
				delta = 0 ;
			} else {
			
				delta += GetDistance() ;
				decalLeftfromLeft();
			}
			
		}
		
		if( InitialElmtsPos ) {
			isMoving = true ;
			useSpeed = false ;
			isDragging = true ;
		}
	}
		
}



//  relevé du doigt
function onUp(pos : Vector2) {
	
	// La fonction s'interrompt si les événements sont désactivés
	if( !eventEnable)
		return ;
	
	// On était en déplacement
	if( isDragging ) {
		
		isMoving = false ;
		
		// transfert la ou on en était pour le décalage progressif
		if (delta < GetDistance()/2 ) {
			decalLeft();
			delta = GetDistance() - delta ;
		}
		
		beginTime = Time.time - delta* transitionTime/GetDistance() ;
		
		delta = 0 ;
		isDragging = false ;
	}
	
}

// appuie
function OnTap (pos : Vector2 ) {
	
	// La fonction s'interrompt si les événements sont désactivés
	if( !eventEnable)
		return ;
	
	if( isDragging )
		return ;
	
	// As - t'on appuyé sur un élément ?
	var ray : Ray = camera.ScreenPointToRay(pos);
	var hit : RaycastHit = new RaycastHit() ;
	
	// Pour chaque élément
	for( var i = 0 ; i < effNbElmts; i++ ) {
		
		// si il n'est pas censé être visible, on passe au suivant
		if( i < currentPage - maxByHalfLine || i > currentPage + maxByHalfLine )
			continue ;
		
		// Si on a appuyé sur lui, on le place au 1er plan
		if( mobilesElmts[i].collider.Raycast(ray, hit, 1000.0f) ) {
			decalTo( i ) ;
			useSpeed = false ;
			delta = 0 ;
		}
	}	
}




/****************************************
 ******* Gestion des déplacements *******
 ****************************************/

/*
 * Test si les elments sont en mouvement
 * et met à jour les infos si le déplacement est fini
 */
private function isMovingUpdate() : boolean {
	
	if (!isMoving)
		return false ;
	
	// Si on se déplace grace à une vitesse initiale
	if( useSpeed) {
		
		// Si on a atteint l'elmt suivant
		if (beginTime + transitionTime/Mathf.Abs(speed) < Time.time) {
			
			isMoving = false ;
			if( speed > 0.5 ) 			// si on va sufisament vite vers la droite, on décale
				decalRight();
			else if (speed < -0.5 )		// si on va sufisament vite vers la gauche, on décale
				decalLeft();
			else						// sinon on s'arrete
				speed = 0;
		}
	} else {
		// Sinon, si on était en déplacement auto et qu'on a fini, on s'arrete
		if(! isDragging) {
		
			if (beginTime + transitionTime < Time.time)
				isMoving = false ;
		}
	}
	return isMoving ;
}


/*
 * Décalage vers la droite
 */
private function decalRight() {
	if (! isMoving && currentPage > 0 )
		decalTo( currentPage - 1 );
	
}

/*
 * Décalage vers la gauche
 */
private function decalLeft() {
	if (currentPage < effNbElmts-1 )
		decalTo( currentPage +1 );
}

/*
 * Décalage vers la gauche depuis encore plus a gauche
 */
private function decalLeftfromLeft() {
	if (currentPage < effNbElmts-2 ) {
		currentPage += 2 ;
		decalTo( currentPage - 1 );
	}
}

/*
 * Décalage vers la droite depuis encore plus a droite
 */
private function decalRightFromRight() {
	if (currentPage < effNbElmts-2 ) {
		currentPage -= 2 ;
		decalTo( currentPage + 1 );
	}
	
}

/*
 * Décalage vers l'élément n
 */
private function decalTo( n : int ) {
	if (! isMoving ) {
		InitialElmtsPos = GetElmtsPosition();
		InitialElmtsRot = GetElmtsRotation();
		beginTime = Time.time ;
		
		currentPage = n ;
		isMoving = true ;
	
	}
}

/*
 * Met à jour les position si en mouvement
 */
private function moveGradualy(pos : Vector3[], rot : Quaternion[] ) {
	
	// temps écoulé
	var timeFactor = (Time.time - beginTime) ;
	
	
	// déplacement constant ? (click)
	if( useSpeed) 
		timeFactor *= Mathf.Abs(speed)/ transitionTime ;
	else {
		
		if(! isDragging)
			// swipe
			timeFactor /= transitionTime ;
		else
			// drag
			timeFactor = Mathf.Abs(delta)  / GetDistance() ;
	}
		
	// Maj des pos/rot
	for( var i = 0 ; i < effNbElmts; i++) {
		
		mobilesElmts[i].transform.position =Vector3.Slerp( 	InitialElmtsPos[i],pos[i],timeFactor ) ;
		mobilesElmts[i].transform.rotation = Quaternion.Slerp( InitialElmtsRot[i], rot[i], timeFactor );
		
	}
	
	// application du frotement
	speed = speed * (1-frictionFactor*(Time.time - lastTime));
	lastTime = Time.time ;
	
}




/****************************************
 ********* Calcul des positions *********
 ****************************************/

/*
 * Crée un nouveau plan
 */
function AddElmtPlane( i : int ) {
	
	mobilesElmts[i] = new GameObject.CreatePrimitive(PrimitiveType.Plane);
	
	var size = mobilesElmts[i].renderer.bounds.size ;
	mobilesElmts[i].transform.localScale= Vector3( elmtsSize.x/size.x, 1, elmtsSize.y/size.z ) ;
	
	mobilesElmts[i].name = "SlideShow Plane "+i ;
}


// Récupère la distance entre l'element central et le suivant
private function GetDistance() : float {
	return ((spacingFactor-1)*(position.xMax - position.xMin)/(spacingFactor)) ;
}



/*
 * calcule les positions des éléments
 * en fonction de la page courante
 */

private function GetElmtsPosition() : Vector3[] {
	
	
	var tabPos : Vector3[] = new Vector3[effNbElmts] ;
	
	for( var i = 0 ; i < effNbElmts; i ++ ) {
		
		if( i - currentPage  < -maxByHalfLine ) {
			
			tabPos[i] =  camera.ScreenToWorldPoint( Vector3(position.xMin + decal.x , position.yMin + decal.y , z) );
			
		} else if ( i - currentPage  > maxByHalfLine ) {
			
			tabPos[i] =  camera.ScreenToWorldPoint( Vector3(position.xMax + decal.x , position.yMin + decal.y , z) );
		
		} else if (  i - currentPage  < 0 ) {
			
			tabPos[i] = camera.ScreenToWorldPoint( Vector3(
						position.xMin + (position.xMax - position.xMin)/(2*Mathf.Pow( spacingFactor, currentPage - i )) + decal.x ,
						position.yMin + decal.y ,
						z ) );
		} else {
			
			tabPos[i] = camera.ScreenToWorldPoint( Vector3(
						position.xMax - (position.xMax - position.xMin)/(2*Mathf.Pow( spacingFactor, i - currentPage  )) + decal.x ,
						position.yMin + decal.y ,
						z ) );
		}
		
	}
	
	return tabPos ;
}


/*
 * calcule les rotations des éléments
 * en fonction de la page courante
 */
private function GetElmtsRotation() : Quaternion[] {
	
	
	var tabPos : Quaternion[] = new Quaternion[effNbElmts] ;
	
	var sens = (toBg) ? 1 : -1 ;
	
	for( var i = 0 ; i < effNbElmts; i ++ ) {
	
		tabPos[i] = camera.transform.rotation ;
		tabPos[i] *= Quaternion.AngleAxis(-90, Vector3( 1,0,0) );
		tabPos[i] *= Quaternion.AngleAxis(180, Vector3( 0,1,0) );
		
		if( i - currentPage  < -maxByHalfLine ) {
			
			tabPos[i]  *= Quaternion.AngleAxis( - sens*90, Vector3( 0,0,1) );
			
		} else if ( i - currentPage  > maxByHalfLine ) {
			
			tabPos[i] *= Quaternion.AngleAxis( sens*90, Vector3( 0,0,1) );
		
		} else if (  i - currentPage  < 0 ) {
			
			tabPos[i] *= Quaternion.AngleAxis( -sens* (90 - 90/(Mathf.Pow( spacingFactor, currentPage - i )) ), Vector3( 0,0,1)  );
			
		} else {
		
			tabPos[i] *= Quaternion.AngleAxis( sens*( 90 - 90/(Mathf.Pow( spacingFactor , i - currentPage )) ), Vector3( 0,0,1)  );
		}
		
	}
	return tabPos ;
}







