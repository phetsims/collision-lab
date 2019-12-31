// Copyright 2019, University of Colorado Boulder

/**
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const NumberDisplay = require( 'SCENERY_PHET/NumberDisplay' );
  const Range = require( 'DOT/Range' );

  // constants
  const MASS_RANGE = new Range( 0, 100 );
  const VELOCITY_COMPONENT_RANGE = new Range( -10, 10 );
  const POSITION_COMPONENT_RANGE = new Range( -10, 10 );
  const MOMENTUM_COMPONENT_RANGE = new Range( -10, 10 );


  class MoreDataBallEntry extends Node {

    /**
     * @param {Ball} ball
     * @param {Property.<boolean>} moreDataProperty - Property that indicates if the "More Data" checkbox is checked.
     * @param {Object} [options]
     */
    constructor( ball, moreDataProperty, options ) {

      assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
      assert && assert( moreDataProperty instanceof BooleanProperty, `invalid moreDataProperty: ${moreDataProperty}` );

      options = merge( {
        numberDisplayOptions: merge(
          CollisionLabColors.BALL_DISPLAY_COLORS, {
            align: 'left',
            backgroundLineWidth: 0,
            maxWidth: 150, // determined empirically,
            font: CollisionLabConstants.DISPLAY_FONT,
            decimalPlaces: CollisionLabConstants.NUMBER_DISPLAY_DECIMAL_PLACES
          }, options.numberDisplayOptions )
      }, options );


      const positionXProperty = new NumberProperty( ball.positionProperty.value.x );
      const positionYProperty = new NumberProperty( ball.positionProperty.value.y );
      const velocityXProperty = new NumberProperty( ball.velocityProperty.value.x );
      const velocityYProperty = new NumberProperty( ball.velocityProperty.value.y );
      const momentumXProperty = new NumberProperty( ball.momentumProperty.value.x );
      const momentumYProperty = new NumberProperty( ball.momentumProperty.value.y );

      const propertyLinkFunction = ( vectorProperty, xProperty, yProperty ) => {
        const vectorListener = vector => {
          xProperty.value = vector.x;
          yProperty.value = vector.y;
        };
        vectorProperty.link( vectorListener );
      };

      propertyLinkFunction( ball.positionProperty, positionXProperty, positionYProperty );
      propertyLinkFunction( ball.velocityProperty, velocityXProperty, velocityYProperty );
      propertyLinkFunction( ball.momentumProperty, momentumXProperty, momentumYProperty );

      const massNumberDisplay = new NumberDisplay( ball.massProperty, MASS_RANGE, options.numberDisplayOptions );
      const positionXNumberDisplay = new NumberDisplay( positionXProperty, POSITION_COMPONENT_RANGE, options.numberDisplayOptions );
      const positionYNumberDisplay = new NumberDisplay( positionYProperty, POSITION_COMPONENT_RANGE, options.numberDisplayOptions );
      const velocityXNumberDisplay = new NumberDisplay( velocityXProperty, VELOCITY_COMPONENT_RANGE, options.numberDisplayOptions );
      const velocityYNumberDisplay = new NumberDisplay( velocityYProperty, VELOCITY_COMPONENT_RANGE, options.numberDisplayOptions );
      const momentumXNumberDisplay = new NumberDisplay( momentumXProperty, MOMENTUM_COMPONENT_RANGE, options.numberDisplayOptions );
      const momentumYNumberDisplay = new NumberDisplay( momentumYProperty, MOMENTUM_COMPONENT_RANGE, options.numberDisplayOptions );

      const hBox = new HBox( {
        children: [massNumberDisplay, positionXNumberDisplay, positionYNumberDisplay, velocityXNumberDisplay,
          velocityYNumberDisplay, momentumXNumberDisplay, momentumYNumberDisplay],
        spacing: 10
      } );

      super();
      this.addChild( hBox );

    }
  }

  return collisionLab.register( 'MoreDataBallEntry', MoreDataBallEntry );
} );