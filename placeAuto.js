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
	
	Console.Test( 'nbOnFirstFloor : ' + nbOnFirstFloor, 100);
	Console.Test( 'nbOnSecondFloor : ' + nbOnSecondFloor, 100);
	Console.Test( 'nbOnThirdFloor : ' + nbOnThirdFloor, 100);
	
	
	for( var i = 0 ; i < pDatasList.length; i++ ) {
		
		var params : Hashtable = pDatasList[i] ;
		var PositionningFactor : float ;
		var nbOnFloor : int ;
		
		// Random value !! I have no idea what I'm doing !
		params['scale'] = 1.0 ;
		
		Console.Test( 'i : ' + i, 100);
		
		if( i < nbOnFirstFloor && nbOnFirstFloor > 0) {
			
			PositionningFactor = 1.0*i / nbOnFirstFloor ;
			nbOnFloor = nbOnFirstFloor ;
			params['latitude'] = firstFloorLat ;
			params['posy'] = -0.666 ;
			params['sizey'] = 0.333 ;
			
		} else if( i < nbOnFirstFloor + nbOnSecondFloor && nbOnSecondFloor > 0) {
			
			PositionningFactor = (1.0*i - nbOnFirstFloor) / nbOnSecondFloor;
			nbOnFloor = nbOnSecondFloor ;
			params['latitude'] = secondFloorLat ;
			params['posy'] = 0;
			params['sizey'] = 0.333 ;
			
		} else if( i < nbOnFirstFloor + nbOnSecondFloor+ nbOnThirdFloor && nbOnThirdFloor > 0) {
			
			PositionningFactor = (1.0*i - nbOnFirstFloor - nbOnSecondFloor) / nbOnThirdFloor;
			nbOnFloor = nbOnThirdFloor ;
			params['latitude'] = thirdFloorLat ;
			params['posy'] = 0.666 ;
			params['sizey'] = 0.334 ;
			
		}
		Console.Test( 'PositionningFactor : ' + PositionningFactor, 100);
		params['posx'] = (PositionningFactor+1/2*nbOnFloor) *2 - 1 ;
		Console.Test( 'params[\'posx\'] : ' + params['posx'], 101);
		Console.Test( 'params[\'posy\'] : ' + params['posy'], 101);
		
		params['sizex'] = 1.0/(nbOnFloor-1) ;
		params['longitude'] = 360.0*PositionningFactor ;
		
		var s : scriptForPlane = new scriptForPlane();
		// init variables of script
		s.InitScript( pDatasList[i] as Hashtable );
		
		var imgs : Array = s.getImages();
		var img : String = null ;
		
		if( imgs.length > 0) {
			img = imgs[0];
		}
		params['ratiotexture'] = 1.0 ;
		
		if( ! params.ContainsKey( 'name') )
			params['name'] = 'name'+i ;
		placeRect(params, img);
	}
	
}