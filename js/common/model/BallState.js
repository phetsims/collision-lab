// Copyright 2020, University of Colorado Boulder

/**
 * A multipurpose 'state' of a Ball that contains information about the mass, position, and velocity of a Ball. Doesn't
 * hold onto any listeners or Properties, so no dispose method is needed.
 *
 * ## Usages of BallState
 *
 *   - BallStates are generally used to hold information about the starting values of a Ball. They are used in the
 *     'Inelastic' screen to save several pre-defined states of Balls in different modes.
 *
 *   - Used internally in Ball to save and update a Ball's state when the restart button is pressed.
 *     Restarting is different from resetting:
 *
 *       Reset All:
 *         - Like a traditional sim, this resets all model Properties back to the values that they were initialized to.
 *
 *       Restart:
 *         - Pauses the sim.
 *         - Sets the elapsed time to 0.
 *         - Sets the Balls' position, mass, and velocity to their most recent saved BallState. Their restart BallState
 *           is saved when the sim play button is pressed.
 *         - Only balls currently in the BallSystem are restarted. Only balls in the BallSystem have their states saved.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';

class BallState {

  /**
   * @param {Vector2} position - position of the center of the ball, in meters.
   * @param {Vector2} velocity - velocity of the ball, in m/s.
   * @param {number} mass - mass of the ball, in kg.
   */
  constructor( position, velocity, mass ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );
    assert && assert( velocity instanceof Vector2, `invalid velocity: ${velocity}` );
    assert && assert( typeof mass === 'number' && mass > 0, `invalid mass: ${mass}` );

    // @public (read-only) {Vector2} - reference to the passed-in position.
    this.position = position;

    // @public (read-only) {Vector2} - reference to the passed-in velocity.
    this.velocity = velocity;

    // @public (read-only) {number} - reference to the passed-in mass.
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