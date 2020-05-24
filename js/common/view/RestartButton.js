// Copyright 2020, University of Colorado Boulder

/**
 * A rectangular Reset button. An solution using common-code components was investigated, and it was decided
 * to use the FontAwesomeNode 'undo' character. See https://github.com/phetsims/collision-lab/issues/54
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import merge from '../../../../phet-core/js/merge.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import ColorConstants from '../../../../sun/js/ColorConstants.js';
import FontAwesomeNode from '../../../../sun/js/FontAwesomeNode.js';
import collisionLab from '../../collisionLab.js';

class RestartButton extends RectangularPushButton {

  /**
   * @param {Object} [options]
   * @constructor
   */
  constructor( options ) {

    options = merge( {
      undoScale: 0.5, // {number} - scale applied to the undo FontAwesomeNode

      // super-class
      baseColor: ColorConstants.LIGHT_BLUE,
      lineWidth: 0,
      xMargin: 6.5,
      yMargin: 5.5

    }, options );

    assert && assert( !options.content, 'content is not customizable' );
    options.content = new FontAwesomeNode( 'undo', { scale: options.scale } );

    super( options );
  }
}

collisionLab.register( 'RestartButton', RestartButton );
export default RestartButton;