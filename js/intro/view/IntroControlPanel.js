// Copyright 2020, University of Colorado Boulder

/**
 * IntroControlPanel is a CollisionLabControlPanel sub-type for the 'Intro' screen, which appears on the
 * upper-right corner of the screen.
 *
 * It adds a 'Change in Momentum' Checkbox to allow the user to toggle the visibility of the change in momentum vectors. The
 * checkbox is inserted right above the 'Center of Mass' Checkbox of the super-class. It also removes the
 * 'Reflecting Border' Checkbox and the stick vs slip ABSwitch.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
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
   * @param {Property.<boolean>} pathVisibleProperty
   * @param {Property.<boolean>} changeInMomentumVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<InelasticCollisionTypes>} inelasticCollisionTypeProperty
   * @param {Property.<boolean>} ballsConstantSizeProperty
   * @param {Object} [options]
   */
  constructor( viewProperties,
               centerOfMassVisibleProperty,
               pathVisibleProperty,
               changeInMomentumVisibleProperty,
               reflectingBorderProperty,
               elasticityPercentProperty,
               inelasticCollisionTypeProperty,
               ballsConstantSizeProperty,
               options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( pathVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( changeInMomentumVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( reflectingBorderProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( elasticityPercentProperty, 'number' );
    assert && AssertUtils.assertProperty( inelasticCollisionTypeProperty, inelasticCollisionType => InelasticCollisionTypes.includes( inelasticCollisionType ) );
    assert && AssertUtils.assertPropertyOf( ballsConstantSizeProperty, 'boolean' );

    options = merge( {
      includeReflectingBorderCheckbox: false,
      includePathCheckbox: false,
      elasticityControlSetNodeOptions: {
        includeStickSlipSwitch: false
      }
    }, options );

    super( viewProperties,
           centerOfMassVisibleProperty,
           pathVisibleProperty,
           reflectingBorderProperty,
           elasticityPercentProperty,
           inelasticCollisionTypeProperty,
           ballsConstantSizeProperty,
           options );

    //----------------------------------------------------------------------------------------

    // 'Change in Momentum' visibility Checkbox.
    const changeInMomentumCheckbox = new CollisionLabCheckbox( changeInMomentumVisibleProperty, collisionLabStrings.changeInMomentum );

    // Add the Change in Momentum Checkbox before the Center of Mass Checkbox.
    this.contentNode.insertChild( this.contentNode.indexOfChild( this.centerOfMassCheckbox ), changeInMomentumCheckbox );
  }
}

collisionLab.register( 'IntroControlPanel', IntroControlPanel );
export default IntroControlPanel;