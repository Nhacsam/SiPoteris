#pragma strict
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
 * Retourne le chemin absolu vers StreamingAssets
 */
static function getStreamingFolder() {
	return Application.dataPath + '/StreamingAssets';
}




/*
 * Retourne le chemin depuis Resources d'un dossier enfant à un dossier
 * Le crée si inexistant
 */
static function getChildFolder( name : String, folderName : String, root ) : String {
	
	
	if(!root)
		root = getResourcesPath() ;
	
	if( isDirExisting( root + '/' + folderName + '/' + name ) )
		return folderName + '/' + name ;
	else
		return '' ;
}


/*
 * Récupère dans un Array les noms des fichiers contenue dans
 * dans le dossier folder (chemin depuis Resources) avec l'extension 
 */
static function getFilesInArrayFromFolder( folder : String, extension : String, root) : Array {
	
	if(!root)
		root = getResourcesPath() ;
	
	var FilesNameTab : Array = new Array();
	
	if( isDirExisting(root + '/' + folder) ) {
	
		var fileInfo = Directory.GetFiles(root + '/' + folder + '/', "*" + extension);
		for (file in fileInfo) {
			FilesNameTab.Push( removeExtension( fromResourcesPath(file) )  );
		}
	}
	return FilesNameTab ;
}

static function getFirstFileFromFolder( folder : String, extension : String, root) : String {
	var tab : Array = getFilesInArrayFromFolder( folder, extension, root );
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


/*
 * renvoie true si le dossier existe
 */

static function isDirExisting( path : String ) : boolean {
	
	var exist  : boolean = false ;
	
	try {
		
		var dir : DirectoryInfo = new DirectoryInfo( path );
		exist = dir.Exists ;
		
		if( ! exist ) {
			
			var msg = 'Le dossier "'+ path + "\" est inexistant \n" ;
			
			if( ! scriptForPlane.isOnIpad() ) {
				dir = Directory.CreateDirectory( path ) ;
				msg += 'Le dossier à été crée !' ;
			}
			
			Console.Warning( msg );
		}
	} catch (e :  System.Exception ) {
		Console.Warning("Erreur (sur iPad ?): \n" + e);
		
		if( scriptForPlane.isOnIpad() )
			exist =  true ;
	}
	
	return exist ;
}

/*
 * Parse le fichier en renvoyant un tableau contenant chaque lignes
 */

static function  parseFile( parsedFilePath : String ) : Array {
	
	var parsedFile : StreamReader = new StreamReader( parsedFilePath );
	var linesArray : Array = Array();
	
	var line : String ;
	
	line = parsedFile.ReadLine();
	while(line) {
		
		linesArray.Push(line);
		line = parsedFile.ReadLine();
	}
	parsedFile.Close();
	
	Console.Info( linesArray.length + ' parsed from the file ' + parsedFilePath );
	
	return linesArray ;
}



/*
 * Référence tous les fichiers contenue dans le dossier et le crée
 */

static function createParsedFile( 	parsedFilePath : String,
									getFiles : Array
								) {
	var i : int = 0 ;
	var j : int = 0 ;
	
	var parsedFile = StreamWriter(parsedFilePath);
	Console.Info('Creating parsed file ' + parsedFilePath );
		
	
	// files
	for( i = 0; i < getFiles.length; i++) {
		
		var files : Array = (getFiles[i] as function() : Array )() ;
		
		if (files ) {
			for( j = 0; j < files.length; j++ ) {
				parsedFile.Write( files[j] + "\n");				
			}
		} else
			Console.HandledError( 'Return value null from callback '+i+' in fileSystem.createParsedFile' );
		
	}
	parsedFile.Flush();
	parsedFile.Close();
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
 * Supprime dans le chemin d'un fichier tout ce qui précède
 * Assets/
 */
static function fromAssetsPath( path : String ) : String {
	
	var tofind : String =  'Assets/' ;
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
		if( (minTab[i] as String).IndexOf(imgName) != -1 )
			return minTab[i] ;
	}
	return img ;
}



/************************/
/******** Divers ********/
/************************/



/*
 * revoie un tableau contant toutes les chaines
 * du tableau passé en paramètre
 * contenant la chaine s
 */
static function getStringContainInArray( A : Array, s : String ) {

	var matchedString : Array = new Array() ;
	
	// Ensuite on cheche ceux qui contiennent s
	for (var i = 0; i < A.length; i++) {
		if( (A[i] as String).IndexOf( s ) > 0 )
			matchedString.Push( A[i] );
	}
	
	// et on renvoie les résultats
	return matchedString ;
}

