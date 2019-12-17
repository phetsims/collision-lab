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
  const Panel = require( 'SUN/Panel' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const XPath = require( 'COLLISION_LAB/common/view/XPath' );

  // strings
  const centerOfMassString = require( 'string!COLLISION_LAB/centerOfMass' );
  const momentumString = require( 'string!COLLISION_LAB/momentum' );
  const velocityString = require( 'string!COLLISION_LAB/velocity' );

  class PlayAreaControlPanel extends Panel {

    constructor( viewProperties, reflectingBorderProperty, elasticityProperty, constantRadiusProperty, options ) {

      options = merge( CollisionLabColors.PANEL_COLORS, options );


      const panelContent = new VBox( {
        align: 'left',
        spacing: 10
      } );

      const velocityCheckbox = new ControlPanelCheckbox(
        velocityString,
        viewProperties.velocityVisibleProperty,
        { rightIcon: new ArrowNode( 0, 0, 40, 0, CollisionLabColors.VELOCITY_VECTOR_COLORS ) }
      );

      panelContent.addChild( velocityCheckbox );

      const momentumCheckbox = new ControlPanelCheckbox(
        momentumString,
        viewProperties.momentumVisibleProperty,
        { rightIcon: new ArrowNode( 0, 0, 40, 0, CollisionLabColors.MOMENTUM_VECTOR_COLORS ) }
      );

      panelContent.addChild( momentumCheckbox );

      const centerOfMassCheckbox = new ControlPanelCheckbox(
        centerOfMassString,
        viewProperties.centerOfMassVisibleProperty,
        {
          rightIcon: new XPath( {
            lineWidth: 1,
            sideLength: 15,
            legThickness: 4
          } )
        }
      );

      panelContent.addChild( centerOfMassCheckbox );


      super( panelContent, options );


    }
  }

  return collisionLab.register( 'PlayAreaControlPanel', PlayAreaControlPanel );
} );