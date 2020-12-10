// Copyright 2020, University of Colorado Boulder

/**
 * Collision subtype for detecting https://github.com/phetsims/collision-lab/issues/184
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';

class Explore1DCollisionEngine extends CollisionEngine {
  /**
   * Finds all balls that share the same velocity AND are adjacent.
   * @private
   *
   * @param {Array.<Ball>} balls
   * @returns {Array.<Ball>}
   */
  findGroupedBalls( balls ) {
    const result = this.ballSystem.balls.filter( ball => {
      return _.some( balls, referenceBall => {
        const positionDifference = Math.abs( ball.positionProperty.value.x - referenceBall.positionProperty.value.x );
        const velocityDifference = Math.abs( ball.velocityProperty.value.x - referenceBall.velocityProperty.value.x );
        const separation = Math.abs( positionDifference - ball.radiusProperty.value - referenceBall.radiusProperty.value );
        return ( ball === referenceBall ) || ( velocityDifference < 1e-10 && separation < 1e-7 );
      } );
    } );

    if ( result.length > balls.length ) {
      return this.findGroupedBalls( result );
    }
    else {
      return result;
    }
  }

  /**
   * Processes and responds to a collision between two balls. Overridden to respond to perfectly inelastic 'stick'
   * collisions between two Balls, in which this method will create and reference a RotatingBallCluster instance.
   * @override
   * @protected
   *
   * @param {Ball} ball1 - the first Ball involved in the collision.
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {number} dt
   */
  handleBallToBallCollision( ball1, ball2, dt ) {
    if ( this.playArea.elasticityPercentProperty.value === 0 ) {

      const balls = this.findGroupedBalls( [ ball1, ball2 ] );

      const totalMomentum = _.sum( balls.map( ball => ball.momentumProperty.value.x ) );
      const totalMass = _.sum( balls.map( ball => ball.massProperty.value ) );

      balls.forEach( ball => {
        ball.velocityProperty.value = new Vector2( totalMomentum / totalMass, 0 );
        this.invalidateCollisions( ball );
      } );
    }
    else {
      super.handleBallToBallCollision( ball1, ball2, dt );
    }
  }

  /**
   * Processes a ball-to-border collision and updates the velocity and the position of the Ball. Overridden to respond
   * to perfectly inelastic 'stick' collisions, in which the Ball's velocity is set to 0.
   * @override
   * @protected
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {number} dt
   */
  handleBallToBorderCollision( ball, dt ) {
    if ( this.playArea.elasticityPercentProperty.value === 0 ) {
      const balls = this.findGroupedBalls( [ ball ] );

      balls.forEach( ball => {
        ball.velocityProperty.value = new Vector2( 0, 0 );
        this.invalidateCollisions( ball );
      } );
    }
    else {
      super.handleBallToBorderCollision( ball, dt );
    }
  }
}

collisionLab.register( 'Explore1DCollisionEngine', Explore1DCollisionEngine );
export default Explore1DCollisionEngine;