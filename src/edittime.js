/*
Copyright 2020 Jeysson Guevara (JeyDotC)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
function GetBehaviorSettings() {
    return {
        "name": "SimpleThree_Camera",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
        "id": "SimpleThree_Camera",			// this is used to SimpleThree this behavior and is saved to the project; never change it
        "version": "1.0",					// (float in x.y format) Behavior version - C2 shows compatibility warnings based on this
        "description": [
            "Represents a 3D Camera. This behavior will use the X and Y coordinates of the instance to position itself. The angle is used as the Y angle.",
        ].join('\n'),
        "author": "JeyDotC",
        "help url": "https://github.com/JeyDotC/construct2-SimpleThree_Camera",
        "category": "Three Js",				// Prefer to re-use existing categories, but you can set anything here
        "flags": 0						// uncomment lines to enable flags...
    };
}

if (typeof module !== 'undefined') {
    module.exports = {settings: GetBehaviorSettings(), type: 'Behavior'};
}

// Actions

AddNumberParam("Camera Elevation", "The camera elevation in 2D Pixels. (Will be translated to camera's Y axis.)", 32);
AddAction(0, 0, "Set Elevation from 2D pixels", "Camera", "Camera position to (<b>{0}</b>, <b>{1}</b>) and elevation of <b>{2}</b>", "Set the camera Elevation using 2D pixels.", "SetCameraElevationFrom2D");

AddNumberParam("Angle", "The camera angle in degrees. (Will be translated to camera's X axis angle in Radians.)", 0);
AddAction(1, 0, "Set Camera Vertical Angle from 2D angle", "Camera", "Camera Vertical angle to (<b>{0}</b>) degrees", "Set Camera Vertical angle using 2D angle in degrees. This gets translated into the camera's X angle in radians.", "SetCameraVerticalAngleFrom2D");

AddNumberParam("Field Of View", "The Field Of View (FOV) in degrees. (Will be translated to camera's Y axis angle in Radians.)", 75);
AddAction(2, 0, "Set Field Of View (FOV)", "Camera", "Camera FOV is (<b>{0}</b>) degrees now", "How wide is the field of view of the camera in degrees.", "SetCameraFOV");

AddNumberParam("Near", "The closest distance an object will be drawn in 2D units.", 3.2);
AddAction(3, 0, "Set Camera Near Distance", "Camera", "Camera near distance is (<b>{0}</b>) 2D Units now", "Set The closest distance an object will be drawn in 2D units.", "SetCameraNear");

AddNumberParam("Far", "The furthest distance an object will be drawn in 2D units.", 32000);
AddAction(4, 0, "Set Camera Far Distance", "Camera", "Camera far distance is (<b>{0}</b>) 2D Units now", "Set The furthest distance an object will be drawn in 2D units.", "SetCameraFar");

// Expressions
AddExpression(0, ef_return_number, "Camera Elevation", "Camera", "Elevation", "Camera elevation in 2D pixels");
AddExpression(1, ef_return_number, "Vertical Angle", "Camera", "VerticalAngle", "Camera vertical angle in degrees");
AddExpression(2, ef_return_number, "Field Of View (FOV)", "Camera", "Fov", "How wide is the field of view of the camera in degrees.");
AddExpression(3, ef_return_number, "Near", "Camera", "Near", "The closest distance an object will be drawn in 2D units.");
AddExpression(4, ef_return_number, "Far", "Camera", "Far", "The furthest distance an object will be drawn in 2D units.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
    new cr.Property(ept_float, "Elevation", 32, "Camera elevation in 2D pixels."),
    new cr.Property(ept_float, "Vertical Angle", 0, "Camera vertical angle in degrees."),
    new cr.Property(ept_float, "Field Of View (FOV)", 75, "How wide is the field of view of the camera in degrees."),
    new cr.Property(ept_float, "Near", 3.2, "The closest distance an object will be drawn in 2D units."),
    new cr.Property(ept_float, "Far", 32000, "The furthest distance an object will be drawn in 2D units."),
];

// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType()
{
    return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType()
{
    assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function(instance)
{
    return new IDEInstance(instance, this);
};

// Class representing an individual instance of the behavior in the IDE
function IDEInstance(instance, type)
{
    assert2(this instanceof arguments.callee, "Constructor called as a function");

    // Save the constructor parameters
    this.instance = instance;
    this.type = type;

    // Set the default property values from the property table
    this.properties = {};

    for (var i = 0; i < property_list.length; i++)
        this.properties[property_list[i].name] = property_list[i].initial_value;

    // any other properties here, e.g...
    // this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
};

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
};