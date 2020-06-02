// Copyright 2020, University of Colorado Boulder

/**
 * CollisionLabUtils is a collection of general utility functions used in this sim.
 *
 * @author Brandon Li
 */

import ObservableArray from '../../../axon/js/ObservableArray.js';
import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import isArray from '../../../phet-core/js/isArray.js';
import collisionLab from '../collisionLab.js';

const CollisionLabUtils = {

  /**
   * Iterates through an array, or an ObservableArray, in pairs, passing the current value and the previous value to the
   * iterator function. For instance, forEachPair( [ 1, 2, 3, 4 ], $f ) would invoke $f( 2, 1 ), $f( 3, 2 ), $f( 4, 3 ).
   * @public
   *
   * @param {ObservableArray.<*>|*[]} collection
   * @param {function(value:*,previousValue:*)} iterator
   */
  forEachPair( collection, iterator ) {
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
   * Similar to Bounds2.prototype.roundedIn(), but instead of rounding in to the nearest whole number, it rounds in
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
    assert && assert( isArray( array ) && _.every( array, number => isFinite( number ) ), `invalid array: ${ array }` );

    // Flag that indicates if the array is sorted.
    let isSorted = true;

    CollisionLabUtils.forEachPair( array, ( value, previousValue ) => {
      if ( isSorted ) {
        isSorted = ( value > previousValue );
      }
    } );
    return isSorted;
  },

  /*----------------------------------------------------------------------------*
   * Type Validation Utilities
   *----------------------------------------------------------------------------*/

  /**
   * Indicates if every element of a array, or an ObservableArray, is of a given type. Used for type-checking arguments.
   * @public
   *
   * @param {ObservableArray.<*>|*[]} collection
   * @param {constructor} type
   * @returns {boolean}
   */
  consistsOf( collection, type ) {
    assert && assert( isArray( collection ) || collection instanceof ObservableArray, `invalid collection: ${collection}` );
    return !collection.some( value => !( value instanceof type ) );
  },

  /**
   * Asserts that an object is a Property whose value satisfies a specified predicate. Used for type-checking arguments.
   * @public
   *
   * @param {Property.<*>} genericProperty
   * @param {function(value:*):boolean} predicate
   */
  assertPropertyPredicate( genericProperty, predicate ) {
    assert( genericProperty instanceof Property, `invalid Property: ${ genericProperty }` );
    assert( predicate( genericProperty.value ), `invalid Property.value: ${ genericProperty.value }` );
  },

  /**
   * Asserts that an object is a Property whose value is a specified primitive type. Used for type-checking arguments.
   * @public
   *
   * @param {Property.<*>} genericProperty
   * @param {string} type
   */
  assertPropertyTypeof( genericProperty, type ) {
    CollisionLabUtils.assertPropertyPredicate( genericProperty, value => typeof value === type );
  },

  /**
   * Asserts that an object is a Property whose value is an instance of a type. Used for type-checking arguments.
   * @public
   *
   * @param {Property.<*>} genericProperty
   * @param {constructor} type
   */
  assertPropertyInstanceof( genericProperty, type ) {
    CollisionLabUtils.assertPropertyPredicate( genericProperty, value => value instanceof type );
  }
};

collisionLab.register( 'CollisionLabUtils', CollisionLabUtils );
export default CollisionLabUtils;