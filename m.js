/**
 * My very own little ellipse class.
 *
 * @requires Point M
 *
 * @author  Ikaros Kappler
 * @date    2018-03-15
 * @version 1.0.0
 **/


// +-------------------------------------------------------------------
// | Construct a new ellipse.
// +------------------------------------------------
M.Ellipse = function(a,b,center) {

    if( typeof center === 'undefined' ) center = new M.Point();
    
    this.a = a;
    this.b = b;
    this.center = center;
};


// +-------------------------------------------------------------------
// | Compute the area in O(1).
// +--------------------------------------------------
M.Ellipse.prototype.computeArea = function() {
    return Math.PI*this.a*this.b;
};


// +-------------------------------------------------------------------
// | Get the point on the outline by the given circular angle (t).
// |
// | Note that t is NOT the elliptical angle, thus the angle of the vector
// | from the origin the the computed points will be a different one.
// +--------------------------------------------------
M.Ellipse.prototype.getPointAtT = function( t ) {
    return new M.Point( this.a*Math.cos(t), this.b*Math.sin(t) );
};


// +-------------------------------------------------------------------
// | Get the point on the outline by the given angle (theta).
// +--------------------------------------------------
M.Ellipse.prototype.getPointAtTheta = function( theta ) {
    // http://mathworld.wolfram.com/Ellipse-LineIntersection.html

    // Convert this ellipse to a circle
    var circular = new M.Ellipse( Math.max(this.a,this.b), Math.max(this.a, this.b) );
    /*
    var ellipticPoint = circular.getPointAtT( theta );
    var linePoint = new Point( ellipticPoint.x * (circular.a/this.a),
			       ellipticPoint.y * (circular.b/this.a)
			     );

    
    var circularIntersection = circular.getCentralLineIntersection( linePoint );
    var circularTheta = M.atanYX( circularIntersection.x, circularIntersection.y );
    return this.getPointAtT( circularTheta );
    */

    // Imagine any line defined by the angle theta and find the intersection.
    var linePoint = circular.getPointAtT( theta );
    return this.getCentralLineIntersection( linePoint );
};


//Ellipse.prototype.getPointAtCircularTheta = function


// +-------------------------------------------------------------------
// | Get the point (x,y) on the outline by the given diametral line (specified by single point).
// |
// | Not that this point is not unique. There is a second one at (-x,-y).
// +--------------------------------------------------
M.Ellipse.prototype.getCentralLineIntersection = function( point ) {
    // http://mathworld.wolfram.com/Ellipse-LineIntersection.html
    
    var base = (this.a*this.b) / Math.sqrt( this.a*this.a * point.y*point.y + this.b*this.b * point.x*point.x );
    if( point.y < 0 ) {
	console.log( JSON.stringify(point) );
	return new M.Point(  (base * point.x),
			     (base * point.y)
			  );
    } else {
	return new M.Point(  base * point.x,
			     base * point.y
			  );
    }
};


// +-------------------------------------------------------------------
// | Split this ellipse into n elliptic sectors.
// +--------------------------------------------------
M.Ellipse.prototype.sectorize = function( n, startAt ) {

    if( typeof startAt === 'undefined' ) startAt = 0.0;
    
    // This solution was insipred by
    //    https://stackoverflow.com/questions/21277355/how-can-you-find-the-point-on-an-ellipse-that-sweeps-a-given-area
    // Thanks to Vikram and Harish Chandra Rajpoot
    
    var sectors = [];
    var points = [];

    var step  = Math.PI*2/n;
    var circularAngle = startAt+step;
    var theta_old = startAt;
    for( var i = 0; i < n; i++ ) {
	var point = this.getPointAtT( circularAngle );
	points.push( point );

	// Compute the angle for the point (x,y) on the outline.
	// Remember: atan2 begins on top and also returns negative values in [-PI,PI]
	//var theta = Math.atan2( point.x, point.y );
	//theta = Ellipse.Helpers.atan2To2Pi(theta);
	var theta = M.wrapTo2Pi( M.atanYX(point.x,point.y) );
	
	//console.log( 'theta_raw_deg=' + (theta/Math.PI*180) + ', theta_deg=' + Ellipse.Helpers.wrapTo2Pi(theta)/Math.PI*180 + ', circularAngle=' + (circularAngle/Math.PI*180) );
	//theta = Ellipse.Helpers.wrapTo2Pi(theta);

	sectors.push( new M.EllipticSector(this, theta_old, theta) );
	
	circularAngle += step;
	theta_old = theta;
    }

    return { points : points, sectors : sectors };
}


M.Ellipse.prototype.scale = function( scaleA, scaleB ) {
    this.a *= scaleA;
    this.b *= scaleB;
    return this;
};


/*
M.Ellipse.Helpers = {
    wrapTo2Pi : function(a) {
	a = a % (Math.PI*2);
	if( a < 0 )
	    a = Math.PI*2 + a;
	return a;
    },
    atan2To2Pi : function(a) {
	if( a < 0 ) a = Math.PI-a;
	return a - Math.PI/2.0;
    }
}
*/


// Self test
if( true ) {

    var e = new M.Ellipse(250,150);
    console.log( JSON.stringify(e) );

}

/**
 * An elliptic sector.
 *
 * @author  Ikaros Kappler
 * @version 1.0.0
 * @date    2018-03-15
 **/


M.EllipticSector = function( ellipse, theta0, theta1 ) {
    this.ellipse = ellipse;
    this.theta0 = theta0;
    this.theta1 = theta1;
};

M.EllipticSector.prototype.getTheta = function() {
    return this.theta1-this.theta0;
}

M.EllipticSector.prototype.computeArea = function() {
    var theta = this.getTheta();
    var a = this.ellipse.a;
    var b = this.ellipse.b;
    return area =
	((a * b)/2) *
	(theta-Math.atan((b-a)*Math.sin(2*this.theta1) / (a+b+(b-a)*Math.cos(2*this.theta1))) +
	 Math.atan((b-a)*Math.sin(2*this.theta0) / (a+b+(b-a)*Math.cos(2*this.theta0))) );
}



/**
 * A point class in 2D.
 *
 * @requires M
 *
 * @author  Ikaros Kappler
 * @date    2018-03-15
 * @version 1.0.0
 **/

M.Point = function( x, y ) {
    if( typeof x === 'undefined' ) x = 0;
    if( typeof y === 'undefined' ) y = 0;

    this.x = x;
    this.y = y;
};


// +-------------------------------------------------------------------
// | Inverse this point to (-x,-y).
// +--------------------------------------------------
M.Point.prototype.inverse = function() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
}


// +-------------------------------------------------------------------
// | Clone this point.
// +--------------------------------------------------
M.Point.prototype.clone = function() {
    return new Point(this.x, this.y);
}

/**
 * A collection of useful math functions, utils and classes.
 *
 * @author  Ikaros Kappler
 * @date    2018-03-16
 * @version 1.0.0
 **/


// +--------------------------------------------------------------------
// | This is M;
// +------------------------------------------------
var M = M || {};




// +--------------------------------------------------------------------
// | atanYX computes the angle between a vector (0,0)->(x,y) and
// | the positive x-axis.
// |
// | Note that the native atan2 computes the angle related to the
// | positive y-axis.
// |
// | @param x:Number The x component of your cartesian vector point.
// | @param y:Number The y component of your cartesian vector point.
// |
// | @return The angle of the vector (with x-axis = 0°).
// +------------------------------------------------
M.atanYX = function( x, y ) {
    // --- Swapping (x,y) to (-y,x) rotates the point by 90° :)
    return Math.atan2(-y,x);
};



// +--------------------------------------------------------------------
// | Wraps a given float into the interval [0, 2*PI].
// |
// |
// | * [0,-PI] is mapped to [0, PI]
// | * [0, PI] is mapped to [PI,2*PI]
// |
// |
// | 
// | This is useful to display full circle radians (counter clockwise)
// | instead of negative and positive half-radians.
// |
// | @param a:Number Any real number.
// |
// | @return 
// +------------------------------------------------
M.wrapTo2Pi = function( a ) {
    return (a > 0 ? (Math.PI*2 - a) : -a);
};
