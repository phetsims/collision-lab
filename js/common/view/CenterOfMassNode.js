// Copyright 2019-2020, University of Colorado Boulder

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

import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CenterOfMass from '../model/CenterOfMass.js';
import PlayAreaNumberDisplay from './PlayAreaNumberDisplay.js';
import XNode from './XNode.js';

class CenterOfMassNode extends Node {

  /**
   * @param {CenterOfMass} centerOfMass
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} valuesVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( centerOfMass, centerOfMassVisibleProperty, valuesVisibleProperty, modelViewTransform, options ) {
    assert && assert( centerOfMass instanceof CenterOfMass, `Invalid centerOfMass: ${centerOfMass}` );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( valuesVisibleProperty, 'boolean' );
    assert && assert( modelViewTransform instanceof ModelViewTransform2 );

    super( options );

    //----------------------------------------------------------------------------------------

    // Create the XNode to represent the visual mark of the CenterOfMass's position. Position set later.
    const xNode = new XNode();

    // Create the number display for the speed of the CenterOfMass, which appears above the xNode. Position set later.
    const speedNumberDisplay = new PlayAreaNumberDisplay( centerOfMass.speedProperty, valuesVisibleProperty, {
      valuePattern: collisionLabStrings.speedPattern,
      backgroundFill: CollisionLabColors.CENTER_OF_MASS_COLORS.fill
    } );

    // Set the children in the correct rendering order.
    this.children = [
      xNode,
      speedNumberDisplay
    ];

    //----------------------------------------------------------------------------------------

    // Observe when the CenterOfMass's position changes and update the positioning of the xNode and speedNumberDisplay.
    // Link is never unlinked since CenterOfMassNodes are never disposed.
    centerOfMass.positionProperty.link( position => {
      xNode.center = modelViewTransform.modelToViewPosition( position );
      speedNumberDisplay.centerBottom = xNode.centerTop.subtractXY( 0, CollisionLabConstants.VALUE_DISPLAY_MARGIN );
    } );

    // Observe when the centerOfMassVisibleProperty changes and update the visibility of this Node. Link is never
    // unlinked since CenterOfMassNodes are never disposed.
    centerOfMassVisibleProperty.linkAttribute( this, 'visible' );
  }
}

collisionLab.register( 'CenterOfMassNode', CenterOfMassNode );
export default CenterOfMassNode;