// Copyright 2020, University of Colorado Boulder

/**
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
   * @param {number} collisionTime - the amount of time until the collision will occur.
   */
  constructor( ball, collidingObject, collisionTime ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( collidingObject instanceof Ball || collidingObject instanceof PlayArea, `invalid collidingObject: ${collidingObject}` );
    assert && assert( typeof collisionTime === 'number', `invalid collisionTime: ${collisionTime}` );

    // @public {Ball} - reference to the passed-in ball.
    this.ball = ball;

    // @public {Ball|PlayArea} - reference to the passed-in collidingObject.
    this.collidingObject = collidingObject;

    // @public {number} - reference to the passed-in collisionTime.
    this.collisionTime = collisionTime;
  }
}

collisionLab.register( 'Collision', Collision );
export default Collision;