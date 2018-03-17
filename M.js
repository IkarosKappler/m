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
