// Copyright 2020, University of Colorado Boulder

/**
 * BallMassSlider is a HSlider sub-type that appears in the BallValuesPanel that allows the user to laterally manipulate
 * the mass of a Ball.
 *
 * Also responsible for handling color customization for each Ball.
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
   * @param {Object} [options]
   */
  constructor( ball, options ) {
    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${options}` );

    options = merge( {

      // super-class options
      trackSize: new Dimension2( 180, 0.5 ),
      thumbSize: new Dimension2( 12, 22 ),
      thumbFill: CollisionLabColors.BALL_COLORS[ ball.index - 1 ],
      thumbFillHighlighted: CollisionLabColors.BALL_COLORS[ ball.index - 1 ].colorUtilsBrighter( 0.5 )

    }, options );

    //----------------------------------------------------------------------------------------

    super( ball.massProperty, CollisionLabConstants.MASS_RANGE, options );
  }
}

collisionLab.register( 'BallMassSlider', BallMassSlider );
export default BallMassSlider;