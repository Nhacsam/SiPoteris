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
		
		if( i < nbOnFirstFloor ) {
			
			var PositionningFactor = i / nbOnFirstFloor ;
			
			
			
		}
		
		
		
		
		
		
		var params : Hashtable = pDatasList[i] ;
		params['longitude'] = i+'' ;
		params['latitude'] = i+'' ;
		params['scale'] = i%5/5+'' ;
		params['ratiotexture'] = (i%10/5)+'' ;
		params['posx'] = 0.0 ;
		params['posy'] = 0.0 ;
		params['sizex'] = 0.33 ;
		params['sizey'] = 0.33 ;
		
		if( ! params.ContainsKey( 'name') )
			params['name'] = 'name'+i ;
		placeRect(params);
	}
	
}