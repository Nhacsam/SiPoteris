/*
Creation : 02/04/2013
Last update : 30/05/2013

Author : Fabien Daoulas
Debug : Nicolas Djambazian

This script creates a piece of sphere.
axis are those of Unity.

number of lines : 220
*/

private var video : videoSettings;

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
	*place mesh in 3D
*/
function placeMesh3D( t : Hashtable ){
	if(	t.ContainsKey( 'theta_min' ) &&
		t.ContainsKey( 'theta_max' ) &&
		t.ContainsKey( 'ratiormin' ) &&
		t.ContainsKey( 'ratiormax' ) &&
		t.ContainsKey( 'name' ) 	 ) {
			video = gameObject.GetComponent("videoSettings") as videoSettings;
	
			// caculate phi min and max thanks to the value contained in the hashtable
			if( float.Parse( t['ratiormin'] )  > 0.66 || float.Parse( t['ratiormax'] )  > 0.66 ){
				var phiMax : float = calculatePHI( float.Parse( t['ratiormin'] ) , true );
				var phiMin : float = calculatePHI( float.Parse( t['ratiormax'] ) , true );
			}
			else{
				phiMax = calculatePHI( float.Parse( t['ratiormin'] ) , false );
				phiMin = calculatePHI( float.Parse( t['ratiormax'] ) , false );
			}
		
			// invert theta_max and theta_min cause of mathematical operation : 180-angle
			// 180-angle because 2D scene looks down (along y-axis) and 3D scene looks up
			var theta_max : float = (180-float.Parse(t['theta_min'])) * Mathf.PI/180;
			var theta_min : float = (180-float.Parse(t['theta_max'])) * Mathf.PI/180;
				
			var g : GameObject = CreateSphericMesh( theta_min , phiMin , theta_max , phiMax , t['name'] );

			return g;	
	}
	else{// return null if a parameter is missing in the xml file - the gameobject is not created
		Console.Warning("An element is missing in xml_data to create the mesh or the gameobject on which the movie is displayed is not assigned");
		return;
	}
}

/*
	*init script attached to each plane
*/
function InitScript( obj : GameObject , t : Hashtable ){
	
	var s : scriptForPlane = obj.AddComponent( "scriptForPlane" );
	
	// init name, hashtable, position
	s.InitName( t['name'] );
	s.InitHT( t );
	if( t.ContainsKey( 'speed' ) )
		s.InitDelta( '', float.Parse( t['speed'] ) );
}

/*
	*create a piece of sphere 
*/
private function CreateSphericMesh( thetaMin : float , phiMin : float , thetaMax : float , phiMax : float , mesh_name : String ) : GameObject {

	var meshSphere : Mesh = new Mesh();//this is the mesh we’re creating
	// give a name to the mesh
	meshSphere.name = "3D_" + mesh_name;
	
	
	// coordinates of vertices
	var newX : float;
	var newY : float;
	var newZ : float;

	// get number of lines
	var numberOfLines : int = Mathf.Floor((phiMax - phiMin)/quantumOfMesh) + 1;
	
	// get number of vertices
	var numberOfVertices : int = Mathf.Floor((thetaMax - thetaMin)/quantumOfMesh + 1)*Mathf.Floor(((phiMax - phiMin)/quantumOfMesh + 1));
	
	VerticesLocal = new Vector3[ numberOfVertices ];
	
	// coordinates of vertices
	var numberOfColumns = numberOfVertices / numberOfLines;
	
	for( var i : int = 0; i < numberOfColumns ; i ++ ){
		for(var j=0; j < numberOfLines ; j ++ ) {
			
			// increment latt and long once the vertex is created
			var latt = phiMin + j*quantumOfMesh ;
			var longi = thetaMin + i*quantumOfMesh ;
			
			// give the right position
			newX = radius * Mathf.Sin(longi) * Mathf.Cos(latt)  	+ (video.getSpherePos()).x ;
			newY = radius * Mathf.Sin(latt) 						+ (video.getSpherePos()).y;
			newZ = radius * Mathf.Cos(longi) * Mathf.Cos(latt)  	+ (video.getSpherePos()).z;
			
			// store it in an array of Vector3
			VerticesLocal[i*numberOfLines + j] = Vector3(newX, newY, newZ);
		}
	}
	
	// once all the vertices are created and positionned, get middle of mesh
	VerticesInMiddle = VerticesLocal[Mathf.Floor(numberOfVertices/2) - 1];
	
	// make the vertex in the middle really in the middle
	// then transform.position gives the center of the mesh
	for(i = 0; i < VerticesLocal.length; i++)
		VerticesLocal[i] -= VerticesInMiddle;
	
	meshSphere.vertices = VerticesLocal;
	
	// we dont realy care about UVs here because there is no renderer
	var UV = new Array();
	for(i = 0; i < numberOfVertices ; i++)
		UV[i] = Vector2(VerticesLocal[i].x, VerticesLocal[i].z);
	meshSphere.uv = UV;
	
	// create triangles that will be part of the mesh
	DatTriangles = new Array();
	
	// bind them 
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
			}//if
		}//for
	}//for
	
	meshSphere.triangles = DatTriangles;
	
	meshSphere.RecalculateBounds();
	meshSphere.RecalculateNormals();
	
	var g : GameObject = new GameObject( meshSphere.name , MeshRenderer ,  MeshFilter , MeshCollider );
	
	// add mesh filter
	g.GetComponent( MeshFilter ).mesh = meshSphere;
	
	// add the mesh collider
	g.GetComponent( MeshCollider ).sharedMesh = meshSphere;
	
	g.transform.position += VerticesInMiddle;
	return g;
}

/*
	*calculate values of phi with ratio in the xml
	*value of b tells me a ratio is lower than 0.66 because the method to calculate phi is different
*/
static function calculatePHI( ratio : float , b : boolean) : float {

	if( b ){
		// ratio min can be lower than 0.66 and ratio max higher
		if( ratio > 0.66 ){
			// dome is about 3/4 of a sphere that is why 7*Mathf.PI/4
			var v : float = Mathf.PI*11/6 + ( 1 - ratio ) * ( Mathf.PI/2 ) / 0.66 ;
		}
		else{
			v = 2*Mathf.PI + Mathf.PI/2*((0.66-ratio)/0.66);
		}
	}
	else
		// if ratio max and min are higher than 0.66 then it s ok, both phi min and max are calculated the same way
		v = (0.66 - ratio)*(Mathf.PI/2)/0.66;

	return v;
}

public function getOrientedTo() : Vector3 {
	return video.getSpherePos();
}
	

