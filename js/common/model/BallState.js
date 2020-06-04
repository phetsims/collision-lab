// Copyright 2020, University of Colorado Boulder

/**
 * A mutable state of a Ball that contains information about the mass, position, and velocity of a Ball.
 *
 * Used in the constructor of Balls to save and update their state when the restart button is pressed.
 * IMPORTANT: Restarting is different from resetting:
 *
 *  'Reset All':
 *    - Like a traditional sim, this resets the all model Properties back to the values that they were initialized to.
 *
 *  'Restart':
 *    - Pauses the sim.
 *    - Sets the elapsed time to 0.
 *    - Sets the Balls' position, mass, and velocity to their most recent saved BallState. Their restart BallState
 *      is saved when the sim play button is pressed.
 *    - Only balls currently in the BallSystem are restarted. Only balls in the BallSystem have their state saved.
 *
 * BallStates are given to each Ball, and since Balls are never disposed, BallStates are also never disposed.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';

class BallState {

  /**
   * @param {Vector2} position - position of the center of the ball, in meters.
   * @param {Vector2} velocity - velocity of the center of mass of the ball, in m/s.
   * @param {number} mass - mass of the ball, in kg.
   */
  constructor( position, velocity, mass ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );
    assert && assert( velocity instanceof Vector2, `invalid velocity: ${velocity}` );
    assert && assert( typeof mass === 'number' && mass > 0, `invalid mass: ${mass}` );

    // @public (read-only) {Vector2} - reference to the passed-in position. Make a copy so that we can mutate.
    this.position = position.copy();

    // @public (read-only) {Vector2} - reference to the passed-in velocity. Make a copy so that we can mutate.
    this.velocity = velocity.copy();

    // @public (read-only) {number} - reference to the passed-in mass.
    this.mass = mass;
  }

  /**
   * Saves a new state of the Ball. As documented above, this is called when the user presses the play button (from
   * paused to play). If the restart button is then pressed, the Ball is set to this state.
   * @public
   *
   * @param {Vector2} position - position of the center of the ball, in meters.
   * @param {Vector2} velocity - velocity of the center of mass of the ball, in m/s.
   * @param {number} mass - mass of the ball, in kg.
   */
  saveState( position, velocity, mass ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );
    assert && assert( velocity instanceof Vector2, `invalid velocity: ${velocity}` );
    assert && assert( typeof mass === 'number' && mass > 0, `invalid mass: ${mass}` );

    // Save the new BallState.
    this.position.set( position );
    this.velocity.set( velocity );
    this.mass = mass;
  }

  /**
   * Debugging string for the BallState.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `BallState[ position: ${this.position}, velocity: ${this.velocity}, mass: ${this.mass} ]`;
  }
}

collisionLab.register( 'BallState', BallState );
export default BallState;