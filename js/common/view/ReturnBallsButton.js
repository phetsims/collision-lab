// Copyright 2020-2022, University of Colorado Boulder

/**
 * ReturnBallsButton is RectangularPushButton sub-type that displays 'Return returnBalls'. It appears when the
 * 'Reflecting Border' checkbox is unchecked and all of the Balls in the system have escaped from within the
 * PlayArea's bounds.
 *
 * Pressing the ReturnBallsButton returns the Balls to their most recent saved state. ReturnBallsButtons are created
 * at the start of the sim and are never disposed, so no dispose method is necessary and internal links are left as-is.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import { Text } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class ReturnBallsButton extends RectangularPushButton {

  /**
   * @param {ReadOnlyProperty.<boolean>} ballsNotInsidePlayAreaProperty - indicates if all of the Balls in the system are NOT
   *                                                              inside the PlayArea's bounds.
   * @param {Object} [options]
   */
  constructor( ballsNotInsidePlayAreaProperty, options ) {
    assert && AssertUtils.assertAbstractPropertyOf( ballsNotInsidePlayAreaProperty, 'boolean' );

    options = merge( {

      // {Font} - font for the label Text instance.
      labelFont: CollisionLabConstants.CONTROL_FONT,

      // super-class options
      baseColor: CollisionLabColors.RETURN_BALLS_BUTTON,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5

    }, options );

    //----------------------------------------------------------------------------------------

    assert && assert( !options.content, 'ReturnBallsButton sets content' );
    options.content = new Text( CollisionLabStrings.returnBalls, {
      font: options.labelFont,
      maxWidth: 150 // constrain width for i18n. determined empirically
    } );

    super( options );

    //----------------------------------------------------------------------------------------

    // Observe when the ballsNotInsidePlayAreaProperty changes and update the visibility of this Button, which
    // is only visible once all of the balls have escaped the PlayArea. Listener is never unlinked since
    // ReturnBallsButtons are never disposed.
    ballsNotInsidePlayAreaProperty.linkAttribute( this, 'visible' );
  }
}

collisionLab.register( 'ReturnBallsButton', ReturnBallsButton );
export default ReturnBallsButton;