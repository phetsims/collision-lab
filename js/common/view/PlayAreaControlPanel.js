// Copyright 2019, University of Colorado Boulder

/**
 * View for the center of mass marker, appears on the play area
 *
 * @author Alex Schor
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const XPath = require( 'COLLISION_LAB/common/view/XPath' );
  const ControlPanelCheckbox = require( 'COLLISION_LAB/common/view/ControlPanelCheckbox' );
  const Panel = require( 'SUN/Panel' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );

  // strings
  const velocityString = require( 'string!COLLISION_LAB/velocity' );
  const momentumString = require( 'string!COLLISION_LAB/momentum' );
  const centerOfMassString = require( 'string!COLLISION_LAB/centerOfMass' );

  class PlayAreaControlPanel extends Panel {

    constructor( viewProperties, reflectingBorderProperty, elasticityProperty, constantRadiusProperty, options ) {

      const panelContent = new VBox( {
        align: 'left',
        spacing: 10
      } );

      const velocityCheckbox = new ControlPanelCheckbox(
        velocityString,
        viewProperties.velocityVisibleProperty,
        { rightIcon: new ArrowNode( 0, 0, 40, 0 ) }
      );

      panelContent.addChild( velocityCheckbox );

      const momentumCheckbox = new ControlPanelCheckbox(
        momentumString,
        viewProperties.momentumVisibleProperty,
        { rightIcon: new ArrowNode( 0, 0, 40, 0 ) }
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