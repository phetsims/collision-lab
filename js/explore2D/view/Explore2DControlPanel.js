// Copyright 2020, University of Colorado Boulder

/**
 * Explore2DControlPanel is a CollisionLabControlPanel sub-type for the 'Explore 2D' screen, which appears on the
 * upper-right corner of the screen.
 *
 * It adds a 'Path' Checkbox to allow the user to toggle the visibility of Ball and Center of Mass paths. The 'Path'
 * checkbox is inserted right below the 'Values' checkbox of the super-class. All other configurations and options
 * are the same.
 *
 * @author Brandon Li
 */

import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import InelasticCollisionTypes from '../../common/model/InelasticCollisionTypes.js';
import CollisionLabCheckbox from '../../common/view/CollisionLabCheckbox.js';
import CollisionLabControlPanel from '../../common/view/CollisionLabControlPanel.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';

class Explore2DControlPanel extends CollisionLabControlPanel {

 /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} pathVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<InelasticCollisionTypes>} inelasticCollisionTypeProperty
   * @param {Property.<boolean>} ballsConstantSizeProperty
   */
  constructor( viewProperties,
               centerOfMassVisibleProperty,
               pathVisibleProperty,
               reflectingBorderProperty,
               elasticityPercentProperty,
               inelasticCollisionTypeProperty,
               ballsConstantSizeProperty ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( reflectingBorderProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( elasticityPercentProperty, 'number' );
    assert && AssertUtils.assertProperty( inelasticCollisionTypeProperty, inelasticCollisionType => InelasticCollisionTypes.includes( inelasticCollisionType ) );
    assert && AssertUtils.assertPropertyOf( ballsConstantSizeProperty, 'boolean' );

    super( viewProperties,
           centerOfMassVisibleProperty,
           reflectingBorderProperty,
           elasticityPercentProperty,
           inelasticCollisionTypeProperty,
           ballsConstantSizeProperty  );

    //----------------------------------------------------------------------------------------

    // Create the 'Path' visibility Checkbox.
    const pathCheckbox = new CollisionLabCheckbox( pathVisibleProperty, collisionLabStrings.path );

    // Add the 'Path' Checkbox after the 'Values' Checkbox.
    this.contentNode.insertChild( this.contentNode.indexOfChild( this.valuesCheckbox ) + 1, pathCheckbox );
  }
}

collisionLab.register( 'Explore2DControlPanel', Explore2DControlPanel );
export default Explore2DControlPanel;