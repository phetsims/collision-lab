// Copyright 2020, University of Colorado Boulder

/**
 * InelasticCollisionEngine is a CollisionEngine sub-type for the 'Inelastic' screen, which handles all continual
 * ball-to-ball collision responses for perfectly inelastic collisions that 'stick'.
 *
 * Perfectly inelastic collisions that 'stick' are a new feature of the HTML5 version of the simulation, where Balls
 * completely stick together and rotate around the center of mass of the Balls. When a 'sticky' collision between balls
 * occurs, InelasticCollisionEngine will dynamically create a RotatingBallCluster instance. This means that there is a
 * third type of collision that InelasticCollisionEngine deals with - cluster-to-border collisions.
 *
 * Perfectly inelastic collisions that 'slip' behave like the standard rigid-body collision model of CollisionEngine,
 * the super-type. Thus, InelasticCollisionEngine will forward all 'slipping' collisions to the super-class and will
 * only handle responses to 'sticking' collisions.
 *
 * ## Rotation-Collision Response
 *
 *  - When a collision between 2 Balls is detected by CollisionEngine, and the collision is a perfectly inelastic
 *    collisions that 'sticks', the collision response is overridden. The velocity of the center-of-mass of the 2
 *    Balls is the same before and after the collision, so there is no need to compute the center-of-mass velocity.
 *    A RotatingBallCluster instance will be created. Currently, the 'Inelastic' screen only has 2 Balls, so the
 *    RotatingBallCluster represents the entire BallSystem.
 *
 *  - Using the conservation of Angular Momentum (L), the InelasticCollisionEngine derives the angular velocity (omega)
 *    of the rotation of the balls relative to the center of mass. See the following for some general background:
 *      + https://en.wikipedia.org/wiki/Angular_momentum#Discussion
 *      + https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles
 *      + https://en.wikipedia.org/wiki/Angular_velocity
 *
 * ### Cluster-to-border Collision Detection:
 *
 *  - On the first time-step after a RotatingBallCluster instance has been created, InelasticCollisionEngine must detect
 *    when it will collide with the border (if 'Reflecting Border' is on). There is no closed-form solution to finding
 *    when the cluster will collide.
 *
 *  - The lower-bound of when the cluster will collide with the border is when the bounding circle of the cluster
 *    collides with the border. The upper-bound is when the center-of-mass collides with the border.
 *    InelasticCollisionEngine uses the bisection method to approximate when the cluster exactly collides with the
 *    border. See https://en.wikipedia.org/wiki/Bisection_method.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import CollisionLabUtils from '../../common/CollisionLabUtils.js';
import Ball from '../../common/model/Ball.js';
import Collision from '../../common/model/Collision.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';
import InelasticBallSystem from './InelasticBallSystem.js';
import InelasticCollisionType from './InelasticCollisionType.js';
import InelasticPlayArea from './InelasticPlayArea.js';
import RotatingBallCluster from './RotatingBallCluster.js';

class InelasticCollisionEngine extends CollisionEngine {

  /**
   * @param {InelasticPlayArea} playArea
   * @param {InelasticBallSystem} ballSystem
   */
  constructor( playArea, ballSystem ) {
    assert && assert( playArea instanceof InelasticPlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof InelasticBallSystem, `invalid ballSystem: ${ballSystem}` );

    super( playArea, ballSystem );

    //----------------------------------------------------------------------------------------

    // @private {RotatingBallCluster} - indicates if the 2 Balls in the system are currently being rotated (handled) by this class.
    //                      If this is false, the collision response is forwarded to the super-class.
    this.rotatingBallCluster = null;

    // Observe when any of the Balls in the system are being user-controlled or when the InelasticPreset is changed and
    // reset the InelasticCollisionEngine. Multilink persists for the lifetime of the sim since
    // InelasticCollisionEngines are never disposed.
    Property.multilink( [
      ballSystem.inelasticPresetProperty,
      playArea.inelasticCollisionTypeProperty
    ], this.reset.bind( this ) );
  }

  /**
   * Resets the InelasticCollisionEngine to its factory state.
   * @public
   *
   * This is invoked in the following scenarios:
   *   - the reset all button is pressed.
   *   - the restart button is pressed.
   *   - when any of the Balls involved in the rotation is user controlled, either by dragging or from the Keypad.
   *   - when any of the Balls involved in the rotation collides with the border of the PlayArea.
   *   - when the elasticity changes.
   * See https://github.com/phetsims/collision-lab/issues/87.
   */
  reset() {
    this.rotatingBallCluster = null;
    super.reset();
  }

  /**
   * Progresses the Balls forwards by the given time-delta, assuming there are no collisions.
   * @protected - can be overridden in subclasses.
   *
   * @param {number} dt - time-delta, in seconds.
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  progressBalls( dt, elapsedTime ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    // CollisionEngine only deals with uniformly moving Balls, but sub-types might not (for the 'Inelastic' screen).
    if ( this.rotatingBallCluster ) {
      this.rotatingBallCluster.step( dt );
      this.ballSystem.updatePaths( elapsedTime + dt );
    }
    else {
      this.ballSystem.stepUniformMotion( dt, elapsedTime + dt );
    }
  }

  /**
   * Detects all ball-ball and ball-border collisions that have not already been detected.
   * @protected - can be overridden in subclasses.
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectAllCollisions( elapsedTime ) {
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    if ( !this.rotatingBallCluster ) {
      // CollisionEngine only deals with detecting 2 types of collisions, but sub-types might not ('Inelastic' screen).
      this.detectBallToBallCollisions( elapsedTime );
      this.detectBallToBorderCollisions( elapsedTime );
    }
    else {
      this.detectBallClusterToBorderCollision( elapsedTime );
    }
  }

  /**
   * Handles all Collision by calling a response algorithm, dispatched by the type of bodies involved in the Collision.
   * @protected - can be overridden in subclasses.
   *
   * @param {Collision} collision - the Collision instance.
   */
  handleCollision( collision ) {
    assert && assert( collision instanceof Collision, `invalid collision: ${collision}` );

    if ( this.rotatingBallCluster ) {
      // CollisionEngine only deals with detecting 2 types of collisions, but sub-types might not ('Inelastic' screen).
      this.handleBallClusterToBorderCollision( collision );
      return;
    }

    // CollisionEngine only deals with detecting 2 types of collisions, but sub-types might not ('Inelastic' screen).
    collision.includes( this.playArea ) ?
          this.handleBallToBorderCollision( collision.body2 === this.playArea ? collision.body1 : collision.body2 ) :
          this.handleBallToBallCollision( collision.body1, collision.body2, collision.time );
  }

  //----------------------------------------------------------------------------------------

  /**
   * Detects all ball-to-ball collisions of the BallSystem that occur within the passed-in time-step. Overridden to do
   * nothing if the Balls in the 'Inelastic' screen are currently being rotated. Otherwise, the collision-detection
   * algorithms are forwarded to the super-type.
   *
   * @override
   * @protected
   *
   * @param {number} dt - time-delta in seconds
   */
  detectBallToBallCollisions( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    !this.rotatingBallCluster && super.detectBallToBallCollisions( dt );
  }

  /**
   * Computes the angular momentum of a Ball relative to the center-of-mass of the 2 Balls that are being rotated,
   * using the L = r x p formula described in https://en.wikipedia.org/wiki/Angular_momentum#Discussion.
   * The Ball must be one of the two Balls that the InelasticCollisionEngine is handling.
   * @private
   *
   * @param {Ball} ball
   * @returns {number} - in kg*(m^2/s).
   */
  computeAngularMomentum( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    // assert && assert( this.isRotatingBalls );

    // Get the position vector (r) and momentum (p) relative to the center-of-mass
    const r = ball.position.minus( this.ballSystem.centerOfMass.position );
    const p = ball.velocity.minus( this.ballSystem.centerOfMass.velocity ).multiplyScalar( ball.mass );

    // L = r x p (relative to the center-of-mass)
    return r.crossScalar( p );
  }

  /**
   * Processes and responds to a collision between two balls. Overridden to respond to perfectly inelastic 'stick'
   * collisions between two Balls. If the collision isn't a 'sticking' collision, the response is forwarded to the
   * super-class. Otherwise, this method is responsible for computing the total momentum and the angular velocity.
   *
   * @override
   * @protected
   *
   * @param {Ball} ball1 - the first Ball involved in the collision.
   * @param {Ball} ball2 - the second Ball involved in the collision.
   */
  handleBallToBallCollision( ball1, ball2 ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball2: ${ball2}` );
    assert && assert( this.playArea.elasticity === 0, 'must be perfectly inelastic for Inelastic screen' );
    assert && assert( this.ballSystem.balls.length === 2, 'InelasticCollisionEngine only supports collisions of 2 Balls' );

    // Handle collisions that 'stick'.
    if ( this.playArea.inelasticCollisionType === InelasticCollisionType.STICK ) {

      // Get the moment of inertia of both Balls, treated as point masses rotating around their center of mass. The
      // reason why we treat the Balls as point masses is because of the formula L = r^2 * m * omega, where r^2 * m is
      // the moment of inertia of a point-mass. See https://en.wikipedia.org/wiki/Angular_momentum#Discussion.
      const I1 = ball1.position.minus( this.ballSystem.centerOfMass.position ).magnitudeSquared * ball1.mass;
      const I2 = ball2.position.minus( this.ballSystem.centerOfMass.position ).magnitudeSquared * ball2.mass;

      const totalAngularMomentum = this.computeAngularMomentum( ball1 ) + this.computeAngularMomentum( ball2 );

      // Update the angular velocity reference. Formula comes from
      // https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles.
      const angularVelocity = totalAngularMomentum / ( I1 + I2 );

      // Set the isRotatingBalls flag to true.
      this.rotatingBallCluster = new RotatingBallCluster( [ ball1, ball2 ], angularVelocity, this.ballSystem.centerOfMass );

      // Remove all collisions that involves either of the Balls.
      this.collisions.forEach( collision => collision.includesEither( ball1, ball2 ) &&
                                            this.collisions.delete( collision ) );
      // // Update the position of the center of mass of the 2 Balls. This is used as a convenience vector for computations
      // // in the step() method.
      // this.ballSystem.centerOfMass.position.set( this.ballSystem.centerOfMass.position );

      // // Update the angular and linear momentum reference. Values are the same before and after the collision.
      // this.totalLinearMomentum.set( ball1.momentum ).add( ball2.momentum );

    }
    else {

      // Forward the collision-response to the super-class.
      super.handleBallToBallCollision( ball1, ball2 );
    }
  }

  /**
   * Processes a ball-to-border collision and updates the velocity and the position of the Ball. Overridden to respond
   * to perfectly inelastic 'stick' collisions. If the collision isn't a 'sticking' collision, the response is forwarded
   * to the super-class.
   *
   * @override
   * @protected
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {number} dt - time-delta in seconds
   */
  handleBallToBorderCollision( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    if ( this.playArea.inelasticCollisionType === InelasticCollisionType.STICK ) {

      // Set the velocity of the Ball to 0.
      ball.velocity = Vector2.ZERO;

      this.collisions.forEach( collision => collision.includes( ball ) && this.collisions.delete( collision ) );
    }
    else {
      super.handleBallToBorderCollision( ball );
    }
  }

  /*----------------------------------------------------------------------------*
   * Rotating Ball Cluster to Border Collisions
   *----------------------------------------------------------------------------*/
  /**
   * Detects all ball-to-border collisions of the BallSystem that haven't already occurred. Although tunneling doesn't
   * occur with ball-to-border collisions, collisions are still detected before they occur to mirror the approach for
   * ball-to-ball collisions. For newly detected collisions, information is encapsulated in a Collision instance.
   * NOTE: no-op when the PlayArea's border doesn't reflect.
   * @private
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectBallClusterToBorderCollision( elapsedTime ) {
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );
    if ( CollisionLabUtils.any( this.collisions, collision => collision.includes( this.rotatingBallCluster ) ) ) {
      return;
    }
    if ( this.rotatingBallCluster.balls.some( ball => this.playArea.isBallTouchingSide( ball ) ) ) {
      return this.collisions.add( new Collision( this.rotatingBallCluster, this.playArea, elapsedTime ) );
    }

    const maxR = Math.max( ...this.rotatingBallCluster.balls.map( ball => ball.position.distance( this.ballSystem.centerOfMass.position ) + ball.radius ) ) + 1E-4;

    const min = this.getCollisionTime( this.ballSystem.centerOfMass.position, this.ballSystem.centerOfMass.velocity, maxR );
    const max = this.getCollisionTime( this.ballSystem.centerOfMass.position, this.ballSystem.centerOfMass.velocity, 0 );
    const playAreaBounds = this.playArea.bounds.copy();


    const helper = ( min, max ) => {
      const mid = ( min + max ) / 2;
      const orientations = this.rotatingBallCluster.getSteppedRotationStates( mid );
      let overlapping = 0;
      let touching = 0;

      orientations.forEach( ( schema, ball ) => {

          playAreaBounds.set( this.playArea.bounds ).erode( ball.radius );
          if ( Utils.equalsEpsilon( schema.position.x - ball.radius, this.playArea.left, CollisionLabConstants.ZERO_THRESHOLD ) ||
                  Utils.equalsEpsilon( schema.position.x + ball.radius, this.playArea.right, CollisionLabConstants.ZERO_THRESHOLD ) ||
                  Utils.equalsEpsilon( schema.position.y + ball.radius, this.playArea.top, CollisionLabConstants.ZERO_THRESHOLD ) ||
                  Utils.equalsEpsilon( schema.position.y - ball.radius, this.playArea.bottom, CollisionLabConstants.ZERO_THRESHOLD ) ) {

            touching += 1;
          }
          else if ( !playAreaBounds.containsPoint( schema.position ) ) {
            overlapping += 1;
          }
      } );


      if ( overlapping > 0 ) {
          // over
          return helper( min, mid );

      }
      else {
        if ( touching > 0 ) {
          // good enough
          this.collisions.add( new Collision( this.rotatingBallCluster, this.playArea, mid + elapsedTime ) );

        }
        else {
          // under
          return helper( mid, max );
        }
      }
    };
    return helper( min, max );
  }

  // @private
  handleBallClusterToBorderCollision( collision ) {
    this.ballSystem.balls.forEach( ball => {
      ball.velocity = Vector2.ZERO;
    } );

    this.collisions.delete( collision );
    this.rotatingBallCluster = null;
  }
}

collisionLab.register( 'InelasticCollisionEngine', InelasticCollisionEngine );
export default InelasticCollisionEngine;