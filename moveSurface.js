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
	
	var s : scriptForPlane = t.GetComponent( "scriptForPlane" );
	
    if( OnPlay ){
	
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
public function resetPlane( t : GameObject ){

	var s : scriptForPlane = t.GetComponent("scriptForPlane");
	var ht : Hashtable = s.getHT();
	
	t.transform.eulerAngles = Vector3( 0 , float.Parse( ht["theta_min"] ) + ( float.Parse( ht["theta_max"] ) - float.Parse( ht["theta_min"] ) )/2 , 0);
	
}





