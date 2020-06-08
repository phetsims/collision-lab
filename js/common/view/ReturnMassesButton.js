// Copyright 2020, University of Colorado Boulder

/**
 * ReturnMassesButton is RectangularPushButton sub-type that displays 'Return Masses'. It appears when the
 * 'Reflecting Border' checkbox is unchecked and all of the Balls in the system have escaped from within the
 * PlayArea's bounds.
 *
 * Pressing the ReturnMassesButton returns the Balls to their most recent saved state. ReturnMassesButtons are created
 * at the start of the sim and are never disposed, so no dispose method is necessary and internal links are left as-is.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class ReturnMassesButton extends RectangularPushButton {

  /**
   * @param {Property.<boolean>} ballsNotInsidePlayAreaProperty - indicates if all of the Balls in the system are NOT
   *                                                              inside the PlayArea's bounds.
   * @param {Object} [options]
   */
  constructor( ballsNotInsidePlayAreaProperty, options ) {
    assert && AssertUtils.assertPropertyOf( ballsNotInsidePlayAreaProperty, 'boolean' );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {

      // {Font} - font for the label Text instance.
      labelFont: CollisionLabConstants.CONTROL_FONT,

      // super-class options
      baseColor: PhetColorScheme.BUTTON_YELLOW

    }, options );

    //----------------------------------------------------------------------------------------

    assert && assert( !options.content, 'ReturnMassesButton sets content' );
    options.content = new Text( collisionLabStrings.returnMasses, {
      font: options.labelFont,
      maxWidth: 150 // constrain width for i18n. determined empirically
    } );

    super( options );

    //----------------------------------------------------------------------------------------

    // Observe when the ballsNotInsidePlayAreaProperty changes and update the visibility of this Button, which
    // is only visible once all of the balls have escaped the PlayArea. Listener is never unlinked since
    // ReturnMassesButtons are never disposed.
    ballsNotInsidePlayAreaProperty.linkAttribute( this, 'visible' );
  }
}

collisionLab.register( 'ReturnMassesButton', ReturnMassesButton );
export default ReturnMassesButton;