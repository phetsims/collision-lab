// Copyright 2020, University of Colorado Boulder

/**
 * CollisionLabUtils is a collection of general utility functions used in this sim.
 *
 * @author Brandon Li
 */

import ObservableArray from '../../../axon/js/ObservableArray.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import isArray from '../../../phet-core/js/isArray.js';
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
    assert && assert( isArray( collection ) || collection instanceof ObservableArray, `invalid collection: ${collection}` );
    assert && assert( typeof iterator === 'function', `invalid iterator: ${iterator}` );

    for ( let i = 1; i < collection.length; i++ ) {
      if ( collection instanceof ObservableArray ) {
        iterator( collection.get( i ), collection.get( i - 1 ) );
      }
      else {
        iterator( collection[ i ], collection[ i - 1 ] );
      }
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
    assert && assert( isArray( collection ) || collection instanceof ObservableArray, `invalid collection: ${collection}` );
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
   * Similar to Bounds2.prototype.roundedIn(), but instead of rounding in to the nearest whole number, it rounds inwards
   * to the nearest of any multiple.
   *
   * For instance, roundedBoundsInToNearest( new Bounds2( -0.28, -0.25, 0.28, 0.25 ), 0.1 )
   * would return new Bounds2( -0.2, -0.2, 0.2, 0.2 ).
   * @public
   *
   * @param {Bounds2} bounds - will not be mutated.
   * @param {number} multiple - the nearest multiple to round the Bounds in
   * @returns {Bounds2}
   */
  roundedBoundsInToNearest( bounds, multiple ) {
    assert && assert( bounds instanceof Bounds2, `invalid bounds: ${bounds}` );
    assert && assert( typeof multiple === 'number', `invalid multiple: ${multiple}` );

    return new Bounds2(
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
  }
};

collisionLab.register( 'CollisionLabUtils', CollisionLabUtils );
export default CollisionLabUtils;