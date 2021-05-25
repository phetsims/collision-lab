// Copyright 2020-2021, University of Colorado Boulder

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

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabControlPanel from '../../common/view/CollisionLabControlPanel.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';

class Explore2DControlPanel extends CollisionLabControlPanel {

  /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} pathsVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Range} enabledElasticityRange
   * @param {Property.<boolean>} ballsConstantSizeProperty
   * @param {Object} [options]
   */
  constructor( viewProperties,
               centerOfMassVisibleProperty,
               pathsVisibleProperty,
               reflectingBorderProperty,
               elasticityPercentProperty,
               enabledElasticityRange,
               ballsConstantSizeProperty,
               options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( reflectingBorderProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( elasticityPercentProperty, 'number' );
    assert && AssertUtils.assertPropertyOf( ballsConstantSizeProperty, 'boolean' );

    options = merge( {

      elasticityNumberControlOptions: {
        trackHeight: 3
      }

    }, options );

    assert && assert( !options.elasticityNumberControlOptions.enabledRangeProperty, 'Explore2DControlPanel sets enabledRangeProperty' );
    options.elasticityNumberControlOptions.enabledRangeProperty = new Property( enabledElasticityRange );

    super( viewProperties,
      centerOfMassVisibleProperty,
      pathsVisibleProperty,
      reflectingBorderProperty,
      elasticityPercentProperty,
      ballsConstantSizeProperty,
      options );

  }
}

collisionLab.register( 'Explore2DControlPanel', Explore2DControlPanel );
export default Explore2DControlPanel;