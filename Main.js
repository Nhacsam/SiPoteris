#pragma strict

private var myPlanes : GameObject[] ;


private var mouseLook : MouseLook ;
private var control : CameraControl ;


private var Planes: placePlanes;
private var Surface : newMesh ;

//private var Videos : videoSettings ;
private var Zoom : Zoom ;

private var VideoFull : FullScreen ;

private var sound : controlAUDIO ;

private var Daoulas = "\"Nan mais les entreprises, elles, un mois c'est pas assez, elles veulent 4 semaines, 8 semaines...\"\n \"La porte de ma chambre je la ferme que quand je suis dedans\"\n\"Y'a de quoi s'embrocher la barbaque là\"\n\"Le stage c'était bien du 6 mars au 2 février?\"\n\"Non mais d'ailleurs mon urine est assez floue en ce moment (mais sans le contexte c'est nul...)\"\n\"Les vingt premières minutes de la fin\"\n\"Fais gaffe les murs ont des oreilles, ils ont peut-être des mains aussi !\"\n\"Oh putain! Il a essayé de m'enfiloter !\"\n\"FD -Mais t'imagines le paradoxe de la gravité? Gras et vite ! \n *blanc* \n ND - C'était un flop là... \n FD - Oui un beau flop j'ai un brelan de rois maintenant.\"\n\"J'préfère encore la cabane photo\"\n\"JA -Nan mais à ce prix là, y'a forcément un processeur de merde... \nFD -Pas forcément de merde mais performant\"\nDans un McDonald :\n\"Je voudrais un menu Maxi Best-Of avec Frites et Potatoes.\"\nDevant son balcon attaqué par des pigeons :\n\"Ils ont chié partout! Ils ont chié ici! Ils ont chié là! Ils ont chié partout! Ah les enculés ils ont chié partout!\"\n\"C'est plus Linkin Park, c'est Fuckin Park\"\n\"Non mais pour moi, la journée de demain commence aujourd'hui.\"\n\"Je vais t'écraser le crâne sur la gueule\"\n\"Mon père c'est pas un singe mais il est poilu quand même\"\n\"Tiens le caviar ça a un goût de fromage. Mais ça doit être à cause du pain\"\n\" -Boite de Pandore ou poule aux oeufs d'or? \n-En tout cas j'ai pas dit boîte aux oeufs d'or\"\nFabien, sur la sécurité des systèmes embarqués : \n\"Semi-intrusif c'est \"Je te mets à poil\" et intrusif c'est \"Je te fous un thermomètre dans le cul\"\"\n\"Ca sert à rien de réinventer la poudre, elle est déjà faite...\"\n\"- Le gras c'est la vie, Karadoc c'est mon idole culinaire et toi Fabien? \n- Moi c'est la mangue.\n- Quoi?\n- Bah le fruit...\" \n" ;

private var Sipoteris = "0. Qui simul intravit rorantia fontibus antra,"
				+ "\n1. Sicut erant, viso nudae sub pectora nymphae"
				+ "\n2. Percussere viro subitisque ululatibus omne"
				+ "\n3. Implevere nemus circum fusaeque Dianam"
				+ "\n4. Corporibus texere suis ; tamen altior illis."
				+ "\n5. sic hausit aquas vultumque virilem"
				+ "\n6. Perfudit spargensque comas ultricibus undis"
				+ "\n7. Addidit haec cladis praenuntia verba futurae"
				+ "\n8. nunc tibi me posito visam velamine narres,"
				+ "\n9. Si poteris narrare, licet."
				
				+ "\n10. Nec plura minata"
				+ "\n11. Dat sparso capiti vivacis cornua cervi+ ,"
				+ "\n12. velat maculoso vellere corpus "
				+ "\n13. Additus et pavor est ;"
				
				+ "\n0. Qui simul intravit rorantia fontibus antra,"
				+ "\n1. Sicut erant, viso nudae sub pectora nymphae"
				+ "\n2. Percussere viro subitisque ululatibus omne"
				+ "\n3. Implevere nemus circum fusaeque Dianam"
				+ "\n4. Corporibus texere suis ; tamen altior illis."
				
				+ "\n5. sic hausit aquas vultumque virilem"
				+ "\n6. Perfudit spargensque comas ultricibus undis"
				+ "\n7. Addidit haec cladis praenuntia verba futurae"
				+ "\n8. nunc tibi me posito visam velamine narres,"
				+ "\n9. Si poteris narrare, licet."
				
				+ "\n10. Nec plura minata"
				+ "\n11. Dat sparso capiti vivacis cornua cervi,"
				+ "\n12. velat maculoso vellere corpus "
				+ "\n13. Additus et pavor est ;"
				
				+ "\n0. Qui simul intravit rorantia fontibus antra,"
				+ "\n1. Sicut erant, viso nudae sub pectora nymphae"
				+ "\n2. Percussere viro subitisque ululatibus omne"
				+ "\n3. Implevere nemus circum fusaeque Dianam"
				+ "\n4. Corporibus texere suis ; tamen altior illis."
				
				+ "\n5. sic hausit aquas vultumque virilem"
				+ "\n6. Perfudit spargensque comas ultricibus undis"
				+ "\n7. Addidit haec cladis praenuntia verba futurae"
				+ "\n8. nunc tibi me posito visam velamine narres,"
				+ "\n9. Si poteris narrare, licet."
				
				+ "\n10. Nec plura minata"
				+ "\n11. Dat sparso capiti vivacis cornua cervi,"
				+ "\n12. velat maculoso vellere corpus "
				+ "\n13. Additus et pavor est ;"
 ;

function Start () {
	
	// MouseLook :
	if( isOnIpad() )
		control = gameObject.AddComponent("CameraControl");
	else
		mouseLook = gameObject.AddComponent("MouseLook");
	
	
	
	// Add others scripts
	Planes = gameObject.AddComponent("placePlanes");
	Surface = gameObject.AddComponent("newMesh");
	
	//Videos = gameObject.AddComponent("videoSettings");
	Zoom = gameObject.AddComponent("Zoom");
	VideoFull = gameObject.AddComponent("FullScreen");
	
	sound = gameObject.AddComponent("controlAUDIO") ;
	
	
	// Init
	//var Surfaces = Surface.PlaceMultipleSurface();
	myPlanes = Planes.placePlanes() ;
	
	//Videos.videoSettings(myPlanes , Planes.GetnbOfPlanes ());
	sound.addAudio(myPlanes[0], "son" );
	sound.addAudio(myPlanes[5], "son" );
	sound.displayAudio(myPlanes); 
	
	
	Zoom.Init(myPlanes, enableMouseLook);
	
	
	VideoFull.InitFullScreen();
	
	
	// Link
	/*Zoom.AddOnZoom( Videos.videoHDZoomON );
	Zoom.AddOnLeave( Videos.videoHDZoomQuit );*/
	Zoom.AddOnLeave( VideoFull.LeaveFullScreen );
	Zoom.AddOnEndZoom(VideoFull.EnterOnFullScreen);
	
	Zoom.AddOnZoom( changeLight );
	Zoom.AddOnLeave( changeLight );
	Zoom.AddOnZoom( switchFiealdOfView );
	Zoom.AddOnLeave( switchFiealdOfView );
	
	
	
	// Camera
	camera.backgroundColor = Color.white;
	CreateLight ();
	camera.fieldOfView  = 36 ;
	
	
	
	
}

function Update () {
	
	Zoom.UpDateZoom ();
	VideoFull.UpDateFullScreen();
	
	sound.updateSounds(myPlanes);
	
}


function enableMouseLook( b : boolean ) {
	
	if( isOnIpad() )
		control.enabled = b ;
	else
		mouseLook.enabled = b ;
	
}


function isOnIpad() :boolean {
	return ( SystemInfo.deviceType == DeviceType.Handheld );
}


function CreateLight () {
	
	gameObject.AddComponent(Light);
	light.type=LightType.Spot;
	light.range=70;
	light.intensity=2.5;
	light.cookie=Resources.Load("camMask");
	
}

function changeLight() {
	light.type = ( light.type == LightType.Spot ) ? LightType.Point : LightType.Spot ;
	light.cookie = (light.cookie == null ) ? Resources.Load("camMask") : null ;
}

function switchFiealdOfView() {
	camera.fieldOfView  = ( camera.fieldOfView == 80 ) ? 36 : 80 ;
}

