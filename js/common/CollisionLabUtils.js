// Copyright 2020-2021, University of Colorado Boulder

/**
 * CollisionLabUtils is a collection of general utility functions used in this sim.
 *
 * @author Brandon Li
 */

import stepTimer from '../../../axon/js/stepTimer.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import collisionLab from '../collisionLab.js';
import CollisionLabConstants from './CollisionLabConstants.js';

const CollisionLabUtils = {

  /**
   * Iterates through an array in pairs, passing the current value and the previous value to an iterator function.
   * For instance, forEachAdjacentPair( [ 1, 2, 3, 4 ], f ) would invoke f( 2, 1 ), f( 3, 2 ), and f( 4, 3 ).
   * @public
   *
   * @param {*[]} collection
   * @param {function(value:*,previousValue:*)} iterator
   */
  forEachAdjacentPair( collection, iterator ) {
    assert && assert( Array.isArray( collection ), `invalid collection: ${collection}` );
    assert && assert( typeof iterator === 'function', `invalid iterator: ${iterator}` );

    for ( let i = 1; i < collection.length; i++ ) {
      const value = collection[ i ];
      const previousValue = collection[ i - 1 ];

      iterator( value, previousValue );
    }
  },

  /**
   * Iterates through an array (or an ObservableArrayDef) for all possible pairs, without duplicating calls. For instance,
   * forEachPossiblePair( [ 1, 2, 3 ], f ) would invoke f( 1 , 2 ), f( 1, 3 ), and f( 2, 3 ), in that order.
   * @public
   *
   * @param {*[]} collection
   * @param {function(value1:*,value2:*)} iterator
   */
  forEachPossiblePair( collection, iterator ) {
    assert && assert( Array.isArray( collection ), `invalid collection: ${collection}` );
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
   * @param {Vector2} vector
   * @param {number} multiple - the nearest multiple to round the Bounds in to.
   * @returns {Vector2}
   */
  roundVectorToNearest( vector, multiple ) {
    assert && assert( vector instanceof Vector2, `invalid vector: ${vector}` );
    assert && assert( typeof multiple === 'number', `invalid multiple: ${multiple}` );

    return vector.dividedScalar( multiple ).roundSymmetric().multiply( multiple );
  },

  /**
   * Determines whether an array (or an ObservableArrayDef) is strictly sorted in ascending order (non-inclusive) by a criterion
   * function that numerically ranks each element of the array. Each element is passed into the criterion function.
   * @public
   *
   * @param {number[]} array
   * @param {function(value:*):number} criterion
   * @returns {boolean}
   */
  isSorted( array, criterion ) {
    assert && assert( Array.isArray( array ), `invalid array: ${array}` );
    assert && assert( typeof criterion === 'function', `invalid criterion: ${criterion}` );

    // Flag that indicates if the array is sorted.
    let isSorted = true;

    CollisionLabUtils.forEachAdjacentPair( array.map( criterion ), ( value, previousValue ) => {
      if ( isSorted ) {
        isSorted = ( value > previousValue );
      }
    } );
    return isSorted;
  },

  /**
   * Gets the extrema of an collection of values that are ranked by some criterion function. 'Extrema' are determined by
   * a comparator function.
   * @public
   *
   * @param {Iterable.<*>} iterable - collection of values.
   * @param {function(value:*):number} criterion - function that numerically ranks each value of the iterable.
   * @param {function(base:number, value:number):number} comparator - Returns -1 if base is more 'extreme' than value,
   *                                                                  0 if base is equally as 'extreme' as value, and
   *                                                                  1 if value is more 'extreme' than value.
   * @returns {*[]} - an array of the extrema extracted from the iterable.
   */
  getExtremaOf( iterable, criterion, comparator ) {
    assert && assert( typeof iterable[ Symbol.iterator ] === 'function', `invalid iterable: ${iterable}` );
    assert && assert( typeof criterion === 'function', `invalid criterion: ${criterion}` );
    assert && assert( typeof comparator === 'function', `invalid comparator: ${comparator}` );
    const iterator = iterable[ Symbol.iterator ]();

    let extrema = [ iterator.next().value ];

    for ( const item of iterator ) {
      const comparison = comparator( criterion( extrema[ 0 ] ), criterion( item ) );
      if ( comparison === -1 ) {
        extrema = [ item ];
      }
      else if ( comparison === 0 ) {
        extrema.push( item );
      }
    }

    return extrema;
  },

  /**
   * Gets the minimum value(s) of a collection of values that are ranked by some criterion function. For instance,
   * getMinValuesOf( [ 1, 1, 2, 3, 4, 1 ], _.identity ) returns Set( [ 1, 1, 1 ] ).
   * @public
   *
   * @param {Iterable.<*>} iterable - collection of values
   * @param {function(value:*):number} criterion
   * @returns {*[]} - an array of the minimum value(s).
   */
  getMinValuesOf( iterable, criterion ) {
    assert && assert( typeof iterable[ Symbol.iterator ] === 'function', `invalid iterable: ${iterable}` );
    assert && assert( typeof criterion === 'function', `invalid criterion: ${criterion}` );

    return CollisionLabUtils.getExtremaOf( iterable, criterion, ( base, value ) => Math.sign( value - base ) );
  },

  /**
   * Gets the maximum value(s) of a collection of values that are ranked by some criterion function. For instance,
   * getMaxValuesOf( [ 1, 2, 3, 3, 4, 4 ], _.identity ) returns Set( [ 4, 4 ] ).
   * @public
   *
   * @param {Iterable.<*>} iterable - collection of values
   * @param {function(value:*):number} criterion
   * @returns {*[]} - an array of the maximum value(s).
   */
  getMaxValuesOf( iterable, criterion ) {
    assert && assert( typeof iterable[ Symbol.iterator ] === 'function', `invalid iterable: ${iterable}` );
    assert && assert( typeof criterion === 'function', `invalid criterion: ${criterion}` );

    return CollisionLabUtils.getExtremaOf( iterable, criterion, ( base, value ) => Math.sign( base - value ) );
  },

  /**
   * Checks if a predicate returns truthy for any element of a collection. Like _.some but works for any iterable.
   * Iteration is stopped once predicate returns truthy.
   * @public
   *
   * @param {Iterable.<*>} iterable - collection of values.
   * @param {function(value:*):boolean} predicate
   * @returns {boolean}
   */
  any( iterable, predicate ) {
    assert && assert( typeof iterable[ Symbol.iterator ] === 'function', `invalid iterable: ${iterable}` );
    assert && assert( typeof predicate === 'function', `invalid predicate: ${predicate}` );

    for ( const value of iterable ) {
      if ( predicate( value ) ) {
        return true;
      }
    }
    return false;
  },

  /**
   * Iterates over a collection, returning an array of all the elements that a predicate function returns truthy for.
   * Like _.filter but works for any iterable.
   * @public
   *
   * @param {Iterable.<*>} iterable - collection of values.
   * @param {function(value:*):boolean} predicate
   * @returns {*[]}
   */
  filter( iterable, predicate ) {
    assert && assert( typeof iterable[ Symbol.iterator ] === 'function', `invalid iterable: ${iterable}` );
    assert && assert( typeof predicate === 'function', `invalid predicate: ${predicate}` );
    const result = [];

    for ( const value of iterable ) {
      if ( predicate( value ) ) {
        result.push( value );
      }
    }
    return result;
  },

  /**
   * Finds the root of some function, f, in some interval [min, max], using the bisection method. If maxIterations is
   * reached, the midpoint is returned. See https://en.wikipedia.org/wiki/Bisection_method. This method differs in that
   * the function provided isn't the polynomial itself, but rather indicates if some input is an over or under estimate.
   * @public
   *
   * @param {function(value:*):number} f - Returns -1 if the value input is an underestimate,
   *                                                0 if the value input is considered 'close enough'
   *                                                1 if the value input is an overestimate.
   * @param {number} min - min value of the interval to check.
   * @param {number} max - max value of the interval to check.
   * @param {number} [maxIterations] - the midpoint is returned after this many iterations.
   * @returns {number}
   */
  bisection( f, min, max, maxIterations = 100 ) {
    assert && assert( typeof f === 'function', `invalid f: ${f}` );
    assert && assert( typeof min === 'number', `invalid min: ${min}` );
    assert && assert( typeof max === 'number', `invalid max: ${max}` );
    assert && assert( typeof maxIterations === 'number', `invalid maxIterations: ${maxIterations}` );

    for ( let i = 0; i < maxIterations; i++ ) {

      // Get the new midpoint of the interval.
      const midpoint = ( min + max ) / 2;

      // Get the result of f at the midpoint.
      const result = f( midpoint );

      if ( result === 1 ) {
        max = midpoint;
      }
      else if ( result === 0 ) {
        return midpoint;
      }
      else {
        min = midpoint;
      }
    }

    // At this point, maxIterations was reached, so return the midpoint.
    return ( min + max ) / 2;
  },

  /**
   * Returns the original value if is larger than the passed-in threshold. If it is less than the threshold (in absolute
   * value), than original value is rounded down to 0.
   * @public
   *
   * @param {number} value
   * @param {number} threshold
   * @returns {Promise}
   */
  clampDown( value, threshold = CollisionLabConstants.ZERO_THRESHOLD ) {
    assert && assert( typeof value === 'number', `invalid value: ${value}` );
    assert && assert( typeof threshold === 'number', `invalid threshold: ${threshold}` );

    return Math.abs( value ) < threshold ? 0 : value;
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
      return new Promise( resolve => stepTimer.setTimeout( resolve, time * 1000 ) );
    }
    else {
      throw new Error( 'CollisionLabUtils.sleep must be used with assertions on' );
    }
  }
};

collisionLab.register( 'CollisionLabUtils', CollisionLabUtils );
export default CollisionLabUtils;