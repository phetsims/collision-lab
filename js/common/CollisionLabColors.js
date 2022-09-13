// Copyright 2019-2022, University of Colorado Boulder

/**
 * Colors for the 'Collision Lab' sim.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import { Color } from '../../../scenery/js/imports.js';
import ColorConstants from '../../../sun/js/ColorConstants.js';
import collisionLab from '../collisionLab.js';

const CollisionLabColors = {

  // General
  SCREEN_BACKGROUND: 'rgb( 244, 250, 255 )',

  // Grids
  GRID_BACKGROUND: 'rgb( 255, 254, 255 )',
  MAJOR_GRIDLINE_COLOR: 'rgb( 212, 212, 212 )',
  MINOR_GRIDLINE_COLOR: 'rgb( 225, 225, 225 )',

  // PlayArea
  TICK_LINE_COLOR: 'rgb( 220, 219, 220 )',
  REFLECTING_PLAY_AREA_BORDER: 'rgb( 41, 41, 128 )',
  NON_REFLECTING_PLAY_AREA_BORDER: Color.BLACK,

  // Buttons
  KEYPAD_ENTER_BUTTON: PhetColorScheme.BUTTON_YELLOW,
  RETURN_BALLS_BUTTON: PhetColorScheme.BUTTON_YELLOW,
  RESTART_BUTTON: ColorConstants.LIGHT_BLUE,

  // Panel-like Containers
  PANEL_STROKE: 'rgb( 190, 190, 190 )',
  PANEL_FILL: 'rgb( 240, 240, 240 )',

  // Balls
  BALL_LEADER_LINES_COLOR: Color.BLACK,
  BALL_STROKE_COLOR: Color.BLACK,
  BALL_COLORS: [
    new Color( 37, 221, 222 ),
    new Color( 255, 37, 173 ),
    new Color( 149, 27, 235 ),
    new Color( 255, 90, 0 ),
    new Color( 247, 248, 16 )
  ],

  // Vector Colors
  VELOCITY_VECTOR_FILL: PhetColorScheme.VELOCITY,
  VELOCITY_VECTOR_STROKE: Color.BLACK,
  MOMENTUM_VECTOR_FILL: PhetColorScheme.MOMENTUM,
  MOMENTUM_VECTOR_STROKE: Color.BLACK,

  // Center of mass
  CENTER_OF_MASS_FILL: new Color( 70, 70, 70 ),
  CENTER_OF_MASS_STROKE: Color.BLACK,

  // Scale Bar
  SCALE_BAR_COLOR: Color.BLACK,

  // Radio Buttons
  RADIO_BUTTON_BASE_COLOR: Color.WHITE,
  RADIO_BUTTON_SELECTED_STROKE: 'rgb( 65, 154, 201 )',
  RADIO_BUTTON_DESELECTED_STROKE: 'rgb( 50, 50, 50 )',

  // Miscellaneous
  CHANGE_IN_MOMENTUM_DASHED_LINE: 'rgb( 182, 181, 182 )',
  HIGHLIGHTED_NUMBER_DISPLAY_FILL: PhetColorScheme.BUTTON_YELLOW,
  TOTAL_MOMENTUM_VECTOR_FILL: Color.BLACK
};

collisionLab.register( 'CollisionLabColors', CollisionLabColors );
export default CollisionLabColors;