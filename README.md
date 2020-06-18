# SimpleThree_Camera
**Type:** Behavior

Represents a 3D Camera. This behavior will use the X and Y coordinates of the instance to position itself. The angle is used as the Y angle.

# Properties

| Name | Type | Description | Options |
|------|------|-------------|---------|
|**Elevation**| _float_ | Camera elevation in 2D pixels. Default value: `32` |  |
|**Vertical Angle**| _float_ | Camera vertical angle in degrees.  |  |
|**Field Of View (FOV)**| _float_ | How wide is the field of view of the camera in degrees. Default value: `75` |  |
|**Near**| _float_ | The closest distance an object will be drawn in 2D units. Default value: `3.2` |  |
|**Far**| _float_ | The furthest distance an object will be drawn in 2D units. Default value: `32000` |  |

# ACES

## Actions

| Name | Description | Parameters |
|------|-------------|------------|
| |**Camera**| |
|**Set Camera position from 2D coordinates**| Set the camera position using 2D coordinates. | - **Camera Elevation** _number_ = `32`: The camera elevation in 2D Pixels. (Will be translated to camera's Y axis.)  |
|**Set Camera Vertical Angle from 2D angle**| Set Camera Vertical angle using 2D angle in degrees. This gets translated into the camera's X angle in radians. | - **Angle** _number_: The camera angle in degrees. (Will be translated to camera's X axis angle in Radians.)  |
|**Set Field Of View (FOV)**| How wide is the field of view of the camera in degrees. | - **Field Of View** _number_ = `75`: The Field Of View (FOV) in degrees. (Will be translated to camera's Y axis angle in Radians.)  |
|**Set Camera Near Distance**| Set The closest distance an object will be drawn in 2D units. | - **Near** _number_ = `3.2`: The closest distance an object will be drawn in 2D units.  |
|**Set Camera Far Distance**| Set The furthest distance an object will be drawn in 2D units. | - **Far** _number_ = `32000`: The furthest distance an object will be drawn in 2D units.  |

## Expressions

| Name | Type | Description | Parameters |
|------|------|-------------|------------|
| | |**Camera**| |
|**Camera Elevation**<br/><small>**Usage:** `MyObject.SimpleThree_Camera.Elevation`</small>|`number`| Camera elevation in 2D pixels |  |
|**Vertical Angle**<br/><small>**Usage:** `MyObject.SimpleThree_Camera.VerticalAngle`</small>|`number`| Camera vertical angle in degrees |  |
|**Field Of View (FOV)**<br/><small>**Usage:** `MyObject.SimpleThree_Camera.Fov`</small>|`number`| How wide is the field of view of the camera in degrees. |  |
|**Near**<br/><small>**Usage:** `MyObject.SimpleThree_Camera.Near`</small>|`number`| The closest distance an object will be drawn in 2D units. |  |
|**Far**<br/><small>**Usage:** `MyObject.SimpleThree_Camera.Far`</small>|`number`| The furthest distance an object will be drawn in 2D units. |  |