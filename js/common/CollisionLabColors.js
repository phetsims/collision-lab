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
  SCREEN_BACKGROUND: Color.WHITE,

  // PlayArea background color
  PLAY_AREA_BACKGROUND_COLOR: 'rgb( 255, 204, 153 )',

  //----------------------------------------------------------------------------------------
  // Grid colors
  GRID_BACKGROUND_COLOR: 'rgb( 255, 204, 153 )',
  MAJOR_GRID_LINE_COLOR: 'rgb( 212, 212, 212 )',
  MINOR_GRID_LINE_COLOR: 'rgb( 225, 225, 225 )',

  //----------------------------------------------------------------------------------------
  // Ball Colors
  BALL_COLORS: [
    'rgb( 255, 0, 0 )',
    'rgb( 0, 155, 255 )',
    'rgb( 0, 155, 0 )',
    'rgb( 255, 0, 255 )',
    'rgb( 255, 255, 0 )'
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
    backgroundFill: 'rgb( 255, 255, 255 )',
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
  }
};

collisionLab.register( 'CollisionLabColors', CollisionLabColors );
export default CollisionLabColors;