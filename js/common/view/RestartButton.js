// Copyright 2016-2019, University of Colorado Boulder

/**
 * A rectangular push  button, typically used to restart something.
 * Drawn programmatically, does not use any image files.
 *
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const ColorConstants = require( 'SUN/ColorConstants' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const merge = require( 'PHET_CORE/merge' );
  const Path = require( 'SCENERY/nodes/Path' );
  const RestartShape = require( 'COLLISION_LAB/common/view/RestartShape' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

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

      // icon, with bounds adjusted so that center of circle appears to be centered on button
      const restartIcon = new Path( new RestartShape(), { fill: options.arrowColor } );

      const reflectedIcon = new Path( restartIcon.shape.transformed( Matrix3.scaling( -1, -1 ) ) );
      restartIcon.localBounds = restartIcon.localBounds.union( reflectedIcon.localBounds );

      assert && assert( !options.content, 'content is not customizable' );

      options.content = restartIcon;

      super( options );
    }
  }

  return collisionLab.register( 'RestartButton', RestartButton );
} );
