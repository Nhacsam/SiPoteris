
/***********************************************************/
/******** Manipulation des dossiers et leur contenu ********/
/***********************************************************/


/*
 * Retourne le chemin absolu vers le dossier Resources
 */
static function getResourcesPath() {
	return Application.dataPath + '/Resources';
}



/*
 * Retourne le chemin depuis Resources d'un dossier enfant à un dossier
 * Le crée si inexistant
 */
static function getChildFolder( name : String, folderName : String ) : String {
	Directory.CreateDirectory(getResourcesPath() + '/' + folderName + '/' + name );
	return folderName + '/' + name ;
}


/*
 * Récupère dans un Array les noms des fichiers contenue dans
 * dans le dossier folder (chemin depuis Resources) avec l'extension extension
 */
static function getFilesInArrayFromFolder( folder : String, extension : String) : Array {
	
	var FilesNameTab : Array = new Array();
	
	var fileInfo = Directory.GetFiles(getResourcesPath() + '/' + folder + '/', "*" + extension);
	for (file in fileInfo) {
		FilesNameTab.Push( removeExtension( fromResourcesPath(file) )  );
	}
	
	return FilesNameTab ;
}

static function getFirstFileFromFolder( folder : String, extension : String) : String {
	var tab : Array = getFilesInArrayFromFolder( folder, extension );
	if( tab.length > 0 )
		return tab[0];
	else
		return '' ;
}



/*
 * Récupère le contenue d'un fichier texte sous format String
 */

static function getTextFromFile( path : String ) {
	
	var fileAsset : TextAsset = Resources.Load( removeExtension( fromResourcesPath( path ) ) );
	if( fileAsset )
		return fileAsset.text ;
	else
		return -1 ;
	
}


/******************************************************/
/******** Traitements sur les nom des fichiers ********/
/******************************************************/

/*
 * Supprime dans le chemin d'un fichier tout ce qui précède
 * Ressources/
 */
static function fromResourcesPath( path : String ) : String {
	
	var tofind : String =  'Resources/' ;
	var found = path.IndexOf( tofind ) ;
	if( found != -1 )
		return path.Substring( found + tofind.length ) ;
	else
		return path ;
}

/*
 * Retire l'extension d'un fichier
 */

static function removeExtension(file : String ) : String {
	
	var pointPos : int = file.IndexOf( '.' );
	if( pointPos >= 0)
		return file.Substring( 0, pointPos ) ;
	else
		return file ;
}

/*
 * Récupère le nom d'un fichier à partir de son adresse complète
 */

static function getName( path : String ) : String {
	
	var pathTab = path.Split('/'[0]);
	if( pathTab.length > 0 )
		return pathTab[ pathTab.length -1 ] ;
	
	else return path ;
}



/*
 * Trouve la miniature associé à une image ou une video
 * en cherchant un fichier dans le tableau
 * qui contient le nom de celui donné en paramètre
 */

static function getAssociatedMin( img : String, minTab : Array) {
	
	var imgName = removeExtension( getName(img) );
	
	for (var i = 0; i < minTab.length; i++) {
		if( minTab[i].IndexOf(imgName) != -1 )
			return minTab[i] ;
	}
	return img ;
}