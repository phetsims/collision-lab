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
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import HSlider from '../../../../sun/js/HSlider.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';

// constants
const MASS_RANGE = CollisionLabConstants.MASS_RANGE;
const MOMENTUM_COMPONENT_RANGE = new Range( -10, 10 );
const POSITION_COMPONENT_RANGE = new Range( -10, 10 );
const VELOCITY_COMPONENT_RANGE = new Range( -10, 10 );

class BallValuesEntryNode extends Node {

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
          textOptions: {
            font: CollisionLabConstants.DISPLAY_FONT
          },
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
    const diskLayer = new Node( { children: [ diskNode, labelNode ] } );


    const massNumberDisplay = new NumberDisplay( ball.massProperty, MASS_RANGE, options.numberDisplayOptions );
    const xPositionNumberDisplay = new NumberDisplay( ball.xPositionProperty, POSITION_COMPONENT_RANGE, options.numberDisplayOptions );
    const yPositionNumberDisplay = new NumberDisplay( ball.yPositionProperty, POSITION_COMPONENT_RANGE, options.numberDisplayOptions );
    const xVelocityNumberDisplay = new NumberDisplay( ball.xVelocityProperty, VELOCITY_COMPONENT_RANGE, options.numberDisplayOptions );
    const yVelocityNumberDisplay = new NumberDisplay( ball.yVelocityProperty, VELOCITY_COMPONENT_RANGE, options.numberDisplayOptions );
    const momentumXNumberDisplay = new NumberDisplay( ball.xMomentumProperty, MOMENTUM_COMPONENT_RANGE, options.numberDisplayOptions );
    const momentumYNumberDisplay = new NumberDisplay( ball.yMomentumProperty, MOMENTUM_COMPONENT_RANGE, options.numberDisplayOptions );

    const moreDataBox = new HBox( {
      children: [ diskLayer, massNumberDisplay,
        xPositionNumberDisplay, yPositionNumberDisplay,
        xVelocityNumberDisplay, yVelocityNumberDisplay,
        momentumXNumberDisplay, momentumYNumberDisplay ],
      spacing: 10
    } );

    const massSlider = new HSlider( ball.massProperty, MASS_RANGE );
    const lessDataBox = new HBox( {
      children: [ diskLayer, massNumberDisplay, massSlider ],
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