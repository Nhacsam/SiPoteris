/*
	Creation : 19/04/2013
	Author : Fabien Daoulas
	Last update : 08/05/2013
This script parses xml files, informations about videos.
	
*/
#pragma strict

import System.Xml;
import System.IO;

/*
	*parse xml file
	*this method creates a hashtable containing all informations of this element, and 
	*thanks to callback, this hashtable will be attached to the plane
*/
static function getElementFromXML( fileName : String, callbackFunc : function( String, Hashtable ) ) : Array {
	
	var Data = new Array();
	
	var textAsset : TextAsset = Resources.Load( fileName , typeof(TextAsset) ) as TextAsset;
	
	if( !textAsset){
		Console.CriticalError( 'Xml file '+ fileName + ' not found !');
		return Data ;
	}
	
	var mFile : XmlDocument = new XmlDocument();
	mFile.Load( new StringReader( textAsset.text ) );
	
	
	
	
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
		
		
		callbackFunc( (nodeList.Name as String).ToLower(), rootTab);
		
	}
	
	return Data ;
	
}

/*
	*explore recursively the xml file
*/
private static function exploreRecursively ( list : XmlNodeList , Htab : Hashtable){
	
	for each( var nodeList : XmlNode in list ) {
	
		var elementContent : XmlNodeList = nodeList.ChildNodes;
		
		// conversion en minuscule (pour insensibilité à la casse)
		var nodeName = (nodeList.Name as String).ToLower() ;
		
		
		// if there are childNodes
		if( elementContent.Count > 1 ){
			
			var nextHT : Hashtable = new Hashtable();
			
			// fill nextHT
			exploreRecursively( elementContent , nextHT );
			
			Htab[ nodeName ] = nextHT;
		
		}
		else {// if there are no childNodes
		
			if( Htab.ContainsKey( nodeName ) && typeof( Htab[ nodeName ] ) != typeof( Array ) ){ // if key already exists and this is not an array
			
				var array : Array = new Array();
				array.Push( Htab[ nodeName ] );
				array.Push( nodeList.InnerText );
				Htab[ nodeName ] = array;
				
			} else if( Htab.ContainsKey( nodeName ) && typeof( Htab[ nodeName ] ) == typeof( Array ) ){ // if key already exists and this is an array
			
				// add another element
				( Htab[ nodeName ] as Array).Push( nodeList.InnerText );
			
			} else // if key does not exist already
				Htab[ nodeName ] = nodeList.InnerText.Trim() ;
			
		}
	}
}





