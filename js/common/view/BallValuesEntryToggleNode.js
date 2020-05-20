// Copyright 2020, University of Colorado Boulder

/**
 * An 'entry' in the BallValuesPanel: displays a row a values for a Single Ball.
 *
 * Assumes that the Ball is in the PlayArea and displays it's values, which are:
 *    - Mass (kg)
 *    - The position of the Ball (m)
 *    - The velocity of the Ball (m/s)
 *    - The linear momentum of the Ball (kg m/s)
 *
 * If the "More Data" checkbox is not checked, the Node only displays:
 *   - Mass (kg)
 *   - A slider to change the mass
 *
 * Ball values are displayed in a BallValuesNumberDisplay.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import HSlider from '../../../../sun/js/HSlider.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallValuesNumberDisplay from './BallValuesNumberDisplay.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';
import KeypadPlane from './KeypadPlane.js';

class BallValuesEntryToggleNode extends Node {

  /**
   * @param {Ball} ball
   * @param {Property.<boolean>} moreDataVisibleProperty
   * @param {KeypadPlane} keypadPlane
   * @param {Object} [options]
   */
  constructor( ball, moreDataVisibleProperty, keypadPlane, options ) {
    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
    assert && assert( moreDataVisibleProperty instanceof BooleanProperty, `invalid moreDataVisibleProperty: ${moreDataVisibleProperty}` );
    assert && assert( keypadPlane instanceof KeypadPlane, `invalid keypadPlane: ${keypadPlane}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${options}` );

    options = merge( {
      ballIconSpacing: 10,                // {number} - x-spacing between the ball-icon and the first NumberDisplay
      componentNumberDisplaySpacing: 12,  // {number} - x-spacing between the x and y component NumberDisplays
      numberDisplayGroupSpacing: 22,      // {number} - x-spacing between the major groups of NumberDisplays
      massSliderOptions: {
        trackSize: new Dimension2( 180, 0.5 ),
        thumbSize: new Dimension2( 12, 22 ),
        thumbFill: CollisionLabColors.BALL_COLORS[ ball.index - 1 ],
        thumbFillHighlighted: CollisionLabColors.BALL_COLORS[ ball.index - 1 ].colorUtilsBrighter( 0.5 )
      }
    }, options );

    //----------------------------------------------------------------------------------------

    // Create the content of the Entry
    const ballIcon = CollisionLabIconFactory.createBallIcon( ball );

    const massNumberDisplay = new BallValuesNumberDisplay( ball, BallValuesNumberDisplay.BallQuantities.MASS, keypadPlane );
    const xPositionNumberDisplay = new BallValuesNumberDisplay( ball, BallValuesNumberDisplay.BallQuantities.X_POSITION, keypadPlane );
    const yPositionNumberDisplay = new BallValuesNumberDisplay( ball, BallValuesNumberDisplay.BallQuantities.Y_POSITION, keypadPlane );
    const xVelocityNumberDisplay = new BallValuesNumberDisplay( ball, BallValuesNumberDisplay.BallQuantities.X_VELOCITY, keypadPlane );
    const yVelocityNumberDisplay = new BallValuesNumberDisplay( ball, BallValuesNumberDisplay.BallQuantities.Y_VELOCITY, keypadPlane );
    const xMomentumNumberDisplay = new BallValuesNumberDisplay( ball, BallValuesNumberDisplay.BallQuantities.X_MOMENTUM, keypadPlane );
    const yMomentumNumberDisplay = new BallValuesNumberDisplay( ball, BallValuesNumberDisplay.BallQuantities.Y_MOMENTUM, keypadPlane );
    const massSlider = new HSlider( ball.massProperty, CollisionLabConstants.MASS_RANGE, options.massSliderOptions );

    // Group the NumberDisplays by components
    const positionNumberDisplaysBox = new HBox( {
      children: [ xPositionNumberDisplay, yPositionNumberDisplay ],
      spacing: options.componentNumberDisplaySpacing
    } );
    const velocityNumberDisplaysBox = new HBox( {
      children: [ xVelocityNumberDisplay, yVelocityNumberDisplay ],
      spacing: options.componentNumberDisplaySpacing
    } );
    const momentumNumberDisplaysBox = new HBox( {
      children: [ xMomentumNumberDisplay, yMomentumNumberDisplay ],
      spacing: options.componentNumberDisplaySpacing
    } );

    // The content when "More Data" is checked.
    const moreDataBox = new HBox( {
      children: [
        massNumberDisplay,
        positionNumberDisplaysBox,
        velocityNumberDisplaysBox,
        momentumNumberDisplaysBox
      ],
      spacing: options.numberDisplayGroupSpacing,
      left: ballIcon.right + options.ballIconSpacing,
      centerY: ballIcon.centerY
    } );

    // The content when "More Data" is not checked.
    const lessDataBox = new HBox( {
      children: [
        massNumberDisplay,
        massSlider
      ],
      spacing: options.numberDisplayGroupSpacing,
      left: ballIcon.right + options.ballIconSpacing,
      centerY: ballIcon.centerY
    } );

    super( options );

    //----------------------------------------------------------------------------------------

    // Observe when the moreDataVisibleProperty changes and update the children of our Node. We change our children
    // rather than the visibility of our children to change our Bounds, which allows out parent (Panel) to resize.
    // Link is removed below.
    const moreDataVisibleListener = moreDataVisible => {
      this.children = [ ballIcon, moreDataVisible ? moreDataBox : lessDataBox ];
    };
    moreDataVisibleProperty.link( moreDataVisibleListener );

    //----------------------------------------------------------------------------------------

    // @private {function} - function that unlink listeners. This is called in the dispose() method.
    this.disposeBallValuesEntryToggleNode = () => {
      massNumberDisplay.dispose();
      xPositionNumberDisplay.dispose();
      yPositionNumberDisplay.dispose();
      xVelocityNumberDisplay.dispose();
      yVelocityNumberDisplay.dispose();
      xMomentumNumberDisplay.dispose();
      yMomentumNumberDisplay.dispose();
      moreDataVisibleProperty.unlink( moreDataVisibleListener );
    };
  }

  /**
   * Disposes the BallValuesEntryToggleNode, releasing all links that it maintained.
   * @public
   * @override
   *
   * Called when the Ball is removed from the PlayArea.
   */
  dispose() {
    this.disposeBallValuesEntryToggleNode();
    super.dispose();
  }
}

collisionLab.register( 'BallValuesEntryToggleNode', BallValuesEntryToggleNode );
export default BallValuesEntryToggleNode;