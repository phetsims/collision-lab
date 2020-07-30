// Copyright 2020, University of Colorado Boulder

/**
 * CollisionLabUtils is a collection of general utility functions used in this sim.
 *
 * @author Brandon Li
 */

import ObservableArray from '../../../axon/js/ObservableArray.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import AssertUtils from '../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../collisionLab.js';

const CollisionLabUtils = {

  /**
   * Iterates through an array, or an ObservableArray, in pairs, passing the current value and the previous value to the
   * iterator function. For instance, forEachAdjacentPair( [ 1, 2, 3, 4 ], f ) would invoke f( 2, 1 ), f( 3, 2 ), and
   * f( 4, 3 ).
   * @public
   *
   * @param {ObservableArray.<*>|*[]} collection
   * @param {function(value:*,previousValue:*)} iterator
   */
  forEachAdjacentPair( collection, iterator ) {
    assert && assert( Array.isArray( collection ) || collection instanceof ObservableArray, `invalid collection: ${collection}` );
    assert && assert( typeof iterator === 'function', `invalid iterator: ${iterator}` );

    for ( let i = 1; i < collection.length; i++ ) {
      const value = collection instanceof ObservableArray ? collection.get( i ) : collection[ i ];
      const previousValue = collection instanceof ObservableArray ? collection.get( i - 1 ) : collection[ i - 1 ];

      iterator( value, previousValue );
    }
  },

  /**
   * Iterates through an array, or an ObservableArray, for all possible pairs, without duplicating calls. For instance,
   * forEachPossiblePair( [ 1, 2, 3 ], f ) would invoke f( 1 , 2 ), f( 1, 3 ), and f( 2, 3 ).
   * @public
   *
   * @param {ObservableArray.<*>|*[]} collection
   * @param {function(value1:*,value2:*)} iterator
   */
  forEachPossiblePair( collection, iterator ) {
    assert && assert( Array.isArray( collection ) || collection instanceof ObservableArray, `invalid collection: ${collection}` );
    assert && assert( typeof iterator === 'function', `invalid iterator: ${iterator}` );

    for ( let i = 0; i < collection.length - 1; i++ ) {
      const value1 = collection instanceof ObservableArray ? collection.get( i ) : collection[ i ];

      for ( let j = i + 1; j < collection.length; j++ ) {

        const value2 = collection instanceof ObservableArray ? collection.get( j ) : collection[ j ];
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
   * Determines whether an array, or an ObservableArray, is strictly sorted in ascending order (non-inclusive) by
   * a criterion function that numerically ranks each element of the array. The criterion function is passed each
   * element of the collection.
   * @public
   *
   * @param {ObservableArray.<*>|*[]} collection
   * @param {function(value:*):number} criterion
   * @returns {boolean}
   */
  isSortedBy( collection, criterion ) {
    assert && assert( Array.isArray( collection ) || collection instanceof ObservableArray, `invalid collection: ${collection}` );
    assert && assert( typeof criterion === 'function', `invalid criterion: ${criterion}` );

    // Works for both ObservableArrays and native Arrays.
    return CollisionLabUtils.isSorted( collection.map( criterion ) );
  },

  /**
   * A javascript version of the sleep function. This is **ONLY to be used for debugging**, and assertions must be
   * enabled. This was mostly used to debug CollisionEngine with large time steps.
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