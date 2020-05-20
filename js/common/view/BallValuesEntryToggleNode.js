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
 * Depending on if the "More Data" checkbox is not checked, the Node only displays:
 *   - Mass (kg)
 *   - A slider to change the mass
 *
 * Ball values are displayed in a BallValuesNumberDisplay.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import BooleanToggleNode from '../../../../sun/js/BooleanToggleNode.js';
import HSlider from '../../../../sun/js/HSlider.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallValuesNumberDisplay from './BallValuesNumberDisplay.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';

// constants
const CONTENT_SPACING = 10;

class BallValuesEntryToggleNode extends BooleanToggleNode {

  /**
   * @param {Ball} ball
   * @param {Property.<boolean>} moreDataVisibleProperty
   */
  constructor( ball, moreDataVisibleProperty ) {
    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
    assert && assert( moreDataVisibleProperty instanceof BooleanProperty, `invalid moreDataVisibleProperty: ${moreDataVisibleProperty}` );

    //----------------------------------------------------------------------------------------

    // Create the content of the Entry
    const ballIcon = CollisionLabIconFactory.createBallIcon( ball );
    const massNumberDisplay = new BallValuesNumberDisplay( ball.massProperty, true );
    const massSlider = new HSlider( ball.massProperty, CollisionLabConstants.MASS_RANGE );
    const xPositionNumberDisplay = new BallValuesNumberDisplay( ball.xPositionProperty, true );
    const yPositionNumberDisplay = new BallValuesNumberDisplay( ball.yPositionProperty, true );
    const xVelocityNumberDisplay = new BallValuesNumberDisplay( ball.xVelocityProperty, true );
    const yVelocityNumberDisplay = new BallValuesNumberDisplay( ball.yVelocityProperty, true );
    const momentumXNumberDisplay = new BallValuesNumberDisplay( ball.xMomentumProperty, false );
    const momentumYNumberDisplay = new BallValuesNumberDisplay( ball.yMomentumProperty, false );

    // The content when "More Data" is checked.
    const moreDataBox = new HBox( {
      children: [
        ballIcon,
        massNumberDisplay,
        xPositionNumberDisplay,
        yPositionNumberDisplay,
        xVelocityNumberDisplay,
        yVelocityNumberDisplay,
        momentumXNumberDisplay,
        momentumYNumberDisplay
      ],
      spacing: CONTENT_SPACING
    } );

    // The content when "More Data" is not checked.
    const lessDataBox = new HBox( {
      children: [
        ballIcon,
        massNumberDisplay,
        massSlider
      ],
      spacing: CONTENT_SPACING
    } );

    super( moreDataBox, lessDataBox, moreDataVisibleProperty, { alignChildren: ToggleNode.LEFT } );

    //----------------------------------------------------------------------------------------

    // @private {function} - function that unlink listeners. This is called in the dispose() method.
    this.disposeBallValuesEntryToggleNode = () => {
      massNumberDisplay.dispose();
      xPositionNumberDisplay.dispose();
      yPositionNumberDisplay.dispose();
      xVelocityNumberDisplay.dispose();
      yVelocityNumberDisplay.dispose();
      momentumXNumberDisplay.dispose();
      momentumYNumberDisplay.dispose();
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