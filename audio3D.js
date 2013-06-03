/*
	*Creation : 22/04/2013
	*Author : Fabien Daoulas
	*Last update : 30/05/2013
	* this script displays sound around the sphere
*/

private var radius : float = 5;

private var trans : Transition2D3D;
private var full : FullScreen;
private var sphericMesh : createSphericMesh;


////////////////////////
//////////init//////////
////////////////////////
public function initSound(){
	trans = gameObject.GetComponent("Transition2D3D") as Transition2D3D;
	full = gameObject.GetComponent("FullScreen") as FullScreen;
	sphericMesh = gameObject.GetComponent("createSphericMesh") as createSphericMesh;
}

////////////////////////////////////////////
//////////create/place audiosource//////////
////////////////////////////////////////////

/*
	*create gameobject with audiosource
*/
public function createAudio( t : Hashtable ) : GameObject{
	var clip : AudioClip = Resources.Load( t['path'] , AudioClip ); 
	
	// test if sound exists in defaultDatas
	if( !clip ){
		Console.Warning("No audio -- " +t['path']+" -- found in resources");
		return;
	}

	var g : GameObject = new GameObject();
	g.name = "3D_sound_"+t['name'];
	g.AddComponent(AudioSource);
	g.audio.clip = clip; 
	
	// place audio
	placeAudioSources( float.Parse(t['theta']) , float.Parse(t['ratio']) , g );
	
	// clip is heard like in the real world
	g.audio.rolloffMode =  AudioRolloffMode.Logarithmic;
	
	return g;
}

/*
	*place GO around the sphere
*/
private function placeAudioSources( theta : float , ratio : float , g : GameObject ){
	if( ratio > 0.66 )
		var phi : float = sphericMesh.calculatePHI( ratio , true );
	else
		phi = sphericMesh.calculatePHI( ratio , false );
		
	theta = theta * Mathf.PI/180;	
	
	g.transform.position = Vector3(	radius * Mathf.Sin(theta) * Mathf.Cos(phi),
									radius * Mathf.Sin(phi) + 1.3,
									radius * Mathf.Cos(theta) * Mathf.Cos(phi) );
}

/////////////////////////////////
//////////run/stop clip//////////
/////////////////////////////////

private function playAudio3D( source : GameObject ){
	if( !source.audio.isPlaying ){
		source.audio.Play();
		// clip will not end
		source.audio.loop = true;
	}
	else
		return;
}

private function stopAudio3D( source : GameObject ){
	source.audio.Stop();
}

/////////////////////////////////
//////////manage volume//////////
/////////////////////////////////

/*
	*calculate the distance between gameObject and center of screen
*/
private function ComputeDistance( x:float , y:float ) : float{
	return Mathf.Sqrt((x - 0.5)*(x - 0.5) + (y - 0.5)*(y - 0.5));
}

/*
	*manage volume of sound
*/
private function manageVolume( d : float , g : GameObject , srcAudioPosViewPoint : Vector3 ){
	if( d < 1/Mathf.Sqrt(2) && srcAudioPosViewPoint.z > 0 ) 
		g.audio.volume = 1;
	else if( d < 5 && srcAudioPosViewPoint.z > 0 ) 
		g.audio.volume = Mathf.Exp(5*(-Mathf.Sqrt(2) + 1/d));
	else 
		g.audio.volume = 0;
}

//////////////////////////
//////////update//////////
//////////////////////////

public function updateSounds ( tabSound : Array ){
	if( !trans.isScene2D() && !full.getOnFullScreen() ){// if in 3D view
		var srcAudioPosViewPoint : Vector3;//position viewpoint
		var Distance : float;//distance between gameObject and center of screen
	
		for(var i = 0; i < tabSound.length ; i++){
			if( (tabSound[i] as GameObject).GetComponent(AudioSource) == null )
				continue ;
				
			// run clip if not playing
			if( !(tabSound[i] as GameObject).audio.isPlaying )
				playAudio3D( tabSound[i] );
				
			if( (tabSound[i] as GameObject).audio.isPlaying ){
				srcAudioPosViewPoint = Camera.main.WorldToViewportPoint( (tabSound[i] as GameObject).transform.position );
				Distance = ComputeDistance( srcAudioPosViewPoint.x , srcAudioPosViewPoint.y );
				manageVolume( Distance , tabSound[i] , srcAudioPosViewPoint );
			}//if
		}//for
	}//if
	else{// if not in 3D view
		for(i = 0; i < tabSound.length ; i++)
			stopAudio3D( tabSound[i] );
	}
}