// Copyright 2020, University of Colorado Boulder

/**
 * IntroCollisionEngine is a CollisionEngine sub-type for the 'Intro' screen.
 *
 * For the 'Intro' screen, the 'Change in Momentum' text needs to be positioned above the exact collision point of the 2
 * balls. Thus, IntroCollisionEngine is responsible for computing the exact contact-point of the 2 Balls of the 'Intro'
 * screen. The contact-point is passed to the IntroBallSystem, which will trigger changes in the change in momentum
 * opacity over time. See https://github.com/phetsims/collision-lab/issues/85. See IntroBallSystem.js and
 * CollisionEngine.js for complete background.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';
import Ball from '../../common/model/Ball.js';
import Collision from '../../common/model/Collision.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';

class IntroCollisionEngine extends CollisionEngine {


  /**
   * Adds the functionality of computing the exact point the Balls collided and passing this information to the
   * IntroBallSystem, if the 'Change in Momentum' vectors are visible.
   *
   * @protected
   * @override
   *
   * @param {Collision} collision - the Collision instance.
   * @param {number} dt
   */
  handleCollision( collision, dt ) {
    assert && assert( collision instanceof Collision, `invalid collision: ${collision}` );
    assert && assert( collision.body1 instanceof Ball && collision.body2 instanceof Ball, 'only ball-ball for intro' );

    // Forward collision response to the super-class.
    super.handleCollision( collision, dt );

    // Only register the 'Change in Momentum' contact point if the 'Change in Momentum' checkbox is checked.
    if ( this.ballSystem.changeInMomentumVisibleProperty.value ) {

      // Reference the deltaR vector, which points to the center of body2 when positioned at the center of body2.
      const deltaR = collision.body2.positionProperty.value.minus( collision.body1.positionProperty.value );

      // The deltaR vector points in the direction of body2. So we set the magnitude to the radius of body1 and add it
      // to the center colliding position of body1 to get the collision-point.
      const contactPoint = deltaR.setMagnitude( collision.body1.radiusProperty.value ).add( collision.body1.positionProperty.value );

      // Pass the calculated information to the IntroBallSystem.
      this.ballSystem.registerChangeInMomentumCollision( contactPoint, collision.time );
    }
  }

}

collisionLab.register( 'IntroCollisionEngine', IntroCollisionEngine );
export default IntroCollisionEngine;