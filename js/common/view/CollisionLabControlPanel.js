// Copyright 2019-2020, University of Colorado Boulder

/**
 * Control Panel at the upper-right corner of each screen that allows the user to manipulate certain Properties of
 * the simulation. It exists for the lifetime of the sim and is not intended to be disposed.
 *
 * @author Brandon Li
 * @author Alex Schor
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import AlignGroup from '../../../../scenery/js/nodes/AlignGroup.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Color from '../../../../scenery/js/util/Color.js';
import HSeparator from '../../../../sun/js/HSeparator.js';
import Panel from '../../../../sun/js/Panel.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabCheckbox from './CollisionLabCheckbox.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';
import CollisionLabViewProperties from './CollisionLabViewProperties.js';
import ElasticityControlSetNode from './ElasticityControlSetNode.js';

class CollisionLabControlPanel extends Panel {

  /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<boolean>} isStickyProperty
   * @param {Property.<boolean>} constantRadiusProperty
   * @param {Object} [options]
   */
  constructor( viewProperties,
               reflectingBorderProperty,
               elasticityPercentProperty,
               isStickyProperty,
               constantRadiusProperty,
               options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && assert( reflectingBorderProperty instanceof Property && typeof reflectingBorderProperty.value === 'boolean', `invalid reflectingBorderProperty: ${reflectingBorderProperty}` );
    assert && assert( elasticityPercentProperty instanceof Property && typeof elasticityPercentProperty.value === 'number', `invalid elasticityPercentProperty: ${elasticityPercentProperty}` );
    assert && assert( isStickyProperty instanceof Property && typeof isStickyProperty.value === 'boolean', `invalid isStickyProperty: ${isStickyProperty}` );
    assert && assert( constantRadiusProperty instanceof Property && typeof constantRadiusProperty.value === 'boolean', `invalid constantRadiusProperty: ${constantRadiusProperty}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {}, CollisionLabConstants.PANEL_OPTIONS, {

      contentSpacing: 5 // {number} - the spacing between the content Nodes of the Panel

    }, options );

    // Make the panel a fixed width.
    assert && assert( options.minWidth === undefined, 'CollisionLabControlPanel sets minWidth' );
    assert && assert( options.maxWidth === undefined, 'CollisionLabControlPanel sets maxWidth' );
    const panelWidth = CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH + 2 * options.xMargin;
    options.minWidth = panelWidth;
    options.maxWidth = panelWidth;

    //----------------------------------------------------------------------------------------

    // 'Velocity' visibility Checkbox
    const velocityCheckbox = new CollisionLabCheckbox( viewProperties.velocityVisibleProperty,
      collisionLabStrings.velocity, {
        icon: CollisionLabIconFactory.createVectorIcon( CollisionLabColors.VELOCITY_VECTOR_COLORS )
      } );

    // 'Momentum' visibility Checkbox
    const momentumCheckbox = new CollisionLabCheckbox( viewProperties.momentumVisibleProperty,
      collisionLabStrings.momentum, {
        icon: CollisionLabIconFactory.createVectorIcon( CollisionLabColors.MOMENTUM_VECTOR_COLORS )
      } );

    // 'Center of Mass' visibility Checkbox
    const centerOfMassCheckbox = new CollisionLabCheckbox( viewProperties.centerOfMassVisibleProperty,
      collisionLabStrings.centerOfMass, {
      icon: CollisionLabIconFactory.createCenterOfMassIcon()
    } );

    // 'Kinetic Energy' visibility Checkbox
    const kineticEnergyCheckbox = new CollisionLabCheckbox( viewProperties.kineticEnergyVisibleProperty,
      collisionLabStrings.kineticEnergy
    );

    // 'Values' visibility Checkbox
    const valuesCheckbox = new CollisionLabCheckbox( viewProperties.valuesVisibleProperty, collisionLabStrings.values );

    // 'Path' visibility Checkbox
    const pathCheckbox = new CollisionLabCheckbox( viewProperties.pathVisibleProperty, collisionLabStrings.path );

    // 'Reflecting Border' Checkbox
    const reflectingBorderCheckbox = new CollisionLabCheckbox( reflectingBorderProperty,
      collisionLabStrings.reflectingBorder );

    // 'Elasticity' control
    const elasticityControlSetNode = new ElasticityControlSetNode( elasticityPercentProperty, isStickyProperty );

    // 'Constant Radius' Checkbox
    const constantRadiusCheckbox = new CollisionLabCheckbox( constantRadiusProperty, collisionLabStrings.constantSize );

    //----------------------------------------------------------------------------------------

    // Create an AlignGroups for the Checkboxes so that they are all the same height.
    const checkboxAlignGroup = new AlignGroup( { matchHorizontal: false, matchVertical: true } );

    // Create the content Node of the Panel
    const contentNode = new VBox( {
      spacing: options.contentSpacing,
      children: [
        checkboxAlignGroup.createBox( velocityCheckbox ),
        checkboxAlignGroup.createBox( momentumCheckbox ),
        checkboxAlignGroup.createBox( centerOfMassCheckbox ),
        checkboxAlignGroup.createBox( kineticEnergyCheckbox ),
        checkboxAlignGroup.createBox( valuesCheckbox ),
        checkboxAlignGroup.createBox( pathCheckbox ),
        checkboxAlignGroup.createBox( reflectingBorderCheckbox ),
        new HSeparator( CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH, { stroke: Color.BLACK } ),
        elasticityControlSetNode,
        checkboxAlignGroup.createBox( constantRadiusCheckbox )
      ]
    } );

    super( contentNode, options );
  }
}

collisionLab.register( 'CollisionLabControlPanel', CollisionLabControlPanel );
export default CollisionLabControlPanel;