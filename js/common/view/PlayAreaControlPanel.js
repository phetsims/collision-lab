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
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const XPath = require( 'COLLISION_LAB/common/view/XPath' );

  // strings
  const centerOfMassString = require( 'string!COLLISION_LAB/centerOfMass' );
  const constantRadiusString = require( 'string!COLLISION_LAB/constantRadius' );
  const kineticEnergyString = require( 'string!COLLISION_LAB/kineticEnergy' );
  const momentumString = require( 'string!COLLISION_LAB/momentum' );
  const pathString = require( 'string!COLLISION_LAB/path' );
  const reflectingBorderString = require( 'string!COLLISION_LAB/reflectingBorder' );
  const valuesString = require( 'string!COLLISION_LAB/values' );
  const velocityString = require( 'string!COLLISION_LAB/velocity' );

  class PlayAreaControlPanel extends Panel {

    constructor( viewProperties, reflectingBorderProperty, elasticityProperty, constantRadiusProperty, options ) {

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
        { rightIconNode: new XPath( { lineWidth: 1, sideLength: 15, legThickness: 4 } ) }
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

      const constantRadiusCheckbox = new ControlPanelCheckbox(
        constantRadiusString,
        constantRadiusProperty
      );

      const panelcontent = new Node();
      panelcontent.addChild( upperCheckboxes );
      panelcontent.addChild( constantRadiusCheckbox );
      constantRadiusCheckbox.top = upperCheckboxes.bottom;

      super( panelcontent, options );


    }
  }

  return collisionLab.register( 'PlayAreaControlPanel', PlayAreaControlPanel );
} );