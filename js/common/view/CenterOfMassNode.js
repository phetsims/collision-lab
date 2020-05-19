// Copyright 2019-2020, University of Colorado Boulder

/**
 * View for the center of mass marker, appears on the play area
 *
 * @author Alex Schor
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import collisionLab from '../../collisionLab.js';
import CenterOfMass from '../model/CenterOfMass.js';
import XNode from './XNode.js';

class CenterOfMassNode extends Node {
  /**
   *
   * @param {CenterOfMass} centerOfMass
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( centerOfMass, centerOfMassVisibleProperty, modelViewTransform ) {

    assert && assert( centerOfMass instanceof CenterOfMass, `Invalid centerOfMass: ${centerOfMass}` );
    assert && assert( centerOfMassVisibleProperty instanceof BooleanProperty,
      `Invalid centerOfMassVisibleProperty: ${centerOfMassVisibleProperty}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2 );
    //----------------------------------------------------------------------------------------
    super();

    const xNode = new XNode();
    this.addChild( xNode );

    // Link the position of the marker to the center of mass property
    // This link is present for the lifetime of the simulation
    centerOfMass.positionProperty.link( position => {
      this.center = modelViewTransform.modelToViewPosition( position );
    } );


    // Link the visibility of the marker to the visibility property and the number of balls (the marker is only
    // present if number of balls >= 2)
    // The link is present for the lifetime of the simulation
    Property.multilink( [ centerOfMassVisibleProperty, centerOfMass.isDefinedProperty ],
      ( centerOfMassVisible, isDefined ) => {
        this.visible = centerOfMassVisible && isDefined;
      } );
  }

}

collisionLab.register( 'CenterOfMassNode', CenterOfMassNode );
export default CenterOfMassNode;