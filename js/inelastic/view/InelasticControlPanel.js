// Copyright 2020, University of Colorado Boulder

/**
 * InelasticControlPanel is a CollisionLabControlPanel sub-type for the 'Explore 2D' screen, which appears on the
 * upper-right corner of the screen.
 *
 * It adds a 'Path' Checkbox to allow the user to toggle the visibility of Ball and Center of Mass paths. The 'Path'
 * checkbox is inserted right below the 'Values' checkbox of the super-class. All other configurations and options
 * are the same.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignGroup from '../../../../scenery/js/nodes/AlignGroup.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabControlPanel from '../../common/view/CollisionLabControlPanel.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';
import InelasticCollisionTypes from '../model/InelasticCollisionTypes.js';

class InelasticControlPanel extends CollisionLabControlPanel {

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
               inelasticCollisionTypeProperty,
               options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( reflectingBorderProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( elasticityPercentProperty, 'number' );
    assert && AssertUtils.assertPropertyOf( ballsConstantSizeProperty, 'boolean' );

    options = merge( {

      elasticityNumberControlOptions: {
      }

    }, options );

    assert && assert( !options.elasticityNumberControlOptions.enabledRangeProperty, 'InelasticControlPanel sets enabledRangeProperty' );
    options.elasticityNumberControlOptions.enabledProperty = new Property( false );

    super( viewProperties,
           centerOfMassVisibleProperty,
           pathsVisibleProperty,
           reflectingBorderProperty,
           elasticityPercentProperty,
           ballsConstantSizeProperty,
           options );

    //----------------------------------------------------------------------------------------


    const stickSlipTextOptions = {
      font: new PhetFont( 13 ),
      maxWidth: 70 // constrain width for i18n, determined empirically
    };

    // Create AlignGroups for the Text Nodes to match their widths.
    const stickSlipAlignGroup = new AlignGroup( { matchHorizontal: true, matchVertical: false } );

    const stickLabel = stickSlipAlignGroup.createBox( new Text( collisionLabStrings.stick, stickSlipTextOptions ) );
    const slipLabel = stickSlipAlignGroup.createBox( new Text( collisionLabStrings.slip, stickSlipTextOptions ) );

    // Create the 'Stick' vs 'Slip' ABSwitch.
    const stickSlipSwitch = new ABSwitch( inelasticCollisionTypeProperty,
      InelasticCollisionTypes.STICK, stickLabel,
      InelasticCollisionTypes.SLIP, slipLabel, {
        toggleSwitchOptions: { size: new Dimension2( 28, 12 ) }
      } );
    this.elasticityControls.addChild( stickSlipSwitch );
  }
}

collisionLab.register( 'InelasticControlPanel', InelasticControlPanel );
export default InelasticControlPanel;