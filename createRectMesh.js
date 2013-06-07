/*
	Creation : 04/06/2013
	Author : Fabien Daoulas
	Last update
	
	This script creates plane over an other plane, that can be tactile areas on the screen of iPad.
	A plane is defined with three parameters:
				-center of the plane
				-height in percentage of the height of the video
				-width in percentage of the width of the video
*/

private var surface : GameObject;

// scripts
private var show : showingWindow;
private var video : videoSettings;


// radius of sphere where th rectangle will be splited
private var radius : float = 5;


///////////////////
//////2D view//////
///////////////////

/*
 * get plane where the movie is displayed
*/
function SetSurface( s : GameObject ) {
	surface = s ;
}

/*
	*create rectangle in 2D view
*/
public function createRect2D( t : Hashtable ){
	if(	t.ContainsKey( 'posx' ) &&
		t.ContainsKey( 'posy' ) &&
		t.ContainsKey( 'sizex' ) &&
		t.ContainsKey( 'sizey' ) &&
		t.ContainsKey( 'name' ) 	 &&
		surface){// check if all elements needed to create the plane are not null
		
		show = gameObject.GetComponent("showingWindow") as showingWindow;

		// create a new plane
		var obj : GameObject = GameObject.CreatePrimitive( PrimitiveType.Plane );
		obj.name = "2D_rect_"+t['name'];
		
		// set position of plane
		setPlane2D( t , obj );
	
		// disable renderer
		obj.renderer.enabled = false;
	
		return obj;
	}
	else{
		Console.Warning("An element is missing in xml_data to create the plane or the gameobject on which the movie is displayed is not assigned");
		return;
	}
}

/*
	*positionnate the plane according to the information loaded in the xml
	*video plane is perpendicular to the y-axis
*/
private function setPlane2D( t : Hashtable , g : GameObject ){
	// set the rotation and position of plane
	// now the plane is at the center of the video plane and has the same rotation
	g.transform.position = surface.transform.position;
	g.transform.rotation = surface.transform.rotation;

	// get mesh of the video plane
	var meshFilterVideo : MeshFilter;
	meshFilterVideo = surface.GetComponent("MeshFilter");
	var meshVideo : Mesh = meshFilterVideo.mesh;
	
	// set the position of plane
	if( typeof(t['posx']) == typeof(String) )//check type of elements
		var posX = float.Parse( t['posx'] );
	else
		posX = t['posx'];
	if( typeof(t['posy']) == typeof(String) )
		var posY = float.Parse( t['posy'] );
	else
		posY = t['posy'];
	
	g.transform.position.x -= posX*meshVideo.bounds.size.x/2;
	g.transform.position.z += posY*meshVideo.bounds.size.z/2;
	
	// set scale of plane
	// get scale of videoplane
	
		if( typeof(t['sizex']) == typeof(String) )//check type of elements
			var sizX : float = float.Parse( t['sizex'] );
		else
			sizX = t['sizex'];
		if( typeof(t['sizey']) == typeof(String) )//check type of elements
			var sizY : float = float.Parse( t['sizey'] );
		else
			sizY = t['sizey'];
	
	var v : Vector3 = surface.transform.localScale;
	var vPlane : Vector3;
	vPlane.x = v.x*sizX;
	vPlane.y = v.y;
	vPlane.z = v.z*sizY;
	g.transform.localScale = vPlane;
}

/*
 * give a point in the normal axe of the plane which is passing by the center
 */
public function getOrientedTo( t : Hashtable , obj : GameObject) : Vector3 {
	
	var v : Vector3 = obj.transform.position;
	return v + Vector3( 0,1,0);
}

///////////////////
//////3D view//////
///////////////////




function createRect3DParam(theta : float , phi : float , scale : float , ratiotexture : float , name : String, path : String ) : GameObject {
	
	// set position, scale, rotation of rectangle
	var obj : GameObject = setRect3D( theta , phi , scale , ratiotexture , name );
	if( path ){
		// load asset
		var texture = Resources.Load( path );
		
		if( texture ){// if file exists
			//test if the asset has the appropriate type
			if( typeof( texture ) == typeof(Texture) || typeof( texture ) == typeof(Texture2D) ){
				// add texture to display on the plane
				obj.renderer.material.mainTexture = texture;
				obj.renderer.enabled = true;
		
				return obj;
			}//if
			else{
				// disable renderer
				obj.renderer.enabled = false;
				Console.Warning("File is typeof "+typeof(texture)+" whereas it should be typeof Texture or Texture2D");
				return obj;
			}
		}//if
		else
			Console.Warning("No file found at path : " + path);
	}//if
	else{
		// disable/enable renderer
		obj.renderer.enabled = true;
		return obj;
	}
}



/*
	*create rectangle in 3D view
*/
function createRect3D( t : Hashtable , path : String ) : GameObject {

	video = gameObject.GetComponent("videoSettings") as videoSettings;
	
	if(	t.ContainsKey( 'longitude' ) 	&&
		t.ContainsKey( 'latitude' ) 		&&
		t.ContainsKey( 'scale' ) 	&&
		t.ContainsKey( 'name' )		&&
		t.ContainsKey( 'ratiotexture')	) {
		
			if( typeof(t['longitude']) == typeof(String) )// check type of elements in hashtable
				var theta : float = float.Parse( t['longitude'] ) * Mathf.PI/180;// convert to radian
			else
				theta = t['longitude'] * Mathf.PI/180;// convert to radian
			if( typeof(t['latitude']) == typeof(String) )// check type of elements in hashtable
				var phi : float = float.Parse( t['latitude'] ) * Mathf.PI/180;// convert to radian
			else
				phi = t['latitude'] * Mathf.PI/180;// convert to radian
			if( typeof(t['scale']) == typeof(String) )// check type of elements in hashtable
				var scale : float = float.Parse( t['scale'] );
			else
				scale = t['scale'];
			if( typeof(t['ratiotexture']) == typeof(String) )//check type of elements in hashtable
				var ratiotexture : float = float.Parse( t['ratiotexture'] );
			else			
				ratiotexture = t['ratiotexture'];
			
			var name : String = t['name'];
			return createRect3DParam(theta, phi, scale, ratiotexture, name, path);
	}//if
	else{// return null if a parameter is missing in the xml file - the gameobject is not created
		Console.Warning("An element is missing in xml_data to create the mesh");
		return null ;
	}
}

/*
	*set rectangle 3D
*/
private function setRect3D( theta : float , phi : float , scale : float , ratiotexture : float , name : String ) : GameObject{
				
	// create new plane
	var obj : GameObject = GameObject.CreatePrimitive( PrimitiveType.Plane );
	obj.name = "3D_rect_"+name;
			
	// set position of plane around the sphere
	var v : Vector3;
	v.x = radius * Mathf.Sin(theta) * Mathf.Cos(phi)  	+ ( video.getSpherePos() ).x ;
	v.y = radius * Mathf.Sin(phi) 						+ ( video.getSpherePos() ).y;
	v.z = radius * Mathf.Cos(theta) * Mathf.Cos(phi)  	+ ( video.getSpherePos() ).z;
	obj.transform.position = v;
		
	// set rotation of plane to face the center of the sphere
	obj.transform.LookAt( video.getSpherePos() );
	obj.transform.localEulerAngles += Vector3(90,0,0);
		
	// set scale
	if( ratiotexture ){
		obj.transform.localScale = Vector3( scale*Mathf.Sqrt(ratiotexture) , 0 , scale/Mathf.Sqrt(ratiotexture) );
	}
	else
		obj.transform.localScale = Vector3( scale , 0 , scale );		
					
	// disable/enable renderer
	obj.renderer.enabled = false;
			
	return obj;
}
