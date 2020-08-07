// Copyright 2020, University of Colorado Boulder

/**
 * An immutable data-structure that contains information about a potential collision, including the Ball involved in the
 * collision, the object the Ball is colliding with, and at what time the collision will occur. Doesn't hold onto any
 * listeners or Properties, so no dispose method is needed.
 *
 *
 *
 * TODO: update? The Collision data-structure is used to encapsulate the necessary information of a potential collision that may
 * happen in the future. CollisionEngine will detect all potential ball-to-ball and ball-to-border collisions upfront
 * and construct Collision instances, if needed. Then, it uses the data that each Collision holds onto to respond to the
 * next collision and repeats the process until there are no collisions detected within the time-step.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import PlayArea from './PlayArea.js';

class Collision {

  /**
   * @param {Ball} ball - the Ball that is involved in the collision.
   * @param {Ball|PlayArea} collidingObject - the object the Ball is colliding with.
   * @param {number} time - the elapsed time of when the collision will occur.
   */
  constructor( ball, collidingObject, time ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( collidingObject instanceof Ball || collidingObject instanceof PlayArea );
    assert && assert( typeof time === 'number', `invalid time: ${time}` );

    // @public {Ball} - reference to the passed-in ball.
    this.ball = ball;

    // @public {Ball|PlayArea} - reference to the passed-in collidingObject.
    this.collidingObject = collidingObject;

    // @public {number} - reference to the passed-in time.
    this.time = time;
  }

  /**
   * Determines if a passed-in ball is involved in this Collision instance.
   * @public
   *
   * @returns {boolean}
   */
  includes( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    return this.ball === ball || this.collidingObject === ball;
  }

  /**
   * Debugging string for the Collision.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `Collision[ ball: ${this.ball} colliding with: ${this.collidingObject}, at ${this.time} s ]`;
  }
}

collisionLab.register( 'Collision', Collision );
export default Collision;