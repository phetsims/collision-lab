// Copyright 2020-2022, University of Colorado Boulder

/**
 * MoreDataCheckbox is the checkbox labeled 'More Data'. It is used to control visibility of extra NumberDisplays in the
 * BallValuesPanel (see BallValuesPanel for more documentation). Instances are positioned just above the BallValuesPanel
 * and appears on every screen in the sim.
 *
 * MoreDataCheckboxes are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabCheckbox from './CollisionLabCheckbox.js';

class MoreDataCheckbox extends CollisionLabCheckbox {

  /**
   * @param {Property.<boolean>} moreDataVisibleProperty
   * @param {Object} [options]
   */
  constructor( moreDataVisibleProperty, options ) {
    assert && AssertUtils.assertPropertyOf( moreDataVisibleProperty, 'boolean' );

    options = merge( {

      // super-class options
      width: 150, // constrain width for i18n, determined empirically
      touchAreaXDilation: 5,
      touchAreaYDilation: 3.5

    }, options );

    super( moreDataVisibleProperty, CollisionLabStrings.moreData, options );
  }
}

collisionLab.register( 'MoreDataCheckbox', MoreDataCheckbox );
export default MoreDataCheckbox;