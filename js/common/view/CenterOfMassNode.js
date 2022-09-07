// Copyright 2019-2022, University of Colorado Boulder

/**
 * CenterOfMassNode is the view representation of a BallSystem's CenterOfMass, which appears in all screens of the
 * 'Collision Lab' simulation.
 *
 * Primary responsibilities are:
 *  - Creating a XNode to represent the visual mark of the CenterOfMass's position.
 *  - Create a PlayAreaNumberDisplay to display the speed of the CenterOfMass. The NumberDisplay is only visible if
 *    both the 'Values' and 'Center of Mass' checkboxes are checked.
 *
 * For the 'Collision Lab' sim, CenterOfMasses are instantiated at the start and persists for the lifetime of the
 * simulation. Thus, links are left as-is and no dispose method is implemented.
 *
 * NOTE: Do not translate this node. It's origin must be at the origin of the view coordinate frame.
 *
 * @author Brandon Li
 * @author Alex Schor
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Shape } from '../../../../kite/js/imports.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import XNode from '../../../../scenery-phet/js/XNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CenterOfMass from '../model/CenterOfMass.js';
import PlayAreaNumberDisplay from './PlayAreaNumberDisplay.js';

class CenterOfMassNode extends Node {

  /**
   * @param {CenterOfMass} centerOfMass
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} valuesVisibleProperty
   * @param {Bounds2} playAreaBounds
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( centerOfMass,
               centerOfMassVisibleProperty,
               valuesVisibleProperty,
               playAreaBounds,
               modelViewTransform,
               options
  ) {
    assert && assert( centerOfMass instanceof CenterOfMass, `Invalid centerOfMass: ${centerOfMass}` );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( valuesVisibleProperty, 'boolean' );
    assert && assert( playAreaBounds instanceof Bounds2, `invalid playAreaBounds: ${playAreaBounds}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2 );

    super( options );

    //----------------------------------------------------------------------------------------

    // Create the XNode to represent the visual mark of the CenterOfMass's position. Position set later.
    const xNode = new XNode( {
      fill: CollisionLabColors.CENTER_OF_MASS_FILL,
      stroke: CollisionLabColors.CENTER_OF_MASS_STROKE
    } );

    // Create the number display for the speed of the CenterOfMass, which appears above the xNode. Position set later.
    const speedNumberDisplay = new PlayAreaNumberDisplay( centerOfMass.speedProperty, {
      visibleProperty: valuesVisibleProperty,
      valuePattern: StringUtils.fillIn( CollisionLabStrings.pattern.vectorSymbolEqualsValueSpaceUnits, {
        symbol: CollisionLabStrings.symbol.velocity,
        units: CollisionLabStrings.units.metersPerSecond
      } )
    } );

    // Set the children in the correct rendering order.
    this.children = [

      // Wrap the XNode in a Node and apply a local ClipArea so that the XNode doesn't appear outside of the PlayArea.
      // This container is not translated so its local Bounds is the same as the parent bounds of the XNode.
      new Node( {
        children: [ xNode ],
        clipArea: Shape.bounds( modelViewTransform.modelToViewBounds( playAreaBounds ) )
      } ),

      speedNumberDisplay
    ];

    //----------------------------------------------------------------------------------------

    // Observe when the centerOfMassVisibleProperty or when the CenterOfMass's position changes and update the
    // positioning of the xNode and speedNumberDisplay and the visibility of this Node. This Node is only visible if the
    // CenterOfMass is visible AND the position is inside the PlayArea's Bounds. Link is never unlinked since
    // CenterOfMassNodes are never disposed.
    Multilink.multilink(
      [ centerOfMassVisibleProperty, centerOfMass.positionProperty ],
      ( centerOfMassVisible, position ) => {
        this.visible = centerOfMassVisible && playAreaBounds.containsPoint( position );

        // Only update positioning if the CenterOfMass is visible for a slight performance optimization.
        if ( this.visible ) {
          xNode.center = modelViewTransform.modelToViewPosition( position );
          speedNumberDisplay.centerBottom = xNode.centerTop.subtractXY( 0, CollisionLabConstants.VALUE_DISPLAY_MARGIN );
        }
      } );
  }
}

collisionLab.register( 'CenterOfMassNode', CenterOfMassNode );
export default CenterOfMassNode;