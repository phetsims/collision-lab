### Model

`[CollisionLabModel]` is the model base class for all screens. It
provides functionality that is unrelated to PlayArea such as the .

`[PlayArea]` is the base class for the pool table on all screens. It
keeps track of the balls, and steps each ball through time.

`[Ball]` is the base class for balls. The properties of ball are tracked
through AXON properties.

`[CollisionDetector]` implements collision detection and process of
collision for ball to ball and ball to wall collisions.

`[CenterOfMass]` is the class that tracks the position of the velocity
of the center of mass

`[MomentaDiagram]` is the class responsible for the model associated
with the momenta diagram.

`[Trajectory]` A model of the trajectory of the ball

### View

`[CollisionBallScreenView]` is the base `ScreenView` for all screens. 

`[PlayAreaNode]` View for the PlayArea, which includes:
 * The borders of the PlayArea as well as the grid lines
 * The dashed lines that indicate the origin // TODO is this what the dashed lines in the mock up indicate?
 * The label of the total kinetic energy in the PlayArea
 * The CenterOfMass node
 
`[CenterOfMassNode]` Scenery Node for CenterMassModel
  
`[BallNode]` renders the scenery node associated with the Ball model.

`[TrajectoryNode]` a Scenery node associated with the trajectory of a
ball.

`[BallVectorNode]` Responsible for:
* Keeping the tail of the ArrowNode at the center of the Ball
* Creating an API to update the direction and magnitude of the Scenery
  ArrowNode
 
`[BallVelocityVectorNode]` A distinct color A draggable tip

`[BallMomentumVectorNode]` Listens to the balls VelocityProperty and
MassProperty via Multilink (or we add a MomentumProperty) and updates
the arrow node to match

A color for momentum arrow

`[GridNode]` The borders of the PlayArea as well as the grid lines
 
`[MomentaDiagramNode]` Scenery Node associated with the momentum diagram

`[ControlPanel]` Panel for the checkboxes and elasticity slider.

`[DisplayView]` //TODO

`[DataTable]` //TODO

`[PlayPauseRestartButtonNode]` //TODO

