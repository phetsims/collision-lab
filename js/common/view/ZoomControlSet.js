// Copyright 2020, University of Colorado Boulder

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
import HBox from '../../../../scenery/js/nodes/HBox.js';
import ColorConstants from '../../../../sun/js/ColorConstants.js';
import collisionLab from '../../collisionLab.js';

class ZoomControlSet extends HBox {

  /**
   * @param {Property.<number>} zoomProperty
   * @param {Range} zoomRange
   * @param {Object} [options]
   */
  constructor( zoomProperty, zoomRange, options ) {

    options = merge( {

      // {Object} - passed to both ZoomButton instances.
      zoomButtonOptions: {
        baseColor: ColorConstants.LIGHT_BLUE,
        disabledBaseColor: ColorConstants.LIGHT_GRAY,
        radius: 8,
        xMargin: 5,
        yMargin: 3,
        touchAreaXDilation: 3.5,
        touchAreaYDilation: 6
      },

      // {number}
      zoomMultiplier: 2,

      // superclass options
      spacing: 10

    }, options );

    assert && assert( !options.zoomButtonOptions.in, 'ZoomControlSet sets zoomButtonOptions.in' );
    assert && assert( !options.listener, 'ZoomControlSet sets zoomButtonOptions.listener' );
    assert && assert( !options.children, 'ZoomControlSet sets children' );

    //----------------------------------------------------------------------------------------

    // Create the zoom-out button.
    const zoomOutButton = new ZoomButton( merge( {}, options.zoomButtonOptions, {
      in: false,
      listener: () => { zoomProperty.value /= 2; }
    } ) );

    // Create the zoom-in button.
    const zoomInButton = new ZoomButton( merge( {}, options.zoomButtonOptions, {
      in: true,
      listener: () => { zoomProperty.value *= 2; }
    } ) );

    // Set the children of this Node in the correct rendering order.
    options.children = [
      zoomOutButton,
      zoomInButton
    ];

    //----------------------------------------------------------------------------------------

    // Observe when the zoom Property changes and disable a button if we reach the min or max. Link lasts for the
    // lifetime of the sim and is never disposed since ZoomControlSets are never disposed.
    zoomProperty.link( zoomFactor => {
      zoomOutButton.enabled = zoomFactor > zoomRange.min;
      zoomInButton.enabled = zoomFactor < zoomRange.max;
    } );

    super( options );
  }
}

collisionLab.register( 'ZoomControlSet', ZoomControlSet );
export default ZoomControlSet;