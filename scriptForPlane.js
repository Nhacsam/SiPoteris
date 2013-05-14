/*
	*Creation : 26/04/2013
	*Author : Fabien Daoulas
	*Last update : 29/04/2013
*/

import System.IO;

/********************** VARIABLES **********************/

// name of the plane to which this script is attached to
private var Name : String;

// hashtable containing informations about interface
private var HT : Hashtable;

// position of plane in world
private var posPlane : Vector3;

// rotation of plane in world
private var rotPlane : Vector3;

// speed of plane
private var delta : float = 0;

// Time when the object have been moved last
private var lastMoveTime : float = 0;


/********************** METHODS **********************/

/*
	*initialize variable Name
*/
public function InitName( s : String ){

	Name = s;

}

/*
	*get Name
*/
public function getName(){

	return Name;

}

/*
	*initialize hashtable
*/
public function InitHT( t : Hashtable ){

	HT = t;

}

/*
	*get hashtable
*/
public function getHT(){

	return HT;

}

/*
	*initialize posPlane
*/
public function InitPosPlane( v : Vector3 ){

	posPlane = v;

}

/*
	*get position of plane in the wordl coordinates
*/
public function getPosPlane(){

	return posPlane;

}

/*
	*initialize posPlane
*/
public function InitRotPlane( v : Vector3 ){

	rotPlane = v;

}

/*
	*get rotation of plane in the wordl coordinates
*/
public function getRotPlane(){

	return rotPlane;

}

/*
	*initialize speed of plane
*/
public function InitDelta( s : float ){

	delta = s;

}

/*
	*get speed of plane
*/
public function getDelta(){

	return delta;

}


/*
 * Accessors of lastMoveTime
 */

public function updateLastMoveTime() {
	lastMoveTime = Time.time ;
}

public function getLastMoveTime() : float {
	return lastMoveTime ;
}




/*********************/
/******** GUI ********/
/*********************/

/*
 * Retourne le chemin absolu vers le dossier Resources
 */
static function getResourcesPath() {
	return Application.dataPath + '/Resources';
}


/*
 * Retourne le nom du dossier contenant les données
 * Le crée si vide
 * crée un dossier default si vide et nom du dossier non trouvé
 */
public function getFolderName() : String{
	
	var folder : String = '' ;
	
	if( HT.Contains('GUI') ) {
		if( typeof(HT['GUI']) == System.Collections.Hashtable ) {
			if( ( HT['GUI'] as Hashtable ).Contains('folder') ) {
				
				folder = ( HT['GUI'] as Hashtable )['folder'] ;
				Directory.CreateDirectory(getResourcesPath() + '/' + folder );
				return folder ;
			
			} // Contain
		} else if (typeof(HT['GUI']) == System.String) {
			
			folder = HT['GUI'] ;
			Directory.CreateDirectory(getResourcesPath() + '/' + folder );
			return folder ;
			
		}// typeof
	} // Contain
	
	// Si on arrive ici, c'est que le nom du dossier n'a pas été trouvé.
	Debug.LogWarning('No data folder found for the plane ' + Name);
	return getDefaultFolder();
	
}

/*
 * Retourne le chemin depuis Resources d'un dossier enfant au dossier principal
 * Le crée si inexistant
 */
public function getChildFolder( name : String ) : String {
	var folderName : String = getFolderName() ;
	Directory.CreateDirectory(getResourcesPath() + '/' + folderName + '/' + name );
	return folderName + '/' + name ;
}



/*
 * Récupère les chemins des dossiers
 * Contenant les infos
 */
public function getImgFolder() : String {
	return getChildFolder( 'img' );
}

public function getAudioFolder() : String {
	return getChildFolder( 'audio' );
}

public function getVideoFolder() : String {
	return getChildFolder( 'video' );
}

// sers en cas d'erreur ou de fichier introuvable
public function getDefaultFolder() : String {
	Directory.CreateDirectory(getResourcesPath() + '/defaultDatas');
	return 'defaultDatas' ;
}


/*
 * Récupère le texte qui sera afficher dans la GUI
 */

public function getText() : String {
	
	var fileAsset : TextAsset ;
	
	/*
	 * Si il y a un champ text dans le xml
	 * in récupère le fichier associé
	 */
	if( HT.Contains('GUI') ) {
		if( typeof(HT['GUI']) == System.Collections.Hashtable ) {
			if( ( HT['GUI'] as Hashtable ).Contains('text') ) {
				
				// lit le contenue du fichier
				var path : String = getFolderName() + (( HT['GUI'] as Hashtable )['text'] as String ) ;
				
				fileAsset = Resources.Load( path );
				if( fileAsset )
					return fileAsset.text ;
				else
					Debug.LogWarning('Invalid text file name '+ path +' for the plane ' + Name);
			} // Contains text
		} // type of
	} // Contains GUI
	
	
	
	/*
	 * sinon si un fichier de type txt est présent dans le dossier
	 * C'est lui qu'on utilise
	 */
	var fileInfo = Directory.GetFiles(getResourcesPath() + '/' + getFolderName() + '/', "*.txt");
	
	for (file in fileInfo) {
		fileAsset = Resources.Load( removeExtension( fromResourcesPath( file ) ) );
		if( fileAsset ) 
			return fileAsset.text ;
	}
	
	/*
	 * sinon si un fichier de type txt est présent dans le dossier par defaut
	 * C'est lui qu'on utilise
	 */
	
	fileInfo = Directory.GetFiles(getResourcesPath() + '/' + getDefaultFolder() + '/', "*.txt");
	
	for (file in fileInfo) {
		fileAsset = Resources.Load( removeExtension( fromResourcesPath(file) ) );
		if( fileAsset )
			return fileAsset.text ;
	}
	
	/*
	 * si rien de concluent est trouvé
	 * Warning + renvoie d'une chaine vide
	 */
	Debug.LogWarning('No text file found for the plane ' + Name);
	return '' ;
}




public function getSounds() : Array {
	
	var Sounds : Array = new Array();
	
	var fileInfo = Directory.GetFiles(getResourcesPath() + '/' + getAudioFolder() + '/', "*");
	for (file in fileInfo) {
		Sounds.Push( removeExtension( fromResourcesPath(file) )  );
	}
	
	return Sounds ;
}


/*
public function slideShowElemt() : Array {
	
	return new Array() ;
}


*/


/***********************************************************/
/******** Traitements sur les chaines de caractères ********/
/***********************************************************/


static function fromResourcesPath( path : String ) : String {
	
	var tofind : String =  'Resources/' ;
	return path.Substring( path.IndexOf( tofind ) + tofind.length ) ;
}

static function removeExtension(file : String ) : String {
	
	var pointPos : int = file.IndexOf( '.' );
	return file.Substring( 0, pointPos ) ;
}


