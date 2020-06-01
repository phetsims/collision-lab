// Copyright 2020, University of Colorado Boulder

/**
 * CollisionLabUtils is a collection of utility functions used in this sim.
 *
 * @author Brandon Li
 */

import ObservableArray from '../../../axon/js/ObservableArray.js';
import Property from '../../../axon/js/Property.js';
import isArray from '../../../phet-core/js/isArray.js';
import collisionLab from '../collisionLab.js';

const CollisionLabUtils = {

  /**
   * Iterates through an array, or an ObservableArray, in pairs, passing the current value and the previous value to the
   * iterator function. For instance, pairwise( [ 1, 2, 3, 4 ], $f ) would invoke $f( 2, 1 ), $f( 3, 2 ), $f( 4, 3 ).
   * @public
   *
   * @param {ObservableArray.<*>|*[]} collection
   * @param {function(value:*,previousValue:*)} iterator
   */
  pairwise( collection, iterator ) {
    assert && assert( isArray( collection ) || collection instanceof ObservableArray, `invalid collection: ${collection}` );
    assert && assert( typeof iterator === 'function', `invalid iterator: ${iterator}` );

    // Works for both ObservableArray and Arrays: Use the `reduce` accumulator to store the previous value.
    collection.reduce( ( previous, current ) => {

      iterator( current, previous );
      return current;
    } );
  },

  /**
   * Determines whether an array is strictly sorted in ascending order (non-inclusive).
   * @public
   *
   * @param {number[]} array
   * @returns {boolean}
   */
  isSorted( array ) {
    assert && assert( isArray( array ) && _.every( array, number => isFinite( number ) ), `invalid array: ${ array }` );

    // Flag that indicates if the array is sorted.
    let isSorted = true;

    CollisionLabUtils.pairwise( array, ( value, previousValue ) => {
      if ( isSorted ) {
        isSorted = ( value > previousValue );
      }
    } );
    return isSorted;
  },

  /**
   * Asserts that an object is a Property whose value satisfies a specified predicate. Used for type-checking arguments.
   * @public
   *
   * @param {Property.<*>} object
   * @param {function(value:*):boolean} predicate
   */
  assertPropertyPredicate( object, predicate ) {
    assert( object instanceof Property, `invalid object: ${ object }` );
    assert( predicate( object.value ), 'Property.value failed predicate' );
  },

  /**
   * Asserts that an object is a Property whose value is a specified primitive type. Used for type-checking arguments.
   * @public
   *
   * @param {*} object
   * @param {string} type
   */
  assertPropertyTypeof( object, type ) {
    CollisionLabUtils.assertPropertyPredicate( object, value => typeof value === type );
  },

  /**
   * Asserts that an object is a Property whose value is an instance of a type. Used for type-checking arguments.
   * @public
   *
   * @param {*} object
   * @param {constructor} type
   */
  assertPropertyInstanceof( object, type ) {
    CollisionLabUtils.assertPropertyPredicate( object, value => value instanceof type );
  }
};

collisionLab.register( 'CollisionLabUtils', CollisionLabUtils );
export default CollisionLabUtils;