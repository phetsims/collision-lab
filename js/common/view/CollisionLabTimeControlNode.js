// Copyright 2020-2022, University of Colorado Boulder

/**
 * CollisionLabTimeControlNode is a subclass of TimeControlNode, specialized for the 'Collision Lab' simulation.
 * Instances are positioned at the bottom-center of the PlayArea and appear in all screens.
 *
 * The CollisionLabTimeControlNode consists of:
 *   - Both step-forward and step-backward buttons.
 *   - Play-Pause Button
 *   - RadioButtons to control the speed of the simulation.
 *
 * Some functionality specific to 'Collision Lab':
 *  - The step-backward button is only enabled when the sim is paused, the elasticity is 100%, and the total
 *    elapsed-time isn't 0.
 *  - The entire TimeControlNode is disabled if the BallSystem is being user-controlled. See
 *    https://github.com/phetsims/collision-lab/issues/49.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class CollisionLabTimeControlNode extends TimeControlNode {

  /**
   * @param {Property.<boolean>} isPlayingProperty
   * @param {EnumerationProperty.<TimeSpeed>} timeSpeedProperty
   * @param {Property.<number>} elapsedTimeProperty
   * @param {ReadOnlyProperty.<boolean>} ballSystemUserControlledProperty
   * @param {Property.<number>} elasticityProperty
   * @param {Object} [options]
   */
  constructor( isPlayingProperty,
               timeSpeedProperty,
               elapsedTimeProperty,
               ballSystemUserControlledProperty,
               elasticityProperty,
               options ) {
    assert && AssertUtils.assertPropertyOf( isPlayingProperty, 'boolean' );
    assert && assert( timeSpeedProperty instanceof EnumerationProperty );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );
    assert && AssertUtils.assertAbstractPropertyOf( ballSystemUserControlledProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( elasticityProperty, 'number' );

    options = merge( {
      speedRadioButtonGroupOptions: {
        spacing: 5,
        labelOptions: {
          font: new PhetFont( 13 ),
          maxWidth: 120
        }
      },
      playPauseStepButtonOptions: {
        includeStepBackwardButton: true
      },
      buttonGroupXSpacing: 20
    }, options );

    //----------------------------------------------------------------------------------------

    assert && assert( !options.timeSpeedProperty, 'CollisionLabTimeControlNode sets options.timeSpeedProperty' );
    assert && assert( !options.enabledProperty, 'CollisionLabTimeControlNode sets options.enabledProperty' );
    assert && assert( !options.playPauseStepButtonOptions.stepBackwardButtonOptions.enabledProperty, 'CollisionLabTimeControlNode sets stepBackwardButtonOptions.enabledProperty' );

    // Set options that cannot be overridden.
    options.timeSpeedProperty = timeSpeedProperty;

    // The step-backward button is only enabled when the sim is paused, the elasticity is 100%, and the total elapsed
    // time isn't 0. There isn't any support to provide a custom enabledProperty to step-buttons. So, we use a
    // a workaround. See https://github.com/phetsims/scenery-phet/issues/606 and
    // https://github.com/phetsims/collision-lab/issues/66. DerivedProperty never disposed since
    // CollisionLabTimeControlNode persists for the lifetime of simulation.
    options.playPauseStepButtonOptions.stepBackwardButtonOptions.enabledProperty = new DerivedProperty(
      [ isPlayingProperty, elapsedTimeProperty, elasticityProperty ], ( isPlaying, elapsedTime, elasticity ) => {
        return !isPlaying && elapsedTime > 0 && elasticity === CollisionLabConstants.ELASTICITY_PERCENT_RANGE.max;
      }, {
        valueType: 'boolean'
      } );

    // The entire TimeControlNode is disabled if the BallSystem is being user-controlled. See
    // https://github.com/phetsims/collision-lab/issues/49. DerivedProperty never disposed since
    // CollisionLabTimeControlNode persists for the lifetime of simulation.
    options.enabledProperty = new DerivedProperty( [ ballSystemUserControlledProperty ],
      ballSystemUserControlled => !ballSystemUserControlled, {
        valueType: 'boolean'
      } );

    super( isPlayingProperty, options );
  }
}

collisionLab.register( 'CollisionLabTimeControlNode', CollisionLabTimeControlNode );
export default CollisionLabTimeControlNode;