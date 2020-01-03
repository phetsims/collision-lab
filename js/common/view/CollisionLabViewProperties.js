// Copyright 2019, University of Colorado Boulder

/**
 * View-specific Properties for the sim. Can be subclassed to add more Properties.
 *
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );

  class CollisionLabViewProperties {

    constructor() {

      // @public indicates if the velocity vector on each ball is visible
      this.velocityVisibleProperty = new BooleanProperty( false );

      // @public indicates if the momentum vector on each ball is visible
      this.momentumVisibleProperty = new BooleanProperty( false );

      // @public indicates if the center of mass is visible
      this.centerOfMassVisibleProperty = new BooleanProperty( false );

      // @public controls the visibility of the kinetic energy numberDisplay
      this.kineticEnergyVisibleProperty = new BooleanProperty( false );

      // @public indicates if the labels for the velocity and momentum are present on each ball
      this.valuesVisibleProperty = new BooleanProperty( false );

      // @public indicates if the path (trajectory) of each ball is visible
      this.pathVisibleProperty = new BooleanProperty( false );

      // @public indicates if the grid of the play area is visible
      this.gridVisibleProperty = new BooleanProperty( false );

      // @public indicates if the momenta diagram is expanded.
      this.momentaDiagramExpandedProperty = new BooleanProperty( false );

      // @public indicates if the momenta are arranged tip to tail in the momenta diagram
      this.tipToTailProperty = new BooleanProperty( false );

      // @public indicates if the more Data panel is visible
      this.moreDataVisibleProperty = new BooleanProperty( false );
    }

    /**
     * Resets the view properties
     * @public
     */
    reset() {
      this.velocityVisibleProperty.reset();
      this.momentumVisibleProperty.reset();
      this.centerOfMassVisibleProperty.reset();
      this.kineticEnergyVisibleProperty.reset();
      this.valuesVisibleProperty.reset();
      this.pathVisibleProperty.reset();
      this.gridVisibleProperty.reset();
      this.momentaDiagramExpandedProperty.reset();
      this.tipToTailProperty.reset();
    }

    /**
     * @public
     */
    dispose() {
      assert && assert( false, 'CollisionLabViewProperties are not intended to be disposed' );
    }
  }

  return collisionLab.register( 'CollisionLabViewProperties', CollisionLabViewProperties );
} );