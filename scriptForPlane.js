/*
	*Creation : 26/04/2013
	*Author : Fabien Daoulas
	*Last update : 29/04/2013
*/

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







