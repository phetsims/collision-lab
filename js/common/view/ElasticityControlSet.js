// Copyright 2020, University of Colorado Boulder

/**
 * A view specialized to display Controls for the user the manipulate the elasticity and, if necessary, the type of
 * elasticity, for all ball collisions in a system. It appears inside of control-panels on all screens.
 *
 * The ElasticityControlSet consists of:
 *   - a standard NumberControl to allow the user to change the elasticity.
 *   - an ABSwitch to allow the user to switch between sticky and slipping perfectly inelastic collisions. This switch
 *     is disabled if the elasticity isn't perfectly inelastic.
 *
 * ElasticityControlSets are created at the start of the sim and are never disposed, so no dispose method is
 * necessary and internal links are left as-is.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignGroup from '../../../../scenery/js/nodes/AlignGroup.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Color from '../../../../scenery/js/util/Color.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import InelasticCollisionTypes from '../model/InelasticCollisionTypes.js';

// constants
const ELASTICITY_PERCENT_RANGE = CollisionLabConstants.ELASTICITY_PERCENT_RANGE;
const TOGGLE_SWITCH_SIZE = new Dimension2( 28, 12 );

class ElasticityControlSet extends VBox {

  /**
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<InelasticCollisionTypes>} inelasticCollisionTypeProperty
   * @param {Object} [options]
   */
  constructor( elasticityPercentProperty, inelasticCollisionTypeProperty, options ) {
    assert && assert( elasticityPercentProperty instanceof Property && typeof elasticityPercentProperty.value === 'number', `invalid elasticityPercentProperty: ${elasticityPercentProperty}` );
    assert && assert( inelasticCollisionTypeProperty instanceof Property && InelasticCollisionTypes.includes( inelasticCollisionTypeProperty.value ), `invalid inelasticCollisionTypeProperty: ${inelasticCollisionTypeProperty}` );


    options = merge( {

      // {Object} - passed to the NumberControl title Text instance.
      titleTextOptions: {
        font: CollisionLabConstants.PANEL_TITLE_FONT,
        maxWidth: 90 // constrain width for i18n, determined empirically
      },

      // {Object} - passed to the tick Text instances.
      tickTextOptions: {
        font: new PhetFont( 12 ),
        maxWidth: 45 // constrain width for i18n, determined empirically
      },

      // {boolean} - indicates if the stick-slip APSwitch is included
      includeStickSlipSwitch: true,

      // {Object} - passed to the labels of the ABSwitch
      stickSlipTextOptions: {
        font: new PhetFont( 13 ),
        maxWidth: 70 // constrain width for i18n, determined empirically
      },

      // superclass options
      spacing: 3.5 // determines spacing between the NumberControl and the ABSwitch

    }, options );

    super( options );

    //------------------------------------------w----------------------------------------------

    // Create AlignGroups for the Text Nodes to match their widths.
    const stickSlipAlignGroup = new AlignGroup( { matchHorizontal: true, matchVertical: false } );

    // Create the Text Nodes that appear in the ElasticityControlSet
    const inelasticLabel = new Text( collisionLabStrings.inelastic, options.tickTextOptions );
    const elasticLabel = new Text( collisionLabStrings.elastic, options.tickTextOptions );
    const stickLabel = stickSlipAlignGroup.createBox( new Text( collisionLabStrings.stick, options.stickSlipTextOptions ) );
    const slipLabel = stickSlipAlignGroup.createBox( new Text( collisionLabStrings.slip, options.stickSlipTextOptions ) );

    //----------------------------------------------------------------------------------------

    // Compute the width of the track to ensure the NumberControl fits in control-panels.
    const trackWidth = CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH - ( inelasticLabel.width + elasticLabel.width ) / 2;

    // Create the 'Elasticity' NumberControl.
    const elasticityNumberControl = new NumberControl( collisionLabStrings.elasticity,
      elasticityPercentProperty,
      ELASTICITY_PERCENT_RANGE, {
        layoutFunction: NumberControl.createLayoutFunction4(),
        includeArrowButtons: false,
        sliderOptions: {
          majorTicks: [
            { value: ELASTICITY_PERCENT_RANGE.min, label: inelasticLabel },
            { value: ELASTICITY_PERCENT_RANGE.max, label: elasticLabel }
          ],
          majorTickLength: 5,
          tickLabelSpacing: 10,
          thumbSize: new Dimension2( 14, 24 ),
          trackSize: new Dimension2( trackWidth, 0.1 ) // height determined empirically
        },
        numberDisplayOptions: {
          valuePattern: StringUtils.fillIn( collisionLabStrings.pattern.valueUnits, {
            units: collisionLabStrings.units.percent
          } ),
          textOptions: { font: CollisionLabConstants.DISPLAY_FONT, maxWidth: options.titleTextOptions.maxWidth },
          backgroundStroke: Color.BLACK,
          backgroundLineWidth: 0.5
        },
        titleNodeOptions: options.titleTextOptions
      } );

    this.addChild( elasticityNumberControl );

    //----------------------------------------------------------------------------------------

    if ( options.includeStickSlipSwitch ) {

      // Create the 'Stick' vs 'Slip' ABSwitch.
      const stickSlipSwitch = new ABSwitch( inelasticCollisionTypeProperty,
        InelasticCollisionTypes.STICK, stickLabel,
        InelasticCollisionTypes.SLIP, slipLabel, {
          toggleSwitchOptions: { size: TOGGLE_SWITCH_SIZE }
        } );
      this.addChild( stickSlipSwitch );

      // Observe when the elasticity is manipulated to disable the stickSlipSwitch if the elasticity isn't perfectly
      // inelastic. Link is never disposed as ElasticityControlSets are never disposed.
      elasticityPercentProperty.link( elasticity => {
        stickSlipSwitch.enabled = ( elasticity === 0 );
      } );
    }
  }
}

collisionLab.register( 'ElasticityControlSet', ElasticityControlSet );
export default ElasticityControlSet;