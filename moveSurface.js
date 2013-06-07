/*
	*Creation : 24/04/2013
	*Author : Fabien Daoulas
	*Last update : 29/04/2013
	*this script moves gameobject to cover the same interesting part of the movie all the time
*/

private var video : videoSettings;

/*
	*move 2D surface to fit with the movement of the movie
*/
public function moveSurface( t : GameObject , OnPlay : boolean){
	// get script containing all the information about the plane you are moving, rotation speed, files attached...
	var s : scriptForPlane = t.GetComponent( "scriptForPlane" );
	
	// if movie is playing
    if( OnPlay ){
        var dt = Time.time-s.getLastMoveTime();
		// rotate around y axis because plane where movie is displayed is perpendicular to y axis
        t.transform.eulerAngles += Vector3( 0 , -s.getDelta('')*dt , 0 );
		// always refresh the time of last move then the planes will move continuously
        s.updateLastMoveTime();
    } else 
        s.updateLastMoveTime();
}

/*
	*move a mesh around the y axis and the center of the sphere
*/
public function rotateY_3D( g : GameObject, OnPlay : boolean ){
	video = gameObject.GetComponent("videoSettings") as videoSettings;
	var s : scriptForPlane = g.GetComponent( "scriptForPlane" );
	
	if( OnPlay ){
		// rotate the gameobject around y axis at speed s.getdelta
		g.transform.RotateAround( video.getSpherePos() , Vector3.up , s.getDelta('x')*Time.deltaTime );
	}
}

/*
	*move a mesh around the x axis and the center of the sphere
*/
public function rotateX_3D( g : GameObject, OnPlay : boolean ){
	video = gameObject.GetComponent("videoSettings") as videoSettings;
	var s : scriptForPlane = g.GetComponent( "scriptForPlane" );
	
	if( OnPlay ){
		// rotate the gameobject around x axis at speed s.getdelta
		g.transform.RotateAround( video.getSpherePos() , Vector3.right , s.getDelta('y')*Time.deltaTime );
	}
}

/*
	*move a mesh around the z axis and the center of the sphere
*/
public function rotateZ_3D( g : GameObject, OnPlay : boolean ){
	video = gameObject.GetComponent("videoSettings") as videoSettings;
	var s : scriptForPlane = g.GetComponent( "scriptForPlane" );
	
	if( OnPlay ){
		// rotate the gameobject around z axis at speed s.getdelta
		g.transform.RotateAround( video.getSpherePos() , Vector3.forward , s.getDelta('z')*Time.deltaTime );
	}
}

/*
	*reset rotation of planes when the movie is ended
*/
public function resetPlane( t : GameObject ){
	t.transform.eulerAngles = Vector3( 0 , 0 , 0);
}





