/*
	Creation : 22 / 04 / 2013
	Author : Fabien Daoulas
	Updates : 29 / 04 / 2013
	
	This script :
	- creates meshes
	- places it to fit on a plane watched by a camera.
	- instantiates a script to each plane created, this script contains hashtable (text, audio, other movies...)
	
*/

// quantum of the mesh
private var quantumOfMesh : float = 0.05f;

// coordonates of vertices in local space
private var VerticesLocal : Vector3[];

// coordonates of vertex in the middle of mesh in world space
private var VerticesInMiddle : Vector3;

// contain triangles
private var DatTriangles : Array;

private var surface : GameObject ;


// test
private var firstTime : boolean = true;



/*
 * get surface
*/
function SetSurface( s : GameObject ) {
	surface = s ;
}


/*
	*place meshes at the position loaded into the XML
	*RatioRmax/min are a ratio between the position of plane and the radius of circle
	*create a script attached to this plane
*/
function placeMesh( thetaMin : float, thetaMax : float, RatioRmin : float, RatioRmax : float, mesh_name : String) : GameObject{
	
	var meshFilter : MeshFilter;
	meshFilter = surface.GetComponent("MeshFilter");
	
	var mesh : Mesh = meshFilter.mesh;
	
	// calculate the true radius
	var Rmax : float = RatioRmax * mesh.bounds.size.x/2;
	var Rmin : float = RatioRmin * mesh.bounds.size.x/2;

	// from degrees to radian
	thetaMin = thetaMin * Mathf.PI/180;
	thetaMax = thetaMax * Mathf.PI/180;
	
	// create meshes at the right position
	var obj : GameObject = CreatePolarMesh(thetaMin, thetaMax, Rmin, Rmax, mesh_name);
	
	obj.transform.position.y = surface.transform.position.y - 1;
	
	return obj;
}


/*
	*create meshes - piece of circle - at the position and around the axis specified in parameters
*/
private function CreatePolarMesh(thetaMin : float, thetaMax : float, Rmin : float, Rmax : float, mesh_name : String) : GameObject{
	
	var meshBuilding : Mesh = new Mesh();//this is the mesh we’re creating
	meshBuilding.name = "sphere_" + mesh_name;
	
	// local coordinates of mesh
	var coorScreen : Vector3;

	var numberOfLines : int = Mathf.Floor((Rmax - Rmin)/quantumOfMesh) + 1;
	var numberOfVertices : int = Mathf.Floor((thetaMax - thetaMin)/quantumOfMesh + 1)*Mathf.Floor(((Rmax - Rmin)/quantumOfMesh + 1));
	var numberOfColumns : int = numberOfVertices/numberOfLines;

	VerticesLocal = new Vector3[ numberOfVertices ];
	
	for( var i : int = 0; i < numberOfColumns ; i ++ ){
		for(var j=0; j < numberOfLines ; j ++ ) {
			
			var radius = Rmin + j*quantumOfMesh ;
			var angle = thetaMin + i*quantumOfMesh ;
			
							
				// here you can orientate the mesh
				coorScreen.x = radius * Mathf.Cos(angle);
				coorScreen.y = 0;
				coorScreen.z = radius * Mathf.Sin(angle);

				VerticesLocal[i*numberOfLines + j] = coorScreen;
		}
	}
	
	meshBuilding.vertices = VerticesLocal;
	
	// we dont realy care about UVs here
	var UV = new Array();
	for(i = 0; i < numberOfVertices ; i++)
		UV[i] = Vector2(VerticesLocal[i].x, VerticesLocal[i].z);
		
	meshBuilding.uv = UV;

	
	// create triangles
	DatTriangles = new Array();
	
	for( i=0; i < numberOfColumns - 1 ; i ++ ){// avoid last lines and last columns
		for( j=0; j < (numberOfLines - 1) ; j ++ ) {
			if(i < numberOfColumns - 1){
				DatTriangles.Push( i*numberOfLines + j );
				DatTriangles.Push( i*numberOfLines + j + 1 );
				DatTriangles.Push( (i+1)*numberOfLines + j );
			
				DatTriangles.Push( i*numberOfLines + j+1 );
				DatTriangles.Push( (i+1)*numberOfLines + j + 1 );
				DatTriangles.Push( (i+1)*numberOfLines + j );
			}
			else{
				DatTriangles.Push( i*numberOfLines + j );
				DatTriangles.Push( i*numberOfLines + j + 1 );
				DatTriangles.Push( j );
				
				DatTriangles.Push( i*numberOfLines + j+1 );
				DatTriangles.Push( j + 1 );
				DatTriangles.Push( j );
			}
		}
	}
	
	meshBuilding.triangles = DatTriangles;
	
	meshBuilding.RecalculateBounds();
	meshBuilding.RecalculateNormals();
	
	var obj : GameObject = new GameObject( meshBuilding.name , MeshRenderer ,  MeshFilter , MeshCollider );
	 
	// add mesh filter
	obj.GetComponent(MeshFilter).mesh = meshBuilding;
	
	// add mesh collider
	obj.GetComponent(MeshCollider).sharedMesh = meshBuilding;

	obj.renderer.enabled = false;

	return obj;
}

/*
	*give the true position of the planes in world coordinates - cause actually they are situated at ( 0 , 0 , 0 )
*/
public function getTruePosition( thetaMin : float , thetaMax : float , RatioRmin : float , RatioRmax : float , obj : GameObject) : Vector3{
	var meshFilter : MeshFilter = surface.GetComponent("MeshFilter");
	var mesh : Mesh = meshFilter.mesh;
	
	// calculate the true radius
	var Rmax : float = RatioRmax * mesh.bounds.size.x/2;
	var Rmin : float = RatioRmin * mesh.bounds.size.x/2;

	var r : float = Rmin + ( Rmax - Rmin ) / 2;
	var a : float = thetaMin + ( thetaMax - thetaMin ) / 2;
	a = a * Mathf.PI / 180;

	return Vector3( r * Mathf.Cos( a ) , obj.transform.position.y , r * Mathf.Sin( a ) );

}



