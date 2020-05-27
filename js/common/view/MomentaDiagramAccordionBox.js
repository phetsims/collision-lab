// Copyright 2020, University of Colorado Boulder

/**
 * MomentaDiagramAccordionBox appears on the bottom-right side of all Screens. Its a feature ported from the flash
 * version which displays a graph of the momentum vectors of all the balls that are currently in the system. The
 * AccordionBox is the same size as control panels.
 *
 * The MomentaDiagramAccordionBox displays the following:
 *   - a grid the contains momentum vectors of all the balls in the system.
 *   - a zoom-in and zoom-out button to change the scaling of the vectors/grid.
 *
 * MomentaDiagramAccordionBoxes are created at the start of the sim and are never disposed, so no dispose method is
 * necessary.
 *
 * @author Brandon Li
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import CollisionLabColors from '../CollisionLabColors.js';

// constants
const PANEL_X_MARGIN = CollisionLabConstants.PANEL_X_MARGIN;
const PANEL_Y_MARGIN = CollisionLabConstants.PANEL_Y_MARGIN;
const PANEL_CORNER_RADIUS = CollisionLabConstants.PANEL_CORNER_RADIUS;

class MomentaDiagramAccordionBox extends AccordionBox {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {}, CollisionLabColors.PANEL_COLORS, {

      contentWidth: CollisionLabConstants.MOMENTA_DIAGRAM_PANEL_CONTENT_WIDTH,

      // super-class options
      titleNode: new Text( collisionLabStrings.momentaDiagram, { font: CollisionLabConstants.CONTROL_FONT } ),
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
      }
    }, options );

    // Assign a max width to the title node for i18n.
    options.titleNode.maxWidth = options.contentWidth
                                 - options.expandCollapseButtonOptions.sideLength
                                 - options.titleXSpacing
                                 - options.titleXMargin;


    super( new Rectangle(  new Bounds2( 0, 0, options.contentWidth, options.contentWidth * 11 / 14 ), { fill: 'white' } ), options );
  }
}


collisionLab.register( 'MomentaDiagramAccordionBox', MomentaDiagramAccordionBox );
export default MomentaDiagramAccordionBox;