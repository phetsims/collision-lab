// Copyright 2019-2020, University of Colorado Boulder

/**
 * MoreDataCheckbox is the checkbox labeled 'More Data'. It is used to control visibility of extra NumberDisplays in the
 * BallValuesPanel (see BallValuesPanel for more documentation). Instances are positioned just above the BallValuesPanel
 * and appears on every screen in the sim.
 *
 * MoreDataCheckboxes are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabCheckbox from './CollisionLabCheckbox.js';

class MoreDataCheckbox extends CollisionLabCheckbox {

  /**
   * @param {BooleanProperty} moreDataVisibleProperty
   * @param {Object} [options]
   */
  constructor( moreDataVisibleProperty, options ) {
    assert && assert( moreDataVisibleProperty instanceof Property && typeof moreDataVisibleProperty.value === 'boolean', `invalid moreDataVisibleProperty: ${moreDataVisibleProperty}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {

      // super-class options
      width: 150 // constrain width for i18n, determined empirically

    }, options );

    super( moreDataVisibleProperty, collisionLabStrings.moreData, options );
  }
}

collisionLab.register( 'MoreDataCheckbox', MoreDataCheckbox );
export default MoreDataCheckbox;