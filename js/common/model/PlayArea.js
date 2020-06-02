// Copyright 2019-2020, University of Colorado Boulder

/**
 * PlayArea is the model for the main area of colliding Balls in the 'collision lab' simulation. It is a sub-model of
 * the top-level model of each screen.
 *
 * PlayArea is mainly responsible for:
 *   - Handling Bounds, dimensions, and range differences between Screens.
 *   - Creating a BallSystem.
 *   - Creating all possible Balls in prepopulatedBalls.
 *   - Keeping track of the number of Balls within the PlayArea system.
 *   - Tracking if there are any Balls that are being controlled by the user.
 *   - Visibility of Paths
 *   - Constant Size, Grid visibility, Elasticity, Reflecting Border, and other PlayArea-specific Properties.
 *
 * PlayAreas are created at the start of the sim and is never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from './Ball.js';
import BallState from './BallState.js';
import BallSystem from './BallSystem.js';
import InelasticCollisionTypes from './InelasticCollisionTypes.js';

class PlayArea {

  /**
   * @param {BallState[]} initialBallStates - the initial BallStates of ALL possible Balls in the system.
   * @param {Object} [options]
   */
  constructor( initialBallStates, options ) {

    options = merge( {

      // {number} - the dimensions of the PlayArea. Must be either 1 or 2.
      dimensions: 2,

      // {RangeWithValue} - the range of the number of Balls in the PlayArea.
      numberOfBallsRange: new RangeWithValue( 1, 5, 2 ),

      // {Bounds2} - the model bounds of the PlayArea, in meters.
      bounds: PlayArea.DEFAULT_BOUNDS

    }, options );

    assert && assert( CollisionLabUtils.consistsOf( initialBallStates, BallState ), `invalid initialBallStates: ${ initialBallStates }` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );
    assert && assert( options.dimensions === 1 || options.dimensions === 2, `invalid dimensions: ${options.dimensions}` );
    assert && assert( options.numberOfBallsRange instanceof RangeWithValue, `invalid numberOfBallsRange: ${options.numberOfBallsRange}` );
    assert && assert( options.bounds instanceof Bounds2, `invalid bounds: ${options.bounds}` );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Bounds2} - the model bounds of the PlayArea, in meters.
    this.bounds = options.bounds;

    // @public (read-only) {number} - the dimensions of the PlayArea.
    this.dimensions = options.dimensions;

    // @public (read-only) {RangeWithValue} - the range of the number of Balls in the BallSystem.
    this.numberOfBallsRange = options.numberOfBallsRange;

    //----------------------------------------------------------------------------------------

    // @public {NumberProperty} - Property of the number of Balls in the PlayArea. This Property is manipulated
    //                            externally in the view.
    this.numberOfBallsProperty = new NumberProperty( options.numberOfBallsRange.defaultValue, {
      numberType: 'Integer',
      range: options.numberOfBallsRange
    } );

    // @public {NumberProperty} - Property of the elasticity of all collisions, as a percentage. See
    //                            https://en.wikipedia.org/wiki/Coefficient_of_restitution for background.
    this.elasticityPercentProperty = new NumberProperty( CollisionLabConstants.ELASTICITY_PERCENT_RANGE.defaultValue, {
      range: CollisionLabConstants.ELASTICITY_PERCENT_RANGE
    } );

    // @public {EnumerationProperty.<InelasticCollisionTypes} - the type of collision for perfectly inelastic collisions
    this.inelasticCollisionTypeProperty = new EnumerationProperty( InelasticCollisionTypes,
      InelasticCollisionTypes.STICK );

    //----------------------------------------------------------------------------------------

    // @public {BooleanProperty} - indicates if the Ball/COM trailing paths are visible. In the model since Ball
    //                             PathDataPoints are only recorded if this is true and are cleared when set to false.
    this.pathVisibleProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - indicates if the center of mass is visible. This is in the model since CenterOfMass
    //                             PathDataPoints are only recorded if this is true and are cleared when set to false.
    this.centerOfMassVisibleProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - indicates if the Balls reflect at the Border of the PlayArea bounds. This Property
    //                             is manipulated in the view.
    this.reflectingBorderProperty = new BooleanProperty( true );

    // @public {BooleanProperty} - indicates if Ball radii are constant (ie. independent of mass). This Property
    //                             is manipulated in the view.
    this.isConstantSizeProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - indicates if the grid of the PlayArea is visible. This is placed inside of the model
    //                             since the visibility of the grid affects the drag-snapping of Balls.
    this.gridVisibleProperty = new BooleanProperty( false );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Balls[]} - an array of all possible balls. Balls are created at the start of the Simulation
    //                                 and are never disposed. However, these Balls are NOT necessarily the Balls
    //                                 currently within the BallSystem. This is just used so that the same Ball
    //                                 instances are added with the same number of balls.
    this.prepopulatedBalls = initialBallStates.map( ( ballState, index ) => new Ball(
      ballState,
      this.isConstantSizeProperty,
      this.gridVisibleProperty,
      this.pathVisibleProperty,
      index + 1, {
        dimensions: options.dimensions,
        bounds: options.bounds
      } ) );

    // @public (read-only) {BallSystem} - the system of Balls inside of the PlayArea
    this.ballSystem = new BallSystem(
      this.prepopulatedBalls,
      this.numberOfBallsProperty,
      this.bounds,
      this.pathVisibleProperty,
      this.centerOfMassVisibleProperty
    );

    //----------------------------------------------------------------------------------------

    // @public {DerivedProperty.<boolean>} - indicates if there are any Balls that are being controlled by the user. Use
    //                                       the userControlledProperty of all possible Balls as dependencies to update
    //                                       but only the balls in the play-area are used in the calculation.
    this.playAreaUserControlledProperty = new DerivedProperty(
      this.prepopulatedBalls.map( ball => ball.userControlledProperty ),
      () => this.ballSystem.balls.some( ball => ball.userControlledProperty.value ), {
        valueType: 'boolean'
      } );

    // Observe when the user is finished controlling any of the Balls to clear the trailing Path of the CenterOfMass.
    // See https://github.com/phetsims/collision-lab/issues/61#issuecomment-634404105. Link lasts for the life-time of
    // the sim as PlayAreas are never disposed.
    this.playAreaUserControlledProperty.lazyLink( playAreaUserControlled => {
      !playAreaUserControlled && this.ballSystem.clearCenterOfMassPath();
    } );
  }

  /**
   * Resets the PlayArea. Called when the reset-all button is pressed.
   * @public
   */
  reset() {
    this.numberOfBallsProperty.reset();
    this.elasticityPercentProperty.reset();
    this.inelasticCollisionTypeProperty.reset();
    this.pathVisibleProperty.reset();
    this.centerOfMassVisibleProperty.reset();
    this.reflectingBorderProperty.reset();
    this.isConstantSizeProperty.reset();
    this.gridVisibleProperty.reset();
    this.prepopulatedBalls.forEach( ball => ball.reset() ); // Reset All Possible Balls.
    this.ballSystem.reset();
  }

  /**
   * Steps the PlayArea.
   * @public
   *
   * @param {number} dt - in seconds
   * @param {number} elapsedTime - the total elapsed time of the simulation, in seconds.
   */
  step( dt, elapsedTime ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    // Step the Balls in the system only.
    this.ballSystem.step( dt );

    // Update the Paths inside the BallPaths only if paths are visible.
    if ( this.pathVisibleProperty.value ) {
      this.ballSystem.updatePaths( elapsedTime );
    }
  }
}

// @public (read-only) {Bounds2} - the default bounds of the PlayArea
PlayArea.DEFAULT_BOUNDS = new Bounds2( -2, -1, 2, 1 );

collisionLab.register( 'PlayArea', PlayArea );
export default PlayArea;