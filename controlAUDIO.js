/*
	created : 22/04/2013
	Author : Fabien Daoulas
*/
@script RequireComponent(AudioSource)


/*
	*add audio sources to a gameobject
*/
function addAudio(object : GameObject, nameOfAudio : String){


	var clip : AudioClip = Resources.Load(nameOfAudio); 
	
	object.AddComponent(AudioSource);
	object.audio.clip = clip; 
	
}

/*
	*display audio
*/
function displayAudio(source : GameObject[]){
	for(var i = 0; i< source.length; i++)
		source[i].audio.Play();

}


/*
	*calculate the distance between gameObject and center of screen
*/
function CalculDistance (x:float , y:float) : float{
	return Mathf.Sqrt((x - 0.5)*(x - 0.5) + (y - 0.5)*(y - 0.5));
}



function updateSounds ( videoTab : Array ){

	var srcAudioPosViewPoint : Vector3;//position viewpoint
	var Distance : float;//distance between gameObject and center of screen
	
	for(var i = 0; i < videoTab.length ; i++){
		
		if( videoTab[i].GetComponent(AudioSource) == null )
			continue ;
		
		srcAudioPosViewPoint = Camera.main.WorldToViewportPoint (videoTab[i].transform.position);
		Distance = CalculDistance(srcAudioPosViewPoint.x , srcAudioPosViewPoint.y);
	
		if (Distance < 1/Mathf.Sqrt(2) && srcAudioPosViewPoint.z > 0) 
			videoTab[i].audio.volume = 1;
		else if (Distance < 5 && srcAudioPosViewPoint.z > 0) 
			videoTab[i].audio.volume = Mathf.Exp(5*(-Mathf.Sqrt(2) + 1/Distance));
		else 
			videoTab[i].audio.volume = 0;
	}
}