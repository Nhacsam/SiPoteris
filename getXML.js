/*
	Creation : 19/04/2013
	Author : Fabien Daoulas
	Last update : 26/04/2013
This script parses xml files, informations about videos.
	
*/


import System.Xml;
import System.IO;

// number of movies
private var numberOfMovies : int = 0;
private var mFile : XmlDocument ;


	
function InitXml(XMLToLoad : String ) {
	
	var textAsset : TextAsset = Resources.Load( XMLToLoad , typeof( TextAsset ) ) as TextAsset;
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
	
	var TempTab : Hashtable ;

	var elementList : XmlNodeList = mFile.GetElementsByTagName( "root" );
	
	var rootChildren : XmlNodeList;
	
	
	for each( var rootnodeList : XmlNode in elementList ) {
		 rootChildren =  rootnodeList.ChildNodes ;
	 }
	  
	 
	// parse XML
	for each( var nodeList : XmlNode in rootChildren ){
		 
		 if(  nodeList.Name == '#comment' )
		 	continue ;
		 
		TempTab = new Hashtable();
		var elementContent : XmlNodeList = nodeList.ChildNodes;
		
		exploreRecursively( elementContent , TempTab );
		
		Data.Push(TempTab);
		
		// do stuff
		f( TempTab );
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
			exploreRecursively( elementContent , Htab );
		
		}
		else // if there are no childNodes
			Htab[ nodeList.Name ] = nodeList.InnerText ;
	}
}




