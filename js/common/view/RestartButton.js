// Copyright 2020, University of Colorado Boulder

/**
 * A rectangular Restart button.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import merge from '../../../../phet-core/js/merge.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import ColorConstants from '../../../../sun/js/ColorConstants.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';

class RestartButton extends RectangularPushButton {

  /**
   * @param {Object} [options]
   * @constructor
   */
  constructor( options ) {

    options = merge( {

      // super-class
      baseColor: ColorConstants.LIGHT_BLUE,
      lineWidth: 0,
      xMargin: 6,
      yMargin: 5

    }, options );

    assert && assert( !options.content, 'RestartButton sets content' );
    options.content = CollisionLabIconFactory.createRestartIcon();

    super( options );
  }
}

collisionLab.register( 'RestartButton', RestartButton );
export default RestartButton;