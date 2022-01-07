// Copyright 2019-2022, University of Colorado Boulder

/**
 * PlayArea is the model for the main container of colliding Balls in the 'collision lab' simulation. It is a
 * sub-model of the top-level model of each screen and has a ideal friction-less surface with rigid borders. The origin
 * is at the center, and its bounds never changes.
 *
 * PlayArea is mainly responsible for:
 *   - Handling the different Bounds of PlayAreas in each screen.
 *   - Handling and referencing the different dimension of each screen.
 *   - PlayArea-related Properties, such as Grid visibility and Reflecting Border.
 *   - Keeping track of the elasticity of collisions.
 *   - Convenience methods related to the PlayArea.
 *
 * PlayAreas are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from './Ball.js';

// constants
const ELASTICITY_PERCENT_RANGE = CollisionLabConstants.ELASTICITY_PERCENT_RANGE;
const EPSILON = CollisionLabConstants.ZERO_THRESHOLD;

class PlayArea {

  /**
   * @param {PlayArea.Dimension} dimension - the dimensions of the PlayArea (1D vs 2D).
   * @param {Object} [options]
   */
  constructor( dimension, options ) {
    assert && assert( PlayArea.Dimension.includes( dimension ), `invalid dimension: ${dimension}` );

    options = merge( {

      // {Bounds2} - the model bounds of the PlayArea, in meters.
      bounds: PlayArea.DEFAULT_BOUNDS,

      // {boolean} - indicates if the Grid is visible initially (and after resetting).
      isGridVisibleInitially: false,

      // {boolean} - indicates if the PlayArea's borders reflect initially (and after resetting).
      reflectingBorderInitially: true,

      // {number} - the initial elasticity of the PlayArea (and after resetting), as a percentage.
      initialElasticityPercent: ELASTICITY_PERCENT_RANGE.max

    }, options );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Bounds2} - the bounds of the PlayArea, in meters.
    this.bounds = options.bounds;

    // @public (read-only) {PlayArea.Dimension} - the dimensions of the PlayArea (1D vs 2D).
    this.dimension = dimension;

    // @public {Property.<boolean>} - indicates if the Balls reflect at the Border of the PlayArea bounds. This Property
    //                             is manipulated in the view.
    this.reflectingBorderProperty = new BooleanProperty( options.reflectingBorderInitially );

    // @public {Property.<boolean>} - indicates if the grid of the PlayArea is visible. This is placed inside of the model
    //                             since the visibility of the grid affects the drag-snapping of Balls.
    this.gridVisibleProperty = new BooleanProperty( options.isGridVisibleInitially );

    // @public {Property.<number>} - Property of the elasticity of all collisions in the PlayArea, as a percentage. See
    //                            https://en.wikipedia.org/wiki/Coefficient_of_restitution for background.
    this.elasticityPercentProperty = new NumberProperty( options.initialElasticityPercent, {
      range: ELASTICITY_PERCENT_RANGE
    } );
  }

  /**
   * Resets the PlayArea.
   * @public
   *
   * Called when the reset-all button is pressed.
   */
  reset() {
    this.reflectingBorderProperty.reset();
    this.gridVisibleProperty.reset();
    this.elasticityPercentProperty.reset();
  }

  //----------------------------------------------------------------------------------------

  /**
   * Convenience method to get the elasticity of all collisions, as a DECIMAL.
   * @public
   *
   * @returns {number}
   */
  getElasticity() {
    return this.elasticityPercentProperty.value / 100;
  }

  /**
   * Gets the width of the PlayArea, in meters.
   * @public
   *
   * @returns {number} - in meters.
   */
  get width() {
    return this.bounds.width;
  }

  /**
   * Gets the height of the PlayArea, in meters.
   * @public
   *
   * @returns {number} - in meters.
   */
  get height() {
    return this.bounds.height;
  }

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

  //----------------------------------------------------------------------------------------

  /**
   * Determines whether the PlayArea FULLY contains all parts of a Ball within its Bounds.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  fullyContainsBall( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    return ball.left >= this.left &&
           ball.right <= this.right &&
           ball.bottom >= this.bottom &&
           ball.top <= this.top;
  }

  /**
   * Determines whether the PlayArea contains ANY part of the Ball within its Bounds.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  containsAnyPartOfBall( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    return ball.right > this.left &&
           ball.left < this.right &&
           ball.top > this.bottom &&
           ball.bottom < this.top;
  }

  /**
   * Determines whether a respective side of a Ball is tangentially touching the corresponding side of the PlayArea.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  isBallTouchingTop( ball ) { return Utils.equalsEpsilon( ball.top, this.top, EPSILON ); } // @public

  isBallTouchingLeft( ball ) { return Utils.equalsEpsilon( ball.left, this.left, EPSILON ); } // @public

  isBallTouchingRight( ball ) { return Utils.equalsEpsilon( ball.right, this.right, EPSILON ); } // @public

  isBallTouchingBottom( ball ) { return Utils.equalsEpsilon( ball.bottom, this.bottom, EPSILON ); } // @public

  /**
   * Determines whether any side of a Ball is tangentially touching any side of the PlayArea from the inside.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  isBallTouchingSide( ball ) {
    return this.isBallTouchingTop( ball ) ||
           this.isBallTouchingBottom( ball ) ||
           this.isBallTouchingLeft( ball ) ||
           this.isBallTouchingRight( ball );
  }
}

// @public (read-only) {Bounds2} - the default bounds of the PlayArea.
PlayArea.DEFAULT_BOUNDS = new Bounds2( -2, -1, 2, 1 );

// @public (read-only) {EnumerationDeprecated} - Enumeration of the possible 'dimension' of a PlayArea.
PlayArea.Dimension = EnumerationDeprecated.byKeys( [ 'ONE', 'TWO' ] );

collisionLab.register( 'PlayArea', PlayArea );
export default PlayArea;