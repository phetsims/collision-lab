// Copyright 2019, University of Colorado Boulder

/**
 * Utility class for Vector
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const Vector2 = require( 'DOT/Vector2' );

  /**
   * @constructor
   */
  class TwoVector {
    /**
     * @param {number} x - X component
     * @param {number} y - Y component
     */
    constructor( x, y ) {

      // @private
      this.currentVector = new Vector2( x, y );

      // @private
      this.oldVector = new Vector2( x, y );
    }

    /**
     * Returns the current vector
     * @returns {TwoVector}
     */
    clone() {
      return new TwoVector( this.currentVector.x, this.currentVector.y );
    }

    /**
     * Sets the old vector to be a copy of the current vector
     */
    initializeXOldYOld() {
      this.oldVector = this.currentVector.copy();
    }

    /**
     * Gets the magnitude of the vector
     * @returns {number}
     */
    getMagnitude() {
      return this.currentVector.magnitude;
    }

    /**
     * Gets the angle of the vector in radians
     * @returns {number}
     */
    getAngle() {
      return this.currentVector.angle;  //angle in radians
    }

    /**
     * Sets the x components of the vector and oldVector
     * @param {number} x
     */
    setX( x ) {
      this.currentVector.setX( x );
      this.oldVector.setX( x );
    }

    /**
     * Sets the y component of the vector and oldVector
     * @param {number} y
     */
    setY( y ) {
      this.currentVector.setY( y );
      this.oldVector.setY( y );
    }

    /**
     * Sets the components of the vector and oldVector
     * @param {number} x - x component
     * @param {number} y - y component
     */
    setXY( x, y ) {
      this.currentVector.set( x, y );
      this.oldVector.set( x, y );
    }

    /**
     * Flips the vector
     */
    flipVector() {
      this.currentVector.times( -1 );
    }

    /**
     * Gets the x component of the vector
     * @returns {number}
     */
    getX() {
      return this.currentVector.x;
    }

    /**
     * Gets the y component of the vector
     * @returns {number}
     */
    getY() {
      return this.currentVector.y;
    }

    /**
     * Gets the x component of the old vector
     * @returns {number}
     */
    getXOld() {
      return this.oldVector.x;
    }

    /**
     * Gets the y component of the old vector
     * @returns {number}
     */
    getYOld() {
      return this.oldVector.y;
    }

    /**
     * Sets the x component of the old vector
     * @param {number} xOld
     */
    setXOld( xOld ) {
      this.oldVector.x = xOld;
    }

    /**
     * Sets the y component of the old vector
     * @param {number} yOld
     */
    setYOld( yOld ) {
      this.oldVector.y = yOld;
    }
  }

  return collisionLab.register( 'TwoVector', TwoVector );
} );