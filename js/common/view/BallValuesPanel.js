// Copyright 2019-2020, University of Colorado Boulder

/**
 * BallValuesPanel is the Panel at the bottom of all screen which displays and allows the user to modify Ball values.
 *
 *
 *
 * The Panel first
 * For each Ball in the PlayArea, this Panel displays it's values, which is a BallValuesEntryNode.
 *
 * This panel exists for the entire sim and is never disposed.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import merge from '../../../../phet-core/js/merge.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Panel from '../../../../sun/js/Panel.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import Ball from '../model/Ball.js';
import BallValuesEntryNode from './BallValuesEntryNode.js';

// const Text = require( '/scenery/js/nodes/Text' );

// strings
// const momentumUnitString = require( 'string!COLLISION_LAB/momentumUnit' );
// const positionUnitString = require( 'string!COLLISION_LAB/positionUnit' );
// const velocityUnitString = require( 'string!COLLISION_LAB/velocityUnit' );
// const massUnitString = require( 'string!COLLISION_LAB/massUnit' );

class BallValuesPanel extends Panel {

  /**
   * @param {ObservableArray.<Ball>} balls - collections of particles inside the container
   * @param {Property.<boolean>} moreDataProperty - Property that indicates if the "More Data" checkbox is checked.
   * @param {Object} [options]
   */
  constructor( balls, moreDataProperty, keypad, options ) {

    assert && assert( balls instanceof ObservableArray
    && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
    assert && assert( moreDataProperty instanceof BooleanProperty, `invalid moreDataProperty: ${moreDataProperty}` );


    options = merge( {}, CollisionLabColors.PANEL_COLORS, {
      xMargin: 16,
      yMargin: 12,
      cornerRadius: 7
    }, options );

    const panelContent = new VBox( { spacing: 6 } );

    // const massText = new Text( massUnitString, options.text);
    // const positionText = new Text( positionUnitString, textOptions);
    // const velocityText = new Text( velocityUnitString, textOptions);
    // const momentumText = new Text( momentumUnitString, textOptions);

    super( panelContent, options );

    const addItemAddedBallListener = addedBall => {

      const addedBallEntryNode = new BallValuesEntryNode( addedBall, moreDataProperty, keypad );
      panelContent.addChild( addedBallEntryNode );

      // Observe when the ball is removed to unlink listeners
      const removeBallListener = removedBall => {
        if ( removedBall === addedBall ) {
          panelContent.removeChild( addedBallEntryNode );
          addedBallEntryNode.dispose();
          balls.removeItemRemovedListener( removeBallListener );
        }
      };
      balls.addItemRemovedListener( removeBallListener );
    };

    balls.addItemAddedListener( addItemAddedBallListener );
    balls.forEach( addItemAddedBallListener );
  }
}

collisionLab.register( 'BallValuesPanel', BallValuesPanel );
export default BallValuesPanel;