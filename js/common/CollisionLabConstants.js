// Copyright 2019, University of Colorado Boulder

/**
 * Constants used in multiple locations within the 'Collision Lab' simulation.
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Range = require( 'DOT/Range' );
  const Vector2 = require( 'DOT/Vector2' );

  const CollisionLabConstants = {

    STEP_DURATION: 1 / 60, // seconds, for a single manual time step

    NORMAL_SPEED_SCALE: 1, // 100%
    SLOW_SPEED_SCALE: 0.3, //  30%

    //----------------------------------------------------------------------------------------
    // ScreenView constants
    SCREEN_VIEW_X_MARGIN: 24,
    SCREEN_VIEW_Y_MARGIN: 14,

    MAX_BALLS: 5,
    DEFAULT_RADIUS: 0.15, // in meters
    MASS_RANGE: new Range( 0.1, 3.0 ),
    VELOCITY_RANGE: new Range( -10, 10 ),

    DEFAULT_BALL_SETTINGS: [
      { mass: 0.5, position: new Vector2( -1.0, 0.00 ), velocity: new Vector2( 1.0, 0.3 ) },
      { mass: 1.5, position: new Vector2( 0.0, 0.50 ), velocity: new Vector2( -0.5, -0.5 ) },
      { mass: 1.0, position: new Vector2( -1.0, -0.50 ), velocity: new Vector2( -0.5, -0.25 ) },
      { mass: 1.0, position: new Vector2( 0.2, -0.65 ), velocity: new Vector2( 1.1, 0.2 ) },
      { mass: 1.0, position: new Vector2( -0.8, 0.65 ), velocity: new Vector2( -1.1, 0 ) }
    ],

    INTRO_DEFAULT_BALL_SETTINGS: [
      { mass: 0.5, position: new Vector2( 1.0, 0.00 ), velocity: new Vector2( 1.0, 0 ) },
      { mass: 1.5, position: new Vector2( 2.0, 0.00 ), velocity: new Vector2( 0, 0 ) }
    ],

    BORDER_WIDTH: 3.2, // horizontal length of pool table in meters
    BORDER_HEIGHT_1D: 0.8, // vertical height of pool table in meters
    BORDER_HEIGHT_2D: 1.6, // vertical height of pool table in meters

    PLAY_AREA_BOUNDS: new Bounds2( -1.6, -0.8, 1.6, 0.8 ),

    MAJOR_GRID_LINE_WIDTH: 2,
    MINOR_GRID_LINE_WIDTH: 1,
    MINOR_GRIDLINE_SPACING: 0.08,
    MINOR_GRIDLINES_PER_MAJOR_GRIDLINE: 5,

    ARROW_OPTIONS: {
      headWidth: 11,
      headHeight: 8,
      tailWidth: 4,
      lineWidth: 1
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