#pragma strict


// Position du slideShow
private var position : Rect ;
private var z : float ;

// Elements mobiles affiché
private var mobilesElmts : GameObject[] ;
private var nbElmts : int ;
private var effNbElmts : int ;

// informations liés aux éléments (utile uniquemment au parent)
private var elmtsInfo : Array ;

private var elmtsSize : Vector2 = new Vector2(10, 10);
private var decal : Vector2 ;

// ou on en est dans les mouvements
private var currentPage : int  = 5;
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







/*
 * Ajoute les listener d'envenements
 */

function OnEnable(){
	Gesture.onSwipeE += OnSwipe;
	Gesture.onDraggingE += OnDrag;
	Gesture.onPinchE += OnPinch ;// zoom
		
	//Gesture.onShortTapE += OnTap;
	Gesture.onLongTapE += OnTap;
	Gesture.onDoubleTapE += OnTap;
	
	Gesture.onUpE += onUp ;
	
}


function OnDisable(){
	Gesture.onSwipeE -= OnSwipe;
	Gesture.onDraggingE -= OnDrag;
	Gesture.onPinchE -= OnPinch ;// zoom
		
	//Gesture.onShortTapE -= OnTap;
	Gesture.onLongTapE -= OnTap;
	Gesture.onDoubleTapE -= OnTap;

	Gesture.onUpE -= onUp ;
}






/*
 * Initialisation des variables
 */

function InitSlideShow( nbOfElmts : int, Pos : Rect, Z : float  ) {
	
	// enregistrement des données
	nbElmts = nbOfElmts ;
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
	for( var i = 0 ; i < nbOfElmts; i++)
		AddElmtPlane(i);
	
	elmtsInfo = new Array( nbOfElmts );
	
	isMoving = false ;
	effNbElmts = 0 ;
}


/*
 * Initialisation avec les positions en facteru entre 0 et 1
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
 * Maj des éléments
 */


function UpDateSlideShow() {
	
	// Pour test sur PC
	if( Input.GetMouseButtonDown(0) )
		OnTap(Input.mousePosition);
		
	
	// positions et rotations finales
	var pos = GetElmtsPosition();
	var rot = GetElmtsRotation();
	
	var i = 0 ;
	
	// Si on est pas en mvt, on place directement les objets
	if( ! isMovingUpdate() ) {
		
		effectiveCurrentPage = currentPage ;
		
		for( i = 0 ; i < nbElmts; i++) {
			mobilesElmts[i].transform.position = pos[i] ;
			mobilesElmts[i].transform.rotation = rot[i] ;
		}
		
	} else {
		// Sinon on les déplace petit à petit
		moveGradualy(pos, rot);
	}
		
}


/*
 * Destruction du slideShow
 */
function destuctSlideShow() {
	
	for(var i = 0 ; i < nbElmts; i++) {
		if( mobilesElmts[i]  )
			Destroy( mobilesElmts[i] );
	}
	nbElmts = 0 ;
	
	
}



/*
 * Récupère les infos du plan courant
 */
function getCurrentAssociedInfo() {
	return elmtsInfo[ effectiveCurrentPage ];
}



/*
 * instancie le plan
 */

function AddElmt( texture : String, info ) : boolean {
	
	
	if( effNbElmts > nbElmts-1 ) {
		effNbElmts-- ;
		Debug.LogError( "Too many elmts given in slideShow" );
		return false ;
	}
	
	AddElmtPlane( effNbElmts );
	
	elmtsInfo[ effNbElmts ] = info ;
	
	var imgTex = Resources.Load(texture);
	mobilesElmts[ effNbElmts].renderer.material.mainTexture = imgTex ;
	
	
	effNbElmts++ ;
	
	return true ;
}





/*
 * Crée un nouveau plan
 */
function AddElmtPlane( i : int ) {
	
	mobilesElmts[i] = new GameObject.CreatePrimitive(PrimitiveType.Plane);
	
	var size = mobilesElmts[i].renderer.bounds.size ;
	mobilesElmts[i].transform.localScale= Vector3( elmtsSize.x/size.x, 1, elmtsSize.y/size.z ) ;
	
	mobilesElmts[i].name = "SlideShow Plane "+i ;
}






/*
 * Test si les elments sont en mouvement
 * et met à jour les infos
 */
private function isMovingUpdate() : boolean {
	
	if (!isMoving)
		return false ;
	
	if( useSpeed) {
		if (beginTime + transitionTime/Mathf.Abs(speed) < Time.time) {
			
			isMoving = false ;
			if( speed > 0.5 )
				decalRight();
			else if (speed < -0.5 )
				decalLeft();
			else
				speed = 0;
		}
	} else {
		if(! isDragging) {
			
			if (beginTime + transitionTime < Time.time)
				isMoving = false ;
		}
	}
	return isMoving ;
}





/*
 * Les Callbacks de gestion des événemments
 */

// Balaiement
function OnSwipe ( info : SwipeInfo) {
	
	if( position.Contains(info.startPoint) && !position.Contains(info.endPoint) ) {
		
		var sens = 1 ;
		
		if( info.angle  < 90 || info.angle > 270 ) {
			decalRight();
			sens = 1 ;
		} else {
			decalLeft();
			sens = -1 ;
		}
		

		speed =  sens*Mathf.Log(info.speed)/2 ;
		useSpeed = true ;
		
	}
}

// Déplacement
function OnDrag ( info : DragInfo) {
	
	if( position.Contains(info.pos) ) {
			
		isMoving = false ;
		
		
		// démarrage
		if( ! isDragging ) {
			
			if( info.delta.x > 0  && currentPage > 0 )
				decalRight();
				
			else if( info.delta.x > 0 ) {
				delta = GetDistance() ;
				
			} else if(currentPage < nbElmts -1 ) {
				currentPage ++ ;
				decalRight();
				delta = GetDistance() ;
		
			} else {
				print('wtf');
				decalRight();
				delta = 0 ;
			}
		}
		// ajout
		delta += info.delta.x ;
			
			
		// On a passé une limite
		if( delta > GetDistance() ) {
			
			if ( currentPage == 0 )
				delta = GetDistance() ;
			else {
				delta -= GetDistance() ;
				decalRight();
			}
			
			
		} else if (delta <0 ) {
			
			if ( currentPage == nbElmts -2) {
				delta = 0 ;
			} else {
			
				delta += GetDistance() ;
				decalLeftfromLeft();
			}
			
		}
				
		isMoving = true ;
		useSpeed = false ;
		isDragging = true ;
	}
		
}



//  relevé du doigt
function onUp(pos : Vector2) {
	
	if( isDragging ) {
		
		isMoving = false ;
		
		
		print(' ******************* ');
		print(delta);
		
		if (delta < GetDistance()/2 ) {
			decalLeft();
		}
		
		print(beginTime);
		print(beginTime + transitionTime);
		print(Time.time / transitionTime);
		
		beginTime = Time.time - delta* transitionTime/GetDistance() ;
		
		
		
		
		print( delta* transitionTime/GetDistance() );
		
		
		delta = 0 ;
		isDragging = false ;
	}
	
}



// Zoom avec les doigts
function OnPinch ( amp : float ) {

}


// appuie
function OnTap (pos : Vector2 ) {
	
	
	var ray : Ray = camera.ScreenPointToRay(pos);
	var hit : RaycastHit = new RaycastHit() ;
	
	for( var i = 0 ; i < nbElmts; i++ ) {
		
		if( i < currentPage - maxByHalfLine || i > currentPage + maxByHalfLine )
			continue ;
		
		if( mobilesElmts[i].collider.Raycast(ray, hit, 1000.0f) ) {
			decalTo( i ) ;
			useSpeed = false ;
			delta = 0 ;
		}
	}
	
}




/*
 * Déplacement des éléments
 */

private function decalRight() {
	
	if (! isMoving && currentPage > 0 )
		decalTo( currentPage - 1 );
	
}

private function decalLeft() {
	
	if (currentPage < nbElmts-1 )
		decalTo( currentPage +1 );
}

private function decalLeftfromLeft() {
	
	if (currentPage < nbElmts-2 ) {
		currentPage += 2 ;
		decalTo( currentPage - 1 );
	}
}

private function decalRightFromRight() {
	
	if (currentPage < nbElmts-2 ) {
		currentPage -= 2 ;
		decalTo( currentPage + 1 );
	}
	
}

private function decalTo( n : int ) {
	if (! isMoving ) {
		InitialElmtsPos = GetElmtsPosition();
		InitialElmtsRot = GetElmtsRotation();
		beginTime = Time.time ;
		
		currentPage = n ;
		isMoving = true ;
	
	}
}

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
	for( var i = 0 ; i < nbElmts; i++) {
	
		mobilesElmts[i].transform.position =Vector3.Slerp( 	InitialElmtsPos[i],
															pos[i],
															timeFactor ) ;
		mobilesElmts[i].transform.rotation = Quaternion.Slerp( InitialElmtsRot[i], rot[i], timeFactor );
		
	}
	
	// application du frotement
	speed = speed * (1-frictionFactor*(Time.time - lastTime));
	lastTime = Time.time ;
	
}




/*
 * calcule les positions des éléments
 * en fonction de la page courante
 */

private function GetElmtsPosition() : Vector3[] {
	
	
	var tabPos : Vector3[] = new Vector3[nbElmts] ;
	
	for( var i = 0 ; i < nbElmts; i ++ ) {
		
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
	
	
	var tabPos : Quaternion[] = new Quaternion[nbElmts] ;
	
	var sens = (toBg) ? 1 : -1 ;
	
	for( var i = 0 ; i < nbElmts; i ++ ) {
	
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


// Récupère la distance entre l'element central et le suivant
private function GetDistance() : float {
	return ((spacingFactor-1)*(position.xMax - position.xMin)/(2*spacingFactor)) ;
}




