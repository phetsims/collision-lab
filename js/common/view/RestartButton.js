// Copyright 2016-2019, University of Colorado Boulder

/**
 * A rectangular push button, used to restart the playArea of the simulation.
 *
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const ColorConstants = require( 'SUN/ColorConstants' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const merge = require( 'PHET_CORE/merge' );
  const Path = require( 'SCENERY/nodes/Path' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const RestartShape = require( 'COLLISION_LAB/common/view/RestartShape' );

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

  return collisionLab.register( 'RestartButton', RestartButton );
} );
