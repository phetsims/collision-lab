// Copyright 2019, University of Colorado Boulder

/**
 * Colors for the 'Collision Lab' sim.
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const Color = require( 'SCENERY/util/Color' );

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
    VELOCITY_VECTOR_COLOR: 'rgb( 0, 255, 0 )',
    MOMENTUM_VECTOR_COLOR: 'rgb( 255, 255, 0 )',

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

  return collisionLab.register( 'CollisionLabColors', CollisionLabColors );
} );