#pragma strict


// dépendances
private var slideshow  : slideShow ;
private var windows  : showingWindow ;
private var audioPlayer : sound ;
private var textViewer : text ;
private var strip : displayStrip;


// On est en mode plein écran ?
private var onFullScreen : boolean ;


// isolation de l'élément par rapport à la sphère complete
private var isolate : boolean = true ;
private var toMove : Vector3 = new Vector3( -2000, -2000, -2000) ;



// Position et rotation quand au début
private var VideoInitialPos : Vector3 ;
private var VideoInitialRot : Vector3 ;
private var CameraInitialPos : Vector3 ;
private var CameraInitialOrthographic : boolean ;








/*
 * Initialisation des variables
 */

function InitFullScreen( ) {
	
	slideshow =		gameObject.AddComponent("slideShow")		as slideShow ;
	windows =		gameObject.AddComponent("showingWindow")	as showingWindow ;
	audioPlayer =	gameObject.AddComponent("sound")			as sound ;
	textViewer =	gameObject.AddComponent("text")				as text ;
	strip = 		gameObject.AddComponent("displayStrip")		as displayStrip;
	
	onFullScreen = false ;
}

function OnGUI(){

	audioPlayer.OnGUISound();
	strip.OnGUIStrip();

}



/*
 * Maj des éléments
 */


function UpDateFullScreen() {
	
	if( onFullScreen ) {
		
		slideshow.UpDateSlideShow();
		
		windows.SetNewTexture( slideshow.getCurrentAssociedInfo(), WINDOWTYPES.IMG, Vector2(260, 390));
		
	}
	
}







/*
 * Les CallBack des entrées et sorties
 */


function EnterOnFullScreen( Video : GameObject ) {
	
	// On retient les positions initiale pour pouvoir les restituer
	VideoInitialPos = Video.transform.position ;
	VideoInitialRot = Video.transform.eulerAngles ;
	CameraInitialPos = camera.transform.position ;
	CameraInitialOrthographic = camera.orthographic ;
	
	// On déplace le tout pour l'isoler ds autres éléments
	if( isolate ) {
		camera.transform.position += toMove ;
		//Video.transform.position += toMove ;
	}
	
	
	// Configuration de la camera et de la lumière
	camera.orthographic = true ;
	gameObject.light.type = LightType.Directional ;
	gameObject.light.intensity = 0.4 ;
	
	
	onFullScreen = true ;
	
	
	var margin : Vector2 = new Vector2(	0, 0.04 );
	
	
	
	var lol : Array = new Array() ;
	lol.Push("lol_imgs/akali");
	lol.Push("lol_imgs/cho");
	lol.Push("lol_imgs/garen");
	lol.Push("lol_imgs/irelia");
	lol.Push("lol_imgs/janna");
	lol.Push("lol_imgs/kata");
	lol.Push("lol_imgs/leesin");
	lol.Push("lol_imgs/leona");
	lol.Push("lol_imgs/lux");
	lol.Push("lol_imgs/panthe");
	lol.Push("lol_imgs/shen");
	lol.Push("lol_imgs/sona");
	lol.Push("lol_imgs/vi");
	
	
	//slideshow.InitSlideShowFactor(lol.length, Rect( 0.55 + margin.x , 0.1 + margin.y , 0.4 - 2*margin.x , 0.16 - 2*margin.y), 20);
	
	slideshow.InitSlideShowFactor(lol.length, Rect( 0.55 + margin.x , 0.1 + margin.y , 0.4 - 2*margin.x , 0.18 - 2*margin.y), 20);
	windows.InitWindowFactor( Rect( 0.55 + margin.x , 0.1 + margin.y , 0.4 - 2*margin.x , 0.64 - 2*margin.y), 20 );
	
	
	windows.SetNewTexture( "RocketBunnies", WINDOWTYPES.VIDEO, Vector2(2,1) );
	
	for (var i = 0; i < lol.length; i++ )
		slideshow.AddElmt( (lol[i] as String) + "_min", lol[i] );
	
	
	
	textViewer.placeText(Screen.height/10, Screen.height * 0.26, Screen.width/20, Screen.width * 0.55, "Dans le couloir.\n\tLéodagan : Qu’est c’que c’est qu’cette lubie d’vous faire construire une table ?\n\tPerceval : D’autant qu’y en déjà une dans la salle à manger !\n\tArthur : Là c’est une table ronde. Pour que les chevaliers de Bretagne se réunissent autour. Toute façon autant vous y faire parce qu’à partir de maintenant on va s’appeler « les chevaliers de la table ronde ».\n\tPerceval : Les chevaliers de la table ronde ???\n\tLéodagan : Encore une chance qu’on se soit pas fait construire un buffet à vaisselle !\nArthur hausse les épaules et s’en va.\nDans la salle Arthur regarde la nouvelle table ronde. Il est appuyé dessus.\n\tArthur : Non, non elle est bien. (Pas convaincu) Elle est bien. (Se lève) pff… Elle est bien mais j’voyais d’la pierre moi.\n\tBreccan (qui nettoie ses outils après avoir fini de faire la table) : Sire, on en a déjà parlé de la pierre ! J’peux pas monté une pierre d’une toise et demi dans un escalier à colimaçon ! (Arthur hausse les épaules) Eh j’suis pas magicien !\n\tBohort : C’est … C’est pas désagréable le bois.\n\tBreccan : D’autant qu’là j’vous ai mis d’la qualité ! Mettons pour un banquet, bon, si y a cinq ou six dames qui veulent un p’tit peu bagnauder là-dessus elle bougera pas !\n\tArthur : Non, non mais c’est pas tellement l’ambiance…\n\tBreccan : Oh ben ça après moi pour le détail je sais pas…\n\tPerceval : C’est pas tant l’bois qui me dérange moi. C’est plutôt l’cuir.\n\tKaradoc : Ca fait un p’tit peu atelier d’cousette.\n\tArthur : Eh ouais, ouais, ouais… Et ouais, c’est pas faux.\n\tBreccan : Le cuir ça restera toujours le cuir. Le cuir ça traverse les âges, les frontières, les modes. D’autant qu’là j’vous ai pas mis d’la vache moisie, attention ! C’est d’la tannerie d’luxe ! Assemblée au crochet d’six. Y a des heures de main d’œuvre derrière !\n\tPerceval : Non mais faut prendre l’habitude, c’est tout.\n\tBreccan : Par contre faudra faire gaffe en mangeant. Parce que là j’vous ai fait un traitement à l’huile de porc pour imperméabiliser mais si y a des taches de jus d’viande c’est foutu.\n\tArthur : Non mais on va pas manger d’sus non plus.\n\tBreccan : Après pour le détail ça je sais pas moi…"); // u d l r
	
	audioPlayer.placeMusic (Screen.height * 0.74 + 10, Screen.height/10, Screen.width/20, Screen.width * 0.45, ["son", "byebyebeautiful", "Bob_Marley-Jamming"]); // Coordinates of the music layout. U D L R. The button is always a square
	
	// init sprite display
	strip.initStrip( Rect( -Screen.width/2 , 0 , 2*Screen.width , Screen.height ) , Rect( Screen.width/2 , 0 , Screen.width/2 , Screen.height/8 ) );
	
}

function LeaveFullScreen( Video : GameObject ) {
	
	// Restitution des positions
	Video.transform.position = VideoInitialPos ;
	Video.transform.eulerAngles = VideoInitialRot;
	camera.transform.position = CameraInitialPos ;
	camera.orthographic = CameraInitialOrthographic ;
	
	audioPlayer.removeMusic();
	textViewer.removeText();
	strip.removeStrip();
	
	slideshow.destuctSlideShow();
	windows.destuctWindow();
	
	onFullScreen = false ;
}



