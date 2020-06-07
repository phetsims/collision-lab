// Copyright 2019-2020, University of Colorado Boulder

/**
 * PlayArea is the model for the main container of colliding Balls in the 'collision lab' simulation. It is a
 * sub-model of the top-level model of each screen. The origin is at the center.
 *
 * PlayArea is mainly responsible for:
 *   - Handling the different Bounds of PlayAreas in each screen.
 *   - Handling and referencing the different dimensions of each screen.
 *   - PlayArea-related Properties, such as Grid visibility and Reflecting Border.
 *   - Convenience methods related to the PlayArea.
 *
 * PlayAreas are created at the start of the sim and is never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from './Ball.js';
import InelasticCollisionTypes from './InelasticCollisionTypes.js';

class PlayArea {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );
    assert && assert( !options || !options.dimensions || options.dimensions === 1 || options.dimensions === 2 );
    assert && assert( !options || !options.bounds || options.bounds instanceof Bounds2 );

    options = merge( {

      // {number} - the dimensions of the PlayArea. Must be either 1 or 2.
      dimensions: 2,

      // {Bounds2} - the model bounds of the PlayArea, in meters.
      bounds: PlayArea.DEFAULT_BOUNDS,

      // {boolean} - indicates if the Grid is visible initially.
      isGridVisibleInitially: false

    }, options );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Bounds2} - the model bounds of the PlayArea, in meters.
    this.bounds = options.bounds;

    // @public (read-only) {number} - the dimensions of the PlayArea.
    this.dimensions = options.dimensions;

    // @public {BooleanProperty} - indicates if the Balls reflect at the Border of the PlayArea bounds. This Property
    //                             is manipulated in the view.
    this.reflectingBorderProperty = new BooleanProperty( true );

    // @public {BooleanProperty} - indicates if the grid of the PlayArea is visible. This is placed inside of the model
    //                             since the visibility of the grid affects the drag-snapping of Balls.
    this.gridVisibleProperty = new BooleanProperty( options.isGridVisibleInitially );

    //----------------------------------------------------------------------------------------

    // @public {NumberProperty} - Property of the elasticity of all collisions in the PlayArea, as a percentage. See
    //                            https://en.wikipedia.org/wiki/Coefficient_of_restitution for background.
    this.elasticityPercentProperty = new NumberProperty( CollisionLabConstants.ELASTICITY_PERCENT_RANGE.defaultValue, {
      range: CollisionLabConstants.ELASTICITY_PERCENT_RANGE
    } );

    // @public {EnumerationProperty.<InelasticCollisionTypes} - the type of collision for perfectly inelastic collisions
    this.inelasticCollisionTypeProperty = new EnumerationProperty( InelasticCollisionTypes,
      InelasticCollisionTypes.SLIP );
  }

  /**
   * Resets the PlayArea. Called when the reset-all button is pressed.
   * @public
   */
  reset() {
    this.reflectingBorderProperty.reset();
    this.gridVisibleProperty.reset();
    this.elasticityPercentProperty.reset();
    this.inelasticCollisionTypeProperty.reset();
  }

  //----------------------------------------------------------------------------------------

  /**
   * Gets a boolean that indicates if its border reflects Balls or not.
   * @public
   *
   * @returns {boolean}
   */
  get reflectsBorder() { return this.reflectingBorderProperty.value; }

  /**
   * Convenience method to get the elasticity of all collisions, as a DECIMAL.
   * @public
   *
   * @returns {number}
   */
  get elasticity() { return this.elasticityPercentProperty.value / 100; }

  /**
   * Convenience method to get the inelastic collision type.
   * @public
   *
   * @returns {InelasticCollisionTypes}
   */
  get inelasticCollisionType() { return this.inelasticCollisionTypeProperty.value; }

  //----------------------------------------------------------------------------------------

  /**
   * Gets the width of the PlayArea, in meters.
   * @public
   *
   * @returns {number} - in meters.
   */
  get width() { return this.bounds.width; }

  /**
   * Gets the height of the PlayArea, in meters.
   * @public
   *
   * @returns {number} - in meters.
   */
  get height() { return this.bounds.height; }

  /**
   * ES5 Getters for the location of the edges of the PlayArea, in meters.
   * Bounds2 has similar getters, but uses a view coordinate frame, where 'top' is minY and 'bottom' is maxY.
   * Instead, this uses the traditional model coordinate frame.
   * @public
   *
   * @returns {number} - in meters.
   */
  get left() { return this.bounds.minX; }
  get right() { return this.bounds.maxX; }
  get bottom() { return this.bounds.minY; }
  get top() { return this.bounds.maxY; }
  get leftTop() { return new Vector2( this.left, this.top ); }

  //----------------------------------------------------------------------------------------

  /**
   * Determines whether the Ball is fully contained horizontally within the PlayArea Bounds.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  fullyContainsBallHorizontally( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    return ball.left >= this.left && ball.right <= this.right;
  }

  /**
   * Determines whether the Ball is fully contained vertically within the PlayArea Bounds.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  fullyContainsBallVertically( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    return ball.bottom >= this.bottom && ball.top <= this.top;
  }

  /**
   * Determines whether the PlayArea fully contains a Ball within its Bounds.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  fullyContainsBall( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    return this.fullyContainsBallHorizontally( ball ) && this.fullyContainsBallVertically( ball );
  }

  /**
   * Determines whether the PlayArea contains any part of the Ball within its Bounds.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  containsAnyPartOfBall( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    return this.bounds.dilated( ball.radius ).containsPoint( ball.position );
  }
}

// @public (read-only) {Bounds2} - the default bounds of the PlayArea
PlayArea.DEFAULT_BOUNDS = new Bounds2( -2, -1, 2, 1 );

collisionLab.register( 'PlayArea', PlayArea );
export default PlayArea;