// Copyright 2020, University of Colorado Boulder

/**
 * Number Displays for the speed and momentum of a Ball. The Number Display for speed is above the ball
 * whereas the Number Display for momentum is below the ball
 *
 * @author Martin Veillette
 */

import merge from '../../../../phet-core/js/merge.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import PlayAreaNumberDisplay from './PlayAreaNumberDisplay.js';

// constant
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
        numberDisplayOptions: {
            maxWidth: 150
          }
      }, options );

    // create number display for speed, located above the ball
    const speedNumberDisplay = new PlayAreaNumberDisplay( speedProperty,
      merge( options.numberDisplayOptions, {
        valuePattern: speedPatternString
      } ) );
    speedNumberDisplay.bottom = -options.verticalOffset;
    speedNumberDisplay.centerX = 0;

    // create number display for momentum, located below the ball
    const momentumNumberDisplay = new PlayAreaNumberDisplay( momentumMagnitudeProperty,
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