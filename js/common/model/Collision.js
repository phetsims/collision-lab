// Copyright 2020, University of Colorado Boulder

/**
 * An immutable data-structure that contains information about a potential collision, including the two colliding bodies
 * involved in the collision and at what time the collision will occur, if it does at all. Doesn't hold onto any
 * listeners or Properties, so no dispose method is needed.
 *
 * The Collision data-structure is used to encapsulate the necessary information of a potential collision that may
 * happen in the future. CollisionEngine will create Collision instances for every combination of physical bodies
 * upfront, along with an associated "time" of when the collision will occur. If a Collision doesn't have an associated
 * "time", it means that the stored bodies will not collide. These Collision instances are saved to reduce redundant
 * detection checks and are unreferenced once the Collision is handled or when one of the stored bodies is involved in
 * another collision.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';

class Collision {

  /**
   * @param {Object} body1 - the first physical object involved in the collision.
   * @param {Object} body2 - the second physical object involved in the collision.
   * @param {number|null} time - the elapsed time of when the collision will occur. Null indicates that the bodies will
   *                             not collide.
   */
  constructor( body1, body2, time ) {
    assert && assert( body1 instanceof Object, `invalid body1: ${body1}` );
    assert && assert( body1 instanceof Object, `invalid body1: ${body1}` );
    assert && assert( time === null || typeof time === 'number', `invalid time: ${time}` );

    // @public {Object} - reference to the passed-in bodies.
    this.body1 = body1;
    this.body2 = body2;

    // @public {number|null} - reference to the passed-in time.
    this.time = time;
  }

  /**
   * Determines if a passed-in Object is stored as a one of the bodies of this Collision instance.
   * @public
   *
   * @param {Object} body
   * @returns {boolean}
   */
  includes( body ) {
    assert && assert( body instanceof Object, `invalid body: ${body}` );

    return this.body1 === body || this.body2 === body;
  }

  /**
   * Returns a boolean that indicates if the stored 'time' of this Collision will occur in between two given times.
   * The order in which the times are given doesn't matter. For instance, if this.time = 2, occursInRange( 1, 3 ) and
   * occursInRange( 3, 1 ) would return true.
   * @public
   *
   * @param {number} time1
   * @param {number} time2
   * @returns {boolean}
   */
  occursInRange( time1, time2 ) {
    assert && assert( typeof time1 === 'number', `invalid time1: ${time1}` );
    assert && assert( typeof time2 === 'number', `invalid time2: ${time2}` );

    return Number.isFinite( this.time ) && ( time2 >= time1 ) ? ( this.time >= time1 && this.time <= time2 ) :
                                                                ( this.time >= time2 && this.time <= time1 );
  }

  /**
   * Debugging string for the Collision.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `Collision[ body1: ${this.body1}, colliding with body2: ${this.body2}, at ${this.time} s ]`;
  }
}

collisionLab.register( 'Collision', Collision );
export default Collision;