// Copyright 2019-2020, University of Colorado Boulder

/**
 * Root class (to be subclassed) for the top-level model of every screen.
 *
 * Mainly responsible for:
 *   -
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
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

    // @public (read-only) {NumberProperty} - Property of the number of Balls in a system. This Property is manipulated
    //                                        outside of the PlayArea in a Spinner.
    this.numberOfBallsProperty = new NumberProperty( 2 );

    // @public (read-only) {NumberProperty} - Property of the elasticity of all collisions, as a percentage. See
    //                                        https://en.wikipedia.org/wiki/Coefficient_of_restitution for background.
    this.elasticityPercentProperty = new NumberProperty( 100, { range: CollisionLabConstants.ELASTICITY_PERCENT_RANGE } );



    // @public - controls the play/pause state of the play area
    this.playProperty = new BooleanProperty( true );

    // @public {EnumerationProperty.<TimeSpeed>} - controls the speed rate of the simulation, slow/normal
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed, TimeSpeed.NORMAL );

    // @public - timeClock for the simulation
    this.timeClock = new TimeClock( this.timeSpeedProperty );

    // @public - handle the playArea (ballistic motion and collision of balls)
    this.playArea = new PlayArea( this.elasticityPercentProperty, this.numberOfBallsProperty );


    // @public - is the any of the balls in the play areas not user controlled
    this.playAreaFreeProperty = new DerivedProperty( [ this.playArea.playAreaUserControlledProperty ],
      playAreaIsUserControlled => !playAreaIsUserControlled );


    // add a time stepping function to the timeClock
    this.timeClock.addTimeStepper( ( dt, isReversing ) => this.playArea.step( dt, isReversing ) );
  }

  /**
   * Resets the model
   * @public
   */
  reset() {
    this.playProperty.reset();
    this.timeSpeedProperty.reset();
    this.playArea.reset();
    this.timeClock.reset();
    this.elasticityPercentProperty.reset();
    this.numberOfBallsProperty.reset();
  }

  /**
   * Steps the model forward in time
   * @public
   * @param {number} dt
   */
  step( dt ) {

    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    if ( this.playProperty.value && this.playAreaFreeProperty.value ) {
      this.timeClock.playStep( dt * this.timeClock.speedFactorProperty.value );
    }
  }

}


collisionLab.register( 'CollisionLabModel', CollisionLabModel );
export default CollisionLabModel;