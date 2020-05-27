// Copyright 2019-2020, University of Colorado Boulder

/**
 * Colors for the 'Collision Lab' sim.
 *
 * @author Martin Veillette
 */

import Color from '../../../scenery/js/util/Color.js';
import collisionLab from '../collisionLab.js';

const CollisionLabColors = {

  //----------------------------------------------------------------------------------------
  // General colors
  SCREEN_BACKGROUND: 'rgb( 244, 250, 255 )',

  // PlayArea background color
  PLAY_AREA_BACKGROUND_COLOR: 'rgb( 255, 204, 153 )',

  //----------------------------------------------------------------------------------------
  // Grid colors
  GRID_BACKGROUND_COLOR: 'rgb( 255, 254, 255 )',
  MAJOR_GRID_LINE_COLOR: 'rgb( 212, 212, 212 )',
  MINOR_GRID_LINE_COLOR: 'rgb( 225, 225, 225 )',
  GRID_BORDER_COLOR: 'rgb( 41, 41, 128 )',

  //----------------------------------------------------------------------------------------
  // Ball Colors
  BALL_COLORS: [
    new Color( 255, 0, 0 ),
    new Color( 0, 155, 255 ),
    new Color( 0, 155, 0 ),
    new Color( 255, 0, 255 ),
    new Color( 255, 255, 0 )
  ],

  //----------------------------------------------------------------------------------------
  // Vector Colors
  VELOCITY_VECTOR_COLORS: {
    fill: 'rgb( 0, 255, 0 )',
    stroke: 'black'
  },
  MOMENTUM_VECTOR_COLORS: {
    fill: 'rgb( 255, 255, 0 )',
    stroke: 'black'
  },

  KINETIC_ENERGY_DISPLAY_COLORS: {
    backgroundFill: 'rgb( 255, 255, 255 )',
    opacity: 0.60
  },

  BALL_DISPLAY_COLORS: {
    backgroundFill: 'rgb( 255, 255, 255 )',
    opacity: 0.60
  },

  TIME_DISPLAY_COLORS: {
    backgroundFill: 'white',
    stroke: 'black'
  },

  //----------------------------------------------------------------------------------------
  // X Marker Colors
  X_MARKER_COLORS: {
    stroke: 'black',
    fill: 'rgb( 251, 139, 65 )'
  },

  //----------------------------------------------------------------------------------------
  // Panel-like container default colors
  PANEL_COLORS: {
    stroke: 'rgb( 190, 190, 190 )',
    fill: 'rgb( 240, 240, 240 )'
  },

  KEYPAD_TEXT_COLORS: {
    error: Color.RED,
    default: Color.BLACK
  }
};

collisionLab.register( 'CollisionLabColors', CollisionLabColors );
export default CollisionLabColors;