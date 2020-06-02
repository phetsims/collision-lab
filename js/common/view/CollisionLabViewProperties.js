// Copyright 2019-2020, University of Colorado Boulder

/**
 * View-specific Properties for the sim. Can be subclassed to add more Properties.
 *
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import collisionLab from '../../collisionLab.js';

class CollisionLabViewProperties {

  constructor() {

    // @public indicates if the velocity vector on each ball is visible
    this.velocityVectorVisibleProperty = new BooleanProperty( true );

    // @public indicates if the momentum vector on each ball is visible
    this.momentumVectorVisibleProperty = new BooleanProperty( false );

    // @public controls the visibility of the kinetic energy numberDisplay
    this.kineticEnergyVisibleProperty = new BooleanProperty( false );

    // @public indicates if the labels for the velocity and momentum are present on each ball
    this.valuesVisibleProperty = new BooleanProperty( false );

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
    this.velocityVectorVisibleProperty.reset();
    this.momentumVectorVisibleProperty.reset();
    this.kineticEnergyVisibleProperty.reset();
    this.valuesVisibleProperty.reset();
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

collisionLab.register( 'CollisionLabViewProperties', CollisionLabViewProperties );
export default CollisionLabViewProperties;