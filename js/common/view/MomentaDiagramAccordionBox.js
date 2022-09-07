// Copyright 2020-2022, University of Colorado Boulder

/**
 * MomentaDiagramAccordionBox appears on the bottom-right side of all Screens. It's a feature ported from the flash
 * version which displays a graph of the momentum vectors of all the balls that are currently in the system. The
 * AccordionBox is the same size as control panels.
 *
 * The MomentaDiagramAccordionBox displays the following:
 *   - a grid with a zoom-in and zoom-out button to change the scaling.
 *   - momentum vectors of all the balls in the system.
 *   - the total momenta vector of the system.
 *
 * MomentaDiagramAccordionBoxes are created at the start of the sim and are never disposed, so no dispose method is
 * necessary.
 *
 * @author Brandon Li
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import GridNode from '../../../../griddle/js/GridNode.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Color, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import CollisionLabColors from '../CollisionLabColors.js';
import Ball from '../model/Ball.js';
import MomentaDiagram from '../model/MomentaDiagram.js';
import PlayArea from '../model/PlayArea.js';
import MomentaDiagramVectorNode from './MomentaDiagramVectorNode.js';
import MomentaDiagramZoomControlSet from './MomentaDiagramZoomControlSet.js';

// constants
const PANEL_X_MARGIN = CollisionLabConstants.PANEL_X_MARGIN;
const PANEL_Y_MARGIN = CollisionLabConstants.PANEL_Y_MARGIN;
const PANEL_CORNER_RADIUS = CollisionLabConstants.PANEL_CORNER_RADIUS;
const MOMENTA_DIAGRAM_ASPECT_RATIO = CollisionLabConstants.MOMENTA_DIAGRAM_ASPECT_RATIO;

class MomentaDiagramAccordionBox extends AccordionBox {

  /**
   * @param {MomentaDiagram} momentaDiagram - the model for the MomentaDiagramAccordionBox.
   * @param {ObservableArrayDef.<Ball>} balls - the Balls that are in the PlayArea system.
   * @param {Object} [options]
   */
  constructor( momentaDiagram, balls, options ) {
    assert && assert( momentaDiagram instanceof MomentaDiagram, `invalid momentaDiagram: ${momentaDiagram}` );
    assert && assert( Array.isArray( balls ) ) && AssertUtils.assertArrayOf( balls, Ball );

    //----------------------------------------------------------------------------------------

    options = merge( {

      gridLineSpacing: 1,   // {number} - the spacing of the grid lines, in model units (kg * m/s)
      zoomControlMargin: 5, // {number} - the margins between the edge of the Grid and the zoom controls
      dimension: PlayArea.Dimension.TWO, // {number} - the dimension of the screen that the MomentaDiagram appears in.

      // {number} - the width of the content (grid) of the MomentaDiagramAccordionBox.
      contentWidth: CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH,

      // superclass options
      titleNode: new Text( CollisionLabStrings.momentaDiagram, { font: CollisionLabConstants.DISPLAY_FONT } ),
      expandedProperty: momentaDiagram.expandedProperty,
      cornerRadius: PANEL_CORNER_RADIUS,
      contentXMargin: PANEL_X_MARGIN,
      contentYMargin: PANEL_Y_MARGIN,
      buttonXMargin: PANEL_X_MARGIN,
      buttonYMargin: PANEL_Y_MARGIN,
      titleYMargin: PANEL_Y_MARGIN,
      titleXMargin: PANEL_X_MARGIN,
      titleXSpacing: PANEL_X_MARGIN,
      contentYSpacing: 0,
      titleAlignX: 'left',
      expandCollapseButtonOptions: {
        sideLength: 22,
        touchAreaXDilation: 6,
        touchAreaYDilation: 6
      },
      fill: CollisionLabColors.PANEL_FILL,
      stroke: CollisionLabColors.PANEL_STROKE

    }, options );

    // Assign a max width to the title node for i18n.
    options.titleNode.maxWidth = options.contentWidth
                                 - options.expandCollapseButtonOptions.sideLength
                                 - options.titleXSpacing
                                 - options.titleXMargin;


    //----------------------------------------------------------------------------------------

    // Compute the view Bounds of the GridNode.
    const gridViewBounds = new Bounds2( 0, 0,
      options.contentWidth,
      options.contentWidth * MOMENTA_DIAGRAM_ASPECT_RATIO.height / MOMENTA_DIAGRAM_ASPECT_RATIO.width
    );

    // Create a separate modelViewTransform in a Property for mapping MomentaDiagramCoordinates to view coordinates.
    const modelViewTransformProperty = new DerivedProperty( [ momentaDiagram.boundsProperty ], bounds => {
      return ModelViewTransform2.createRectangleInvertedYMapping( bounds, gridViewBounds );
    }, {
      valueType: ModelViewTransform2
    } );

    //----------------------------------------------------------------------------------------

    // Create the Grid. Its spacings and offsets will be adjusted when the modelViewTransformProperty changes. Never
    // disposed since MomentaDiagramAccordionBoxes last for the life-time of the sim.
    const gridNode = new GridNode( gridViewBounds.width, gridViewBounds.height, {
      minorLineOptions: {
        lineWidth: CollisionLabConstants.MINOR_GRIDLINE_WIDTH,
        stroke: CollisionLabColors.MAJOR_GRIDLINE_COLOR
      },
      modelViewTransformProperty: modelViewTransformProperty,
      minorHorizontalLineSpacing: options.gridLineSpacing,
      minorVerticalLineSpacing: options.gridLineSpacing
    } );

    //----------------------------------------------------------------------------------------

    // Create the container for all Momenta Vector Nodes.
    const momentaVectorContainer = new Node();

    // Loop through each possible Ball and its associated momentaVector. These Balls are NOT necessarily the Balls
    // currently within the PlayArea system, so we are responsible for updating its visibility when necessary.
    momentaDiagram.ballToMomentaVectorMap.forEach( ( momentaVector, ball ) => {

      // Create the momenta Vector Node for the momentaVector.
      const momentaVectorNode = new MomentaDiagramVectorNode( momentaVector, ball.index, modelViewTransformProperty, {
        dimension: options.dimension,
        isTotalMomentaVector: false
      } );

      // Add the Vector Node to the container.
      momentaVectorContainer.addChild( momentaVectorNode );

      // Observe when Balls are added or removed from the PlayArea system and adjust the visibility of the momenta
      // Vector, which is only visible if the ball is in the PlayArea system.
      balls.lengthProperty.link( () => {
        momentaVectorNode.visible = balls.includes( ball );
      } );

    } );

    // Create the Momenta Vector Node for the 'total' sum of the momenta Vectors and add it to the container.
    const sumMomentaVectorNode = new MomentaDiagramVectorNode( momentaDiagram.totalMomentumVector,
      CollisionLabStrings.total,
      modelViewTransformProperty, {
        dimension: options.dimension,
        isTotalMomentaVector: true,
        arrowOptions: {
          fill: CollisionLabColors.TOTAL_MOMENTUM_VECTOR_FILL
        },
        textOptions: {
          maxWidth: 50
        }
      } );
    momentaVectorContainer.addChild( sumMomentaVectorNode );

    //----------------------------------------------------------------------------------------

    // Create the Border Rectangle of the Grid.
    const borderNode = new Rectangle( gridViewBounds, {
      stroke: Color.BLACK,
      lineWidth: 2
    } );

    // Create the background behind the Grid.
    const backgroundNode = new Rectangle( gridViewBounds, { fill: CollisionLabColors.GRID_BACKGROUND } );

    // Create the Zoom Controls
    const zoomControlSet = new MomentaDiagramZoomControlSet( momentaDiagram, {
      bottom: gridViewBounds.maxY - options.zoomControlMargin,
      right: gridViewBounds.maxX - options.zoomControlMargin
    } );

    // Create a container of the content of the MomentaDiagramAccordionBox.
    const contentNode = new Node( {
      children: [
        backgroundNode,
        gridNode,
        borderNode,
        momentaVectorContainer,
        zoomControlSet
      ],
      clipArea: Shape.bounds( gridViewBounds )
    } );
    super( contentNode, options );
  }
}

collisionLab.register( 'MomentaDiagramAccordionBox', MomentaDiagramAccordionBox );
export default MomentaDiagramAccordionBox;