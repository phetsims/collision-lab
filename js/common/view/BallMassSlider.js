// Copyright 2020, University of Colorado Boulder

/**
 * BallMassSlider is a HSlider sub-type that appears in the BallValuesPanel when 'More Data' is off. It allows the user
 * to laterally manipulate the mass of a Ball. The color of the slider-thumb is based on the color of the Ball.
 *
 * The BallMassSlider should be disposed if the Ball is removed from the PlayArea.
 *
 * @author Brandon Li
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import HSlider from '../../../../sun/js/HSlider.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';

class BallMassSlider extends HSlider {

  /**
   * @param {Ball} ball
   * @param {BallSystem} ballSystem
   * @param {Object} [options]
   */
  constructor( ball, ballSystem, options ) {
    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );

    options = merge( {

      // super-class options
      trackSize: new Dimension2( 180, 0.5 ),
      thumbSize: new Dimension2( 12, 22 ),
      thumbFill: CollisionLabColors.BALL_COLORS[ ball.index - 1 ],
      thumbFillHighlighted: CollisionLabColors.BALL_COLORS[ ball.index - 1 ].colorUtilsBrighter( 0.5 ),
      thumbTouchAreaXDilation: 7,
      thumbTouchAreaYDilation: 1

    }, options );

    //----------------------------------------------------------------------------------------

    assert && assert( !options.startDrag, 'BallMassSlider sets startDrag.' );
    assert && assert( !options.drag, 'BallMassSlider sets drag.' );
    assert && assert( !options.endDrag, 'BallMassSlider sets endDrag.' );

    // Set the massUserControlledProperty of the Ball to true when dragging. See
    // https://github.com/phetsims/collision-lab/issues/76
    options.startDrag = () => { ball.massUserControlledProperty.value = true; };
    options.endDrag = () => {
      ballSystem.bumpBallAwayFromOthers( ball );
      ball.massUserControlledProperty.value = false;
    };

    //----------------------------------------------------------------------------------------

    super( ball.massProperty, CollisionLabConstants.MASS_RANGE, options );
  }
}

collisionLab.register( 'BallMassSlider', BallMassSlider );
export default BallMassSlider;