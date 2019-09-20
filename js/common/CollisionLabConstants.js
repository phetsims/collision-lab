// Copyright 2019, University of Colorado Boulder

/**
 * Constants used in multiple locations within the 'Collision Lab' simulation.
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );

  const CollisionLabConstants = {

    MAX_BALLS: 5,
    BORDER_WIDTH: 3.2, // horizontal length of pool table in meters
    BORDER_HEIGHT_1D: 0.8, // vertical height of pool table in meters
    BORDER_HEIGHT_2D: 1.6, // vertical height of pool table in meters

    VIEW_TO_MODEL_SCALING: 200, // meter to view coordinates (1 m = 200 coordinates)

    ARROW_OPTIONS: {
      headWidth: 11.5,
      headHeight: 8.5,
      tailWidth: 4,
      lineWidth: 0
    },

    //----------------------------------------------------------------------------------------
    // Rounding
    NUMBER_DISPLAY_ROUNDING: 3, // rounding for all number display instances
    MASS_VALUE_ROUNDING: 1, // rounding for the mass 'values' in decimal points

    //----------------------------------------------------------------------------------------
    // Fonts
    PANEL_LABEL_FONT: new PhetFont( 18 ),
    CHECKBOX_FONT: new PhetFont( 16 ),
    TITLE_FONT: new PhetFont( 16 )
  };

  return collisionLab.register( 'CollisionLabConstants', CollisionLabConstants );
} );