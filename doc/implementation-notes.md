# Collision Lab - implementation notes

This document contains notes related to the implementation of Collision Lab. This is not an exhaustive description of the implementation. The intention is to provide a high-level overview and to supplement the internal documentation (source code comments) and external documentation (design documents).  

Before reading this document, you are encouraged to read:
* [model.md](https://github.com/phetsims/collision-lab/blob/master/doc/model.md), a high-level description of the simulation model
* [PhET Development Overview](https://github.com/phetsims/phet-info/blob/master/doc/phet-development-overview.md)  
* [PhET Software Design Patterns](https://github.com/phetsims/phet-info/blob/master/doc/phet-software-design-patterns.md)
* [Collision Lab HTML5](https://docs.google.com/document/d/1FwMnpv8LyMZfMYPcASYhI2jtgCXyWrgAjTOx3Po_MsE/), the design document

## Terminology

This section defines terminology that you'll see used throughout the internal and external documentation. Skim this section once, and refer back to it as you explore the implementation.

Much of the terminology for this sim is identified by labels that are visible in the user interface (Center of Mass, Path, Momenta Diagram, Change in Momentum, ...) and those terms are not included here.

* _play area_ - the main viewing box of the Balls
* _ball system_ - the complete collection of balls, inside and outside the play area
* _collision engine_ - the main physics engine of the simulation
* _ball values panel_ - the panel at the bottom of each screen, which displays and allows to user to manipulate the Properties of the Balls that are in the system.
* _inelastic collision type_ - refers to which type of perfectly inelastic collision, see [InelasticCollisionType](../js/inelastic/model/InelasticCollisionType.js)
* _inelastic preset_ - refers to a preset for the 'Inelastic screen', see [InelasticPreset](../js/inelastic/model/InelasticPreset.js)

## General Considerations

This section describes how this simulation addresses implementation considerations that are typically encountered in PhET simulations.

**Coordinate Transforms**: The model coordinate frame is in meters (m), with +x right, +y up. The standard (scenery) view coordinate frame has +x right, +y down. Thus, Collision Lab uses a [ModelViewTransform2](https://github.com/phetsims/phetcommon/blob/master/js/view/ModelViewTransform2.js) scaling transformation that inverts the y-axis.

**Query Parameters**: Query parameters are used to enable sim-specific features, mainly for debugging and testing. Sim-specific query parameters are documented in [CollisionLabQueryParameters](../js/common/CollisionLabQueryParameters.js).

**Assertions**: The implementation makes heavy use of `assert` to verify pre/post assumptions and perform type checking. This sim performs type-checking for almost all function arguments via `assert`. If you are making modifications to this sim, do so with assertions enabled via the `?ea` query parameter.

**Memory Management**: The only dynamically allocated objects in the simulation are [PathDataPoint](../js/common/model/PathDataPoint.js), [BallState](../js/common/model/BallState.js), [Collision](../js/common/model/Collision.js), and [RotatingBallCluster](../js/inelastic/model/RotatingBallCluster.js). However, none of these data structures hold onto any [Properties](https://github.com/phetsims/axon/blob/master/js/Property.js) or listeners, so simply un-referencing them will allow the garbage collector to free the memory.

Otherwise, there are no dynamically allocated objects in the simulation. The same Ball objects (both model and view) are used with the same number of Balls, meaning Balls are created at the start of the sim and persist for the lifetime of the sim. See [BallSystem](../js/common/model/BallSystem.js) for details.

For the view, the simulation takes advantage of this and creates scenery [Nodes](https://github.com/phetsims/scenery/blob/master/js/nodes/Node.js) that represent each Ball (for the [Ball Values Panel](../js/common/view/BallValuesPanel.js), [Paths](../js/common/view/PathsNode.js), [BallNodes](../js/common/view/BallNode.js), etc.), regardless of whether or not the Ball is currently visible and adjusts visibility based on whether or not it is in the system. There is no performance loss since Balls not in the system are not stepped or updated. 

Thus, all observer/observable relationships exist for the lifetime of the sim, so there is no need to call the various memory-management functions associated with these objects (`unlink`, `dispose`, `removeListener`, etc.).

## Class Overview

### Common to all screens

This section describes the **main** classes that are common to multiple screens. You'll find these classes in `js/common/`.

#### Model

[CollisionLabModel](../js/common/model/CollisionLabModel.js) is the model base class for all screens. It is responsible for instantiating sub-models common to all screens.

[PlayArea](../js/common/model/PlayArea.js) is the main viewing box of the Balls.

[Ball](../js/common/model/Ball.js) is the model for the Balls that appear in the sim.

[CollisionEngine](../js/common/model/CollisionEngine.js) implements collision detection and responses of Balls for all screens. Reference the [Collision Implementation](implementation-notes.md#collision-implementation) section.

[BallSystem](../js/common/model/BallSystem.js) is the class that instantiates pre-populated Balls and tracks the number of Balls and which Balls that are in the "system."

#### View

[CollisionLabViewProperties](../js/common/view/CollisionLabViewProperties.js) a collection of boolean AXON Properties, mostly for visibility, that applies to all screens.

[CollisionLabScreenView](../js/common/view/CollisionLabScreenView.js) is the base `ScreenView` for all screens. 

[PlayAreaNode](../js/common/view/PlayAreaNode.js) is the PlayArea view for all screens.

[BallNode](../js/common/view/BallNode.js) is the view associated with each Ball.

[BallSystemNode](../js/common/view/BallSystemNode.js) is the view associated with each BallSystem. In particular, it is responsible for creating each BallNode and layering them.

### Screen-specific classes

All screens have screen-specific classes to account for the described [screen differences](https://github.com/phetsims/collision-lab/blob/master/model.md).

The top-level classes ([CollisionLabModel](../js/common/model/CollisionLabModel.js) and [CollisionBallScreenView](../js/common/view/CollisionBallScreenView.js)) use the [Factory Method Pattern](https://en.wikipedia.org/wiki/Factory_method_pattern) to allow screens to specify and provide screen-specific sub-classes while still allowing the base-classes to handle the instance.

Commonly sub-typed classes are [BallSystem](../js/common/model/BallSystem.js), [PlayArea](../js/common/model/PlayArea.js), [CollisionEngine](../js/common/model/CollisionEngine.js), [BallSystemNode](../js/common/view/BallSystemNode.js), and [CollisionLabControlPanel](../js/common/view/CollisionLabControlPanel.js).

### Inelastic Screen

The _Inelastic_ screen introduces many components and behaviors that are unique to it, as described in the [model description](https://github.com/phetsims/collision-lab/blob/master/model.md).

[InelasticCollisionType](../js/inelastic/model/InelasticCollisionType.js) is an Enumeration of the different types of perfectly inelastic collisions ("Stick" vs "Slip").

[InelasticCollisionEngine](../js/inelastic/model/InelasticCollisionEngine.js) implements collision detection and responses for perfectly inelastic collisions that "stick." Most notably, it handles rotations of Ball clusters. Reference the [Collision Implementation](https://github.com/phetsims/collision-lab/blob/master/doc/implementation-notes.md#collision-implementation).

[InelasticPreset](../js/inelastic/model/InelasticPreset.js) is a rich Enumeration which maps to a `PresetValue` that sets the states of the Balls. The different _presets_ are visible in the [PresetRadioButtonGroup](../js/inelastic/view/PresetRadioButtonGroup.js).

## Collision Implementation

The motion of Balls is based on the fact that they are under-going uniform-motion. Every type of collision is detected *before* the collision occurs to avoid tunneling scenarios where Balls would pass through each other with sufficiently high velocities and/or time-steps

On each time-step, every combination of physical bodies is encapsulated in a [Collision](../js/common/model/Collision.js) data structure instance, along with if and when these respective bodies will collide. These [Collision](../js/common/model/Collision.js) instances are saved to optimize the number of redundant collision-detection checks. On successive time-steps, [Collision](../js/common/model/Collision.js) instances are only created for ball-ball and ball-border combinations that haven't already been created. [Collision](../js/common/model/Collision.js) instances are removed when a collision is handled or some other state in the simulation changes.

The algorithm for detecting ball-ball collisions is described fully in https://github.com/phetsims/collision-lab/blob/master/doc/algorithms/ball-to-ball-collision-detection.md.

Then, after [Collisions](../js/common/model/Collision) have been created for every ball-ball and ball-border combination, we check if any of the saved collisions that have associated collision times are in between the previous and current step, meaning a collision will occur in this time-step. To fully ensure that collisions are simulated correctly — even with extremely high time-steps — only the earliest collision is handled and progressed. All Collision instances that store the involved bodies are removed. This detection-response loop is then repeated until there are no collisions detected within the time-step.

When collisions are handled, the velocity of the Balls are updated, taking into account the elasticity and input momentums. The algorithm for determining output velocities follows the standard rigid-body collision model as described in [Impact Particles](http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf).

#### Inelastic Screen

The _Inelastic_ screen introduces a new body: [RotatingBallClusters](../js/inelastic/model/RotatingBallCluster.js). Since there are only two Balls in the _Inelastic_ screen, there can only be one [RotatingBallCluster](../js/inelastic/model/RotatingBallCluster.js) at a time, which represents the entire  [BallSystem](../js/common/model/BallSystem.js)

This also means that there is a third type of collision that InelasticCollisionEngine deals with: `cluster-to-border` collisions.

Once a "[sticky](../js/inelastic/model/InelasticCollisionType.js)" ball-ball collision is detected by CollisionEngine, a [RotatingBallCluster](../js/inelastic/model/RotatingBallCluster.js) instance will be dynamically created. Using the [conservation of Angular Momentum (L)](https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles), the [InelasticCollisionEngine](../js/inelastic/model/InelasticCollisionEngine.js) derives the [angular velocity (&omega;)](https://en.wikipedia.org/wiki/Angular_velocity) of the rotation of the balls relative to the center of mass. To see how this is implemented, see [RotatingBallCluster.js](../js/inelastic/model/RotatingBallCluster.js).

On the first time-step after a [RotatingBallCluster](../js/inelastic/model/RotatingBallCluster.js) instance has been created, [InelasticCollisionEngine](../js/inelastic/model/InelasticCollisionEngine.js) must detect when it will collide with the border (if 'Reflecting Border' is on). There is no closed-form solution to finding when the cluster will collide with the border, so a [bisection root-finder](https://en.wikipedia.org/wiki/Bisection_method) variant is used. The lower-bound of when the cluster will collide with the border is when the bounding circle of the cluster collides with the border. The upper-bound is when the center-of-mass collides with the border. Since [Collisions](../js/common/model/Collision) are 'saved', this computation is only executed once.

If in the future, the simulation needs to support rotations of Ball clusters of three or more Balls, the [InelasticCollisionEngine](../js/inelastic/model/InelasticCollisionEngine.js) will also have to consider collisions between a ball and a rotating ball-cluster as well as collisions between two ball-clusters.