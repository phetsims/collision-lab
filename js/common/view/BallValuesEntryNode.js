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
import Node from '../../../../scenery/js/nodes/Node.js';
import HSlider from '../../../../sun/js/HSlider.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallValuesNumberDisplay from './BallValuesNumberDisplay.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';

class BallValuesEntryNode extends Node {

  /**
   * @param {Ball} ball
   * @param {Property.<boolean>} moreDataVisibleProperty
   * @param {Object} [options]
   */
  constructor( ball, moreDataVisibleProperty, options ) {
    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
    assert && assert( moreDataVisibleProperty instanceof BooleanProperty, `invalid moreDataVisibleProperty: ${moreDataVisibleProperty}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${options}` );

    const ballIcon = CollisionLabIconFactory.createBallIcon( ball );
    const massNumberDisplay = new BallValuesNumberDisplay( ball.massProperty, true );
    const xPositionNumberDisplay = new BallValuesNumberDisplay( ball.xPositionProperty, true );
    const yPositionNumberDisplay = new BallValuesNumberDisplay( ball.yPositionProperty, true );
    const xVelocityNumberDisplay = new BallValuesNumberDisplay( ball.xVelocityProperty, true );
    const yVelocityNumberDisplay = new BallValuesNumberDisplay( ball.yVelocityProperty, true );
    const momentumXNumberDisplay = new BallValuesNumberDisplay( ball.xMomentumProperty, false );
    const momentumYNumberDisplay = new BallValuesNumberDisplay( ball.yMomentumProperty, false );


    const moreDataBox = new HBox( {
      children: [ ballIcon, massNumberDisplay,
        xPositionNumberDisplay, yPositionNumberDisplay,
        xVelocityNumberDisplay, yVelocityNumberDisplay,
        momentumXNumberDisplay, momentumYNumberDisplay ],
      spacing: 10
    } );

    const massSlider = new HSlider( ball.massProperty, CollisionLabConstants.MASS_RANGE );
    const lessDataBox = new HBox( {
      children: [ ballIcon, massNumberDisplay, massSlider ],
      spacing: 10
    } );

    super();

    this.addChild( moreDataBox );
    this.addChild( lessDataBox );


    const moreDataVisibleListener = moreData => {
      moreDataBox.visible = moreData;
      lessDataBox.visible = !moreData;
    };
    moreDataVisibleProperty.link( moreDataVisibleListener );

    // @private {function} disposeBallValuesEntryNode - function to unlink listeners, called in dispose().
    this.disposeBallValuesEntryNode = () => {
      massNumberDisplay.dispose();
      xPositionNumberDisplay.dispose();
      yPositionNumberDisplay.dispose();
      xVelocityNumberDisplay.dispose();
      yVelocityNumberDisplay.dispose();
      momentumXNumberDisplay.dispose();
      momentumYNumberDisplay.dispose();
      moreDataVisibleProperty.unlink( moreDataVisibleListener );
    };
  }

  /**
   * Disposes the BallValuesEntryNode, releasing all links that it maintained.
   * @public
   * @override
   *
   * Called when the Ball is removed from the PlayArea.
   */
  dispose() {
    this.disposeBallValuesEntryNode();
    super.dispose();
  }
}

collisionLab.register( 'BallValuesEntryNode', BallValuesEntryNode );
export default BallValuesEntryNode;