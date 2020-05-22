// Copyright 2019-2020, University of Colorado Boulder

/**
 * View for the control panel of the play area
 *
 * @author Alex Schor
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import Panel from '../../../../sun/js/Panel.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';
import ControlPanelCheckbox from './ControlPanelCheckbox.js';

// constants
const ELASTICITY_PERCENT_RANGE = CollisionLabConstants.ELASTICITY_PERCENT_RANGE;

const centerOfMassString = collisionLabStrings.centerOfMass;
const constantSizeString = collisionLabStrings.constantSize;
const elasticityPercentString = collisionLabStrings.elasticityPercent;
const elasticityString = collisionLabStrings.elasticity;
const elasticString = collisionLabStrings.elastic;
const inelasticString = collisionLabStrings.inelastic;
const kineticEnergyString = collisionLabStrings.kineticEnergy;
const momentumString = collisionLabStrings.momentum;
const pathString = collisionLabStrings.path;
const reflectingBorderString = collisionLabStrings.reflectingBorder;
const valuesString = collisionLabStrings.values;
const velocityString = collisionLabStrings.velocity;

// strings
const stickString = collisionLabStrings.stick;
const slipString = collisionLabStrings.slip;

class CollisionLabControlPanel extends Panel {

  /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<boolean>} isStickyProperty
   * @param {Property.<boolean>} constantRadiusProperty
   * @param {Object} [options]
   */
  constructor( viewProperties,
               reflectingBorderProperty,
               elasticityPercentProperty,
               isStickyProperty,
               constantRadiusProperty,
               options ) {

    options = merge( {}, CollisionLabConstants.PANEL_OPTIONS, options );

    const velocityCheckbox = new ControlPanelCheckbox(
      velocityString,
      viewProperties.velocityVisibleProperty,
      { rightIconNode: CollisionLabIconFactory.createVectorIcon( CollisionLabColors.VELOCITY_VECTOR_COLORS ) }
    );

    const momentumCheckbox = new ControlPanelCheckbox(
      momentumString,
      viewProperties.momentumVisibleProperty,
      { rightIconNode: CollisionLabIconFactory.createVectorIcon( CollisionLabColors.MOMENTUM_VECTOR_COLORS ) }
    );

    const centerOfMassCheckbox = new ControlPanelCheckbox(
      centerOfMassString,
      viewProperties.centerOfMassVisibleProperty,
      { rightIconNode: CollisionLabIconFactory.createCenterOfMassIcon() }
    );

    const kineticEnergyCheckbox = new ControlPanelCheckbox(
      kineticEnergyString,
      viewProperties.kineticEnergyVisibleProperty
    );

    const valuesCheckbox = new ControlPanelCheckbox(
      valuesString,
      viewProperties.valuesVisibleProperty
    );

    const pathCheckbox = new ControlPanelCheckbox(
      pathString,
      viewProperties.pathVisibleProperty
    );

    const reflectingBorderCheckbox = new ControlPanelCheckbox(
      reflectingBorderString,
      reflectingBorderProperty
    );

    const upperCheckboxes = new VBox( {
      children:
        [ velocityCheckbox, momentumCheckbox, centerOfMassCheckbox,
          kineticEnergyCheckbox, valuesCheckbox, pathCheckbox, reflectingBorderCheckbox ],
      align: 'left',
      spacing: 10
    } );

    const elasticityNumberControl = new NumberControl( elasticityString, elasticityPercentProperty, ELASTICITY_PERCENT_RANGE, {
      layoutFunction: NumberControl.createLayoutFunction4(),
      includeArrowButtons: false,
      sliderOptions: {
        majorTicks: [ {
          value: ELASTICITY_PERCENT_RANGE.min, label: new Text( inelasticString, { font: new PhetFont( 12 ) } )
        },
          {
            value: ELASTICITY_PERCENT_RANGE.max, label: new Text( elasticString, { font: new PhetFont( 12 ) } )
          } ],
        majorTickLength: 5,
        trackSize: new Dimension2( upperCheckboxes.width - 30, 1 ),
        thumbSize: new Dimension2( 10, 20 )
      },
      numberDisplayOptions: {
        valuePattern: elasticityPercentString,
        textOptions: {
          font: new PhetFont( 14 )
        }
      },
      titleNodeOptions: {
        font: new PhetFont( 16 ),
        maxWidth: 120
      }
    } );

    const stickText = new Text( stickString, { font: new PhetFont( 16 ) } );
    const slipText = new Text( slipString, { font: new PhetFont( 16 ) } );

    const stickSlipSwitch = new ABSwitch( isStickyProperty, true, stickText, false, slipText, {
      toggleSwitchOptions: { size: new Dimension2( 30, 15 ) }
    } );

    elasticityPercentProperty.link( elasticity => {
      const enabled = ( elasticity === 0 );
      stickSlipSwitch.opacity = enabled ? 1 : 0.5;
      stickSlipSwitch.pickable = enabled;
    } );


    const constantRadiusCheckbox = new ControlPanelCheckbox(
      constantSizeString,
      constantRadiusProperty
    );

    const separatingLine = new Line( 0, 0, upperCheckboxes.width, 0, { stroke: 'black' } );

    const panelContent = new Node();
    panelContent.setChildren( [ upperCheckboxes, separatingLine, constantRadiusCheckbox,
      elasticityNumberControl, stickSlipSwitch ] );

    separatingLine.top = upperCheckboxes.bottom + 5;
    elasticityNumberControl.top = separatingLine.bottom + 5;
    stickSlipSwitch.top = elasticityNumberControl.bottom + 5;
    constantRadiusCheckbox.top = stickSlipSwitch.bottom + 5;
    stickSlipSwitch.centerX = elasticityNumberControl.centerX;


    super( panelContent, options );
  }
}

collisionLab.register( 'CollisionLabControlPanel', CollisionLabControlPanel );
export default CollisionLabControlPanel;