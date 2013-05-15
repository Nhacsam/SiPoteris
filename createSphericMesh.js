/*
Creation : 02/04/2013
Last update : 14/05/2013

Author : Fabien Daoulas
Debug : Nicolas Djambazian

This script creates a piece of sphere.
axis are those of Unity.
*/

// vertices corresponding to a filled "line" : leave second loop to increase thetaValue - this is the first vertex of the line
private var lineFilled : int[];

// contain triangles
private var DatTriangles : Array;

// coordonates of vertex in the middle of mesh in world space
private var VerticesInMiddle : Vector3;

// coordonates of vertices in local space
private var VerticesLocal : Vector3[];

// coordinates
private var UV : Array;
private var Triangles : int[];

// quantum of the mesh - when this method create meshes, theta will in/decrease of quantumOfMesh
private var quantumOfMesh : float = 0.05f;

// array of gameobject 
private var sphere : GameObject[];

// radius of piece of sphere
private var radius : float = 10;

private var DATSphere : GameObject[];

/*
function Start(){
	DATSphere = new GameObject[1];
	DATSphere[0] = CreateMesh(0, 0, Mathf.PI*2, Mathf.PI/6, 0);
}
*/

/*
	*place mesh in 3D
*/
function placeMesh3D( ArrGO : GameObject[] ){

	for ( var i = 0 ; i < ArrGO.length ; i++ ){
	
		var s : scriptForPlane = GetComponent( "scriptForPlane" );
		
		var HT : Hashtable = s.getHT();
		
		var phiMin : float = calculatePHI( HT['ratioRmin'] );
		var phiMax : float = calculatePHI( HT['ratioRmax'] );
		
		CreateSphericMesh( HT['theta_min'] , phiMin , HT['theta_max'] , phiMax , ArrGO[i] );

	}

}

/*
	*create a piece of sphere 
*/
private function CreateSphericMesh( thetaMin : float , phiMin : float , thetaMax : float , phiMax : float , g : GameObject ) : GameObject {

	var meshSphere : Mesh = new Mesh();//this is the mesh we’re creating
	
	// coordinates of vertices
	var newX : float;
	var newY : float;
	var newZ : float;

	// get number of lines
	var numberOfLines : int = Mathf.Floor((phiMax - phiMin)/quantumOfMesh) + 1;
	
	// get number of vertices
	var numberOfVertices : int = Mathf.Floor((thetaMax - thetaMin)/quantumOfMesh + 1)*Mathf.Floor(((phiMax - phiMin)/quantumOfMesh + 1));
	
	VerticesLocal = new Vector3[numberOfVertices];
	
	// coordinates of vertices
	var numberOfColumns = numberOfVertices / numberOfLines;
	
	for( var i : int = 0; i < numberOfColumns ; i ++ ){
		for(var j=0; j < numberOfLines ; j ++ ) {
			
			var latt = phiMin + j*quantumOfMesh ;
			var longi = thetaMin + i*quantumOfMesh ;
			
			newX = radius * Mathf.Sin(longi) * Mathf.Cos(latt);
			newY = radius * Mathf.Sin(latt);
			newZ = radius * Mathf.Cos(longi) * Mathf.Cos(latt);
			
			VerticesLocal[i*numberOfLines + j] = Vector3(newX, newY, newZ);
		}
	}
	
	// get middle of mesh
	VerticesInMiddle = VerticesLocal[Mathf.Floor(numberOfVertices/2) - 1];
	
	for(i = 0; i < VerticesLocal.length; i++)
		VerticesLocal[i] -= VerticesInMiddle;
	
	meshSphere.vertices = VerticesLocal;
	
	// we dont realy care about UVs here
	var UV = new Array();
	for(i = 0; i < numberOfVertices ; i++)
		UV[i] = Vector2(VerticesLocal[i].x, VerticesLocal[i].z);
	meshSphere.uv = UV;
	
	
	
	// create triangles
	DatTriangles = new Array();
	
	for( i=0; i < numberOfColumns ; i ++ ){// avoid last lines and last columns
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
	
	meshSphere.triangles = DatTriangles;
	
	meshSphere.RecalculateBounds();
	meshSphere.RecalculateNormals();
	
	// add mesh filter
	g.GetComponent( MeshFilter ).mesh = meshSphere;
	
	// add the mesh collider
	g.GetComponent( MeshCollider ).sharedMesh = meshSphere;
	
	g.transform.position += VerticesInMiddle;
	
	return g;
}

/*
	*calculate values of phi with ratio in the xml
*/
private function calculatePHI( ratio : float ) : float {

	var v : float = Mathf.PI/2 - ratio*Mathf.PI/2;

	return v;

}



