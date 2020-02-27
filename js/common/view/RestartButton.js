// Copyright 2020, University of Colorado Boulder

/**
 * A rectangular push button, used to restart the playArea of the simulation.
 *
 * @author Martin Veillette
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import merge from '../../../../phet-core/js/merge.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import ColorConstants from '../../../../sun/js/ColorConstants.js';
import collisionLab from '../../collisionLab.js';
import RestartShape from './RestartShape.js';

class RestartButton extends RectangularPushButton {

  /**
   * @param {Object} [options]
   * @constructor
   */
  constructor( options ) {

    options = merge( {
      baseColor: ColorConstants.LIGHT_BLUE,
      arrowColor: 'black',
      lineWidth: 0
    }, options );

    // {Shape} shape of the restart icon
    const restartShape = new RestartShape();

    // restart icon
    const restartIcon = new Path( restartShape, { fill: options.arrowColor } );

    // inverted shape of the restart shape
    const invertedShape = restartShape.transformed( Matrix3.scaling( -1, -1 ) );

    // bounds of the restart icon is union of this icon and invertedShape to ensure
    // that the center of the icon is at the center of the button
    restartIcon.localBounds = restartShape.bounds.union( invertedShape.bounds );

    assert && assert( !options.content, 'content is not customizable' );

    options.content = restartIcon;

    super( options );
  }
}

collisionLab.register( 'RestartButton', RestartButton );
export default RestartButton;