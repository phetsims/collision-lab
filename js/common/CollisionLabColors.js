// Copyright 2019, University of Colorado Boulder

/**
 * Colors for the 'Collision Lab' sim.
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );

  const CollisionLabColors = {

    //----------------------------------------------------------------------------------------
    // Screen colors
    SCREEN_BACKGROUND_COLOR: 'rgb( 255, 250, 227 )',

    // play area background
    PLAY_AREA_BACKGROUND_COLOR: 'rgb(255, 204, 153)',

    // ball Colors
    BALL_COLORS: [
      'rgb( 255, 0, 0 )',
      'rgb( 0, 155, 255 )',
      'rgb( 0, 155, 0 )',
      'rgb( 255, 0, 255 )',
      'rgb( 255, 255, 0 )'
    ],

    //----------------------------------------------------------------------------------------
    // Panel-like container default colors
    COLOR_VELOCITY_ARROW_COLOR: 'rgb( 0, 255, 0 )',
    COLOR_MOMENTUM_ARROW_COLOR: 'rgb( 255, 255, 0 )',

    //----------------------------------------------------------------------------------------
    // Panel-like container default colors
    PANEL_COLORS: {
      stroke: 'rgb( 190, 190, 190 )',
      fill: 'rgb( 240, 240, 240 )'
    },

    //----------------------------------------------------------------------------------------
    // Radio Button Group default colors
    RADIO_BUTTON_COLORS: {
      baseColor: Color.WHITE,
      selectedStroke: 'rgb( 65, 154, 201 )',
      deselectedStroke: 'rgb( 50, 50, 50 )'
    }
  };

  return collisionLab.register( 'CollisionLabColors', CollisionLabColors );
} );