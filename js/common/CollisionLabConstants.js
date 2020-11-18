// Copyright 2019-2020, University of Colorado Boulder

/**
 * Constants used in multiple locations within the 'Collision Lab' simulation. All fields are static.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import collisionLab from '../collisionLab.js';
import CollisionLabColors from './CollisionLabColors.js';
import CollisionLabQueryParameters from './CollisionLabQueryParameters.js';

// For panel-like containers.
const PANEL_X_MARGIN = 14;
const PANEL_Y_MARGIN = 10;
const PANEL_CORNER_RADIUS = 7;

const CollisionLabConstants = {

  // Ranges
  MASS_RANGE: new Range( 0.1, 3.0 ),
  VELOCITY_RANGE: new Range( -3, 3 ),
  ELASTICITY_PERCENT_RANGE: new Range( 0, 100 ),
  ELASTICITY_PERCENT_INTERVAL: 5,

  // Time
  TIME_STEP_DURATION: CollisionLabQueryParameters.timeStepDuration,
  NORMAL_SPEED_FACTOR: 1,
  SLOW_SPEED_FACTOR: 0.33,

  // PlayArea
  MINOR_GRIDLINE_SPACING: 0.1,
  MAJOR_GRIDLINE_SPACING: 0.5,
  PLAY_AREA_1D_HEIGHT: 1.1,
  PLAY_AREA_VIEW_TOP_1D: 100,

  // Vectors with magnitudes smaller than this value are treated as effectively zero.
  // See https://github.com/phetsims/collision-lab/issues/51.
  ZERO_THRESHOLD: 1E-10,

  // Balls that have a component of their velocity smaller than this value have the component set to 0 m/s.
  MIN_VELOCITY: 1E-3,

  // Balls
  BALL_DEFAULT_DENSITY: 35,   // Uniform Density of Balls if constant-radius is OFF, in kg/m^3.
  BALL_CONSTANT_RADIUS: 0.15, // Radius of Balls if constant-radius is on, in meters.

  // Momenta Diagram
  MOMENTA_DIAGRAM_ASPECT_RATIO: new Dimension2( 7, 5.7 ),
  MOMENTA_DIAGRAM_ZOOM_RANGE: new RangeWithValue( 0.125, 4, 2 ),

  //----------------------------------------------------------------------------------------

  // ScreenViews
  SCREEN_VIEW_X_MARGIN: 15,
  SCREEN_VIEW_Y_MARGIN: 10.5,

  // Rounding
  DISPLAY_DECIMAL_PLACES: 2,

  // Margins
  VALUE_DISPLAY_MARGIN: 2,

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
  PANEL_OPTIONS: {
    xMargin: PANEL_X_MARGIN,
    yMargin: PANEL_Y_MARGIN,
    cornerRadius: PANEL_CORNER_RADIUS,
    fill: CollisionLabColors.PANEL_FILL,
    stroke: CollisionLabColors.PANEL_STROKE
  },

  // Fonts
  PANEL_TITLE_FONT: new PhetFont( { size: 15, weight: 600 } ),
  DISPLAY_FONT: new PhetFont( 15.5 ),
  CONTROL_FONT: new PhetFont( 16 ) // Default font for controls (buttons, checkboxes, ...).
};

collisionLab.register( 'CollisionLabConstants', CollisionLabConstants );
export default CollisionLabConstants;