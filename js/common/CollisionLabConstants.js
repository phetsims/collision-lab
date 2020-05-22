// Copyright 2019-2020, University of Colorado Boulder

/**
 * Constants used in multiple locations within the 'Collision Lab' simulation.
 *
 * @author Martin Veillette
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Range from '../../../dot/js/Range.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import collisionLab from '../collisionLab.js';
import CollisionLabColors from './CollisionLabColors.js';

// shared constants within this file
const RIGHT_PANEL_WIDTH = 175; // fixed width of panels and accordion boxes on right side of the screen

const CollisionLabConstants = {

  STEP_DURATION: 1 / 30, // seconds, for a single manual time step

  NORMAL_SPEED_SCALE: 1, // 100%
  SLOW_SPEED_SCALE: 0.3, //  30%

  //----------------------------------------------------------------------------------------
  // ScreenView constants
  SCREEN_VIEW_X_MARGIN: 24,
  SCREEN_VIEW_Y_MARGIN: 14,

  MAX_BALLS: 5,
  CONSTANT_RADIUS: 0.15, // radius of balls when constant radius mode is on, in meters.
  MASS_RANGE: new Range( 0.1, 3.0 ),
  VELOCITY_RANGE: new Range( -10, 10 ),
  ELASTICITY_PERCENT_RANGE: new Range( 0, 100 ),


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
    headWidth: 12,
    headHeight: 13,
    tailWidth: 3.5,
    lineWidth: 1
  },

  // vector components or magnitudes smaller than this value are treated as effectively zero
  ZERO_THRESHOLD: 1E-10,

  //----------------------------------------------------------------------------------------
  // Rounding
  NUMBER_DISPLAY_ROUNDING: 3, // rounding for all number display instances
  MASS_VALUE_ROUNDING: 1, // rounding for the mass 'values' in decimal points

  NUMBER_DISPLAY_DECIMAL_PLACES: 2,
  //----------------------------------------------------------------------------------------
  // Fonts
  PANEL_LABEL_FONT: new PhetFont( 18 ),
  CHECKBOX_FONT: new PhetFont( 16 ),
  DISPLAY_FONT: new PhetFont( 16 ),
  PANEL_TITLE_FONT: new PhetFont( { size: 15, weight: 600 } ),
  KEYPAD_FONT: new PhetFont( 15 ),
  CONTROL_FONT: new PhetFont( 16 ),  // default font for controls (buttons, checkboxes, ...)

  //----------------------------------------------------------------------------------------
  // panels
  PANEL_OPTIONS: merge( {
    xMargin: 16,
    yMargin: 12,
    cornerRadius: 7
  }, CollisionLabColors.PANEL_COLORS ),

  // fixed width of each GraphControlPanel
  CONTROL_PANEL_CONTENT_WIDTH: RIGHT_PANEL_WIDTH,
  MOMENTA_DIAGRAM_PANEL_CONTENT_WIDTH: RIGHT_PANEL_WIDTH,

  CHECKBOX_BOX_WIDTH: 18
};

collisionLab.register( 'CollisionLabConstants', CollisionLabConstants );
export default CollisionLabConstants;