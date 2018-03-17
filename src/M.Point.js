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
