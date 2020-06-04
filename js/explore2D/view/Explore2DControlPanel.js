// Copyright 2020, University of Colorado Boulder

/**
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

class Explore2DControlPanel extends CollisionLabControlPanel {

 /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} pathVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<InelasticCollisionTypes>} inelasticCollisionTypeProperty
   * @param {Property.<boolean>} isBallConstantSizeProperty
   * @param {Object} [options]
   */
  constructor( viewProperties,
               centerOfMassVisibleProperty,
               pathVisibleProperty,
               reflectingBorderProperty,
               elasticityPercentProperty,
               inelasticCollisionTypeProperty,
               isBallConstantSizeProperty,
               options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && assert( centerOfMassVisibleProperty instanceof Property && typeof centerOfMassVisibleProperty.value === 'boolean', `invalid centerOfMassVisibleProperty: ${centerOfMassVisibleProperty}` );
    assert && assert( pathVisibleProperty instanceof Property && typeof pathVisibleProperty.value === 'boolean', `invalid pathVisibleProperty: ${pathVisibleProperty}` );
    assert && assert( reflectingBorderProperty instanceof Property && typeof reflectingBorderProperty.value === 'boolean', `invalid reflectingBorderProperty: ${reflectingBorderProperty}` );
    assert && assert( elasticityPercentProperty instanceof Property && typeof elasticityPercentProperty.value === 'number', `invalid elasticityPercentProperty: ${elasticityPercentProperty}` );
    assert && assert( inelasticCollisionTypeProperty instanceof Property && InelasticCollisionTypes.includes( inelasticCollisionTypeProperty.value ), `invalid inelasticCollisionTypeProperty: ${inelasticCollisionTypeProperty}` );
    assert && assert( isBallConstantSizeProperty instanceof Property && typeof isBallConstantSizeProperty.value === 'boolean', `invalid isBallConstantSizeProperty: ${isBallConstantSizeProperty}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );


    super( viewProperties,
           centerOfMassVisibleProperty,
           reflectingBorderProperty,
           elasticityPercentProperty,
           inelasticCollisionTypeProperty,
           isBallConstantSizeProperty,
           options );

    // 'Path' visibility Checkbox
    const pathCheckbox = new CollisionLabCheckbox( pathVisibleProperty, collisionLabStrings.path );


    this.contentNode.children = [
      this.velocityCheckbox,
      this.momentumCheckbox,
      this.centerOfMassCheckbox,
      this.kineticEnergyCheckbox,
      this.valuesCheckbox,
      pathCheckbox,
      this.reflectingBorderCheckbox,
      this.hSeperator,
      this.elasticityControlSetNode,
      this.constantRadiusCheckbox
    ];
  }
}

collisionLab.register( 'Explore2DControlPanel', Explore2DControlPanel );
export default Explore2DControlPanel;