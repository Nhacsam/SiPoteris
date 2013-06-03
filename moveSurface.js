/*
	*Creation : 24/04/2013
	*Author : Fabien Daoulas
	*Last update : 29/04/2013
	*this script moves gameobject to cover the same interesting part of the movie all the time
*/

private var lastTime : float = 0 ;

private var numberIn : float = 0;


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
        t.transform.eulerAngles += Vector3( 0 , -s.getDelta()*dt , 0 );
		// always refresh the time of last move then the planes will move continuously
        s.updateLastMoveTime();
    } else 
        s.updateLastMoveTime();
}



/*
	*reset rotation of planes when the movie is ended
*/
public function resetPlane( t : GameObject ){
	t.transform.eulerAngles = Vector3( 0 , 0 , 0);
}





