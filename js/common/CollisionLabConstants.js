// Copyright 2019-2020, University of Colorado Boulder

/**
 * Constants used in multiple locations within the 'Collision Lab' simulation. All fields are static.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import collisionLab from '../collisionLab.js';
import CollisionLabColors from './CollisionLabColors.js';
import BallState from './model/BallState.js';

// For panel-like containers.
const PANEL_X_MARGIN = 13.5;
const PANEL_Y_MARGIN = 10;
const PANEL_CORNER_RADIUS = 7;

//----------------------------------------------------------------------------------------

const CollisionLabConstants = {

  // Ranges
  MASS_RANGE: new Range( 0.1, 3.0 ),
  VELOCITY_RANGE: new Range( -4, 4 ),
  ELASTICITY_PERCENT_RANGE: new RangeWithValue( 0, 100, 100 ),
  NUMBER_OF_BALLS_RANGE: new RangeWithValue( 1, 5, 2 ),

  // Time
  TIME_STEP_DURATION: 0.03, // Seconds of real time per each press of the Step button.
  NORMAL_SPEED_FACTOR: 1,
  SLOW_SPEED_FACTOR: 0.33,

  // PlayArea
  PLAY_AREA_BOUNDS: new Bounds2( -2, -1, 2, 1 ), // in meters
  MINOR_GRIDLINE_SPACING: 0.1,
  MAJOR_GRIDLINE_SPACING: 0.5,

  // Vectors with magnitudes smaller than this value are treated as effectively zero.
  // See https://github.com/phetsims/collision-lab/issues/51.
  ZERO_THRESHOLD: 1E-10,

  // Balls
  BALL_DEFAULT_DENSITY: 35,   // Uniform Density of Balls if constant-radius is OFF, in kg/m^3.
  BALL_CONSTANT_RADIUS: 0.15, // Radius of Balls if constant-radius is on, in meters.

  INITIAL_BALL_STATES: [
    new BallState( new Vector2( -1.0, 0.00 ), new Vector2( 1.0, 0.3 ), 0.5 ),
    new BallState( new Vector2( 0.0, 0.50 ), new Vector2( -0.5, -0.5 ), 1.5 ),
    new BallState( new Vector2( -1.0, -0.50 ), new Vector2( -0.5, -0.25 ), 1.0 ),
    new BallState( new Vector2( 0.2, -0.65 ), new Vector2( 1.1, 0.2 ), 1.0 ),
    new BallState( new Vector2( -0.8, 0.65 ), new Vector2( -1.1, 0 ), 1.0 )
  ],

  // Momenta Diagram
  MOMENTA_DIAGRAM_ZOOM_RANGE: new RangeWithValue( 0.25, 4, 2 ),
  MOMENTA_DIAGRAM_ASPECT_RATIO: new Dimension2( 14, 11 ),

  //----------------------------------------------------------------------------------------

  // ScreenViews
  SCREEN_VIEW_X_MARGIN: 28,
  SCREEN_VIEW_Y_MARGIN: 10.5,

  // Rounding
  DISPLAY_DECIMAL_PLACES: 2,

  // ArrowNodes
  ARROW_OPTIONS: {
    headWidth: 12,
    headHeight: 13,
    tailWidth: 3.5,
    lineWidth: 1,
    isHeadDynamic: true,
    fractionalHeadHeight: 0.5
  },

  // Checkboxes
  CHECKBOX_OPTIONS: {
    boxWidth: 18,
    spacing: 6
  },

  // Panels
  PANEL_X_MARGIN: PANEL_X_MARGIN,
  PANEL_Y_MARGIN: PANEL_Y_MARGIN,
  PANEL_CORNER_RADIUS: PANEL_CORNER_RADIUS,
  CONTROL_PANEL_CONTENT_WIDTH: 218,

  PANEL_OPTIONS: merge( {
    xMargin: PANEL_X_MARGIN,
    yMargin: PANEL_Y_MARGIN,
    cornerRadius: PANEL_CORNER_RADIUS
  }, CollisionLabColors.PANEL_COLORS ),

  // Fonts
  PANEL_TITLE_FONT: new PhetFont( { size: 15, weight: 600 } ),
  DISPLAY_FONT: new PhetFont( 15.5 ),
  CONTROL_FONT: new PhetFont( 16 ) // default font for controls (buttons, checkboxes, ...)
};

collisionLab.register( 'CollisionLabConstants', CollisionLabConstants );
export default CollisionLabConstants;