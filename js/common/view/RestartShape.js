// Copyright 2020, University of Colorado Boulder

/**
 * Shape used to indicate the arc of a circle with an arrow (anticlockwise), used on RestartButton.
 * Origin is at the center of the circle.
 *
 * @author Martin Veillette
 */

import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';

class RestartShape extends Shape {

  /**
   * @param {Object} [options]
   * @constructor
   */
  constructor( options ) {

    options = merge( {
      outerRadius: 9,
      arrowWidth: 3,
      headWidthFactor: 3,
      startAngle: Math.PI * 0.9,
      arrowheadAngularSpan: -Math.PI * 0.35,
      endToNeckAngularSpan: -2 * Math.PI * 0.70
    }, options );

    super();

    // Adjust these parameters to tweak the appearance of the arrow.
    const INNER_RADIUS = options.outerRadius - options.arrowWidth;
    const OUTER_RADIUS = options.outerRadius;
    const HEAD_WIDTH = options.headWidthFactor * ( options.arrowWidth );
    const START_ANGLE = options.startAngle;
    const END_TO_NECK_ANGULAR_SPAN = options.endToNeckAngularSpan;
    const ARROW_HEAD_ANGULAR_SPAN = options.arrowheadAngularSpan;

    // Create the curved arrow shape, starting at the inside of the non-pointed end.
    // Inner edge of end.
    this.moveTo( INNER_RADIUS * Math.cos( START_ANGLE ), INNER_RADIUS * Math.sin( START_ANGLE ) );
    this.lineTo( OUTER_RADIUS * Math.cos( START_ANGLE ), OUTER_RADIUS * Math.sin( START_ANGLE ) );
    const neckAngle = START_ANGLE + END_TO_NECK_ANGULAR_SPAN;

    // Outer curve.
    this.arc( 0, 0, OUTER_RADIUS, START_ANGLE, neckAngle, true );
    const HEAD_WIDTHExtrusion = ( HEAD_WIDTH - ( OUTER_RADIUS - INNER_RADIUS ) ) / 2;
    this.lineTo(
      ( OUTER_RADIUS + HEAD_WIDTHExtrusion ) * Math.cos( neckAngle ),
      ( OUTER_RADIUS + HEAD_WIDTHExtrusion ) * Math.sin( neckAngle ) );

    // Tip of arrowhead.
    const pointRadius = ( OUTER_RADIUS + INNER_RADIUS ) * 0.7; // Tweaked a little from center for better look.
    this.lineTo(
      pointRadius * Math.cos( neckAngle + ARROW_HEAD_ANGULAR_SPAN ),
      pointRadius * Math.sin( neckAngle + ARROW_HEAD_ANGULAR_SPAN ) );
    this.lineTo(
      ( INNER_RADIUS - HEAD_WIDTHExtrusion ) * Math.cos( neckAngle ),
      ( INNER_RADIUS - HEAD_WIDTHExtrusion ) * Math.sin( neckAngle ) );
    this.lineTo(
      INNER_RADIUS * Math.cos( neckAngle ),
      INNER_RADIUS * Math.sin( neckAngle ) );

    // Inner curve.
    this.arc( 0, 0, INNER_RADIUS, neckAngle, START_ANGLE );
    this.close();

  }
}

collisionLab.register( 'RestartShape', RestartShape );
export default RestartShape;