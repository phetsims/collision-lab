// Copyright 2020, University of Colorado Boulder

/**
 * Factory for creating the various icons that appear in the sim.
 *
 * ## Creates the following icons):
 *  - Ball Icons (BallValuesPanel)
 *  - Checkbox Icons
 *
 * NOTE: All floating numbers in this file were determined empirically and are tentative.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import XNode from './XNode.js';

const CollisionLabIconFactory = {

  /**
   * Creates a Ball icon that appears in the BallValuesPanel.
   * @public
   * @param {Ball} ball
   * @returns {Node}
   */
  createBallIcon( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    // Circle representation of the Ball.
    const ballCircle = new Circle( 10.5, {
      fill: CollisionLabColors.BALL_COLORS[ ball.index - 1 ],
      stroke: 'black'
    } );

    // Labels the index of the Ball
    const labelNode = new Text( ball.index, {
      font: new PhetFont( { size: 18, weight: 600 } ),
      center: ballCircle.center,
      stroke: 'black',
      fill: 'white'
    } );

    return new Node( { children: [ ballCircle, labelNode ] } );
  },

  //----------------------------------------------------------------------------------------

  /**
   * Creates a vector icon that points to the right, used with various checkboxes.
   * @public
   * @param {Object} [options]
   * @returns {Node}
   */
  createVectorIcon( options ) {

    options = merge( {}, CollisionLabConstants.ARROW_OPTIONS, {
      lineWidth: 1,
      length: 27
    }, options );

    return new ArrowNode( 0, 0, options.length, 0, options );
  },

  /**
   * Creates the center-of-mass icon, which is placed next to a checkbox to toggle the visibility of the center-of-mass.
   * @public
   * @param {Object} [options]
   * @returns {Node}
   */
  createCenterOfMassIcon( options ) {

    options = merge( {
      lineWidth: 1,
      length: 15,
      legThickness: 3.3
    }, options );

    return new XNode( options );
  }
};

collisionLab.register( 'CollisionLabIconFactory', CollisionLabIconFactory );
export default CollisionLabIconFactory;