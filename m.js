/**
 * A collection of useful math functions, utils and classes.
 *
 * @author   Ikaros Kappler
 * @date     2018-03-16
 * @modified 2018-03-19 Added DEG2RAD and RAD2DEG.
 * @version  1.1.0
 **/


(function(_context) {
	"use strict";

	// +--------------------------------------------------------------------
	// | This is M;
	// +------------------------------------------------
	var M = _context.M = M || {};



	// +--------------------------------------------------------------------
	// | The conversion constant for transforming degrees to radians.
	// +------------------------------------------------
	M.DEG2RAD = Math.PI/180;


	// +--------------------------------------------------------------------
	// | The conversion constant for transforming radians to degrees.
	// +------------------------------------------------
	M.RAD2DEG = 180/Math.PI;


	// +--------------------------------------------------------------------
	// | Two Pi.
	// +------------------------------------------------
	M.TWOPI = Math.PI*2;


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
	    //return M.TWOPI - (a > 0 ? (Math.PI*2 - a) : -a);
	    return (a > 0 ? (Math.PI*2 - a) : -a);
	};
})( window ? window : module.exports );


/**
 * A point class in 2D.
 *
 * @requires M
 *
 * @author  Ikaros Kappler
 * @date    2018-03-15
 * @version 1.0.0
 **/

(function(_context) {
	"use strict";

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

})( window ? window : module.exports );
/**
 * My very own little ellipse class.
 *
 * @requires Point M
 *
 * @author  Ikaros Kappler
 * @date    2018-03-15
 * @version 1.0.0
 **/


(function(_context) {
    "use strict";

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
        // Imagine any line defined by the angle theta and find the intersection.
        var linePoint = circular.getPointAtT( theta );
        return this.getCentralLineIntersection( linePoint );
    };


    // +-------------------------------------------------------------------
    // | Get the point (x,y) on the outline by the given diametral line (specified by single point).
    // |
    // | Not that this point is not unique. There is a second one at (-x,-y).
    // +--------------------------------------------------
    M.Ellipse.prototype.getCentralLineIntersection = function( point ) {
        // http://mathworld.wolfram.com/Ellipse-LineIntersection.html
        
        var base = (this.a*this.b) / Math.sqrt( this.a*this.a * point.y*point.y + this.b*this.b * point.x*point.x );
        if( point.y < 0 ) {
    	//console.log( JSON.stringify(point) );
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
    	var theta = M.wrapTo2Pi( M.atanYX(point.x,point.y) );
    	sectors.push( new M.EllipticSector(this, theta_old, theta) );	
    	circularAngle += step;
    	theta_old = theta;
        }

        return { points : points, sectors : sectors };
    }

    /*
    M.Ellipse.prototype.scale = function( scaleA, scaleB ) {
        this.a *= scaleA;
        this.b *= scaleB;
        return this;
    };
    */

})( window ? window : module.exports );


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


(function(_context) {
    "use strict";


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


})( window ? window : module.exports );
/**
 * A matrix class.
 *
 * Todo:
 *  - inv
 *  - rank
 *  - eval
 *
 * @requires M
 *
 * @author  Ikaros Kappler
 * @date    2018-06-07
 * @version 1.0.0
 **/


(function() {
	"use strict";


	// +-------------------------------------------------------------------
	// | Create a new matrix.
	// |
	// | Matrix creation works with one, two or three different arguments:
	// |    (i) new M.Matrix( [ [a0,a1,a2], [b0,b1,b2], ... ] )
	// |   (ii) new Matrix( 3, 4 )
	// |  (iii) new Matrix( [ a0,a1,a2,a3, b0,b1,b2,b3, c0, ... ], 3, 4 )
	// |   (iv) new Matrix( 3, 4, function(x,y) { return x==y?1:0; } )
	// | 
	// | @param data:array|int  
	// | @param width:int (optional)
	// | @param height:int (optional)
	// +--------------------------------------------------
	M.Matrix = function( data, m, n ) {
		//console.log('type of data: ' + (typeof data) );
	    if( typeof data != 'object' && typeof data != 'array' ) {
	    	// data is no array
	    	if( typeof m == 'number' ) {
	  			this.n    = m;
	  			this.m    = data;
	    		this.data = __mkEmptyMatrix( data, m, typeof n != 'undefined' ? n : function(x,y) { return x==y?1:0; } ); // mk n*m-array
	    	}
	    	else {
	    		// 1*1 matrix
	    		this.n    = 1;
	    		this.m    = 1;
	    		this.data = [ data ]; // [ number|boolean ]
	    	}
	    } else {
	    	// data is array
	    	var width = m;
	    	//console.log('typeof with ('+width+') is ' +  typeof width );
	    	if( typeof width == 'number' ) {
	    		if( width < 0 ) throw "Cannot create matrix with negative width ("+width+")";
	    		if( width == 0 ) {
	    			this.data = [];
	    			this.n    = 0;
	    			this.m    = 0;
	    		} else {
		    		// Re-arrange the elements in data to fixed width
		    		this.data = [];
		    		var y = 0;
		    		var x = 0;
		    		var i = 0;
		    		while( i < data.length ) {
		    			var row = data.slice( i, i+width );
		    			while( row.length < width )
		    				row.push( 0 );
		    			this.data.push( row );
		    			i += row.length;
		    		}
		    		this.n = width;
		    		this.m = this.data.length;
		    	}
	    	} else {
	    		this.data = data;
	    		this.m    = data.length;
	    		this.n    = data.length == 0 ? 0 : data[0].length;
	    	}
	    }
	};


	// +-------------------------------------------------------------------
	// | Clones this matrix.
	// | 
	// | @return M.Matrix.  
	// +--------------------------------------------------
	M.Matrix.prototype.clone = function() {
		return new M.Matrix( __deepCloneArray(this.data) );
	};



	// +-------------------------------------------------------------------
	// | Evaluate (Matrix is a function) with passed vector.
	// | 
	// | @return array (A vector).  
	// +--------------------------------------------------
	M.Matrix.prototype.eval = function( vec ) {
		if( this.m != vec.length )
			throw "Cannot evaluate function with vector of " + vec.length + " elements and a " + this.m + "x" + this.n + " matrix.";	
		var result = __mkArray( this.m, 0 );
		for( var y = 0; y < this.m; y++ ) {
			for( var x = 0; x < this.n; x++ ) {
				result[y] += this.data[y][x] * vec[y];
			}	
		}
		return result;
	};



	// +-------------------------------------------------------------------
	// | Adds a column to the right of this matrix.
	// |
	// | @param array A vector as an array. Must have m elements.
	// | 
	// | @return this (for chaining).  
	// +--------------------------------------------------
	M.Matrix.prototype.addColumn = function( vec ) {
		if( this.m != vec.length )
			throw "Cannot add a column vector with " + vec.length + " elements to an " + this.m + "x" + this.n + " matrix.";
		for( var i = 0; i < vec.length; i++ ) {
			this.data[i].push( vec[i] );
		}
		this.n++;
		return this;
	};


	// +-------------------------------------------------------------------
	// | Adds a row to the bottom of this matrix.
	// |
	// | @param array A vector as an array. Must have n elements.
	// | 
	// | @return this (for chaining).  
	// +--------------------------------------------------
	M.Matrix.prototype.addRow = function( vec ) {
		if( this.n != vec.length )
			throw "Cannot add a column vector with " + vec.length + " elements to an " + this.m + "x" + this.n + " matrix.";
		this.data.push( __cloneArray(vec) );
		this.m++;
		return this;
	};



	// +-------------------------------------------------------------------
	// | Multiplies this m*n matrix with the given n*k matrix.
	// | 
	// | @return M.Matrix (the result of the multiplication).  
	// +--------------------------------------------------
	M.Matrix.prototype.mul = function( mat ) {
		if( this.n != mat.m )
			throw "Cannot multiply a " + this.m + 'x'+ this.n + " matrix with a " + mat.m + 'x'+ mat.n + " one.";

		var result = this.clone();
		for( var y = 0; y < this.m; y++ ) {
			for( var x = 0; x < this.n; x++ ) {
				result.data[y][x] = __multiplyRowWithCol( this, y, mat, x );
			}
		}
		return result;
	};



	// +-------------------------------------------------------------------
	// | Compute the upper triangular matrix using gaussian elimination.
	// |
	// | In-place: yes.
	// | 
	// | @return this (for chaining)
	// +--------------------------------------------------
	M.Matrix.prototype.gaussianElimination = function() {
		// Thanks to itsravenous@github for the implementation of gaussian
		// elimination:
		//    https://github.com/itsravenous/gaussian-elimination

		for( var i=0; i < this.n; i++ ) { 
	        // Search for maximum in this column
	        var maxEl = Math.abs(this.data[i][i]),
	            maxRow = i;
	        for( var k=i+1; k < this.n; k++) { 
	            if (Math.abs(this.data[k][i]) > maxEl) {
	                maxEl = Math.abs(this.data[k][i]);
	                maxRow = k;
	            }
	        }


	        // Swap maximum row with current row (column by column)
	        for( var k=i; k < this.n; k++) { // < n+1 ?
	            var tmp = this.data[maxRow][k];
	            this.data[maxRow][k] = this.data[i][k];
	            this.data[i][k] = tmp;
	        }

	        // Make all rows below this one 0 in current column
	        for( var k=i+1; k < this.n; k++) { 
	            var c = -this.data[k][i]/this.data[i][i];
	            for (var j=i; j < this.n; j++) { // < n+1 ?
	                if (i===j) {
	                    this.data[k][j] = 0;
	                } else {
	                    this.data[k][j] += c * this.data[i][j];
	                }
	            }
	        }
	    }
	    // console.log( JSON.stringify(this.data) );
	}
	


	// +-------------------------------------------------------------------
	// | Multiplies this m*n matrix with the given n*k matrix.
	// | 
	// | @return This matrix for chaining.  
	// +--------------------------------------------------
	M.Matrix.prototype.empty = function() {
		return this.m == 0 || this.n == 0;
	};


	// +-------------------------------------------------------------------
	// | Compute the determinant of this matrix.
	// | 
	// | @return number
	// +--------------------------------------------------
	M.Matrix.prototype.det = function() {
		var det = 0;
		for( var x = 0; x < this.n; x++ ) {
			// console.log( '[det] even diagonalProduct of index='+x+': ' + __getDiagonalProduct( this, x, false ) );
			// console.log( '[det]  odd diagonalProduct of index='+x+': ' + __getDiagonalProduct( this, x, true ) );
			det += this.diagonalProduct( x, false );
			det -= this.diagonalProduct( x, true  ); // bottomUp
		}
		return det;
	};


	// +-------------------------------------------------------------------
	// | Compute the trace of this matrix.
	// | 
	// | The trace is the sum of all diagonal elements.
	// | 
	// | @return number
	// +--------------------------------------------------
	M.Matrix.prototype.trace = function() {
		var min   = Math.min( this.m, this.n );
		var trace = 0;
		for( var i = 0; i < min; i++ ) {
			trace += this.data[i][i];
		}
		return trace;
	};



	// +-------------------------------------------------------------------
	// | Get single diagonal product of matrix.
	// | 
	// | @return number  
	// +--------------------------------------------------
	M.Matrix.prototype.diagonalProduct = function( col, bottomUp ) {
		if( this.empty() ) return 0;
		var prod = 1;
		for( var i = 0; i < this.m; i++ ) {
			if( bottomUp ) prod *= this.data[ this.m - 1 - i ][ (col + i) % this.n ];
			else           prod *= this.data[ i ]             [ (col + i) % this.n ];
		}
		return prod;
	}


	// +-------------------------------------------------------------------
	// | Convert this matrix into a human readable string.
	// | 
	// | @return string  
	// +--------------------------------------------------
	M.Matrix.prototype.toString = function( pretty ) {
		// return JSON.stringify( this.data, null, 2 );

		// For pretty printing the widths of the elements are required.
		var colWidths = pretty ? __getColumnDisplayWidths( this ) : __mkArray( this.n, 0 );

		var buf = [ "[\n" ];
		for( var y = 0; y < this.m; y++ ) {
			buf.push( ' [');
			for( var x = 0; x < this.n; x++ ) {
				buf.push( __addPadding(colWidths[x],this.data[y][x]) );
				if( x+1 < this.n ) buf.push(',');
			}
			buf.push( "]");
			if( y+1 < this.m ) buf.push(',');
			buf.push( "\n");
		}
		buf.push( ']' );
		return buf.join('');
	};


	// +-------------------------------------------------------------------
	// | Helper function: create an array with length n and the given value.
	// | 
	// | @return array  
	// +--------------------------------------------------
	var __mkArray = function( n, value ) {
		var arr = [];
		for( var i = 0; i < n; i++ )
			arr.push( value );
		return arr;
	}

	// +-------------------------------------------------------------------
	// | Helper function: plain array copy.
	// | 
	// | @return array  
	// +--------------------------------------------------
	var __cloneArray = function( arr ) {
		var copy = [];
		for( var i = 0; i < arr.length; i++ )
			copy.push( arr[i] );
		return copy;
	}


	// +-------------------------------------------------------------------
	// | Helper function: deep array clone.
	// | 
	// | @return array  
	// +--------------------------------------------------
	var __deepCloneArray = function( array ) {
		var result = [];
		for( var i = 0; i < array.length; i++ ) {
			if( typeof array[i] == 'object' || typeof array[i] == 'array' )
				result.push( __deepCloneArray(array[i]) );
			else
				result.push( array[i] );
		}
		return result;
	}


	// +-------------------------------------------------------------------
	// | Helper function: create an N*M matrix as an two-dimensional array.
	// | 
	// | @return array  
	// +--------------------------------------------------
	var __mkEmptyMatrix = function( m, n, value ) {
		var seeder = (typeof value) == 'function' ? value : function(x,y) { return value; };
		var data = [];
		for( var y = 0; y < m; y++ ) {
			var row = [];
			for( var x = 0; x < n; x++ ) 
				row.push( seeder(x,y) );
			data.push( row );
		}
		return data;
	}

	// +-------------------------------------------------------------------
	// | Helper function: miltiply row of first matrix with column of 
	// | second matrix.
	// |
	// | Sum(0<=i<n){ matA[rowA,i] * matB[i,colB] }
	// |
	// | Please note that this function does not perform and bound checks!
	// | Width of first matrix must match height of second matrix.
	// | 
	// | @return int  
	// +--------------------------------------------------
	var __multiplyRowWithCol = function( matA, rowA, matB, colB ) {
		//console.log( 'Multiply row ' + rowA + ' with col ' + colB );
		var num = 0;
		for( var i = 0; i < matA.n; i++ ) {
			num += (matA.data[rowA][i]*matB.data[i][colB]);
			//console.log( num, matA.data[rowA][i], matB.data[i][colB] );
		}
		return num;
	};
	

	// +-------------------------------------------------------------------
	// | Helper function: get the display widths for all columns.
	// |
	// | @param mat The matrix to get the column display widths for.
	// | 
	// | @return array:int
	// +--------------------------------------------------
	var __getColumnDisplayWidths = function( mat ) {
		var widths = __mkArray( mat.n, 0 );
		for( var y = 0; y < mat.m; y++ ) {
			for( var x = 0; x < mat.n; x++ ) {
				widths[x] = Math.max( widths[x], (''+mat.data[y][x]).length );
			}
		}
		return widths;
	};


	// +-------------------------------------------------------------------
	// | Helper function: add some whitespace (padding) to the left side of the
	// | passed value/number.
	// |
	// | @param padding:int   The desired string length (including padding and value).
	// | @param number:number The number/value to add the padding to.
	// | 
	// | @return string
	// +--------------------------------------------------
	var __addPadding = function( padding, number ) {
		var len = (''+number).length;
		return __mkArray(padding-len,' ').join('') + number;
	};



	// +-------------------------------------------------------------------
	// | Create the Identity matrix of size m*m or m*n.
	// | 
	// | The Identity matrix is 1 where indices i=j, and is 0 elsewhere.
	// |
	// | @param m The height of the matrix.
	// | @param n (optional) The width of the matrix (default is square matrix).
	// | 
	// | @return M.Matrix
	// +--------------------------------------------------
	M.Matrix.identity = function( m, n ) {
		return new M.Matrix( m, typeof n == 'undefined' ? m : n );
	};

})();


// Self test?
if( true ) {
	var mA = new M.Matrix( 3, 4 );
	console.log( '[A] mA is instance of M.Matrix: ' + (mA instanceof M.Matrix) );
	console.log( '[A] width(n): ' + mA.n + ', height(m): ' + mA.m );
	console.log( mA.toString() );
	console.log( '[A] det=' + mA.det() );
	console.log( '[A] trace=' + mA.trace() );


	var mB = new M.Matrix( [0,1,2, 3,4,5, 6,7,8], 3 );
	console.log( '[B] width(n): ' + mB.n + ', height(m): ' + mB.m );
	console.log( mB.toString( true ) );
	console.log( '[B] det=' + mB.det() );
	console.log( '[B] trace=' + mB.trace() );
	console.log( "Multiply // matrix^2" );
	var mBquad = mB.mul( mB );
	console.log( mBquad.toString( true ) );
	console.log( '[B] det=' + mB.det() );
	console.log( '[B] trace=' + mB.trace() );

	var identity3 = M.Matrix.identity(3);
	console.log( '[identity3] width(n): ' + identity3.n + ', height(m): ' + identity3.m );
	console.log( identity3.toString( true ) );
	console.log( '[identity3] det=' + identity3.det() );
	console.log( '[itentity3] trace=' + identity3.trace() );

	var mD = new M.Matrix( [ [4,3,2], [3,2,1], [2,1,0] ] );
	console.log( '[D] width(n): ' + mD.n + ', height(m): ' + mD.m );
	console.log( mD.toString() );
	console.log( '[D] det=' + mD.det() );
	console.log( '[D] trace=' + mD.trace() );
	console.log( '[D] cloning ...' );
	var mDclone = mD.clone();
	console.log( '[D.clone] width(n): ' + mDclone.n + ', height(m): ' + mDclone.m );
	console.log( mDclone.toString( true ) );
	console.log( 'Gaussian elimination ... ' );
	/*
	var gauss = mD.gaussianElimination();
	console.log( 'gauss.L: ' );
	console.log( gauss.L.toString() );
	console.log( 'gauss.R: ' );
	console.log( gauss.R.toString() );
	console.log( 'Multiplication L*R ... ');
	var LR = gauss.L.clone().mul(gauss.R);
	console.log( 'LR: ' );
	console.log( LR.toString() );
	*/
	mD.gaussianElimination();
	console.log( mD.toString( true ) );

	console.log( '[D] Add column ... ' );
	mD.addColumn( [10, 9, 8] );
	console.log( mD.toString( true ) );

	console.log( '[D] Add row ... ' );
	mD.addRow( [20, 21, 22, 23] );
	console.log( mD.toString( true ) );

	var x = [ 1, 1, 1, 1 ];
	console.log( '[D] Evaluating with vector: x=' + JSON.stringify(x) );
	var y = mD.eval( x );
	console.log( '[D] y=' + JSON.stringify(y) );
	console.log( '[D] Evaluating Identity with vector: x=' + JSON.stringify(x) );
	var y2 = M.Matrix.identity(4).eval( x );
	console.log( '[D] y2=' + JSON.stringify(y2) );

}


