// Copyright 2020, University of Colorado Boulder

/**
 * CollisionLabUtils is a collection of general utility functions used in this sim.
 *
 * @author Brandon Li
 */

import AxonArray from '../../../axon/js/AxonArray.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import AssertUtils from '../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../collisionLab.js';
import CollisionLabConstants from './CollisionLabConstants.js';

const CollisionLabUtils = {

  /**
   * Iterates through an array, or an AxonArray, in pairs, passing the current value and the previous value to the
   * iterator function. For instance, forEachAdjacentPair( [ 1, 2, 3, 4 ], f ) would invoke f( 2, 1 ), f( 3, 2 ), and
   * f( 4, 3 ).
   * @public
   *
   * @param {*[]} collection
   * @param {function(value:*,previousValue:*)} iterator
   */
  forEachAdjacentPair( collection, iterator ) {
    assert && assert( Array.isArray( collection ) || collection instanceof AxonArray, `invalid collection: ${collection}` );
    assert && assert( typeof iterator === 'function', `invalid iterator: ${iterator}` );

    for ( let i = 1; i < collection.length; i++ ) {
      const value = collection[ i ];
      const previousValue = collection[ i - 1 ];

      iterator( value, previousValue );
    }
  },

  /**
   * Iterates through an array, or an AxonArray, for all possible pairs, without duplicating calls. For instance,
   * forEachPossiblePair( [ 1, 2, 3 ], f ) would invoke f( 1 , 2 ), f( 1, 3 ), and f( 2, 3 ).
   * @public
   *
   * @param {*[]} collection
   * @param {function(value1:*,value2:*)} iterator
   */
  forEachPossiblePair( collection, iterator ) {
    assert && assert( Array.isArray( collection ) || collection instanceof AxonArray, `invalid collection: ${collection}` );
    assert && assert( typeof iterator === 'function', `invalid iterator: ${iterator}` );

    for ( let i = 0; i < collection.length - 1; i++ ) {
      const value1 = collection[ i ];

      for ( let j = i + 1; j < collection.length; j++ ) {

        const value2 = collection[ j ];
        assert && assert( value1 !== value2 );

        iterator( value1, value2 );
      }
    }
  },

  /**
   * Similar to Bounds2.prototype.roundIn(), but instead of rounding in to the nearest whole number, it rounds inwards
   * to the nearest of any multiple.
   *
   * For instance, roundBoundsInToNearest( new Bounds2( -0.28, -0.25, 0.28, 0.25 ), 0.1 )
   * would return Bounds2( -0.2, -0.2, 0.2, 0.2 ).
   * @public
   *
   * @param {Bounds2} bounds - will be mutated!
   * @param {number} multiple - the nearest multiple to round the Bounds in to.
   * @returns {Bounds2}
   */
  roundBoundsInToNearest( bounds, multiple ) {
    assert && assert( bounds instanceof Bounds2, `invalid bounds: ${bounds}` );
    assert && assert( typeof multiple === 'number', `invalid multiple: ${multiple}` );

    return bounds.setMinMax(
      Math.ceil( bounds.minX / multiple ) * multiple,
      Math.ceil( bounds.minY / multiple ) * multiple,
      Math.floor( bounds.maxX / multiple ) * multiple,
      Math.floor( bounds.maxY / multiple ) * multiple
    );
  },

  /**
   * Rounds the magnitude of a Vector2 instance upwards to the nearest of any multiple. For instance,
   * roundUpVectorToNearest( new Vector2( 0.98, 0 ), 0.1 ) would return Vector2( 1, 0 ).
   * @public
   *
   * @param {Vector2} vector - will be mutated!
   * @param {number} multiple - the nearest multiple to round the Bounds in to.
   * @returns {Vector2}
   */
  roundUpVectorToNearest( vector, multiple ) {
    assert && assert( vector instanceof Vector2, `invalid vector: ${vector}` );
    assert && assert( typeof multiple === 'number', `invalid multiple: ${multiple}` );

    vector.setPolar( Math.ceil( vector.magnitude / multiple ) * multiple, vector.angle );

    if ( Utils.equalsEpsilon( vector.y, 0, CollisionLabConstants.ZERO_THRESHOLD ) ) { vector.y = 0; }
    return vector;
  },

  /**
   * Rounds the values of a Vector2 instance to the nearest of any multiple. For instance,
   * roundVectorToNearest( new Vector2( 0.28, 0.24 ), 0.1 ) would return Vector2( 0.3, 0.2 ).
   * @public
   *
   * @param {Vector2} vector - will be mutated!
   * @param {number} multiple - the nearest multiple to round the Bounds in to.
   * @returns {Vector2}
   */
  roundVectorToNearest( vector, multiple ) {
    assert && assert( vector instanceof Vector2, `invalid vector: ${vector}` );
    assert && assert( typeof multiple === 'number', `invalid multiple: ${multiple}` );

    return vector.divideScalar( multiple ).roundSymmetric().multiply( multiple );
  },

  /**
   * Determines whether an array is strictly sorted in ascending order (non-inclusive).
   * @public
   *
   * @param {number[]} array
   * @returns {boolean}
   */
  isSorted( array ) {
    assert && AssertUtils.assertArrayOf( array, 'number' );

    // Flag that indicates if the array is sorted.
    let isSorted = true;

    CollisionLabUtils.forEachAdjacentPair( array, ( value, previousValue ) => {
      if ( isSorted ) {
        isSorted = ( value > previousValue );
      }
    } );
    return isSorted;
  },

  /**
   * Gets the extrema of an array of values by some comparator function.
   * @public
   *
   * @param {*[]} array
   * @param {function(value:*,base:*):number} comparator - Return -1 if base is more 'extreme' than value, 0 if base
   *                                                       is equally as 'extreme' as value, and 1 otherwise.
   * @returns {*[]} - an array of the extrema.
   */
  getExtremaOf( array, comparator ) {
    // assert && assert( Array.isArray( array ), `invalid array: ${array}` );
    assert && assert( typeof comparator === 'function', `invalid comparator: ${comparator}` );

    // Flag of the resulting extrema.
    let extrema = [];

    array.forEach( item => {
      if ( !extrema.length ) {
        extrema.push( item );
      }
      else {
        const comparison = comparator( item, extrema[ 0 ] );
        if ( comparison === -1 ) {
          extrema = [ item ];
        }
        else if ( comparison === 0 ) {
          extrema.push( item );
        }
      }
    } );

    return extrema;
  },

  /**
   * Gets the minimum value(s) of an array of values that are ranked by some criterion function. For instance,
   * getMinValuesOf( [ 1, 1, 2, 3, 4, 1 ], _.identity ) returns [ 1, 1, 1 ].
   * @public
   *
   * @param {*[]} array
   * @param {function(value:*):number} criterion
   * @returns {*[]} - an array of the maximum value(s).
   */
  getMinValuesOf( array, criterion ) {
    // assert && assert( Array.isArray( array ), `invalid array: ${array}` );
    assert && assert( typeof criterion === 'function', `invalid criterion: ${criterion}` );

    return CollisionLabUtils.getExtremaOf( array,
      ( base, value ) => Math.sign( criterion( base ) - criterion( value ) ) );
  },

  /**
   * Gets the maximum value(s) of an array of values that are ranked by some criterion function. For instance,
   * getMaxValuesOf( [ 1, 2, 3, 3, 4, 4 ], _.identity ) returns [ 4, 4 ].
   * @public
   *
   * @param {*[]} array
   * @param {function(value:*):number} criterion
   * @returns {*[]} - an array of the maximum value(s).
   */
  getMaxValuesOf( array, criterion ) {
    // assert && assert( Array.isArray( array ), `invalid array: ${array}` );
    assert && assert( typeof criterion === 'function', `invalid criterion: ${criterion}` );

    return CollisionLabUtils.getExtremaOf( array,
      ( base, value ) => Math.sign( criterion( value ) - criterion( base ) ) );
  },

  /**
   * Determines whether an array, or an AxonArray, is strictly sorted in ascending order (non-inclusive) by
   * a criterion function that numerically ranks each element of the array. The criterion function is passed each
   * element of the collection.
   * @public
   *
   * @param {*[]} collection
   * @param {function(value:*):number} criterion
   * @returns {boolean}
   */
  isSortedBy( collection, criterion ) {
    assert && assert( Array.isArray( collection ) || collection instanceof AxonArray, `invalid collection: ${collection}` );
    assert && assert( typeof criterion === 'function', `invalid criterion: ${criterion}` );

    // Works for both AxonArrays and native Arrays.
    return CollisionLabUtils.isSorted( collection.map( criterion ) );
  },

  /**
   * A javascript version of the sleep function. This is **ONLY to be used for debugging**, and assertions must be
   * enabled for use. This was mostly used to debug CollisionEngine with large time steps. In this case, it should be
   * used in-conjunction with the step button to allow the javascript event loop to return before the next step.
   * @public
   *
   * @param {number} time - in seconds.
   * @returns {Promise}
   */
  sleep( time ) {
    if ( assert ) {
      return new Promise( resolve => setTimeout( resolve, time * 1000 ) );
    }
  }
};

collisionLab.register( 'CollisionLabUtils', CollisionLabUtils );
export default CollisionLabUtils;