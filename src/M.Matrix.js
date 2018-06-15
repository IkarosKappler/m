/**
 * A matrix class.
 *
 * Todo:
 *  - inv
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
	M.Matrix.prototype.getColumn = function( index ) {
		if( index < 0 || index >= this.n )
			throw "Cannot retrieve column: index out of bounds (" + index + ", n="+this.n+")";
		var vec = [];
		for( var y = 0; y < this.m; y++ )
			vec.push( this.data[y][index] );
		return vec;
	};


	// +-------------------------------------------------------------------
	// | Adds a column to the right of this matrix.
	// |
	// | @param array A vector as an array. Must have m elements.
	// | 
	// | @return this (for chaining).  
	// +--------------------------------------------------
	M.Matrix.prototype.addColumn = function( vec ) {
		if( this.n > 0 && this.m != vec.length )
			throw "Cannot add a column vector with " + vec.length + " elements to an " + this.m + "x" + this.n + " matrix.";
		if( this.n == 0 ) {
			//this.data.push( __cloneArray(vec) );
			for( var y = 0; y < vec.length; y++ )
				this.data.push( [vec[y]] );
			this.m = vec.length;
		} else {
			for( var i = 0; i < vec.length; i++ ) 
				this.data[i].push( vec[i] );
		}
		this.n++;
		return this;
	};


	// +-------------------------------------------------------------------
	// | Adds a matrix to the right of this matrix.
	// |
	// | @param M.Matrix A second matrix to attach to the right.
	// | 
	// | @return this (for chaining).  
	// +--------------------------------------------------
	M.Matrix.prototype.concat = function( mat ) {
		if( this.m > 0 && this.m != mat.m )
			throw "Cannot concat an " + mat.m + 'x' + mat.n + " matrix to an " + this.m + "x" + this.n + " matrix.";
		for( var x = 0; x < mat.n; x++ ) 
			this.addColumn( mat.getColumn(x) );
		return this;
	};


	// +-------------------------------------------------------------------
	// | Adds a column to the right of this matrix.
	// |
	// | @param array A vector as an array. Must have m elements.
	// | 
	// | @return this (for chaining).  
	// +--------------------------------------------------
	M.Matrix.prototype.getColumns = function( start, end ) {
		var mat = new M.Matrix([]);
		console.log( 'mat: ' + mat.m + 'x' + mat.n );
		for( var x = start; x < end; x++ ) {
			//console.log( x );
			//console.log( mat.toString() );
			//console.log( 'Column: ' + JSON.stringify(this.getColumn(x)) );
			mat.addColumn( this.getColumn(x) );
			//console.log( 'After adding ...' );
			//console.log( mat.toString() );
		}
		return mat;
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
	// | Multiplies this m*n matrix with the given n*k matrix.
	// | 
	// | @return M.Matrix (the result of the multiplication).  
	// +--------------------------------------------------
	// NOT WORKING CORRECTLY
	/*
	M.Matrix.prototype.inv = function() {
		if( this.n != this.m )
			throw "Cannot compute inverse matrix from a non-square matrix (" + this.m + 'x' + this.n + ").";

		// Create the identity matrix
		var ident = M.Matrix.identity( this.m );
		// Work on a clone of this matrix
		var A     = this.clone();
		A.concat(ident);
		console.log( A.toString(true) );
		console.log( "(" + A.m + 'x' + A.n + ")." );
		A.gaussianElimination();

		return A.getColumns( 0, this.n );
	}
	*/



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
		//for( var i=0; i < this.n; i++ ) { 
		for( var i=0; i < this.m; i++ ) { 
	        // Search for maximum in this column
	        var maxEl = Math.abs(this.data[i][i]),
	            maxRow = i;
	        //for( var k=i+1; k < this.n; k++) { 
	        for( var k=i+1; k < this.m; k++) { 
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
	        //for( var k=i+1; k < this.n; k++) { 
	        for( var k=i+1; k < this.m; k++) { 
	            var c = -this.data[k][i]/this.data[i][i];
	            // for (var j=i; j < this.n; j++) { // < n+1 ?
	            for (var j=i; j < this.m; j++) { // < n+1 ?
	                if (i===j) {
	                    this.data[k][j] = 0;
	                } else {
	                    this.data[k][j] += c * this.data[i][j];
	                }
	            }
	        }
	    }
	    // console.log( JSON.stringify(this.data) );
	    return this;
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
	// | Compute the rank of this matrix – which is the dimension of the
	// | vector space spanned by its rows.
	// |
	// | 0 <= mat.rank() < mat.m
	// | 
	// | @return int
	// +--------------------------------------------------
	M.Matrix.prototype.rank = function() {
		// Convert this matrix into an upper triangle matrix
		// and determine the number of linearly independent rows.
		var triangle = this.clone().gaussianElimination();
		var rank     = 0;
		for( var y = 0; y < triangle.m; y++ ) {
			if( !__isNullVector(triangle.data[y]) )
				rank++;
		}
		return rank;
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


	var __isNullVector = function( arr ) {
		for( var i = 0; i < arr.length; i++ ) {
			if( arr[i] != 0 ) return false;
		}
		return true;
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

	console.log( '[D] Get the rank of the matrix ... ' );
	console.log( '[D] rank=' + mD.rank() );

	console.log( '[D] Get column of the matrix at index 2 ... ' );
	console.log( '[D] rank=' + JSON.stringify(mD.getColumn(2)) );

	console.log( '[D] Concat a second matrix ... ' );
	console.log( '[D] concat: ' + mD.clone().concat( M.Matrix.identity(mD.m)).toString(true) );

	console.log( '[E] Create a new matrix with rank() < m ... ' );
	var mE = new M.Matrix( [ [1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,2,0] ] );
	console.log( mE.toString( true ) );
	console.log( '[E] Gaussian elimination: ' + mE.clone().gaussianElimination() );
	console.log( '[E] rank=' + mE.rank() );

	console.log( '[F] Create a new matrix with full rank (bijective) ... ' );
	var mF = new M.Matrix( [ [1,0,0,0], [0,2,3,4], [0,0,3,4], [0,0,0,5] ] );
	console.log( mF.toString( true ) );
	console.log( '[F] rank=' + mF.rank() );
	console.log( '[F] inverse=' + mF.inv() );
}


