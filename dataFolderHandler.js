#pragma strict

/*
number of lines : 620

*/

// Nom du dossier principal
private var ResourcesFolderName : String ;
private var StreamingFolderName : String ;

// Nom du fichier texte si spécié par l'utilisateur
private var textName : Array ;

// Liste des fichiers pour la GUI
private var GUIFiles : Array = Array() ;

// nom du fichier contenant les adresses des ressources
private var parsedFilePath : String = "resourcesInfos.txt" ;

// nom du plan concerné
private var Name : String ;


public function Init( gui, name : String ) {
	
	Name = name ;
	ResourcesFolderName = getFolderName('', gui);
	StreamingFolderName = getFolderName(fileSystem.getStreamingFolder(), gui);
	textName = getTextFromHashtab( gui );
}


/*
 * Retourne le nom du dossier contenant les données
 * Le crée si vide
 * crée un dossier default si vide et nom du dossier non trouvé
 */
public function getFolderName	(  root : String, gui ) : String{
	
	if( ! root )
		root = fileSystem.getResourcesPath() ;
	
	var folder : String = '' ;
	
	if( gui ) {
		if( typeof(gui) == System.Collections.Hashtable ) {
			if( ( gui as Hashtable ).Contains('folder') ) {
				
				folder = (gui as Hashtable )['folder'] ;
				if( fileSystem.isDirExisting(root + '/' + folder) )
					return folder ;
			
			} // Contain
		} else if (typeof( gui )== System.String) {
			
			folder = gui ;
			if( fileSystem.isDirExisting(root + '/' + folder) )
				return folder ;
			         
		}// typeof
	} // Contain
	
	// Si on arrive ici, c'est que le nom du dossier n'a pas été trouvé.
	Console.Warning('No data folder found for the plane ' + Name);
	return getDefaultFolder(null);
	
}


public function getTextFromHashtab( gui ) : Array {
	
	var path : String = '' ;
	var resultFiles : Array = new Array();
	
	/*
	 * Si il y a un champ text dans le xml
	 * in récupère le fichier associé
	 */
	if( gui ) {
		if( typeof(gui) == System.Collections.Hashtable ) {
			if( ( gui as Hashtable ).Contains('text') ) {
				
				if( typeof( ( gui as Hashtable )['text']) == Array ) {
					
					var files : Array  = ( gui as Hashtable )['text'] as Array ;
					
					for( var i = 0 ; i < files.length; i ++ ){
						
						if (fileSystem.getTextFromFile( ResourcesFolderName + (files[i] as String) )  != -1)
						 	resultFiles.Push(files[i] + '.textefile') ;
						
					}
				} else {
				
					// lit le contenue du fichier
					path = ResourcesFolderName + (( gui as Hashtable )['text'] as String ) ;
					
					if (fileSystem.getTextFromFile(path)  != -1)
						resultFiles.Push( path + '.textefile' );
				}
					
			} // Contains text
		} // type of
	} // Contains gui
	
	return resultFiles;
}


/*
 * Récupère les chemins des dossiers
 * Contenant les infos
 */
public function getImgFolder() : String {
	return fileSystem.getChildFolder( 'img',ResourcesFolderName, null );
}

public function getAudioFolder() : String {
	return fileSystem.getChildFolder( 'audio',ResourcesFolderName, null );
}

public function getVideoFolder() : String {
	return  fileSystem.getChildFolder( 'video', StreamingFolderName, fileSystem.getStreamingFolder() ) ;
}

public function getVideoRightFolder() : String {
	return  fileSystem.getChildFolder( 'videoRight', StreamingFolderName, fileSystem.getStreamingFolder() ) ;
}

public function getVideoLeftFolder() : String {
	return  fileSystem.getChildFolder( 'videoLeft', StreamingFolderName, fileSystem.getStreamingFolder() ) ;
}

public function getMiniatureFolder() : String {
	return fileSystem.getChildFolder( 'min',ResourcesFolderName, null );
}

public function getStripImgFolder() : String {
	return fileSystem.getChildFolder( 'strip',ResourcesFolderName, null );
}

public function getStripVideoFolder() : String {
	return  fileSystem.getChildFolder( 'strip', StreamingFolderName, fileSystem.getStreamingFolder() ) ;
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

public function getText( lang : String ) : String {
	var path : String = getFileText( lang ) ;
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

	if( scriptForPlane.isOnIpad() )
		return getIpadSounds() ;
	else
		return getEditorSounds() ;
}

public function getImages() : Array {
	
	if( scriptForPlane.isOnIpad() )
		return getIpadImages() ;
	else
		return getEditorImages() ;
}


public function getVideos() : Array {
	
	if( scriptForPlane.isOnIpad() )
		return getIpadVideos() ;
	else
		return getEditorVideos() ;
}

public function getVideosRight() : Array {
	
	if( scriptForPlane.isOnIpad() )
		return getIpadVideosRight() ;
	else
		return getEditorVideosRight() ;
}

public function getVideosLeft() : Array {
	
	if( scriptForPlane.isOnIpad() )
		return getIpadVideosLeft() ;
	else
		return getEditorVideosLeft() ;
}

public function getMiniatures() : Array {
	
	if( scriptForPlane.isOnIpad() )
		return getIpadMiniatures() ;
	else
		return getEditorMiniatures() ;
}

public function getFileText( lang : String ) : String {
	
	var texts : Array ;
	
	if( scriptForPlane.isOnIpad() )
		texts = getIpadFileText() ;
	else
		texts =  getEditorFileText() ;
	
	// récupération des fichiers de la bonne langue (qui finissent par _fr.textefile par ex )
	var textsOnGoodLang : Array = fileSystem.getStringContainInArray(texts, '_'+lang+'.textefile' );
	
	// on renvoie le 1er trouvé
	if ( textsOnGoodLang.length > 0 ) {
		return fileSystem.removeExtension(textsOnGoodLang[0]);
	} else if ( texts.length > 0 ) {
		return fileSystem.removeExtension(texts[0]);
	} else {
		return '';
	}
	
}

public function getStripImg() : String {
	
	if( scriptForPlane.isOnIpad() )
		return getIpadStripImg() ;
	else
		return getEditorStripImg() ;
}


public function getStripVideo() : String {
	
	if( scriptForPlane.isOnIpad() )
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

public function getEditorFileText() : Array {
	
	var path : String = '' ;
	var text : Array = new Array();
	
	if ( textName != Array() && textName.length > 0 ) {
		text = textName ;
	}
	
	/*
	 * sinon si un fichier de type txt est présent dans le dossier
	 * C'est lui qu'on utilise
	 */
	var allPaths : Array = fileSystem.getFilesInArrayFromFolder(ResourcesFolderName, '.txt', null ) ;
	
	for( var i = 0; i < allPaths.length; i++ ) {
		
		if( allPaths[i] != ResourcesFolderName +'/'+ fileSystem.removeExtension(parsedFilePath) )
			text.Push( allPaths[i] + '.textefile' );
	}
	
	/*
	 * sinon si un fichier de type txt est présent dans le dossier par defaut
	 * C'est lui qu'on utilise
	 */
	allPaths = fileSystem.getFilesInArrayFromFolder( getDefaultFolder(null), '.txt', null ) ;
	
	for( i = 0; i < allPaths.length; i++ ) {
		
		if( allPaths[i] != getDefaultFolder(null) +'/'+ fileSystem.removeExtension(parsedFilePath) )
			text.Push( allPaths[i] + '.textefile' );
	}
	
	/*
	 * si rien de concluent est trouvé Warning
	 */
	if ( text == Array() || text.length == 0 )
		Console.Warning('No text file found for the plane ' + Name);
	
	return text ;
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
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ResourcesFolderName +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/Audio/' et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '/audio/' );
}


public function getIpadImages() : Array {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ResourcesFolderName +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/img/' et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '/img/' );

}


public function getIpadVideos() : Array {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ResourcesFolderName +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/video/' et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '/video/' );

}


public function getIpadVideosRight() : Array {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ResourcesFolderName +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/videoRight/' et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '/videoRight/' );

}


public function getIpadVideosLeft() : Array {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ResourcesFolderName +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/videoLeft/' et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '/videoLeft/' );

}

public function getIpadMiniatures() : Array {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ResourcesFolderName +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '/min/' et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '/min/' );

}

public function getIpadFileText() : Array {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ResourcesFolderName +'/'+ parsedFilePath ) ;
	
	// Ensuite on cheche ceux qui contiennent '.textefile' (concaténé lors de la creation du fichier) et on renvoie les résultats
	return fileSystem.getStringContainInArray(GUIFiles, '.textefile' );
}

public function getIpadStripImg() : String {
	
	// Si la liste des fichiers et vides, on la génère
	if( GUIFiles.length == 0 )
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ResourcesFolderName +'/'+ parsedFilePath ) ;
	
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
		GUIFiles = fileSystem.parseFile( fileSystem.getResourcesPath() +'/'+ResourcesFolderName +'/'+ parsedFilePath ) ;
	
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
	
	fileSystem.createParsedFile( fileSystem.getResourcesPath() +'/'+ResourcesFolderName +'/'+ parsedFilePath, gettingFilesFunctions );
}


/*
 * Function getText Wrapper pour renvoyer un Array
 * (utile pour le callbak de createParsedFile )
 */

public function getTextArrayWrapper() : Array {	
	if( scriptForPlane.isOnIpad() )
		return getIpadFileText() ;
	else
		return getEditorFileText() ;
}

public function getStripVideoArrayWrapper() : Array {	
	return Array( getStripVideo() ) ;
}

public function getStripImgArrayWrapper() : Array {	
	return Array( getStripImg() ) ;
}
