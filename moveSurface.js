/*

	Creation : 24/04/2013
	Author : Fabien Daoulas
	Last update : 29/04/2013
	
*/

private var lastTime : float = 0 ;


/*
	*move 2D surface to fit with the movement of the movie
*/


public function moveSurface( t : GameObject , OnPlay : boolean){
	
    if( OnPlay ){
        var s : scriptForPlane = t.GetComponent( "scriptForPlane" );
	
        var n  : String = s.getName();
        var dt = Time.time-s.getLastMoveTime();
	
        t.transform.eulerAngles += Vector3( 0 , -s.getDelta()*dt , 0 );
	
        s.updateLastMoveTime();
    } else
        s.updateLastMoveTime();
}



/*
	*reset planes
*/
public function resetPlanes( t : GameObject ){

	var s : scriptForPlane = GetComponent("scriptForPlane");
	var ht : Hashtable = getHT();
	
	t.transform.eulerAngles = Vector3( 0 , ht["theta_min"] + ( ht["theta_max"] - ht["theta_min"] )/2 , 0);
	
	
}





