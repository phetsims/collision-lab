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

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignGroup from '../../../../scenery/js/nodes/AlignGroup.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
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
        font: CollisionLabConstants.CONTROL_FONT,
        maxWidth: 70 // constrain width for i18n, determined empirically
      },

      // {Object} - passed to the ABSwitch instance.
      stickSlipABSwitchOptions: {
        toggleSwitchOptions: {
          size: new Dimension2( 28, 12 )
        }
      },

      includeElasticityNumberControl: false

    }, options );

    super( viewProperties,
           centerOfMassVisibleProperty,
           pathsVisibleProperty,
           reflectingBorderProperty,
           elasticityPercentProperty,
           ballsConstantSizeProperty,
           options );

    //----------------------------------------------------------------------------------------


    const inelasticCollisionTitle = new Text( collisionLabStrings.inelasticCollision, {
      font: CollisionLabConstants.PANEL_TITLE_FONT,
      maxWidth: CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH // constrain width for i18n
    } );

    const elasticityReadout = new Text( StringUtils.fillIn( collisionLabStrings.pattern.labelEqualsValueUnits, {
      label: collisionLabStrings.elasticity,
      units: collisionLabStrings.units.percent,
      value: elasticityPercentProperty.value
    } ), {
      font: new PhetFont( 12 )
    } );


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

    const elasticityControls = new VBox( { spacing: 4, children: [
      elasticityReadout,
      new HStrut( CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH, { pickable: false } ),
      stickSlipSwitch
    ] } );


    this.contentNode.insertChild( this.contentNode.indexOfChild( this.constantSizeCheckbox ), inelasticCollisionTitle );
    this.contentNode.insertChild( this.contentNode.indexOfChild( this.constantSizeCheckbox ), elasticityControls );
  }
}

collisionLab.register( 'InelasticControlPanel', InelasticControlPanel );
export default InelasticControlPanel;