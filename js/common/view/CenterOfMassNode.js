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
import CollisionLabColors from '../CollisionLabColors.js';
import CenterOfMass from '../model/CenterOfMass.js';
import PathCanvasNode from './PathCanvasNode.js';
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

    const centerOfMassPathNode = new PathCanvasNode( centerOfMass.path, modelViewTransform, {
      pathBaseColor: CollisionLabColors.X_MARKER_COLORS.fill
    } );
    this.addChild( centerOfMassPathNode );


    const xNode = new XNode();
    this.addChild( xNode );

    Property.multilink( [ centerOfMass.positionProperty, centerOfMassVisibleProperty ],
      ( position, centerOfMassVisible ) => {
        this.visible = centerOfMassVisible;
        if ( this.visible ) {
          xNode.center = modelViewTransform.modelToViewPosition( position );
        }
      } );
  }
}

collisionLab.register( 'CenterOfMassNode', CenterOfMassNode );
export default CenterOfMassNode;