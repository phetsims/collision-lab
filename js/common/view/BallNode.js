// Copyright 2019-2022, University of Colorado Boulder

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
import Multilink from '../../../../axon/js/Multilink.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Circle, Color, DragListener, Node, Text } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from '../model/Ball.js';
import BallUtils from '../model/BallUtils.js';
import BallMomentumVectorNode from './BallMomentumVectorNode.js';
import BallVelocityVectorNode from './BallVelocityVectorNode.js';
import LeaderLinesNode from './LeaderLinesNode.js';
import PlayAreaNumberDisplay from './PlayAreaNumberDisplay.js';

// constants
const MASS_RANGE = CollisionLabConstants.MASS_RANGE;
const ELASTICITY_PERCENT_RANGE = CollisionLabConstants.ELASTICITY_PERCENT_RANGE;
const LABEL_FONT = new PhetFont( 20 );
const LINE_WIDTH_RANGE = new Range( 1, 3 );

class BallNode extends Node {

  /**
   * @param {Ball} ball - the Ball model
   * @param {BallSystem} ballSystem
   * @param {Property.<boolean>} valuesVisibleProperty - indicates if the momentum and speed NumberDisplays are visible.
   * @param {Property.<boolean>} velocityVectorVisibleProperty - indicates if the velocity vector is visible.
   * @param {Property.<boolean>} momentumVectorVisibleProperty - indicates if the momentum vector is visible.
   * @param {Property.<number>} elasticityPercentProperty - elasticity of all collisions as a percentage
   * @param {Property.<boolean>} isPlayingProperty - indicates if simulation is playing or not.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( ball,
               ballSystem,
               valuesVisibleProperty,
               velocityVectorVisibleProperty,
               momentumVectorVisibleProperty,
               elasticityPercentProperty,
               isPlayingProperty,
               modelViewTransform,
               options ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && AssertUtils.assertPropertyOf( valuesVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( velocityVectorVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( momentumVectorVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( isPlayingProperty, 'boolean' );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    super( options );

    // The fill color of the Ball. The color of the Ball is based on its index. If isConstantSizeProperty is true,
    // its brightnessFactor is increased based on the mass to indicate a denser ball (more dense = more saturated).
    // DerivedProperty is never disposed since BallNodes are never disposed.
    const fillProperty = new DerivedProperty( [ ball.massProperty, ballSystem.ballsConstantSizeProperty ],
      ( mass, isConstantSize ) => {
        const brightnessFactor = isConstantSize ? Utils.linear( MASS_RANGE.min, MASS_RANGE.max, 0.7, 0, mass ) : 0;
        return CollisionLabColors.BALL_COLORS[ ball.index - 1 ].colorUtilsBrighter( brightnessFactor );
      } );

    //----------------------------------------------------------------------------------------

    // Create the Circle Node that represents the visual aspect of a Ball. Radius and position to be updated later.
    const ballCircle = new Circle( {
      fill: fillProperty,
      stroke: CollisionLabColors.BALL_STROKE_COLOR,
      cursor: 'pointer'
    } );

    // Create the label that displays the index of the Ball. To be positioned later.
    const labelNode = new Text( ball.index, {
      font: LABEL_FONT,
      stroke: Color.BLACK,
      fill: Color.WHITE,
      pickable: false
    } );

    // Create the Vector Node for the velocity vector of the Ball. To be positioned later.
    const velocityVectorNode = new BallVelocityVectorNode( ball,
      ball.playArea.dimension,
      velocityVectorVisibleProperty,
      isPlayingProperty,
      modelViewTransform );

    // Create the Vector Node for the momentum vector of the Ball. To be positioned later.
    const momentumVectorNode = new BallMomentumVectorNode( ball.positionProperty,
      ball.momentumProperty,
      momentumVectorVisibleProperty,
      modelViewTransform );

    // Create the number display for the speed of the Ball, which appears above the ball. To be positioned later.
    const speedNumberDisplay = new PlayAreaNumberDisplay( ball.speedProperty, {
      visibleProperty: valuesVisibleProperty,
      valuePattern: StringUtils.fillIn( CollisionLabStrings.pattern.vectorSymbolEqualsValueSpaceUnits, {
        symbol: CollisionLabStrings.symbol.velocity,
        units: 'm/s'
      } )
    } );

    // Create the number display for the momentum of the Ball, which appears below the ball. To be positioned later.
    const momentumNumberDisplay = new PlayAreaNumberDisplay( ball.momentumMagnitudeProperty, {
      visibleProperty: valuesVisibleProperty,
      valuePattern: StringUtils.fillIn( CollisionLabStrings.pattern.vectorSymbolEqualsValueSpaceUnits, {
        symbol: CollisionLabStrings.symbol.momentum,
        units: 'kg\u00b7m/s'
      } )
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

    // Wrap the components that are only visible when the Ball is inside of the PlayArea.
    const ballInsideVisibleContainer = new Node( {
      children: [
        momentumVectorNode,
        velocityVectorNode,
        speedNumberDisplay,
        momentumNumberDisplay
      ]
    } );

    // Set the children of the Ball Node in the correct rendering order.
    this.children = [
      leaderLinesNode,
      ballCircleAndLabelContainer,
      ballInsideVisibleContainer
    ];

    //----------------------------------------------------------------------------------------

    // Listen to when the when the Ball's radius changes and update the radius of the ballCircle. It was decided
    // to decrease the line-width with elasticity; a thicker stroke could indicate a rubbery coating which would be
    // inelastic. See https://github.com/phetsims/collision-lab/issues/38. Link persists for the lifetime of the sim.
    Multilink.multilink( [ ball.radiusProperty, elasticityPercentProperty ], ( radius, elasticity ) => {

      // Update the line-width based on the elasticity using a linear mapping.
      ballCircle.lineWidth = Utils.linear( ELASTICITY_PERCENT_RANGE.min,
        ELASTICITY_PERCENT_RANGE.max,
        LINE_WIDTH_RANGE.max,
        LINE_WIDTH_RANGE.min,
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
        leaderLinesNode.setReticle( ballCircle.center );
      },

      // Set the positionUserControlledProperty of the ball and the visibility of the leader-lines when dragging.
      start: ( event, listener ) => {
        ball.dragToPosition( listener.modelPoint );
        leaderLinesNode.setReticle( ballCircle.center );

        leaderLinesNode.visible = true;
        ball.xPositionUserControlledProperty.value = true;
        ball.yPositionUserControlledProperty.value = true;
      },
      end: () => {
        leaderLinesNode.visible = false;

        const constrainedBounds = BallUtils.getBallGridSafeConstrainedBounds(
          ball.playArea.bounds,
          ball.radiusProperty.value,
          10 ** -CollisionLabConstants.DISPLAY_DECIMAL_PLACES
        );

        // Round the position to match the displayed value on drag-release. See
        // https://github.com/phetsims/collision-lab/issues/136.
        ball.positionProperty.value = CollisionLabUtils.roundVectorToNearest(
          constrainedBounds.closestPointTo( ball.positionProperty.value ),
          10 ** -CollisionLabConstants.DISPLAY_DECIMAL_PLACES
        );
        // When the user is finished dragging the Ball, bump the Ball away from the other Balls that it is overlapping
        // with. See https://github.com/phetsims/collision-lab/issues/100.
        ballSystem.bumpBallAwayFromOthers( ball );

        ball.xPositionUserControlledProperty.value = false;
        ball.yPositionUserControlledProperty.value = false;
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

      // Set the ballInsideVisibleContainer to visible if the Ball's center is inside the PlayArea.
      ballInsideVisibleContainer.visible = playAreaViewBounds.containsPoint( viewPosition );
    } );

    // Observe when either the position of the Ball changes or when the radius of the Ball changes, which changes
    // the positioning of the speed and momentum NumberDisplays. Link persists for the lifetime of the simulation.
    Multilink.multilink( [ valuesVisibleProperty, ball.positionProperty, ball.radiusProperty ], valuesVisible => {

      if ( valuesVisible ) { // Only update positioning if the NumberDisplays are visible.

        // Update the position of the velocity and momentum NumberDisplays.
        speedNumberDisplay.centerBottom = ballCircle.centerTop.subtractXY( 0, CollisionLabConstants.VALUE_DISPLAY_MARGIN );
        momentumNumberDisplay.centerTop = ballCircle.centerBottom.addXY( 0, CollisionLabConstants.VALUE_DISPLAY_MARGIN );
      }
    } );

    // Observe when the rotationProperty of the Ball changes and rotate the label of the BallNode. The ballCircle
    // doesn't need to be rotated. Link persists for the lifetime of the simulation.
    ball.rotationProperty.link( rotation => {
      labelNode.rotation = -rotation;
      labelNode.center = ballCircle.center;
    } );
  }
}

collisionLab.register( 'BallNode', BallNode );
export default BallNode;