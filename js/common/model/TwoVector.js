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
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    constructor( x, y ) {
      this.currentVector = new Vector2( x, y );
      this.lastVector = new Vector2( x, y );
    }//end of constructor


    clone() {
      return new TwoVector( this.currentVector.x, this.currentVector.y );
    }

    initializeXLastYLast() {
      this.lastVector = this.currentVector.copy();
    }

    getMagnitude() {
      return this.currentVector.magnitude;
    }

    getAngle() {
      return this.currentVector.angle;  //angle in radians
    }

    setX( x ) {
      this.currentVector.setX( x );
      this.lastVector.setX( x );
    }

    setY( y ) {

      this.currentVector.setY( y );
      this.lastVector.setY( y );

    }

    setXY( x, y ) {
      this.currentVector.set( x, y );
      this.lastVector.set( x, y );
    }

    flipVector() {
      this.currentVector.times( -1 );
    }

    getX() {
      return this.currentVector.x;
    }

    getY() {
      return this.currentVector.y;
    }

    getXLast() {
      return this.lastVector.x;
    }

    getYLast() {
      return this.lastVector.y;
    }

    setXLast( xLast ) {
      this.lastVector.x = xLast;
    }

    setYLast( yLast ) {
      this.lastVector.y = yLast;
    }
  }

  return collisionLab.register( 'TwoVector', TwoVector );
} );

