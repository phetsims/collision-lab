// Copyright 2019-2020, University of Colorado Boulder

/**
 * Control Panel at the upper-right corner of each screen that allows the user to manipulate certain Properties of
 * the simulation.
 *
 * All screens have a control-panel in the same location with similar components. However, some components vary for
 * specific screens. This includes (which appear in some screens, not in other screens):
 *    - stick vs slip ABSwitch
 *    - change in momentum Checkbox
 *    - path Checkbox
 *    - reflecting border Checkbox
 *
 * Since many screens have similar control-panels, this was implemented to work generally for all screens, but can be
 * subclassed to add extra components that are specific to a screen. It also contains an options API to un-include
 * components that are normally common to all screens.
 *
 * @author Brandon Li
 * @author Alex Schor
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Color from '../../../../scenery/js/util/Color.js';
import HSeparator from '../../../../sun/js/HSeparator.js';
import Panel from '../../../../sun/js/Panel.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import InelasticCollisionTypes from '../model/InelasticCollisionTypes.js';
import CollisionLabCheckbox from './CollisionLabCheckbox.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';
import CollisionLabViewProperties from './CollisionLabViewProperties.js';
import ElasticityControlSet from './ElasticityControlSet.js';

class CollisionLabControlPanel extends Panel {

  /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} pathVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<InelasticCollisionTypes>} inelasticCollisionTypeProperty
   * @param {Property.<boolean>} ballsConstantSizeProperty
   * @param {Object} [options]
   */
  constructor( viewProperties,
               centerOfMassVisibleProperty,
               pathVisibleProperty,
               reflectingBorderProperty,
               elasticityPercentProperty,
               inelasticCollisionTypeProperty,
               ballsConstantSizeProperty,
               options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( pathVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( reflectingBorderProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( elasticityPercentProperty, 'number' );
    assert && AssertUtils.assertProperty( inelasticCollisionTypeProperty, inelasticCollisionType => InelasticCollisionTypes.includes( inelasticCollisionType ) );
    assert && AssertUtils.assertPropertyOf( ballsConstantSizeProperty, 'boolean' );

    options = merge( {}, CollisionLabConstants.PANEL_OPTIONS, {

      // {number} - the spacing between the content Nodes of the Panel
      contentSpacing: 7,

       // {boolean} - indicates if the reflecting border checkbox is included.
      includeReflectingBorderCheckbox: true,

      // {boolean} - indicates if the 'Path' checkbox is included.
      includePathCheckbox: true,

      // {Object} - passed to the ElasticityControlSet
      elasticityControlSetNodeOptions: null

    }, options );

    // Make the panel a fixed width.
    assert && assert( options.minWidth === undefined, 'CollisionLabControlPanel sets minWidth' );
    assert && assert( options.maxWidth === undefined, 'CollisionLabControlPanel sets maxWidth' );
    const panelWidth = CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH + 2 * options.xMargin;
    options.minWidth = panelWidth;
    options.maxWidth = panelWidth;

    //----------------------------------------------------------------------------------------

    // Create the content Node of the Control Panel.
    const contentNode = new VBox( { spacing: options.contentSpacing } );
    super( contentNode, options );

    // @protected {Node} - the content Node. This is referenced for layouting purposes in sub-classes.
    this.contentNode = contentNode;

    //----------------------------------------------------------------------------------------

    // 'Velocity' visibility Checkbox
    const velocityCheckbox = new CollisionLabCheckbox( viewProperties.velocityVectorVisibleProperty,
      collisionLabStrings.velocity, {
        icon: CollisionLabIconFactory.createVectorIcon( CollisionLabColors.VELOCITY_VECTOR_COLORS )
      } );

    // 'Momentum' visibility Checkbox
    const momentumCheckbox = new CollisionLabCheckbox( viewProperties.momentumVectorVisibleProperty,
      collisionLabStrings.momentum, {
        icon: CollisionLabIconFactory.createVectorIcon( CollisionLabColors.MOMENTUM_VECTOR_COLORS )
      } );

    // @protected {Checkbox} - 'Center of Mass' visibility Checkbox. This is referenced for ordering in sub-classes.
    this.centerOfMassCheckbox = new CollisionLabCheckbox( centerOfMassVisibleProperty,
      collisionLabStrings.centerOfMass, {
        icon: CollisionLabIconFactory.createCenterOfMassIcon()
      } );

    // 'Kinetic Energy' visibility Checkbox
    const kineticEnergyCheckbox = new CollisionLabCheckbox( viewProperties.kineticEnergyVisibleProperty,
      collisionLabStrings.kineticEnergy
    );

    // 'Values' visibility Checkbox. This is referenced for ordering in sub-classes.
    const valuesCheckbox = new CollisionLabCheckbox( viewProperties.valuesVisibleProperty, collisionLabStrings.values );

    // 'Elasticity' control
    const elasticityControlSetNode = new ElasticityControlSet(
      elasticityPercentProperty,
      inelasticCollisionTypeProperty,
      options.elasticityControlSetNodeOptions );

    // 'Constant Radius' Checkbox
    const constantRadiusCheckbox = new CollisionLabCheckbox( ballsConstantSizeProperty, collisionLabStrings.constantSize );

    // HSeparator
    const hSeparator = new HSeparator( CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH, { stroke: Color.BLACK } );

    //----------------------------------------------------------------------------------------

    // Set the children of the content in the correct order.
    contentNode.children = [
      velocityCheckbox,
      momentumCheckbox,
      this.centerOfMassCheckbox,
      kineticEnergyCheckbox,
      valuesCheckbox
    ];

    // Add the reflecting border Checkbox if it is included.
    if ( options.includeReflectingBorderCheckbox ) {

      // 'Reflecting Border' Checkbox
      const reflectingBorderCheckbox = new CollisionLabCheckbox( reflectingBorderProperty,
        collisionLabStrings.reflectingBorder );

      // Add the Reflecting Border Checkbox after the values Checkbox.
      contentNode.addChild( reflectingBorderCheckbox );
    }

    // Add the path Checkbox if it is included.
    if ( options.includePathCheckbox ) {


      // Create the 'Path' visibility Checkbox.
      const pathCheckbox = new CollisionLabCheckbox( pathVisibleProperty, collisionLabStrings.path );

      // Add the 'Path' Checkbox after the 'Values' Checkbox.
      contentNode.addChild( pathCheckbox );
    }

    contentNode.addChild( hSeparator );
    contentNode.addChild( elasticityControlSetNode );
    contentNode.addChild( constantRadiusCheckbox );


    // Apply additional Bounds mutators.
    this.mutate( options );
  }
}

collisionLab.register( 'CollisionLabControlPanel', CollisionLabControlPanel );
export default CollisionLabControlPanel;