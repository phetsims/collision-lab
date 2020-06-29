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

import Property from '../../../../axon/js/Property.js';
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
   * @param {Property.<boolean>} ballsConstantSizeProperty
   * @param {Object} [options]
   */
  constructor( viewProperties,
               centerOfMassVisibleProperty,
               pathsVisibleProperty,
               reflectingBorderProperty,
               elasticityPercentProperty,
               ballsConstantSizeProperty,
               elasticityPercentRange,
               options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( reflectingBorderProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( elasticityPercentProperty, 'number' );
    assert && AssertUtils.assertPropertyOf( ballsConstantSizeProperty, 'boolean' );

    options = options || {};
    options.elasticityNumberControlOptions = options.elasticityNumberControlOptions || {};

    assert && assert( !options.elasticityNumberControlOptions.enabledRangeProperty, 'Explore2DControlPanel sets enabledRangeProperty' );
    options.elasticityNumberControlOptions.enabledRangeProperty = new Property( elasticityPercentRange );
    options.elasticityNumberControlOptions.trackHeight = 3;

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