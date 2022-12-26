// Copyright 2020-2022, University of Colorado Boulder

/**
 * StickSlipABSwitch is a ABSwitch sub-type that allows the user to the different InelasticCollisionTypes. It
 * appears only on the bottom-center of the control panel in the 'Inelastic' screen. See InelasticCollisionType.js for
 * more context.
 *
 * StickSlipABSwitch is never disposed and exists for the entire simulation.
 *
 * @author Brandon Li
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import { AlignGroup, Text } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import InelasticCollisionType from '../model/InelasticCollisionType.js';

class StickSlipABSwitch extends ABSwitch {

  /**
   * @param {Property.<InelasticCollisionType>} inelasticCollisionTypeProperty
   * @param {Object} [options]
   */
  constructor( inelasticCollisionTypeProperty, options ) {
    assert && AssertUtils.assertEnumerationDeprecatedPropertyOf( inelasticCollisionTypeProperty, InelasticCollisionType );

    options = merge( {

      // {Object} - passed to the labels of the ABSwitch.
      textOptions: {
        font: CollisionLabConstants.CONTROL_FONT,
        maxWidth: 70 // constrain width for i18n, determined empirically
      },

      // super-class options
      toggleSwitchOptions: {
        size: new Dimension2( 28, 12 )
      }

    }, options );

    //----------------------------------------------------------------------------------------

    // Create an AlignGroup for the Text Nodes to match their widths.
    const labelAlignGroup = new AlignGroup( { matchHorizontal: true, matchVertical: false } );

    // Create the Labels of the ABSwitch.
    const stickLabel = labelAlignGroup.createBox( new Text( CollisionLabStrings.stick, options.textOptions ) );
    const slipLabel = labelAlignGroup.createBox( new Text( CollisionLabStrings.slip, options.textOptions ) );

    // Create the 'Stick' vs 'Slip' ABSwitch.
    super( inelasticCollisionTypeProperty,
      InelasticCollisionType.STICK, stickLabel,
      InelasticCollisionType.SLIP, slipLabel,
      options );
  }
}

collisionLab.register( 'StickSlipABSwitch', StickSlipABSwitch );
export default StickSlipABSwitch;