#pragma strict


// Liste des donnée des plans à positionner
private var pDatasList : Array ;





















public function InitPlacer() {
	pDatasList = new Array();
}




public function addPlane( datas : Hashtable ) {
	pDatasList.Push(datas);
}


public function compute( placeRect : function(Hashtable) ) {
	
	var firstFloorLat = 25 ;
	var secondFloorLat = 45 ;
	var thirdFloorLat = 65 ;
	
	
	
	
	
	var nbByFloor : int = Mathf.Floor( pDatasList.length /3 ) ;
	var unplaced : int  = pDatasList.length % 3 ;
	
	var nbOnFirstFloor = nbByFloor;
	var nbOnSecondFloor = nbByFloor;
	var nbOnThirdFloor = nbByFloor;
	
	if( unplaced > 0 ) {
		nbOnFirstFloor ++ ;
		unplaced-- ;
	}
	if( unplaced > 0 ) {
		nbOnSecondFloor ++ ;
		unplaced-- ;
	}
	
	for( var i = 0 ; i < pDatasList.length; i++ ) {
		
		var params : Hashtable = pDatasList[i] ;
		var PositionningFactor : float ;
		
		// Random value !! I have no idea what I'm doing !
		params['scale'] = 1.0 ;
		
		if( i < nbOnFirstFloor && nbOnFirstFloor > 0) {
			
			PositionningFactor = i / nbOnFirstFloor ;
			params['latitude'] = firstFloorLat ;
			params['posy'] = 0.0 ;
			params['sizey'] = 0.333 ;
			
		} else if( i < nbOnFirstFloor + nbOnSecondFloor && nbOnSecondFloor > 0) {
			
			PositionningFactor = (i - nbOnFirstFloor) / nbOnSecondFloor;
			params['latitude'] = secondFloorLat ;
			params['posy'] = 0.333 ;
			params['sizey'] = 0.333 ;
			
		} else if( i < nbOnFirstFloor + nbOnSecondFloor+ nbOnThirdFloor && nbOnThirdFloor > 0) {
			
			PositionningFactor = (i - nbOnFirstFloor - nbOnSecondFloor) / nbOnThirdFloor;
			params['latitude'] = thirdFloorLat ;
			params['posy'] = 0.666 ;
			params['sizey'] = 0.334 ;
			
		}
		
		params['posx'] = PositionningFactor ;
		params['sizex'] = 1/PositionningFactor ;
		params['longitude'] = 360*PositionningFactor ;
		
		var s : scriptForPlane = new scriptForPlane();
		// init variables of script
		s.InitScript( pDatasList[i] as Hashtable );
		
		var imgs : Array = s.getImages();
		var img : String ;
		
		if( imgs.length > 0) {
			
			img = imgs[0];
		} else {
			img = null ;
			params['ratiotexture'] = 1.0 ;
		}
		
		
		if( ! params.ContainsKey( 'name') )
			params['name'] = 'name'+i ;
		placeRect(params);
	}
	
}