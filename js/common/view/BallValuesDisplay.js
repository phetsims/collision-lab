// Copyright 2019, University of Colorado Boulder

/**
 * Number Displays for the speed and momentum of a  ball. The Number Display for speed is above the ball
 * whereas the Number Display for momentum is below the ball
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberDisplay = require( 'SCENERY_PHET/NumberDisplay' );
  const Range = require( 'DOT/Range' );

  // constant
  const SPEED_RANGE = new Range( 0, 999 ); // range for the speed to determine size of display box
  const MOMENTUM_RANGE = new Range( 0, 999 ); // range for the momentum to determine size of display box

  // strings
  const speedPatternString = require( 'string!COLLISION_LAB/speedPattern' );
  const momentumPatternString = require( 'string!COLLISION_LAB/momentumPattern' );

  class BallValuesDisplay extends Node {

    /**
     * @param {Property.<number>} speedProperty
     * @param {Property.<number>} momentumMagnitudeProperty
     * @param {Property.<boolean>} valuesVisibleProperty
     * @param {Object} [options]
     */
    constructor( speedProperty,
                 momentumMagnitudeProperty,
                 valuesVisibleProperty,
                 options ) {

      options = merge(
        {
          verticalOffset: 10 // vertical offset from center of the ball
        },
        {
          numberDisplayOptions: merge(
            CollisionLabColors.BALL_DISPLAY_COLORS,
            {
              align: 'left',
              backgroundLineWidth: 0,
              maxWidth: 150, // determined empirically,
              font: CollisionLabConstants.DISPLAY_FONT,
              decimalPlaces: CollisionLabConstants.NUMBER_DISPLAY_DECIMAL_PLACES
            }, options.numberDisplayOptions )
        }, options );

      // create number display for speed, located above the ball
      const speedNumberDisplay = new NumberDisplay( speedProperty, SPEED_RANGE,
        merge( options.numberDisplayOptions,
          {
            valuePattern: speedPatternString
          } ) );
      speedNumberDisplay.bottom = -options.verticalOffset;
      speedNumberDisplay.centerX = 0;

      // create number display for momentum, located below the ball
      const momentumNumberDisplay = new NumberDisplay( momentumMagnitudeProperty, MOMENTUM_RANGE,
        merge( options.numberDisplayOptions,
          {
            valuePattern: momentumPatternString
          } ) );
      momentumNumberDisplay.top = options.verticalOffset;
      momentumNumberDisplay.centerX = 0;

      super( options );

      this.addChild( speedNumberDisplay );
      this.addChild( momentumNumberDisplay );

      // visibility listener
      const valuesVisibleHandle = valuesVisibleProperty.linkAttribute( this, 'visible' );

      // @private {function} disposeBallValuesDisplay - function to unlink listeners, called in dispose()
      this.disposeBallValuesDisplay = () => {
        valuesVisibleProperty.unlinkAttribute( valuesVisibleHandle );
      };

    }

    /**
     * @public
     * @override
     */
    dispose() {
      this.disposeBallValuesDisplay();
      super.dispose();
    }
  }

  return collisionLab.register( 'BallValuesDisplay', BallValuesDisplay );
} );