// Copyright 2020-2021, University of Colorado Boulder

/**
 * A view specialized to display Controls for the user to change the zoom factor of the 'Momenta Diagram'. For the
 * 'Collision Lab' simulation, it is positioned at the bottom-right corner of the MomentaDiagramAccordionBox and
 * appears on all screens.
 *
 * Consists of two ZoomButtons for zooming in and zooming out. Responsible for disabling any buttons that would
 * exceed the zoom range. ZoomControlSets are also not intended to be disposed.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import ZoomButton from '../../../../scenery-phet/js/buttons/ZoomButton.js';
import { HBox } from '../../../../scenery/js/imports.js';
import ColorConstants from '../../../../sun/js/ColorConstants.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import MomentaDiagram from '../model/MomentaDiagram.js';

class MomentaDiagramZoomControlSet extends HBox {

  /**
   * @param {MomentaDiagram} momentaDiagram - the Momenta Diagram that is being zoomed in or out.
   * @param {Object} [options]
   */
  constructor( momentaDiagram, options ) {
    assert && assert( momentaDiagram instanceof MomentaDiagram, `invalid momentaDiagram: ${momentaDiagram}` );

    options = merge( {

      // {Object} - passed to both ZoomButton instances.
      zoomButtonOptions: {
        baseColor: ColorConstants.LIGHT_BLUE,
        magnifyingGlassOptions: {
          glassRadius: 8
        },
        xMargin: 5,
        yMargin: 3,
        touchAreaXDilation: 3.5,
        touchAreaYDilation: 6
      },

      // superclass options
      spacing: 10

    }, options );

    assert && assert( !options.zoomButtonOptions.in, 'MomentaDiagramZoomControlSet sets zoomButtonOptions.in' );
    assert && assert( !options.listener, 'MomentaDiagramZoomControlSet sets zoomButtonOptions.listener' );
    assert && assert( !options.children, 'MomentaDiagramZoomControlSet sets children' );

    //----------------------------------------------------------------------------------------

    // Create the zoom-out button.
    const zoomOutButton = new ZoomButton( merge( {}, options.zoomButtonOptions, {
      in: false,
      listener: () => { momentaDiagram.zoomOut(); }
    } ) );

    // Create the zoom-in button.
    const zoomInButton = new ZoomButton( merge( {}, options.zoomButtonOptions, {
      in: true,
      listener: () => { momentaDiagram.zoomIn(); }
    } ) );

    // Set the children of this Node in the correct rendering order.
    options.children = [
      zoomOutButton,
      zoomInButton
    ];

    //----------------------------------------------------------------------------------------

    // Observe when the zoom Property changes and disable a button if we reach the min or max. Link lasts for the
    // lifetime of the sim and is never disposed since ZoomControlSets are never disposed.
    momentaDiagram.zoomProperty.link( zoomFactor => {
      zoomOutButton.enabled = zoomFactor > CollisionLabConstants.MOMENTA_DIAGRAM_ZOOM_RANGE.min;
      zoomInButton.enabled = zoomFactor < CollisionLabConstants.MOMENTA_DIAGRAM_ZOOM_RANGE.max;
    } );

    super( options );
  }
}

collisionLab.register( 'MomentaDiagramZoomControlSet', MomentaDiagramZoomControlSet );
export default MomentaDiagramZoomControlSet;