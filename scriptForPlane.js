#pragma strict
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

// plan is visible
private var visible : boolean ;

// Time when the object have been moved last
private var lastMoveTime : float = 0;

private var beginTime : float ;
private var endTime : float ;


// gestionnaire des fichiers
private var datasHandler : dataFolderHandler ;


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
	
	if( t.ContainsKey( 'begint' ) )
		beginTime = float.Parse( t['begint']+'' ) ;
	else
		beginTime = -1 ;
		
	if( t.ContainsKey( 'endt' ) )
		endTime = float.Parse( t['endt']+'' ) ;
	else
		endTime = -1 ;
	
	
	// Initialisatiion du gestionnaire de l'architecture de fichier
	datasHandler =		gameObject.GetComponent("dataFolderHandler")	as dataFolderHandler ;
	if( ! datasHandler )
		datasHandler =	gameObject.AddComponent("dataFolderHandler")	as dataFolderHandler ;
	
	if( !HT.Contains('gui') )
		HT['gui'] = null ;
	
	datasHandler.Init( HT['gui'], Name );
	
}


public function getHandler() {
	return datasHandler ;
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



/*
 * The plan could be visible ?
 */
public function setVisible ( b : boolean ) {
	visible = b ;
}
public function getVisible() : boolean {
	return visible ;
}


public function getBeginTime() {
	return beginTime ;
}

public function getEndTime() {
	return endTime ;
}


static function isOnIpad() : boolean {
	return ( SystemInfo.deviceType == DeviceType.Handheld );
}

