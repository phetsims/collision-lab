// Copyright 2020, University of Colorado Boulder

/**
 * InelasticControlPanel is a CollisionLabControlPanel sub-type for the 'Inelastic' screen, which appears on the
 * upper-right corner of the screen.
 *
 * It adds a 'Stick' vs 'Slip' ABSwitch to allow the user to toggle the InelasticCollisionType. The ABSwitch is inserted
 * right below the 'elasticity' NumberControl of the super-class. It also disables the 'elasticity' NumberControl. All
 * other configurations and options are the same.
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
import InelasticCollisionType from '../model/InelasticCollisionType.js';

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

      // {Object} - passed to the labels of the ABSwitch
      stickSlipTextOptions: {
        font: new PhetFont( 13 ),
        maxWidth: 70 // constrain width for i18n, determined empirically
      },

      // {Object} - passed to the ABSwitch instance.
      stickSlipABSwitchOptions: {
        toggleSwitchOptions: {
          size: new Dimension2( 28, 12 )
        }
      }

    }, options );

    //----------------------------------------------------------------------------------------

    // Disable the 'elasticity' NumberControl.
    assert && assert( !options.elasticityNumberControlOptions, 'InelasticControlPanel sets elasticityNumberControlOptions' );
    options.elasticityNumberControlOptions = { enabledProperty: new Property( false ) };

    super( viewProperties,
           centerOfMassVisibleProperty,
           pathsVisibleProperty,
           reflectingBorderProperty,
           elasticityPercentProperty,
           ballsConstantSizeProperty,
           options );

    //----------------------------------------------------------------------------------------

    // Create an AlignGroup for the Text Nodes to match their widths.
    const labelAlignGroup = new AlignGroup( { matchHorizontal: true, matchVertical: false } );

    // Create the Labels of the ABSwitch.
    const stickLabel = labelAlignGroup.createBox( new Text( collisionLabStrings.stick, options.stickSlipTextOptions ) );
    const slipLabel = labelAlignGroup.createBox( new Text( collisionLabStrings.slip, options.stickSlipTextOptions ) );

    // Create the 'Stick' vs 'Slip' ABSwitch.
    const stickSlipSwitch = new ABSwitch( inelasticCollisionTypeProperty,
      InelasticCollisionType.STICK, stickLabel,
      InelasticCollisionType.SLIP, slipLabel,
      options.stickSlipABSwitchOptions );

    // Add the ABSwitch right below the 'elasticity' NumberControl.
    this.elasticityControls.addChild( stickSlipSwitch );
  }
}

collisionLab.register( 'InelasticControlPanel', InelasticControlPanel );
export default InelasticControlPanel;