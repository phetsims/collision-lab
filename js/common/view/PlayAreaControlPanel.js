// Copyright 2019, University of Colorado Boulder

/**
 * View for the control panel of the play area
 *
 * @author Alex Schor
 */

define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const ControlPanelCheckbox = require( 'COLLISION_LAB/common/view/ControlPanelCheckbox' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Line = require( 'SCENERY/nodes/Line' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Range = require( 'DOT/Range' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const XNode = require( 'COLLISION_LAB/common/view/XNode' );

  // constants
  const ELASTICITY_PERCENT_RANGE = new Range( 0, 100 );

  // strings
  const centerOfMassString = require( 'string!COLLISION_LAB/centerOfMass' );
  const constantSizeString = require( 'string!COLLISION_LAB/constantSize' );
  const elasticityPercentString = require( 'string!COLLISION_LAB/elasticityPercent' );
  const elasticityString = require( 'string!COLLISION_LAB/elasticity' );
  const elasticString = require( 'string!COLLISION_LAB/elastic' );
  const inelasticString = require( 'string!COLLISION_LAB/inelastic' );
  const kineticEnergyString = require( 'string!COLLISION_LAB/kineticEnergy' );
  const momentumString = require( 'string!COLLISION_LAB/momentum' );
  const pathString = require( 'string!COLLISION_LAB/path' );
  const reflectingBorderString = require( 'string!COLLISION_LAB/reflectingBorder' );
  const valuesString = require( 'string!COLLISION_LAB/values' );
  const velocityString = require( 'string!COLLISION_LAB/velocity' );

  class PlayAreaControlPanel extends Panel {

    /**
     * @param {CollisionLabViewProperties} viewProperties
     * @param {Property.<boolean>} reflectingBorderProperty
     * @param {Property.<number>} elasticityPercentProperty
     * @param {Property.<boolean>} constantRadiusProperty
     * @param {Object} [options]
     */
    constructor( viewProperties,
                 reflectingBorderProperty,
                 elasticityPercentProperty,
                 constantRadiusProperty,
                 options ) {

      options = merge( CollisionLabColors.PANEL_COLORS, options );

      const velocityCheckbox = new ControlPanelCheckbox(
        velocityString,
        viewProperties.velocityVisibleProperty,
        { rightIconNode: new ArrowNode( 0, 0, 40, 0, CollisionLabColors.VELOCITY_VECTOR_COLORS ) }
      );

      const momentumCheckbox = new ControlPanelCheckbox(
        momentumString,
        viewProperties.momentumVisibleProperty,
        { rightIconNode: new ArrowNode( 0, 0, 40, 0, CollisionLabColors.MOMENTUM_VECTOR_COLORS ) }
      );

      const centerOfMassCheckbox = new ControlPanelCheckbox(
        centerOfMassString,
        viewProperties.centerOfMassVisibleProperty,
        { rightIconNode: new XNode( { lineWidth: 1, sideLength: 15, legThickness: 4 } ) }
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
          [velocityCheckbox, momentumCheckbox, centerOfMassCheckbox,
            kineticEnergyCheckbox, valuesCheckbox, pathCheckbox, reflectingBorderCheckbox],
        align: 'left',
        spacing: 10
      } );

      const elasticityNumberControl = new NumberControl( elasticityString, elasticityPercentProperty, ELASTICITY_PERCENT_RANGE, {
        layoutFunction: NumberControl.createLayoutFunction4(),
        includeArrowButtons: false,
        sliderOptions: {
          majorTicks: [{
            value: ELASTICITY_PERCENT_RANGE.min, label: new Text( inelasticString, { font: new PhetFont( 12 ) } )
          },
            {
              value: ELASTICITY_PERCENT_RANGE.max, label: new Text( elasticString, { font: new PhetFont( 12 ) } )
            }],
          majorTickLength: 5,
          trackSize: new Dimension2( upperCheckboxes.width - 30, 1 ),
          thumbSize: new Dimension2( 10, 20 )
        },
        numberDisplayOptions: {
          valuePattern: elasticityPercentString,
          font: new PhetFont( 14 )
        },
        titleNodeOptions: {
          font: new PhetFont( 16 ),
          maxWidth: 120
        }
      } );

      const constantRadiusCheckbox = new ControlPanelCheckbox(
        constantSizeString,
        constantRadiusProperty
      );

      const separatingLine = new Line( 0, 0, upperCheckboxes.width, 0, { stroke: 'black' } );

      const panelContent = new Node();
      panelContent.setChildren( [upperCheckboxes, separatingLine, constantRadiusCheckbox,
        elasticityNumberControl] );

      separatingLine.top = upperCheckboxes.bottom + 5;
      elasticityNumberControl.top = separatingLine.bottom + 5;
      constantRadiusCheckbox.top = elasticityNumberControl.bottom + 5;

      super( panelContent, options );
    }
  }

  return collisionLab.register( 'PlayAreaControlPanel', PlayAreaControlPanel );
} );