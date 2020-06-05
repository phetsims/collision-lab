// Copyright 2020, University of Colorado Boulder

/**
 * Number Displays for the speed and momentum of a  ball. The Number Display for speed is above the ball
 * whereas the Number Display for momentum is below the ball
 *
 * @author Martin Veillette
 */

import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

// constant
const SPEED_RANGE = new Range( 0, 999 ); // range for the speed to determine size of display box
const MOMENTUM_RANGE = new Range( 0, 999 ); // range for the momentum to determine size of display box

const speedPatternString = collisionLabStrings.speedPattern;
const momentumPatternString = collisionLabStrings.momentumPattern;

class BallLabelsNode extends Node {

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
          {
            align: 'left',
            backgroundLineWidth: 0,
            maxWidth: 150, // determined empirically,
            decimalPlaces: CollisionLabConstants.DISPLAY_DECIMAL_PLACES,
            textOptions: {
              font: CollisionLabConstants.DISPLAY_FONT
            }
          }, options.numberDisplayOptions )
      }, options );

    // create number display for speed, located above the ball
    const speedNumberDisplay = new NumberDisplay( speedProperty, SPEED_RANGE,
      merge( options.numberDisplayOptions, {
        valuePattern: speedPatternString
      } ) );
    speedNumberDisplay.bottom = -options.verticalOffset;
    speedNumberDisplay.centerX = 0;

    // create number display for momentum, located below the ball
    const momentumNumberDisplay = new NumberDisplay( momentumMagnitudeProperty, MOMENTUM_RANGE,
      merge( options.numberDisplayOptions, {
        valuePattern: momentumPatternString
      } ) );
    momentumNumberDisplay.top = options.verticalOffset;
    momentumNumberDisplay.centerX = 0;

    super( options );

    this.addChild( speedNumberDisplay );
    this.addChild( momentumNumberDisplay );

    // visibility listener
    const valuesVisibleHandle = valuesVisibleProperty.linkAttribute( this, 'visible' );

    // @private {function} disposeBallLabelsNode - function to unlink listeners, called in dispose()
    this.disposeBallLabelsNode = () => {
      valuesVisibleProperty.unlinkAttribute( valuesVisibleHandle );
      momentumNumberDisplay.dispose();
      speedNumberDisplay.dispose();
    };

  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeBallLabelsNode();
    super.dispose();
  }
}

collisionLab.register( 'BallLabelsNode', BallLabelsNode );
export default BallLabelsNode;