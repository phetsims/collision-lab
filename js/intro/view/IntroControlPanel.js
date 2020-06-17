// Copyright 2020, University of Colorado Boulder

/**
 * IntroControlPanel is a CollisionLabControlPanel sub-type for the 'Intro' screen, which appears on the
 * upper-right corner of the screen.
 *
 * It adds a 'Change in P' Checkbox to allow the user to toggle the visibility of the change in momentum vectors. The
 * checkbox is inserted right above the 'Center of Mass' Checkbox of the super-class. It also removes the
 * 'Reflecting Border' Checkbox and the stick vs slip ABSwitch.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import InelasticCollisionTypes from '../../common/model/InelasticCollisionTypes.js';
import CollisionLabCheckbox from '../../common/view/CollisionLabCheckbox.js';
import CollisionLabControlPanel from '../../common/view/CollisionLabControlPanel.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';

class IntroControlPanel extends CollisionLabControlPanel {

 /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} changeInMomentumVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<InelasticCollisionTypes>} inelasticCollisionTypeProperty
   * @param {Property.<boolean>} ballsConstantSizeProperty
   */
  constructor( viewProperties,
               centerOfMassVisibleProperty,
               changeInMomentumVisibleProperty,
               reflectingBorderProperty,
               elasticityPercentProperty,
               inelasticCollisionTypeProperty,
               ballsConstantSizeProperty ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && assert( centerOfMassVisibleProperty instanceof Property && typeof centerOfMassVisibleProperty.value === 'boolean', `invalid centerOfMassVisibleProperty: ${centerOfMassVisibleProperty}` );
    assert && assert( changeInMomentumVisibleProperty instanceof Property && typeof changeInMomentumVisibleProperty.value === 'boolean', `invalid changeInMomentumVisibleProperty: ${changeInMomentumVisibleProperty}` );
    assert && assert( reflectingBorderProperty instanceof Property && typeof reflectingBorderProperty.value === 'boolean', `invalid reflectingBorderProperty: ${reflectingBorderProperty}` );
    assert && assert( elasticityPercentProperty instanceof Property && typeof elasticityPercentProperty.value === 'number', `invalid elasticityPercentProperty: ${elasticityPercentProperty}` );
    assert && assert( inelasticCollisionTypeProperty instanceof Property && InelasticCollisionTypes.includes( inelasticCollisionTypeProperty.value ), `invalid inelasticCollisionTypeProperty: ${inelasticCollisionTypeProperty}` );
    assert && assert( ballsConstantSizeProperty instanceof Property && typeof ballsConstantSizeProperty.value === 'boolean', `invalid ballsConstantSizeProperty: ${ballsConstantSizeProperty}` );

    super( viewProperties,
           centerOfMassVisibleProperty,
           reflectingBorderProperty,
           elasticityPercentProperty,
           inelasticCollisionTypeProperty,
           ballsConstantSizeProperty, {
             includeReflectingBorderCheckbox: false,
             elasticityControlSetNodeOptions: {
                includeStickSlipSwitch: false
             }
           } );

    //----------------------------------------------------------------------------------------

    // 'Change in Momentum' visibility Checkbox.
    const changeInMomentumCheckbox = new CollisionLabCheckbox( changeInMomentumVisibleProperty, collisionLabStrings.changeInMomentum );

    // Add the Change in Momentum Checkbox before the Center of Mass Checkbox.
    this.contentNode.insertChild( this.contentNode.indexOfChild( this.centerOfMassCheckbox ), changeInMomentumCheckbox );
  }
}

collisionLab.register( 'IntroControlPanel', IntroControlPanel );
export default IntroControlPanel;