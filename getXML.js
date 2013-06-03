/*
	Creation : 19/04/2013
	Author : Fabien Daoulas
	Last update : 08/05/2013
This script parses xml files, informations about videos...
	
*/
#pragma strict

import System.Xml;
import System.IO;

// number of movies
private var numberOfMovies : int = 0;
private var mFile : XmlDocument ;


	
function InitXml( XMLToLoad : String ) {
	
	// because .xml is not managed by iPad, this file has to be .txt and then load as a textAsset
	var textAsset : TextAsset = Resources.Load( XMLToLoad , typeof(TextAsset) ) as TextAsset;
	mFile = new XmlDocument();
	mFile.Load( new StringReader( textAsset.text ) );
	
}


/*
	*parse xml file
	*this method creates a hashtable containing all informations of this element, and 
	*thanks to callback, this hashtable will be attached to the plane
*/
function getElementFromXML( functions : Hashtable ) : Array {

	var Data = new Array();
	
	// root hashtable
	var rootTab : Hashtable ;

	// get all element under tag "root"
	var elementList : XmlNodeList = mFile.GetElementsByTagName( "root" );
	
	var rootChildren : XmlNodeList;
	
	// get child of roots
	for each( var rootnodeList : XmlNode in elementList ) {
		 rootChildren =  rootnodeList.ChildNodes ;
	 }
	  
	 
	// parse XML - fir each element of rootChildren list
	for each( var nodeList : XmlNode in rootChildren ){
		 if(  nodeList.Name == '#comment' )
		 	continue ;
		 
		rootTab = new Hashtable();
		
		// list of child of an element of rootChidren list
		var elementContent : XmlNodeList = nodeList.ChildNodes;
		
		// explore all the xml recursively until there is no child for a node
		exploreRecursively( elementContent , rootTab );
		
		// get all the information stored under this element of rootChildren
		Data.Push( rootTab );
		
		if( functions.Contains(nodeList.Name) )
			(functions[ nodeList.Name ] as function(Hashtable) )(rootTab) ;
		
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
				// create an array and start storing all the information
				var array : Array = new Array();
				array.Push( Htab[ nodeList.Name ] );
				array.Push( nodeList.InnerText );
				Htab[ nodeList.Name ] = array;
				
			} else if( Htab.ContainsKey( nodeList.Name ) && typeof( Htab[ nodeList.Name ] ) == typeof( Array ) ){ // if key already exists and this is an array
			
				// add another element in the array
				( Htab[ nodeList.Name ] as Array).Push( nodeList.InnerText );
			
			} else // if key does not exist already
				Htab[ nodeList.Name ] = nodeList.InnerText ;
			
		}
	}
}





