// Copyright 2019, University of Colorado Boulder

/**
 *  numerical display for time elapsed
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberDisplay = require( 'SCENERY_PHET/NumberDisplay' );
  const Range = require( 'DOT/Range' );

  // constant
  const TIME_RANGE = new Range( 0, 999 ); // range for the time to determine size of display box

  // strings
  const sString = require( 'string!COLLISION_LAB/s' );

  class TimeDisplay extends NumberDisplay {

    /**
     * @param {Property.<number>} timeProperty
     */
    constructor( timeProperty ) {

      super( timeProperty,
        TIME_RANGE,
        merge( CollisionLabColors.TIME_DISPLAY_COLORS, {
          valuePattern: sString,
          maxWidth: 100, // determined empirically,
          font: CollisionLabConstants.CHECKBOX_FONT,
          decimalPlaces: 2
        } ) );

    }
  }

  return collisionLab.register( 'TimeDisplay', TimeDisplay );
} );