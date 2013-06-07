/*
 * Gere les message d'erreur et d'info dans la console
 */



// Affiche les infos ?
static var displayInfo : boolean = false ;

// Affiche les warning ?
static var displayWarning : boolean = true ;

// Affiche les erreurs ??
static var displayHandledError : boolean = true ;
static var displayCriticalError : boolean = true ;

// Affiche les petits debug perso ??
static var displayPrivateDebug : boolean = true ;

// lesquels ?
static var PrivateDebugToDisplay : int = 101 ;










/*
 * Affiche un message dans la console pour tracker
 * le bon déroulement du programme
 */
static function Info ( s ) {
	
	if (displayInfo)
		Debug.Log( 'INFO : ' + s);
}

/*
 * Affiche un message dans la console pour tracker 
 * les petites erreur dont on s'en fou quand même pas mal
 */
static function Warning ( s ) {
	
	if (displayWarning)
		Debug.LogWarning( 'WARNING : ' + s);
}

/*
 * Affiche un message dans la console pour tracker
 * les erreurs qui sont géré mais qui doivent être corrigé
 */
static function HandledError ( s ) {
	
	if (displayHandledError)
		Debug.LogWarning( 'ERROR : ' + s);
}


/*
 * Affiche un message dans la console pour tracker
 * les erreur critiques qui doivent être corrigé de suite
 */
static function CriticalError ( s ) {
	
	if (displayCriticalError)
		Debug.LogError( 'ERROR : ' + s);
}


/*
 * Affiche un message dans les petits debug perso
 *
 * Notice : donner un numéro random à la suite d'affichage (par exemple : 123)
 * Mettez la valeur 123 dans PrivateDebugToDisplay pour que vos erreurs s'affiche 
 *
 */
static function Test ( s, num : int ) {
	
	if (num == PrivateDebugToDisplay)
		Debug.Log( 'TEST No ' + num +' : ' + s);
}

