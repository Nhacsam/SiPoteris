/*

	Creation : 24/04/2013
	Author : Fabien Daoulas
	Last update : 29/04/2013
	
*/

private var lastTime : float = 0 ;


/*
	*move 2D surface to fit with the movement of the movie
*/
public function moveSurface( t : GameObject[] , OnPlay : boolean ){
	
	if( OnPlay ){
		var dt = Time.time-lastTime; 
		
		lastTime = Time.time;
	
		for( var i = 0 ; i < t.length ; i ++){
	
			var s : scriptForPlane = t[i].GetComponent( "scriptForPlane" );
			var n  : String = s.getName();

			t[i].transform.eulerAngles += Vector3( 0 , -s.getDelta()*dt*10 , 0 );
		}
	}
	else
		lastTime = Time.time;
	
	
	}









