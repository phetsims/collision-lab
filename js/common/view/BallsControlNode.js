// Copyright 2020, University of Colorado Boulder

/**
 * A view specialized to display a control that allows the user to change the number of Balls in the PlayArea system.
 * It is positioned just outside the PlayArea on the top-right side and appears on all of the Screens except for the
 * the 'Intro' screen.
 *
 * BallsControlNodes are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class BallsControlNode extends VBox {

  /**
   * @param {Property.<number>} numberOfBallsProperty - the number of Balls in the PlayArea system.
   * @param {Object} [options]
   */
  constructor( numberOfBallsProperty, options ) {
    assert && assert( numberOfBallsProperty instanceof Property && typeof numberOfBallsProperty.value === 'number', `invalid numberOfBallsProperty: ${numberOfBallsProperty}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${options}` );

    options = merge( {

      // {Object} - passed to the title Text instance.
      titleTextOptions: {
        font: CollisionLabConstants.CONTROL_FONT,
        maxWidth: 40 // constrain width for i18n, determined empirically
      },

      // {Object} - options passed to the NumberSpinner instance
      numberSpinnerOptions: {
        font: new PhetFont( 26 ),
        backgroundMinWidth: 37,
        backgroundLineWidth: 0.5,
        arrowButtonLineWidth: 0.5,
        yMargin: 4
      },

      // {number} - spacing between the title and the NumberSpinner
      spacing: 6

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // Create the title Text of the BallsControlNode.
    const ballsText = new Text( collisionLabStrings.balls, options.titleTextOptions );

    // Create the NumberSpinner of the BallsControlNode to allow the user to change the number of balls.
    const numberOfBallsSpinner = new NumberSpinner( numberOfBallsProperty,
      new Property( CollisionLabConstants.BALLS_RANGE ),
      options.numberSpinnerOptions );

    // Set the children of this Node in the correct rendering order.
    this.children = [
      ballsText,
      numberOfBallsSpinner
    ];
  }
}

collisionLab.register( 'BallsControlNode', BallsControlNode );
export default BallsControlNode;