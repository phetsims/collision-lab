// Copyright 2019-2020, University of Colorado Boulder

/**
 * Colors for the 'Collision Lab' sim.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Color from '../../../scenery/js/util/Color.js';
import collisionLab from '../collisionLab.js';

const LIGHT_GRAY = 'rgb( 225, 225, 225 )';

const CollisionLabColors = {

  // General
  SCREEN_BACKGROUND: 'rgb( 244, 250, 255 )',



  // PlayArea background
  PLAY_AREA_BACKGROUND_COLOR: 'rgb( 255, 204, 153 )',

  // Grid
  GRID_BACKGROUND_COLOR: 'rgb( 255, 254, 255 )',
  MAJOR_GRIDLINE_COLOR: 'rgb( 212, 212, 212 )',
  MINOR_GRIDLINE_COLOR: LIGHT_GRAY,
  REFLECTING_GRID_BORDER_COLOR: 'rgb( 41, 41, 128 )',
  NON_REFLECTING_GRID_BORDER_COLOR: Color.BLACK,
  TICK_LINE_COLOR: LIGHT_GRAY,


  CHANGE_IN_MOMENTUM_DASHED_LINE_COLOR: 'rgb( 182, 181, 182 )',

  // Panel-like containers
  PANEL_COLORS: {
    stroke: 'rgb( 190, 190, 190 )',
    fill: 'rgb( 240, 240, 240 )'
  },

  // Balls
  BALL_COLORS: [
    new Color( 225, 70, 124 ).setImmutable(),
    new Color( 73, 157, 247 ).setImmutable(),
    new Color( 10, 184, 25 ).setImmutable(),
    new Color( 255, 0, 215 ).setImmutable()
  ],

  // Center of mass
  CENTER_OF_MASS_COLORS: {
    fill: 'rgb( 255, 128, 48 )',
    stroke: 'rgb( 69, 54, 42 )'
  },

  // Leader lines, for when Balls are dragged
  BALL_LEADER_LINES_COLOR: Color.BLACK,


  // Keypad
  KEYPAD_TEXT_COLORS: {
    error: Color.RED,
    default: Color.BLACK
  },


  TOTAL_MOMENTUM_VECTOR_FILL: Color.BLACK,

  // Vector Colors
  VELOCITY_VECTOR_COLORS: {
    fill: 'rgb( 0, 255, 0 )',
    stroke: Color.BLACK
  },
  MOMENTUM_VECTOR_COLORS: {
    fill: 'rgb( 255, 255, 0 )',
    stroke: Color.BLACK
  }
};

collisionLab.register( 'CollisionLabColors', CollisionLabColors );
export default CollisionLabColors;