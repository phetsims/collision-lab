// Copyright 2019-2020, University of Colorado Boulder

/**
 * BallValuesPanel is the Panel at the bottom of the screen.
 *
 * For each Ball in the PlayArea, this Panel displays it's values, which are:
 *    - Mass (kg)
 *    - The position of the Ball
 *    - The velocity of the Ball
 *    - The linear momentum of the Ball
 * Depending on if the "More Data" checkbox is checked or not, some of these values may be hidden.
 *
 * This panel exists for the entire sim and is never disposed.
 *
 * @author Brandon Li
 */

define( require => {
  'use strict';

  // modules
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const Node = require( 'SCENERY/nodes/Node' );
  // const Text = require( 'SCENERY/nodes/Text' );
  const merge = require( 'PHET_CORE/merge' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const Panel = require( 'SUN/Panel' );
  const MoreDataBallEntry = require( 'COLLISION_LAB/common/view/MoreDataBallEntry' );

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
    constructor( balls, moreDataProperty, options ) {

      assert && assert( balls instanceof ObservableArray
      && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
      assert && assert( moreDataProperty instanceof BooleanProperty, `invalid moreDataProperty: ${moreDataProperty}` );

      options = merge( CollisionLabColors.PANEL_COLORS, options );

      const panelContent = new Node();

      // const massText = new Text( massUnitString, options.text);
      // const positionText = new Text( positionUnitString, textOptions);
      // const velocityText = new Text( velocityUnitString, textOptions);
      // const momentumText = new Text( momentumUnitString, textOptions);

      super( panelContent, options );

      const addItemAddedBallListener = addedBall => {

        const addedBallEntryNode = new MoreDataBallEntry( addedBall, moreDataProperty );
        panelContent.addChild( addedBallEntryNode );
        addedBallEntryNode.bottom = addedBallEntryNode.height * 1.1 * addedBall.index;

        // Observe when the ball is removed to unlink listeners
        const removeBallListener = removedBall => {
          if ( removedBall === addedBall ) {
            panelContent.removeChild( addedBallEntryNode );
            balls.removeItemRemovedListener( removeBallListener );
          }
        };
        balls.addItemRemovedListener( removeBallListener );
      };

      balls.addItemAddedListener( addItemAddedBallListener );
      balls.forEach( addItemAddedBallListener );
    }
  }

  return collisionLab.register( 'BallValuesPanel', BallValuesPanel );
} );