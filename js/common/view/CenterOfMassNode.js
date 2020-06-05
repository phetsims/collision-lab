// Copyright 2019-2020, University of Colorado Boulder

/**
 * View for the center of mass marker, appears on the play area
 *
 * @author Brandon Li
 * @author Alex Schor
 */

import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CenterOfMass from '../model/CenterOfMass.js';
import PlayAreaNumberDisplay from './PlayAreaNumberDisplay.js';
import XNode from './XNode.js';

class CenterOfMassNode extends Node {
  /**
   *
   * @param {CenterOfMass} centerOfMass
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( centerOfMass, centerOfMassVisibleProperty, valuesVisibleProperty, modelViewTransform ) {

    assert && assert( centerOfMass instanceof CenterOfMass, `Invalid centerOfMass: ${centerOfMass}` );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );
    assert && assert( modelViewTransform instanceof ModelViewTransform2 );
    //----------------------------------------------------------------------------------------

    super();

    const xNode = new XNode();

    // create number display for speed, located above the COM
    const speedNumberDisplay = new PlayAreaNumberDisplay( centerOfMass.speedProperty, {
      valuePattern: collisionLabStrings.speedPattern
    } );


    this.children = [
      xNode,
      speedNumberDisplay
    ];


    centerOfMassVisibleProperty.linkAttribute( this, 'visible' );
    valuesVisibleProperty.linkAttribute( speedNumberDisplay, 'visible' );

    centerOfMass.positionProperty.link( position => {
      xNode.center = modelViewTransform.modelToViewPosition( position );
      speedNumberDisplay.centerBottom = xNode.centerTop.subtractXY( 0, 10 );
    } );


  }
}

collisionLab.register( 'CenterOfMassNode', CenterOfMassNode );
export default CenterOfMassNode;