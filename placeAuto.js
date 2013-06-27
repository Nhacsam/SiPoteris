#pragma strict


// Liste des donnée des plans à positionner
private var pDatasList : Array ;


public function InitPlacer() {
	pDatasList = new Array();
}




public function addPlane( datas : Hashtable ) {
	pDatasList.Push(datas);
}


public function compute( placeRect : function(Hashtable, String) ) {
	
	var firstFloorLat = -10 ;
	var secondFloorLat = 20 ;
	var thirdFloorLat = 50 ;
	
	var latVariationRange : float = 10 ;
	
	var obj = new GameObject();
	var s : scriptForPlane = obj.AddComponent('scriptForPlane') as scriptForPlane ;
	
	// Calcul du nombre d'élément par étage
	var nbOnFloor : int[] = nbByFloor( 3, pDatasList.length ) ;
	
		
	
	for( var i = 0 ; i < pDatasList.length; i++ ) {
		
		var params : Hashtable = pDatasList[i] ;
		var PositionningFactor2D : float ;
		var PositionningFactor3D : float ;
		var nbOnThisFloor : int ;
		
		// Random value !! I have no idea what I'm doing !
		params['scale'] = 0.1 ;
		
		var randomVariation : float = Random.Range(0, latVariationRange);
		randomVariation -= latVariationRange/2 ;
		
		/*
		 * On détermine à quel étage on se situe
		 */
		if( i < nbOnFloor[0] && nbOnFloor[0] > 0) {
			
			nbOnThisFloor = nbOnFloor[0] ;
			
			PositionningFactor2D = (nbOnThisFloor == 1 ) ? 1 : (1.0*i / (nbOnThisFloor-1) ) ;
			PositionningFactor3D = (nbOnThisFloor == 1 ) ? 1 : (1.0*i / (nbOnThisFloor) ) ;
			
			params['latitude'] = firstFloorLat + randomVariation ;
			params['posy'] = 1.0/6;
			params['sizey'] = 1.0/3 ;
			
		} else if( i < nbOnFloor[0] + nbOnFloor[1] && nbOnFloor[1] > 0) {
			
			nbOnThisFloor = nbOnFloor[1] ;
			PositionningFactor2D = (1.0*i - nbOnFloor[0]) / (nbOnFloor[1]-1);
			PositionningFactor3D = (1.0*i - nbOnFloor[0]) / (nbOnFloor[1]);
			
			params['latitude'] = secondFloorLat + randomVariation ;
			params['posy'] = 3.0/6 ;
			params['sizey'] = 1.0/3 ;
			
		} else if( i < nbOnFloor[0] + nbOnFloor[1]+ nbOnFloor[2] && nbOnFloor[2] > 0) {
			
			nbOnThisFloor = nbOnFloor[2] ;
			PositionningFactor2D = (1.0*i - nbOnFloor[0] - nbOnFloor[1]) / (nbOnFloor[2]-1);
			PositionningFactor3D = (1.0*i - nbOnFloor[0] - nbOnFloor[1]) / (nbOnFloor[2]);
			
			params['latitude'] = thirdFloorLat + randomVariation ;
			params['posy'] = 5.0/6 ;
			params['sizey'] = 1.0/3 ;
			
		}
		
		// positionnement en 2D
		params['posx'] = PositionningFactor2D ;
		params['sizex'] = 1.0/(nbOnThisFloor) ;
		
		// écart entre deux elmts consécutifs
		var longdistance : float = 360.0/nbOnThisFloor ;
		randomVariation = Random.Range(0, longdistance/2);
		randomVariation -= longdistance/4 ;
		
		params['longitude'] = 360.0*PositionningFactor3D + randomVariation ;
		
		// init variables of script
		s.InitScript( pDatasList[i] as Hashtable );
		
		var imgs : Array = s.getHandler().getImages();
		var img : String = null ;
		
		if( imgs.length > 0) {
			img = imgs[0];
		}
		params['ratiotexture'] = 1.0 ;
		params['deltax'] = 0;
		params['deltay'] = 0;
		params['deltaz'] = 0;
		
		params['maxdeltax'] = 3 ;
		params['maxdeltay'] = 3 ;
		params['maxdeltaz'] = 3 ;
		
		if( params.ContainsKey( 'maxdeltax') )
			params['deltax'] = Random.Range(0, params['maxdeltax'] );
		if( params.ContainsKey( 'maxdeltay') )
			params['deltay'] = Random.Range(0, params['maxdeltay'] );
		if( params.ContainsKey( 'maxdeltaz') )
			params['deltaz'] = Random.Range(0, params['maxdeltaz'] );
		
		if( ! params.ContainsKey( 'name') )
			params['name'] = 'name'+i ;
		placeRect(params, img);
		
	}
	Destroy(obj);
}


private function nbByFloor( nbFloor : int, nbElemt : int ) : int[] {
	
	
	var nbBaseByFloor : int = Mathf.Floor( nbElemt*1.0/nbFloor ) ;
	var unplaced : int  = nbElemt % nbFloor ;
	
	var resultArray : int[] = new int[nbFloor];
	
	for( var i = 0; i < nbFloor; i ++) {
		
		if( unplaced > 0 ) {
			resultArray[i] = nbBaseByFloor+1  ;
			unplaced-- ;
		} else
			resultArray[i] = nbBaseByFloor ;
		
	}
	
	return resultArray ;
}







