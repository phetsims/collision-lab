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

`[Grid]` is the class responsible for the grid and border shape for the playArea

`[MomentaDiagram]` is the class responsible for the model associated
with the momenta diagram.

`[Trajectory]` A model of the trajectory of the ball

`[KineticEnergySumProperty]` is the class that determined the total kinetic energy through an Axon Property  

`[TimeClock]` is the class that handles the time and the speed of the simulation

### View

`[CollisionBallScreenView]` is the base `ScreenView` for all screens. 

`[PlayAreaNode]` View for the PlayArea, which includes:
 * The borders of the PlayArea as well as the grid lines
 * The dashed lines that indicate the origin // TODO is this what the dashed lines in the mock up indicate?
 * The label of the total kinetic energy in the PlayArea
 * The CenterOfMass node
 
`[CenterOfMassNode]` Scenery Node for CenterMassModel
  
`[BallNode]` renders the scenery node associated with the Ball model.

`[GridNode]` is the class responsible for border of the playArea, gridlines and its visibility 

`[TrajectoryNode]` a Scenery node associated with the trajectory of a
ball.

`[ControlPanelCheckbox]` is the class responsible for an opiniated checkbox with an optional icon 

`[BallVectorNode]` Responsible for:
* Keeping the tail of the ArrowNode at the center of the Ball
* Creating an API to update the direction and magnitude of the Scenery
  ArrowNode
 
`[BallVelocityVectorNode]` A distinct color A draggable tip

`[BallMomentumVectorNode]` Listens to the balls VelocityProperty and
MassProperty via Multilink (or we add a MomentumProperty) and updates
the arrow node to match

A color for momentum arrow
 
`[MomentaDiagramNode]` Scenery Node associated with the momentum diagram

`[ControlPanel]` Panel for the checkboxes and elasticity number control.

`[TimeDisplay]` NumberDisplay class for the running time of the simulation

`[DataTable]` //TODO

`[CollisionLabViewProperties]` a collection of boolean AXON Properties, mostly for visibility 

# Model

The motion of the balls is based on a ballistic motion. At every time step,
the balls are first propagated forward ballistically assuming no collision of any kind.
Each pair of balls is then inspected to see if they physically overlap.
In the case that they do, a ball collision is processed by first determining 
analytically the exact time of collision. The resulting position of the pair of balls
is then corrected taking into account the elasticity and current time.
Additionally, each ball is check to see if it overlaps with the border of the playArea.
In a similar process, the time of the contact between the border is determined
and then the velocity and positions are corrected.
