// Copyright 2020, University of Colorado Boulder

/**
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HSlider = require( 'SUN/HSlider' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberDisplay = require( 'SCENERY_PHET/NumberDisplay' );
  const Range = require( 'DOT/Range' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const MASS_RANGE = new Range( 0.1, 2 );
  const MOMENTUM_COMPONENT_RANGE = new Range( -10, 10 );
  const POSITION_COMPONENT_RANGE = new Range( -10, 10 );
  const VELOCITY_COMPONENT_RANGE = new Range( -10, 10 );

  class MoreDataBallEntry extends Node {

    /**
     * @param {Ball} ball
     * @param {Property.<boolean>} moreDataVisibleProperty
     * @param {Object} [options]
     */
    constructor( ball, moreDataVisibleProperty, options ) {

      assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
      assert && assert( moreDataVisibleProperty instanceof BooleanProperty, `invalid moreDataVisibleProperty: ${moreDataVisibleProperty}` );

      options = merge( {
        numberDisplayOptions: merge(
          CollisionLabColors.BALL_DISPLAY_COLORS, {
            align: 'right',
            maxWidth: 80, // determined empirically,
            font: CollisionLabConstants.DISPLAY_FONT,
            backgroundStroke: 'black',
            backgroundLineWidth: 1,
            decimalPlaces: CollisionLabConstants.NUMBER_DISPLAY_DECIMAL_PLACES
          } ),
        diskNodeOptions: {
          fill: CollisionLabColors.BALL_COLORS[ ball.index - 1 ],
          center: Vector2.ZERO,
          stroke: 'black'
        },
        labelNodeOptions: {
          font: new PhetFont( 20 ),
          center: Vector2.ZERO,
          stroke: 'black',
          fill: 'white'
        }
      }, options );

      // create and add disk to the scene graph
      const diskNode = new Circle( 10, options.diskNodeOptions );

      // create and add labelNode of the ball
      const labelNode = new Text( ball.index, options.labelNodeOptions );

      // create and add a layer for the disk and label
      const diskLayer = new Node( { children: [diskNode, labelNode] } );


      const massNumberDisplay = new NumberDisplay( ball.massProperty, MASS_RANGE, options.numberDisplayOptions );
      const positionXNumberDisplay = new NumberDisplay( ball.positionXProperty, POSITION_COMPONENT_RANGE, options.numberDisplayOptions );
      const positionYNumberDisplay = new NumberDisplay( ball.positionYProperty, POSITION_COMPONENT_RANGE, options.numberDisplayOptions );
      const velocityXNumberDisplay = new NumberDisplay( ball.velocityXProperty, VELOCITY_COMPONENT_RANGE, options.numberDisplayOptions );
      const velocityYNumberDisplay = new NumberDisplay( ball.velocityYProperty, VELOCITY_COMPONENT_RANGE, options.numberDisplayOptions );
      const momentumXNumberDisplay = new NumberDisplay( ball.momentumXProperty, MOMENTUM_COMPONENT_RANGE, options.numberDisplayOptions );
      const momentumYNumberDisplay = new NumberDisplay( ball.momentumYProperty, MOMENTUM_COMPONENT_RANGE, options.numberDisplayOptions );

      const moreDataBox = new HBox( {
        children: [diskLayer, massNumberDisplay,
          positionXNumberDisplay, positionYNumberDisplay,
          velocityXNumberDisplay, velocityYNumberDisplay,
          momentumXNumberDisplay, momentumYNumberDisplay],
        spacing: 10
      } );

      const massSlider = new HSlider( ball.massProperty, MASS_RANGE );
      const lessDataBox = new HBox( {
        children: [diskLayer, massNumberDisplay, massSlider],
        spacing: 10
      } );

      super();

      this.addChild( moreDataBox );
      this.addChild( lessDataBox );


      // listener present for the lifetime of the simulation
      moreDataVisibleProperty.link( moreData => {
        moreDataBox.visible = !moreData;
        lessDataBox.visible = moreData;
      } );
    }
  }

  return collisionLab.register( 'MoreDataBallEntry', MoreDataBallEntry );
} );