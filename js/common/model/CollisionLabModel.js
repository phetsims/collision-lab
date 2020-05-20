// Copyright 2019-2020, University of Colorado Boulder

/**
 * Root class (to be subclassed) for the top-level model of every screen.
 *
 * Mainly responsible for:
 *   - Time Control Properties and stepping the simulation.
 *   - Keep track of the top-level user-manipulation Properties, like the number of Balls or the elasticity.
 *   - Instantiation of a single PlayArea.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import PlayArea from './PlayArea.js';
import TimeClock from './TimeClock.js';

class CollisionLabModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    // @public (read-only) {BooleanProperty} - indicates the play/pause state of the simulation.
    this.playProperty = new BooleanProperty( false );

    // @public (read-only) {EnumerationProperty.<TimeSpeed>} - indicates the speed rate of the simulation.
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed, TimeSpeed.NORMAL );

    // @public (read-only) {TimeClock} - stopwatch for the simulation.
    this.timeClock = new TimeClock( this.timeSpeedProperty );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {NumberProperty} - Property of the number of Balls in a system. This Property is manipulated
    //                                        outside of the PlayArea in a Spinner.
    this.numberOfBallsProperty = new NumberProperty( 2 );

    // @public (read-only) {NumberProperty} - Property of the elasticity of all collisions, as a percentage. See
    //                                        https://en.wikipedia.org/wiki/Coefficient_of_restitution for background.
    this.elasticityPercentProperty = new NumberProperty( 100, { range: CollisionLabConstants.ELASTICITY_PERCENT_RANGE } );

    // @public (read-only) {BooleanProperty} - indicates if the Balls reflect at the Border of the PlayArea bounds.
    //                                         This Property is manipulated outside of the PlayArea.
    this.reflectingBorderProperty = new BooleanProperty( true );

    // @public (read-only) {BooleanProperty} - indicates if Ball radii are constant (i.e. independent of mass).
    //                                         This Property is manipulated outside of the PlayArea.
    this.constantRadiusProperty = new BooleanProperty( false );

    // @public (read-only) {BooleanProperty} - indicates if the grid of the PlayArea is visible. This Property is
    //                                         manipulated outside of the PlayArea. This is placed inside of the model
    //                                         since the visibility of the grid affects the drag-snapping of Balls.
    this.gridVisibleProperty = new BooleanProperty( false );

    // @public (read-only) {BooleanProperty} - determines if the balls are sticky or if they slide on inelastic collisions.
    // TODO: this should be an EnumerationProperty of a Enum (stick vs slide).
    // TODO: what is the state of the design of this feature.
    this.isStickyProperty = new BooleanProperty( true );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {PlayArea} - create the PlayArea of the screen.
    this.playArea = new PlayArea(
      this.numberOfBallsProperty,
      this.elasticityPercentProperty,
      this.reflectingBorderProperty,
      this.constantRadiusProperty,
      this.gridVisibleProperty,
      this.isStickyProperty
    );
  }

  /**
   * Resets the model
   * @public
   */
  reset() {
    this.playProperty.reset();
    this.timeSpeedProperty.reset();
    this.timeClock.reset();
    this.numberOfBallsProperty.reset();
    this.elasticityPercentProperty.reset();
    this.reflectingBorderProperty.reset();
    this.constantRadiusProperty.reset();
    this.gridVisibleProperty.reset();
    this.isStickyProperty.reset();
    this.playArea.reset();
  }

  /**
   * Steps the model forward in time
   * @public
   * @param {number} dt
   */
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    if ( this.playProperty.value && !this.playArea.playAreaUserControlledProperty.value ) {
      const ellapsedTime = dt * this.timeClock.speedFactorProperty.value;

      this.timeClock.step( ellapsedTime );
      this.playArea.step( ellapsedTime );
    }
  }
}

collisionLab.register( 'CollisionLabModel', CollisionLabModel );
export default CollisionLabModel;