// Copyright 2019-2020, University of Colorado Boulder

/**
 * BallNode is the view representation of a single spherical Ball, which appears in all screens of the 'Collision Lab'
 * simulation. BallNodes are implemented to work for both 1D and 2D screens, so no sub-types are needed.
 *
 * Primary responsibilities are:
 *  - Creating a Circle that represents the visual Ball object with a label that displays its index.
 *  - Updating the Circle's center location when the Ball's position changes.
 *  - Updating the Circle's radius when the Ball's radius changes.
 *  - Handling drag requests to change the position of the Ball and showing leader-lines.
 *  - Creating and positioning NumberDisplays for the speed and momentum values of the Ball.
 *  - Creating BallVectorNodes to allow the user to see/manipulate the momentum and velocity vectors of the Ball.
 *
 * For the 'Collision Lab' sim, Balls are instantiated at the start and the same Balls are used with the same
 * number of Balls in the system. They are never disposed even if they aren't in the system. Thus, BallNodes
 * persist for the lifetime of the simulation and links are left as-is. See BallSystemNode.js for more background.
 *
 * NOTE: Do not translate this node. It's origin must be at the origin of the view coordinate frame.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallMomentumVectorNode from './BallMomentumVectorNode.js';
import BallVelocityVectorNode from './BallVelocityVectorNode.js';
import LeaderLinesNode from './LeaderLinesNode.js';
import PlayAreaNumberDisplay from './PlayAreaNumberDisplay.js';

// constants
const MASS_RANGE = CollisionLabConstants.MASS_RANGE;
const ELASTICITY_PERCENT_RANGE = CollisionLabConstants.ELASTICITY_PERCENT_RANGE;
const LABEL_FONT = new PhetFont( 20 );
const LINE_WIDTH_RANGE = new Range( 1, 3 );
const VALUE_DISPLAY_MARGIN = 2;

class BallNode extends Node {

  /**
   * @param {Ball} ball - the Ball model
   * @param {Property.<boolean>} valuesVisibleProperty - indicates if the momentum and speed NumberDisplays are visible.
   * @param {Property.<boolean>} velocityVectorVisibleProperty - indicates if the velocity vector is visible.
   * @param {Property.<boolean>} momentumVectorVisibleProperty - indicates if the momentum vector is visible.
   * @param {Property.<boolean>} isConstantSizeProperty - indicates if the Ball's radius is constant size.
   * @param {Property.<boolean>} isPlayingProperty - indicates if simulation is playing or not.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( ball,
               valuesVisibleProperty,
               velocityVectorVisibleProperty,
               momentumVectorVisibleProperty,
               isConstantSizeProperty,
               elasticityPercentProperty,
               isPlayingProperty,
               modelViewTransform,
               options ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && AssertUtils.assertPropertyOf( valuesVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( velocityVectorVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( momentumVectorVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( isConstantSizeProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( isPlayingProperty, 'boolean' );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    super( options );

    // The fill color of the Ball. The color of the Ball is based on its index. If isConstantSizeProperty is true,
    // its brightnessFactor is increased based on the mass to indicate a denser ball (more dense = more saturated).
    // DerivedProperty is never disposed since BallNodes are never disposed.
    const fillProperty = new DerivedProperty( [ ball.massProperty, isConstantSizeProperty ],
      ( mass, isContantSize ) => {
        const brightnessFactor = isContantSize ? Utils.linear( MASS_RANGE.min, MASS_RANGE.max, 0.7, 0, mass ) : 0;
        return CollisionLabColors.BALL_COLORS[ ball.index - 1 ].colorUtilsBrighter( brightnessFactor );
      } );

    //----------------------------------------------------------------------------------------

    // Create the Circle Node that represents the visual aspect of a Ball. Radius and position to be updated later.
    const ballCircle = new Circle( {
      fill: fillProperty,
      stroke: Color.BLACK,
      cursor: 'pointer'
    } );

    // Create the label that displays the index of the Ball. To be positioned later.
    const labelNode = new Text( ball.index, {
      font: LABEL_FONT,
      stroke: Color.BLACK,
      fill: Color.WHITE
    } );

    // Create the Vector Node for the velocity vector of the Ball. To be positioned later.
    const velocityVectorNode = new BallVelocityVectorNode( ball,
      ball.velocityProperty,
      ball.userControlledProperty,
      velocityVectorVisibleProperty,
      isPlayingProperty,
      modelViewTransform );

    // Create the Vector Node for the momentum vector of the Ball. To be positioned later.
    const momentumVectorNode = new BallMomentumVectorNode( ball.momentumProperty,
      momentumVectorVisibleProperty,
      modelViewTransform );

    // Create the number display for the speed of the Ball, which appears above the ball. To be positioned later.
    const speedNumberDisplay = new PlayAreaNumberDisplay( ball.speedProperty, valuesVisibleProperty, {
      valuePattern: collisionLabStrings.speedPattern
    } );

    // Create the number display for the momentum of the Ball, which appears below the ball. To be positioned later.
    const momentumNumberDisplay = new PlayAreaNumberDisplay( ball.momentumMagnitudeProperty, valuesVisibleProperty, {
      valuePattern: collisionLabStrings.momentumPattern
    } );

    // Reference the bounds of the PlayArea in view coordinates.
    const playAreaViewBounds = modelViewTransform.modelToViewBounds( ball.playArea.bounds );

    // Create the 'leader lines', which are displayed when the Ball is being dragged. To be drawn and positioned later.
    const leaderLinesNode = new LeaderLinesNode( playAreaViewBounds );

    //----------------------------------------------------------------------------------------

    // Wrap the BallCircle and the Label in a Node and apply a local ClipArea so that the Ball doesn't appear outside
    // of the PlayArea. This container is not translated so its local Bounds is the same as the parent bounds of the
    // BallCircle and Label. Note that this clip-area doesn't apply to any of the NumberDisplays or VectorNodes.
    const ballCircleAndLabelContainer = new Node( {
      children: [ ballCircle, labelNode ],
      clipArea: Shape.bounds( playAreaViewBounds )
    } );

    // Wrap the Vector Nodes in a container to apply visibility changes for when the Ball is out of the PlayArea.
    const vectorNodeContainer = new Node( { children: [ momentumVectorNode, velocityVectorNode ] } );

    // Set the children of the Ball Node in the correct rendering order.
    this.children = [
      ballCircleAndLabelContainer,
      vectorNodeContainer,
      speedNumberDisplay,
      momentumNumberDisplay,
      leaderLinesNode
    ];

    //----------------------------------------------------------------------------------------

    // Listen to when the when the Ball's radius changes and update the radius of the ballCircle. It was decided
    // to increase the line-width with elasticity; a thicker stroke could indicate a rubbery coating which would be
    // elastic. See https://github.com/phetsims/collision-lab/issues/38. Link persists for the lifetime of the sim.
    Property.multilink( [ ball.radiusProperty, elasticityPercentProperty ], ( radius, elasticity ) => {

      // Update the line-width based on the elasticity using a linear mapping.
      ballCircle.lineWidth = Utils.linear( ELASTICITY_PERCENT_RANGE.min,
        ELASTICITY_PERCENT_RANGE.max,
        LINE_WIDTH_RANGE.min,
        LINE_WIDTH_RANGE.max,
        elasticity );

      // Update the radius of the Ball, subtracting half of the line-width so that the stroke is directed 'inwards'.
      ballCircle.radius = modelViewTransform.modelToViewDeltaX( radius ) - ballCircle.lineWidth / 2;
    } );

    //----------------------------------------------------------------------------------------

    // Add a DragListener to the Ball Circle for translating the Ball. Listener is never removed since BallNodes are
    // never disposed.
    ballCircle.addInputListener( new DragListener( {
      transform: modelViewTransform,
      drag: ( event, listener ) => {
        ball.dragToPosition( listener.modelPoint );

        // Now that the user is dragging the Ball, update the leader-lines.
        leaderLinesNode.reticle = ballCircle.center;
      },

      // Set the userControlledProperty of the ball and the visibility of the leader-lines to true when dragging.
      start: ( event, listener ) => {
        ball.dragToPosition( listener.modelPoint );
        leaderLinesNode.reticle = ballCircle.center;

        leaderLinesNode.visible = true;
        ball.userControlledProperty.value = true;
      },
      end: () => {
        leaderLinesNode.visible = false;
        ball.userControlledProperty.value = false;
      }
    } ) );

    //----------------------------------------------------------------------------------------

    // Observe when the Ball's position changes to update the positioning of the BallCircle and the Vector Nodes.
    // Link persists for the lifetime of the simulation.
    ball.positionProperty.link( position => {
      const viewPosition = modelViewTransform.modelToViewPosition( position );

      // Update the positioning of view components.
      ballCircle.center = viewPosition;
      labelNode.center = viewPosition;
      vectorNodeContainer.translation = viewPosition;

      // Set the VectorNodes container to visible if the Ball's center is inside the PlayArea.
      vectorNodeContainer.visible = playAreaViewBounds.containsPoint( viewPosition );
    } );

    // Observe when either the position of the Ball changes or when the radius of the Ball changes, which changes
    // the positioning of the speed and momentum NumberDisplays. Link persists for the lifetime of the simulation.
    Property.multilink( [ valuesVisibleProperty, ball.positionProperty, ball.radiusProperty ], valuesVisible => {

      if ( valuesVisible ) { // Only update positioning if the NumberDisplays are visible.

        // Update the position of the velocity and momentum NumberDisplays.
        speedNumberDisplay.centerBottom = ballCircle.centerTop.minusXY( 0, VALUE_DISPLAY_MARGIN );
        momentumNumberDisplay.centerTop = ballCircle.centerBottom.addXY( 0, VALUE_DISPLAY_MARGIN );
      }
    } );
  }
}

collisionLab.register( 'BallNode', BallNode );
export default BallNode;