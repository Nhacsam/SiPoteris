#pragma strict


// instantiate scripts
private var xml : getXML;
private var createPolar : createPolarMesh;


function Start () {
	
	createPolar = gameObject.AddComponent("createPolarMesh") as createPolarMesh;
	xml = gameObject.AddComponent("getXML") as getXML;

	
	/*
	 * Inits
	 */	
			
		
	xml.InitXml("xml_data");
	
	// create pieces of circle for Diane
	xml.getElementFromXML( placeMeshHash );

}

func=ù=======+£ùtion Update () {
}



/*
	*place piece of circle according to xml
	*init hashtable in the sript attached to the plane
*/

function placeMeshHash ( t : Hashtable ){
	
	var obj = 	new GameObject() ;
	
	
	var s : scriptForPlane = obj.GetComponent("scriptForPlane");
	if( ! s)
		// add script to the plane
		s  = obj.AddComponent ("scriptForPlane");
	
	s.InitScript( t );
	s.getSounds();
	s.getImages() ;
	s.getVideos();
	s.getMiniatures();
}

