// Copyright 2019-2020, University of Colorado Boulder

/**
 * Factory for creating the various icons that appear in the sim.
 *
 * ## Creates the following icons):
 *  - Ball Icons (BallValuesPanel)
 *
 * NOTE: All floating numbers in this file were determined empirically and are tentative.
 *
 * @author Brandon Li
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import Ball from '../model/Ball.js';

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
    const ballCircle = new Circle( 10, {
      fill: CollisionLabColors.BALL_COLORS[ ball.index - 1 ],
      stroke: 'black'
    } );

    // Labels the index of the Ball
    const labelNode = new Text( ball.index, {
      font: new PhetFont( 18 ),
      center: ballCircle.center,
      stroke: 'black',
      fill: 'white'
    } );

    return new Node( { children: [ ballCircle, labelNode ] } );
  }
};

collisionLab.register( 'CollisionLabIconFactory', CollisionLabIconFactory );
export default CollisionLabIconFactory;