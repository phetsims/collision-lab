// Copyright 2020-2022, University of Colorado Boulder

/**
 * IntroControlPanel is a CollisionLabControlPanel sub-type for the 'Intro' screen, which appears on the
 * upper-right corner of the screen.
 *
 * It adds a 'Change in Momentum' Checkbox to allow the user to toggle the visibility of the change in momentum vectors.
 * The checkbox is inserted right above the 'Center of Mass' Checkbox of the super-class. It also removes the
 * 'Reflecting Border' Checkbox and the 'Path' Checkbox.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabCheckbox from '../../common/view/CollisionLabCheckbox.js';
import CollisionLabControlPanel from '../../common/view/CollisionLabControlPanel.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';

class IntroControlPanel extends CollisionLabControlPanel {

  /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} changeInMomentumVisibleProperty
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} pathsVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<boolean>} ballsConstantSizeProperty
   * @param {Object} [options]
   */
  constructor( viewProperties,
               changeInMomentumVisibleProperty,
               centerOfMassVisibleProperty,
               pathsVisibleProperty,
               reflectingBorderProperty,
               elasticityPercentProperty,
               ballsConstantSizeProperty,
               options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && AssertUtils.assertPropertyOf( changeInMomentumVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( pathsVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( reflectingBorderProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( elasticityPercentProperty, 'number' );
    assert && AssertUtils.assertPropertyOf( ballsConstantSizeProperty, 'boolean' );

    options = merge( {

      includeReflectingBorderCheckbox: false,
      includePathCheckbox: false

    }, options );

    super( viewProperties,
      centerOfMassVisibleProperty,
      pathsVisibleProperty,
      reflectingBorderProperty,
      elasticityPercentProperty,
      ballsConstantSizeProperty,
      options );

    //----------------------------------------------------------------------------------------

    // 'Change in Momentum' visibility Checkbox.
    const changeInMomentumCheckbox = new CollisionLabCheckbox( changeInMomentumVisibleProperty, CollisionLabStrings.changeInMomentum );

    // Add the Change in Momentum Checkbox before the Center of Mass Checkbox.
    this.contentNode.insertChild( this.contentNode.indexOfChild( this.centerOfMassCheckbox ), changeInMomentumCheckbox );
  }
}

collisionLab.register( 'IntroControlPanel', IntroControlPanel );
export default IntroControlPanel;