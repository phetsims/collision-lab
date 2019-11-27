// Copyright 2019, University of Colorado Boulder

/**
 * View for the vectors of Balls. See https://github.com/phetsims/collision-lab/issues/24 for
 * an overview of the BallVector view hierarchy.
 *
 * Responsible for:
 *  - Keeping the tail of the ArrowNode at the center of the Ball
 *  - Creating an API to update the direction and magnitude of the ArrowNode
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const BallVectorNode = require( 'COLLISION_LAB/common/view/BallVectorNode' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const merge = require( 'PHET_CORE/merge' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  class BallVelocityVectorNode extends BallVectorNode {

    /**
     * @param {Property.<Vector2>} velocityProperty
     * @param {Property.<boolean>} visibleProperty - Property that indicates if this node is visible
     * @param {Property.<boolean>} playProperty
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options]
     */
    constructor( velocityProperty, visibleProperty, playProperty, modelViewTransform, options ) {

      assert && assert( visibleProperty instanceof BooleanProperty, `invalid visibleProperty: ${visibleProperty}` );
      assert && assert( modelViewTransform instanceof ModelViewTransform2,
        `invalid modelViewTransform: ${modelViewTransform}` );
      assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${options}` );

      //----------------------------------------------------------------------------------------

      options = merge( {

        arrowOptions: {} // TODO
      }, options );

      // create label for the tip of velocity vector
      const tipLabelText = new Text( 'V', {
        font: new PhetFont( 16 ),
        center: Vector2.ZERO,
        fill: 'black'
      } );

      // create circular outline for the tip of velocity vector
      const tipCircle = new Circle( 10, { stroke: 'black' } );

      // create a layer node for the circular outline and tip label
      const tipTargetNode = new Node();
      tipTargetNode.addChild( tipCircle );
      tipTargetNode.addChild( tipLabelText );

      tipTargetNode.moveToBack();

      const tipPositionProperty = new Vector2Property( modelViewTransform.modelToViewDelta( velocityProperty.value ) );

      // add input listener to tip of the velocity vector
      tipTargetNode.addInputListener( new DragListener( {
        locationProperty: tipPositionProperty
      } ) );


      velocityProperty.link( vector => {
        tipTargetNode.center = modelViewTransform.modelToViewDelta( vector );
      } );

      // update the velocity vector upon change of the tip position
      tipPositionProperty.link( velocity => {
        velocityProperty.value = modelViewTransform.viewToModelDelta( velocity );
      } );

      //  make the tip invisible if the simulation is running
      playProperty.link( play => {
        tipTargetNode.visible = !play;
      } );

      super( velocityProperty, visibleProperty, modelViewTransform, options );

      this.addChild( tipTargetNode );
      this.arrowNode.moveToFront();


    }

  }

  return collisionLab.register( 'BallVelocityVectorNode', BallVelocityVectorNode );
} );