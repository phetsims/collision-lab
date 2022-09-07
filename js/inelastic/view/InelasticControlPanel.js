// Copyright 2020-2022, University of Colorado Boulder

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

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HStrut, Text, VBox } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import CollisionLabControlPanel from '../../common/view/CollisionLabControlPanel.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';
import StickSlipABSwitch from './StickSlipABSwitch.js';

class InelasticControlPanel extends CollisionLabControlPanel {

  /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} pathsVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<boolean>} ballsConstantSizeProperty
   * @param {Property.<InelasticCollisionType>} inelasticCollisionTypeProperty
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

      // super-class options
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


    const inelasticCollisionTitle = new Text( CollisionLabStrings.inelasticCollision, {
      font: CollisionLabConstants.PANEL_TITLE_FONT,
      maxWidth: CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH // constrain width for i18n
    } );

    const elasticityReadout = new Text( StringUtils.fillIn( CollisionLabStrings.pattern.labelEqualsValueUnits, {
      label: CollisionLabStrings.elasticity,
      units: CollisionLabStrings.units.percent,
      value: elasticityPercentProperty.value
    } ), {
      font: new PhetFont( 12 ),
      maxWidth: CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH
    } );

    // Create the 'Stick' vs 'Slip' ABSwitch.
    const stickSlipSwitch = new StickSlipABSwitch( inelasticCollisionTypeProperty );

    const elasticityControls = new VBox( {
      spacing: 4, children: [
        elasticityReadout,
        new HStrut( CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH, { pickable: false } ),
        stickSlipSwitch
      ]
    } );

    this.contentNode.insertChild( this.contentNode.indexOfChild( this.constantSizeCheckbox ), inelasticCollisionTitle );
    this.contentNode.insertChild( this.contentNode.indexOfChild( this.constantSizeCheckbox ), elasticityControls );
  }
}

collisionLab.register( 'InelasticControlPanel', InelasticControlPanel );
export default InelasticControlPanel;