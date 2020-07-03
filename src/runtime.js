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
// ECMAScript 5 strict mode
"use strict";

"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.SimpleThree_Camera = function (runtime) {
    this.runtime = runtime;
};

(function () {

    const behaviorProto = cr.behaviors.SimpleThree_Camera.prototype;

    /////////////////////////////////////
    // plugin type class
    behaviorProto.Type = function (behavior, objtype) {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;

        this.simpleThree = undefined;
    };

    const typeProto = behaviorProto.Type.prototype;

    typeProto.onCreate = function () {
    };

    /////////////////////////////////////
    // plugin instance class
    behaviorProto.Instance = function (type, inst) {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;
        this.runtime = type.runtime;

        this.camera = undefined;
        this.elevation = 0;
        this.verticalAngle2D = 0;
        this.fov = 75;
        this.near = 0.5;
        this.far = 1000;
    };

    const instanceProto = behaviorProto.Instance.prototype;

    instanceProto.findSimpleThreeInstance = function () {
        const simpleThreeInstances = Object.values(this.runtime.objectsByUid)
            .filter(instance => instance.plugin instanceof cr.plugins_.SimpleThree);

        if (simpleThreeInstances.length === 0) {
            return undefined;
        }

        return simpleThreeInstances[0];
    };

    instanceProto.onCreate = function () {
        this.pixelsTo3DUnits = v => v;
        this.threeDimentionalUnitsToPixels = v => v;
        this.angleTo3D = v => v;

        this.simpleThree = this.findSimpleThreeInstance();
        if (this.simpleThree === undefined) {
            console.warn('No simpleThree Object found');
            return;
        }

        this.pixelsTo3DUnits = this.simpleThree.pixelsTo3DUnits.bind(this.simpleThree);
        this.threeDimentionalUnitsToPixels = this.simpleThree.threeDimentionalUnitsToPixels.bind(this.simpleThree);
        this.angleTo3D = this.simpleThree.angleTo3D.bind(this.simpleThree);

        this.elevation = this.properties[0];
        this.verticalAngle2D = this.properties[1];
        this.fov = this.properties[2];
        this.near = this.pixelsTo3DUnits(this.properties[3]);
        this.far = this.pixelsTo3DUnits(this.properties[4]);

        this.camera = new THREE.PerspectiveCamera(this.fov, this.simpleThree.width / this.simpleThree.height, this.near, this.far);
        this.camera.rotation.order = 'YXZ';

        this.simpleThree.setCamera(this.camera);
    };

    // called when saving the full state of the game
    instanceProto.saveToJSON = function () {
        // return a Javascript object containing information about your plugin's state
        // note you MUST use double-quote syntax (e.g. "property": value) to prevent
        // Closure Compiler renaming and breaking the save format
        return {
            "e": this.elevation,
            "va": this.verticalAngle2D,
            "fv": this.fov,
            "n": this.threeDimentionalUnitsToPixels(this.near),
            "f": this.threeDimentionalUnitsToPixels(this.far),
        };
    };

    // called when loading the full state of the game
    instanceProto.loadFromJSON = function (o) {
        // load from the state previously saved by saveToJSON
        // 'o' provides the same object that you saved, e.g.
        // this.myValue = o["myValue"];
        // note you MUST use double-quote syntax (e.g. o["property"]) to prevent
        // Closure Compiler renaming and breaking the save format
        const acts = this.behavior.acts;

        acts.SetCameraElevationFrom2D.bind(this)(o["e"]);
        acts.SetCameraVerticalAngleFrom2D.bind(this)(o["va"]);
        acts.SetCameraFOV.bind(this)(o["fv"]);
        acts.SetCameraNear.bind(this)(o["n"]);
        acts.SetCameraFar.bind(this)(o["f"]);
    };

    instanceProto.tick = function () {
        if (this.simpleThree /*&& this.runtime.redraw*/) {
            this.updateCameraAngle();
            this.updateCameraPosition();
        }
    };

    // The comments around these functions ensure they are removed when exporting, since the
    // debugger code is no longer relevant after publishing.
    /**BEGIN-PREVIEWONLY**/
    instanceProto.getDebuggerValues = function (propsections) {
        // Append to propsections any debugger sections you want to appear.
        // Each section is an object with two members: "title" and "properties".
        // "properties" is an array of individual debugger properties to display
        // with their name and value, and some other optional settings.
        propsections.push({
            "title": this.type.name,
            "properties": [
                {"name": "Elevation", "value": this.elevation },
                {"name": "Vertical Angle", "value": this.verticalAngle2D},
                {"name": "fov", "value": this.fov},
                {"name": "near", "value": this.threeDimentionalUnitsToPixels(this.near)},
                {"name": "far", "value": this.threeDimentionalUnitsToPixels(this.far)},
            ]
        });
    };

    instanceProto.onDebugValueEdited = function (header, name, value) {
        const acts = this.behavior.acts;
        switch (name) {
            case "Elevation" :
                acts.SetCameraElevationFrom2D.bind(this)(value);
                break;
            case "Vertical Angle"     :
                acts.SetCameraVerticalAngleFrom2D.bind(this)(value);
                break;
            case "fov"                  :
                acts.SetCameraFOV.bind(this)(value);
                break;
            case "near"                 :
                acts.SetCameraNear.bind(this)(value);
                break;
            case "far"                  :
                acts.SetCameraFar.bind(this)(value);
                break;
        }
    };

    instanceProto.updateCameraAngle = function () {
        this.camera.rotation.y = this.angleTo3D(cr.to_degrees(this.inst.angle));
        this.camera.rotation.x = cr.to_radians(this.verticalAngle2D);
    };

    instanceProto.updateCameraPosition = function () {
        this.camera.position.set(
            this.pixelsTo3DUnits(this.inst.x),
            this.pixelsTo3DUnits(this.elevation),
            this.pixelsTo3DUnits(this.inst.y)
        );
    };

    instanceProto.onDestroy = function () {
        // called when associated object is being destroyed
        // note runtime may keep the object and behavior alive after this call for recycling;
        // release, recycle or reset any references here as necessary
    };

    /**END-PREVIEWONLY**/

    //////////////////////////////////////
    // Conditions
    function Cnds() {
    }

    // TODO: Put conditions here

    behaviorProto.cnds = new Cnds();

    //////////////////////////////////////
    // Actions
    function Acts() {
    }

    Acts.prototype.SetCameraElevationFrom2D = function (elevation) {
        this.elevation = elevation;
        this.updateCameraPosition();
    };

    Acts.prototype.SetCameraVerticalAngleFrom2D = function (angle) {
        this.verticalAngle2D = angle;
    };

    Acts.prototype.SetCameraFOV = function (cameraFov) {
        if (cameraFov == this.fov) {
            return;
        }
        this.fov = this.camera.fov = cameraFov;
        this.camera.updateProjectionMatrix();
        this.runtime.redraw = true;
    };

    Acts.prototype.SetCameraNear = function (cameraNear) {
        const newCameraNear = this.pixelsTo3DUnits(cameraNear);
        if (newCameraNear == this.near) {
            return;
        }
        this.near = this.camera.near = newCameraNear;
        this.camera.updateProjectionMatrix();
        this.runtime.redraw = true;
    };

    Acts.prototype.SetCameraFar = function (cameraFar) {
        const newCameraFar = this.pixelsTo3DUnits(cameraFar);
        if (newCameraFar == this.far) {
            return;
        }
        this.far = this.camera.far = newCameraFar;
        this.camera.updateProjectionMatrix();
        this.runtime.redraw = true;
    };

    behaviorProto.acts = new Acts();

    //////////////////////////////////////
    // Expressions
    function Exps() {
    }

    Exps.prototype.Elevation = function (ret) {
        ret.set_float(this.elevation);
    };

    Exps.prototype.VerticalAngle = function (ret) {
        ret.set_float(this.verticalAngle2D);
    };

    Exps.prototype.Fov = function (ret) {
        ret.set_float(this.fov);
    };

    Exps.prototype.Fov = function (ret) {
        ret.set_float(this.fov);
    };

    Exps.prototype.Near = function (ret) {
        ret.set_float(this.threeDimentionalUnitsToPixels(this.near));
    };

    Exps.prototype.Far = function (ret) {
        ret.set_float(this.threeDimentionalUnitsToPixels(this.far));
    };

    behaviorProto.exps = new Exps();

}());