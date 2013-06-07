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

// Point vers lequel est orienté le plan
private var orientedTo : Vector3 ;

// speed of plane
private var deltaX : float = 0;
private var deltaY : float = 0;
private var deltaZ : float = 0;


// Time when the object have been moved last
private var lastMoveTime : float = 0;

// Liste des fichiers pour la GUI
private var GUIFiles : Array = Array() ;

// nom du fichier contenant les adresses des ressources
private var parsedFilePath : String = "resourcesInfos.txt" ;


/********************** METHODS **********************/


/*
	*init script attached to each plane
*/
function InitScript( t : Hashtable ){
		
	// init name, hashtable, position
	if( t.ContainsKey( 'name' ) )
		InitName( t['name'] );
	
	InitHT( t );
	
	if( t.ContainsKey( 'speed' ) )
		InitDelta( 'y', float.Parse( t['speed']+'' ) );
	if( t.ContainsKey( 'deltax' ) )
		InitDelta( 'x', float.Parse( t['deltax']+'' ) );
	if( t.ContainsKey( 'deltay' ) )
		InitDelta( 'y', float.Parse( t['deltay']+'' ) );
	if( t.ContainsKey( 'deltaz' ) )
		InitDelta( 'z', float.Parse( t['deltaz']+'' ) );
}




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
	*initialize orientedTo
*/
public function InitOrientedTo( v : Vector3 ){
	orientedTo = v;
}

/*
	*get the point where the plane is oriented to
*/
public function getOrientedTo(){
	return orientedTo;
}


/*
	*initialize speed of plane
*/
public function InitDelta( coord : String,  s : float ){
	switch(coord) {
		case'x' : deltaX = s; break;
		case'y' : deltaY = s; break;
		case'z' : deltaZ = s; break;
		default : deltaY = s; break;
	}
}

/*
	*get speed of plane
*/
public function getDelta( coord : String ){
	switch(coord) {
		case'x' : return deltaX; break;
		case'y' : return deltaY; break;
		case'z' : return deltaZ; break;
		default : return deltaY; break;
	}
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




static function isOnIpad() : boolean {
	return ( SystemInfo.deviceType == DeviceType.Handheld );
}






/*********************/
/******** GUI ********/
/*********************/

/*
 * Retourne le nom du dossier contenant les données
 * Le crée si vide
 * crée un dossier default si vide et nom du dossier non trouvé
 */
public function getFolderName	(  root : String ) : String{
	
	if( ! root )
		root = fileSystem.getResourcesPath() ;
	
	var folder : String = '' ;
	
	if( HT.Contains('gui') ) {
		if( typeof(HT['gui']) == System.Collections.Hashtable ) {
			if( ( HT['gui'] as Hashtable ).Contains('folder') ) {
				
				folder = ( HT['gui'] as Hashtable )['folder'] ;
				if( fileSystem.isDirExisting(root + '/' + folder) )
					return folder ;
			
			} // Contain
		} else if (typeof(HT['gui']) == System.String) {
			
			folder = HT['gui'] ;
			if( fileSystem.isDirExisting(root + '/' + folder) )
				return folder ;
			         
		}// typeof
	} // Contain
	
	// Si on arrive ici, c'est que le nom du dossier n'a pas été trouvé.
	Console.Warning('No data folder found for the plane ' + Name);
	return getDefaultFolder(null);
	
}



/*
 * Récupère les chemins des dossiers
 * Contenant les infos
 */
public function getImgFolder() : String {
	return fileSystem.getChildFolder( 'img', getFolderName(null), null );
}

public function getAudioFolder() : String {
	return fileSystem.getChildFolder( 'audio', getFolderName(null), null );
}

public function getVideoFolder() : String {
	return  fileSystem.getChildFolder( 'video', getFolderName(  fileSystem.getStreamingFolder() ), fileSystem.getStreamingFolder() ) ;
}

public function getVideoRightFolder() : String {
	return  fileSystem.getChildFolder( 'videoRight', getFolderName(  fileSystem.getStreamingFolder() ), fileSystem.getStreamingFolder() ) ;
}

public function getVideoLeftFolder() : String {
	return  fileSystem.getChildFolder( 'videoLeft', getFolderName(  fileSystem.getStreamingFolder() ), fileSystem.getStreamingFolder() ) ;
}

public function getMiniatureFolder() : String {
	return fileSystem.getChildFolder( 'min', getFolderName(null), null );
}

public function getStripImgFolder() : String {
	return fileSystem.getChildFolder( 'strip', getFolderName(null), null );
}

public function getStripVideoFolder() : String {
	return  fileSystem.getChildFolder( 'strip', getFolderName(  fileSystem.getStreamingFolder() ), fileSystem.getStreamingFolder() ) ;
}



/*
 * Récupère les chemins des dossiers
 * Contenant les infos par défaut
 * sers en cas d'erreur ou de fichier(s) introuvable(s)
 */
 
public function getDefaultFolder( root : String ) : String {
	
	if( ! root )
		root = fileSystem.getResourcesPath() ;
	
	if( fileSystem.isDirExisting( root + '/defaultDatas' ) )
		return 'defaultDatas' ;
	else
		return fileSystem.getResourcesPath() ;
}

public function getDefaultImgFolder() : String {
	return fileSystem.getChildFolder( 'img', getDefaultFolder(null), null );
}

public function getDefaultAudioFolder() : String {
	return fileSystem.getChildFolder( 'audio', getDefaultFolder(null), null );
}

public function getDefaultVideoFolder() : String {
	return fileSystem.getChildFolder( 'video', getDefaultFolder( fileSystem.getStreamingFolder() ), fileSystem.getStreamingFolder() ) ;
}

public function getDefaultVideoRightFolder() : String {
	return fileSystem.getChildFolder( 'videoRight', getDefaultFolder( fileSystem.getStreamingFolder() ), fileSystem.getStreamingFolder() ) ;
}

public function getDefaultVideoLeftFolder() : String {
	return fileSystem.getChildFolder( 'videoLeft', getDefaultFolder( fileSystem.getStreamingFolder() ), fileSystem.getStreamingFolder() ) ;
}

public function getDefaultMiniatureFolder() : String {
	return fileSystem.getChildFolder( 'min', getDefaultFolder(null), null );
}

public function getDefaultStripImgFolder() : String {
	return fileSystem.getChildFolder( 'strip', getDefaultFolder(null), null );
}

public function getDefaultStripVideoFolder() : String {
	return fileSystem.getChildFolder( 'strip', getDefaultFolder( fileSystem.getStreamingFolder() ), fileSystem.getStreamingFolder() ) ;
}

/*
 * Récupère le texte qui sera afficher dans la GUI
 */

public function getText() : String {
	var path : String = getFileText() ;
	var text = fileSystem.getTextFromFile(path) ;
	if( text == -1)
		Console.Warning('Invalid text file name '+ path +' for the plane ' + Name);
	else
		return text ;
}


/*
 * Récupère la liste des fichiers de chaques catégorie
 * pour l'interface graphique utilisateur
 */

public function getSounds() : Array {

	if( isOnIpad() )
		return getIpadSounds() ;
	else
		return getEditorSounds() ;
}

public function getImages() : Array {
	
	if( isOnIpad() )
		return getIpadImages() ;
	else
		return getEditorImages() ;
}


public function getVideos() : Array {
	
	if( isOnIpad() )
		return getIpadVideos() ;
	else
		return getEditorVideos() ;
}

public function getVideosRight() : Array {
	
	if( isOnIpad() )
		return getIpadVideosRight() ;
	else
		return getEditorVideosRight() ;
}

public function getVideosLeft() : Array {
	
	if( isOnIpad() )
		return getIpadVideosLeft() ;
	else
		return getEditorVideosLeft() ;
}

public function getMiniatures() : Array {
	
	if( isOnIpad() )
		return getIpadMiniatures() ;
	else
		return getEditorMiniatures() ;
}

public function getFileText() : String {
	
	if( isOnIpad() )
		return getIpadFileText() ;
	else
		return getEditorFileText() ;
}

public function getStripImg() : String {
	
	if( isOnIpad() )
		return getIpadStripImg() ;
	else
		return getEditorStripImg() ;
}


public function getStripVideo() : String {
	
	if( isOnIpad() )
		return getIpadStripVideo() ;
	else
		return getEditorStripVideo() ;
}


/*
 * Récupère la liste des fichiers de chaques catégorie
 * pour l'interface graphique utilisateur
 *
 * Depuis l'editeur
 */ 

public function getEditorSounds() : Array {
	
	var Datas : Array = fileSystem.getFilesInArrayFromFolder( getAudioFolder(), '', null ) ;
	
	if( Datas.length <= 0 ) // not found
		Datas = fileSystem.getFilesInArrayFromFolder( getDefaultAudioFolder(), '', null ) ;

	return Datas ;
}

public function getEditorImages() : Array {
	var Datas : Array = fileSystem.getFilesInArrayFromFolder( getImgFolder(), '', null ) ;
	
	if( Datas.length <= 0 ) // not found
		Datas = fileSystem.getFilesInArrayFromFolder( getDefaultImgFolder(), '', null ) ;
		
	return Datas ;
}


public function getEditorVideos() : Array {
	var Datas : Array = fileSystem.getFilesInArrayFromFolder( getVideoFolder(), '', fileSystem.getStreamingFolder() ) ;
	
	if( Datas.length <= 0 ) // not found
		Datas = fileSystem.getFilesInArrayFromFolder( getDefaultVideoFolder(), '', fileSystem.getStreamingFolder() ) ;
	
	
	for( var i = 0; i < Datas.length; i++ )
		Datas[i] = fileSystem.fromAssetsPath( Datas[i] ) ;
	
	return Datas ;
}

public function getEditorVideosRight() : Array {
	var Datas : Array = fileSystem.getFilesInArrayFromFolder( getVideoRightFolder(), '', fileSystem.getStreamingFolder() ) ;
	
	if( Datas.length <= 0 ) // not found
		Datas = fileSystem.getFilesInArrayFromFolder( getDefaultVideoRightFolder(), '', fileSystem.getStreamingFolder() ) ;
	
	
	for( var i = 0; i < Datas.length; i++ )
		Datas[i] = fileSystem.fromAssetsPath( Datas[i] ) ;
	
	return Datas ;
}

public function getEditorVideosLeft() : Array {
	var Datas : Array = fileSystem.getFilesInArrayFromFolder( getVideoLeftFolder(), '', fileSystem.getStreamingFolder() ) ;
	
	if( Datas.length <= 0 ) // not found
		Datas = fileSystem.getFilesInArrayFromFolder( getDefaultVideoLeftFolder(), '', fileSystem.getStreamingFolder() ) ;
	
	
	for( var i = 0; i < Datas.length; i++ )
		Datas[i] = fileSystem.fromAssetsPath( Datas[i] ) ;
	
	return Datas ;
}

public function getEditorMiniatures() : Array {
	
	var Datas : Array = fileSystem.getFilesInArrayFromFolder( getMiniatureFolder(), '', null ) ;
	
	if( Datas.length <= 0 ) // not found
		Datas = fileSystem.getFilesInArrayFromFolder( getDefaultMiniatureFolder(), '', null ) ;

	return Datas ;
}

public function getEditorStripImg() : String {
	
	var Datas : Array = fileSystem.getFilesInArrayFromFolder( getStripImgFolder(), '', null ) ;
	
	if( Datas.length <= 0 ) // not found
		Datas = fileSystem.getFilesInArrayFromFolder( getDefaultStripImgFolder(), '', null ) ;

	if( Datas.length > 0)
		return fileSystem.fromAssetsPath( Datas[ Datas.length -1 ] );
	else
		return '' ;
}

public function getEditorStripVideo() : String {
	
	var Datas : Array = fileSystem.getFilesInArrayFromFolder( getStripVideoFolder(), '', fileSystem.getStreamingFolder() ) ;
	
	if( Datas.length <= 0 ) // not found
		Datas = fileSystem.getFilesInArrayFromFolder( getDefaultStripVideoFolder(), '', fileSystem.getStreamingFolder() ) ;
	
	if( Datas.length > 0)
		return fileSystem.fromAssetsPath( Datas[ Datas.length -1] );
	else
		return '' ;
}


/*
 * Récupère le nom du fichier qui contient le 
 * texte qui sera afficher dans la GUI
 */

public function getEditorFileText() : String {
	
	var path : String = '' ;
	var text ;
	
	/*
	 * Si il y a un champ text dans le xml
	 * in récupère le fichier associé
	 */
	if( HT.Contains('gui') ) {
		if( typeof(HT['gui']) == System.Collections.Hashtable ) {
			if( ( HT['gui'] as Hashtable ).Contains('text') ) {
				
				// lit le contenue du fichier
				path = getFolderName(null) + (( HT['gui'] as Hashtable )['text'] as String ) ;
				
				if (fileSystem.getTextFromFile(path)  != -1)
					return path + '.textefile' ;
				
					
			} // Contains text
		} // type of
	} // Contains gui
	
		
	/*
	 * sinon si un fichier de type txt est présent dans le dossier
	 * C'est lui qu'on utilise
	 */
	var allPaths : Array = fileSystem.getFilesInArrayFromFolder( getFolderName(null), '.txt', null ) ;
	
	for( var i = 0; i < allPaths.length; i++ ) {
		
		if( allPaths[i] != getFolderName(null) +'/'+ fileSystem.removeExtension(parsedFilePath) )
			return allPaths[i] + '.textefile' ;
	}
	
	/*
	 * sinon si un fichier de type txt est présent dans le dossier par defaut
	 * C'est lui qu'on utilise
	 */
	allPaths = fileSystem.getFilesInArrayFromFolder( getDefaultFolder(null), '.txt', null ) ;
	
	for( i = 0; i < allPaths.length; i++ ) {
		
		if( allPaths[i] != getDefaultFolder(null) +'/'+ fileSystem.removeExtension(parsedFilePath) )
			return allPaths[i] + '.textefile' ;
	}
	
	/*
	 * si rien de concluent est trouvé
	 * Warning + renvoie d'une chaine vide
	 */
	Console.Warning('No text file found for the plane ' + Name);
	return '' ;

	
}




/*
 * Récupère la liste des fichiers de chaques catégorie
 * pour l'interface graphique utilisateur
 *
 * Depuis l'iPad en utilisant le fichier parsé
 */ 

public function getIpadSounds() : Array {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ getFolderName(null) +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/Audio/' et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '/audio/' );
}


public function getIpadImages() : Array {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ getFolderName(null) +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/img/' et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '/img/' );

}


public function getIpadVideos() : Array {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ getFolderName(null) +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/video/' et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '/video/' );

}


public function getIpadVideosRight() : Array {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ getFolderName(null) +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/videoRight/' et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '/videoRight/' );

}


public function getIpadVideosLeft() : Array {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ getFolderName(null) +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/videoLeft/' et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '/videoLeft/' );

}

public function getIpadMiniatures() : Array {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ getFolderName(null) +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/min/' et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '/min/' );

}

public function getIpadFileText() : String {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ getFolderName(null) +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '.textefile' (concaténé lors de la creation du fichier) et on renvoie le premier résultat
	var matchedFile : Array = fileSystem.getStringContainInArray(GUIFiles, '.textefile' );
	
	if ( matchedFile.length <= 0)
		return '' ;
	else
		return fileSystem.removeExtension(matchedFile[0]) ;
}

public function getIpadStripImg() : String {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ getFolderName(null) +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/strip/' et on renvoie le premier résultat
	var matchedFile : Array = fileSystem.getStringContainInArray(GUIFiles, '/strip/' );
	
	// on renvoie le premier
	if ( matchedFile.length <= 0)
		return '' ;
	else
		return fileSystem.removeExtension(matchedFile[0]) ;
		
}

public function getIpadStripVideo() : String {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ getFolderName(null) +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent 'StreamingAssets/strip/' et on renvoie le premier résultat
	var matchedFile : Array = fileSystem.getStringContainInArray(GUIFiles, 'StreamingAssets/' );
	matchedFile = fileSystem.getStringContainInArray(matchedFile, '/strip/' );
	
	 if ( matchedFile.length <= 0)
		return '' ;
	else
		return fileSystem.removeExtension(matchedFile[0]) ;
}


/*
 * Crée le fichier contenant tous les donnée
 * relatif à ce plan
 */

public function createParsedFile() {
	
	var gettingFilesFunctions : Array = new Array() ;
	gettingFilesFunctions.Push( getSounds );
	gettingFilesFunctions.Push( getImages );
	gettingFilesFunctions.Push( getVideos ) ;
	gettingFilesFunctions.Push( getVideosRight );
	gettingFilesFunctions.Push( getVideosLeft );
	gettingFilesFunctions.Push( getMiniatures );
	gettingFilesFunctions.Push( getTextArrayWrapper );
	gettingFilesFunctions.Push( getStripVideoArrayWrapper );
	gettingFilesFunctions.Push( getStripImgArrayWrapper );
	
	fileSystem.createParsedFile( fileSystem.getResourcesPath() +'/'+ getFolderName(null) +'/'+ parsedFilePath, gettingFilesFunctions );
}


/*
 * Function getText Wrapper pour renvoyer un Array
 * (utile pour le callbak de createParsedFile )
 */

public function getTextArrayWrapper() : Array {	
	return Array( getFileText() ) ;
}

public function getStripVideoArrayWrapper() : Array {	
	return Array( getStripVideo() ) ;
}

public function getStripImgArrayWrapper() : Array {	
	return Array( getStripImg() ) ;
}



