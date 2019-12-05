// Copyright 2019, University of Colorado Boulder

/**
 * View for the center of mass marker, appears on the play area
 *
 * @author Alex Schor
 */

define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const CenterOfMass = require( 'COLLISION_LAB/common/model/CenterOfMass' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );
  const XPath = require( 'COLLISION_LAB/common/view/XPath' );

  class CenterOfMassNode extends Node {
    /**
     *
     * @param {CenterOfMass} centerOfMass
     * @param {Property.<boolean>} centerOfMassVisibleProperty
     * @param {Property.<number>} numberOfBallsProperty
     * @param {ModelViewTransform2} modelViewTransform
     */
    constructor( centerOfMass, centerOfMassVisibleProperty, numberOfBallsProperty, modelViewTransform ) {

      assert && assert( centerOfMass instanceof CenterOfMass, `Invalid centerOfMass: ${centerOfMass}` );
      assert && assert( centerOfMassVisibleProperty instanceof BooleanProperty,
        `Invalid centerOfMassVisibleProperty: ${centerOfMassVisibleProperty}` );
      assert && assert( numberOfBallsProperty instanceof NumberProperty,
        `Invalid numberOfBallsProperty: ${numberOfBallsProperty}` );
      assert && assert( modelViewTransform instanceof ModelViewTransform2 );
      //----------------------------------------------------------------------------------------
      super();

      const xPath = new XPath();
      this.addChild( xPath );

      // Link the position of the marker to the center of mass property
      // This link is present for the lifetime of the simulation
      centerOfMass.positionProperty.link( position => {
        this.center = modelViewTransform.modelToViewPosition( position );
      } );


      // Link the visibility of the marker to the visibility property and the number of balls (the marker is only
      // present if number of balls >= 2)
      // The link is present for the lifetime of the simulation
      Property.multilink( [centerOfMassVisibleProperty, numberOfBallsProperty, centerOfMass.isDefinedProperty],
        ( centerOfMassVisible, numberOfBalls, isDefined ) => {
          this.visible = ( numberOfBalls > 1 ) && centerOfMassVisible && isDefined;
        } );


    }
  }

  return collisionLab.register( 'CenterOfMassNode', CenterOfMassNode );
} );