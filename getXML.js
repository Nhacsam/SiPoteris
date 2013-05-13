/*
	Creation : 19/04/2013
	Author : Fabien Daoulas
	Last update : 08/05/2013
This script parses xml files, informations about videos.
	
*/


import System.Xml;
import System.IO;

// number of movies
private var numberOfMovies : int = 0;
private var mFile : XmlDocument ;


	
function InitXml( XMLToLoad : String ) {
	
	var textAsset : TextAsset = Resources.Load( XMLToLoad , typeof(TextAsset) ) as TextAsset;
	mFile = new XmlDocument();
	mFile.Load( new StringReader( textAsset.text ) );
	
}


/*
	*parse xml file
	*for each element named "element", this method creates a hashtable containing all informations of this element, and 
	*thanks to callback, this hashtable will be attached to the plane
*/
function getElementFromXML( f : function(Hashtable) ) : Array {
	
	var Data = new Array();
	
	// root hashtable
	var rootTab : Hashtable ;

	var elementList : XmlNodeList = mFile.GetElementsByTagName( "root" );
	
	var rootChildren : XmlNodeList;
	
	
	for each( var rootnodeList : XmlNode in elementList ) {
		 rootChildren =  rootnodeList.ChildNodes ;
	 }
	  
	 
	// parse XML
	for each( var nodeList : XmlNode in rootChildren ){
		 
		 if(  nodeList.Name == '#comment' )
		 	continue ;
		 
		rootTab = new Hashtable();
		var elementContent : XmlNodeList = nodeList.ChildNodes;
		
		exploreRecursively( elementContent , rootTab );
		
		Data.Push( rootTab );
		
		// do stuff
		f( rootTab );
	}
	
	return Data ;
	
}

/*
	*explore recursively the xml file
*/
private function exploreRecursively ( list : XmlNodeList , Htab : Hashtable){
	
	for each( var nodeList : XmlNode in list ) {
	
		var elementContent : XmlNodeList = nodeList.ChildNodes;
		
		// if there are childNodes
		if( elementContent.Count > 1 ){
			
			var nextHT : Hashtable = new Hashtable();
			
			// fill nextHT
			exploreRecursively( elementContent , nextHT );
			
			Htab[ nodeList.Name ] = nextHT;
		
		}
		else {// if there are no childNodes
		
			if( Htab.ContainsKey( nodeList.Name ) && typeof( Htab[ nodeList.Name ] ) != typeof( Array ) ){ // if key already exists and this is not an array
			
				var array : Array = new Array();
				array.Push( Htab[ nodeList.Name ] );
				array.Push( nodeList.InnerText );
				Htab[ nodeList.Name ] = array;
				
			} else if( Htab.ContainsKey( nodeList.Name ) && typeof( Htab[ nodeList.Name ] ) == typeof( Array ) ){ // if key already exists and this is an array
			
				// add another element
				Htab[ nodeList.Name ].Push( nodeList.InnerText );
			
			} else // if key does not exist already
				Htab[ nodeList.Name ] = nodeList.InnerText ;
			
		}
	}
}





