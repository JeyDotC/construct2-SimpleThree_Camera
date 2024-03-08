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

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins not created");

/////////////////////////////////////
// plugin class
cr.plugins_.SimpleThree = function (runtime) {
    this.runtime = runtime;
};

(function () {

    const CanvasOrder = {
        InFront: 0,
        Behind: 1,
    };

    const CanvasSizing = {
        InSyncWithScreen: 0,
        UseObjectSize: 1,
    };

    const CanvasPositioning = {
        TopLeft: 0,
        UseObjectPosition: 1,
    };

    const FogType = {
        None: 0,
        Linear: 1,
        ExponentialSquared: 2,
    };
	

    const pluginProto = cr.plugins_.SimpleThree.prototype;

    /////////////////////////////////////
    // plugin type class
    pluginProto.Type = function (plugin) {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };

    const typeProto = pluginProto.Type.prototype;

    typeProto.onCreate = function () {
    };

    /////////////////////////////////////
    // plugin instance class
    pluginProto.Instance = function (type) {
        this.type = type;
        this.plugin = type.plugin;
        this.runtime = type.runtime;

        this.renderer = undefined;
        this.scene = undefined;
        this.camera = undefined;
        this.canvas3d = undefined;
        this.ambientLight = undefined;
        this.fog = undefined;

        this.canvasOrder = CanvasOrder.InFront;
        this.canvasSizing = CanvasSizing.InSyncWithScreen;
        this.canvasPositioning = CanvasPositioning.TopLeft;
        this.pixelsPer3DUnit = 32;
        this.ambientLightColor = 0xFFFFFF;
        this.ambientLightIntensity = 4;
        this.fov = 75;
        this.near = 0.5;
        this.far = 1000;
        // Fog
        this.fogType = FogType.None;
        this.fogColor = cr.RGB(255, 255, 255);
        this.fogDensity = 0.00025;
        this.fogNear = 1;
        this.fogFar = 1000;
        // Scene
        this.sceneBackgroundColor = undefined;
    };

    const instanceProto = pluginProto.Instance.prototype;

    instanceProto.pixelsTo3DUnits = function (distance2D) {
        return distance2D / (this.pixelsPer3DUnit || 1);
    };

    instanceProto.threeDimentionalUnitsToPixels = function (distance3D) {
        return distance3D * (this.pixelsPer3DUnit || 1);
    };

    instanceProto.angleTo3D = function (angle) {
        return -cr.to_radians(angle + 90);
    };

    instanceProto.configureFog = function () {
        switch (this.fogType) {
            case FogType.None:
                this.scene.fog = undefined;
                return;
            case FogType.Linear:
                this.scene.fog = new THREE.Fog(this.fogColor, this.fogNear, this.fogFar);
                break;
            case FogType.ExponentialSquared:
                this.scene.fog = new THREE.FogExp2(this.fogColor, this.fogDensity);
                break;
            default:
                break;
        }
    };

    instanceProto.onCreate = function () {
        this.canvasOrder = this.properties[0];
        this.canvasSizing = this.properties[1];
        this.canvasPositioning = this.properties[2];
        this.pixelsPer3DUnit = this.properties[4];
        this.ambientLightColor = new THREE.Color(this.properties[5]);
        this.ambientLightIntensity = this.properties[6];
        // Fog
        this.fogType = this.properties[7];
        this.fogColor = new THREE.Color(this.properties[8]);
        this.fogDensity = this.properties[9];
        this.fogNear = this.pixelsTo3DUnits(this.properties[10]);
        this.fogFar = this.pixelsTo3DUnits(this.properties[11]);
        // Scene
        this.sceneBackgroundColor = new THREE.Color(this.properties[12]);

        this.canvas3d = createCanvas();

        this.runtime.canvas.parentElement.style.display = 'grid';
        this.runtime.canvas.style.gridArea = '1/1';

        if (this.canvasOrder === CanvasOrder.InFront) {
            this.runtime.canvas.parentElement.appendChild(this.canvas3d);
        } else {
            this.runtime.canvas.parentElement.prepend(this.canvas3d);
        }

        this.scene = new THREE.Scene();
        this.scene.background = this.sceneBackgroundColor;

        this.configureFog();

        this.ambientLight = new THREE.AmbientLight(this.ambientLightColor, this.ambientLightIntensity);

        this.scene.add(this.ambientLight);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas3d,
        });

        this.runtime.tickMe(this);

        this.updateCanvas3d();

        window.addEventListener('resize', this.updateCanvas3d.bind(this));
    };

    function createCanvas() {
        document.querySelectorAll(".simplethree-3d-canvas")
            .forEach(el => el.remove());

        const canvas3d = document.createElement("canvas");
        canvas3d.setAttribute("class", "simplethree-3d-canvas");
        canvas3d.style.display = "block";
        canvas3d.style.gridArea = '1/1';

        return canvas3d;
    }

    instanceProto.updateCanvas3d = function () {
        if (this.canvasPositioning === CanvasPositioning.UseObjectPosition) {
            const newPosition = {
                x: this.x - this.hotspotX * this.width,
                y: this.y - this.hotspotY * this.height
            };

            this.canvas3d.style.marginLeft = `${newPosition.x}px`;
            this.canvas3d.style.marginTop = `${newPosition.y}px`;
        }

        const newSize = this.canvasSizing === CanvasSizing.UseObjectSize ?
            {width: this.width, height: this.height} :
            {width: this.runtime.canvas.width, height: this.runtime.canvas.height};

        this.renderer.setSize(newSize.width, newSize.height);

        if (this.camera) {
            this.updateCameraAspect();
        }

        this.runtime.redraw = true;
    };

    instanceProto.setCamera = function (newCamera) {
        this.camera = newCamera;
        this.updateCameraAspect();
    };

    instanceProto.updateCameraAspect = function () {
        if(!this.camera){
            return;
        }
        const {width, height} = this.renderer.getSize();
        const newAspect = width / height;
        if(newAspect !== this.camera.aspect) {
            this.camera.aspect = newAspect;
            this.camera.updateProjectionMatrix();
        }
    };

    instanceProto.onDestroy = function () {
        // called when associated object is being destroyed
        // note runtime may keep the object and plugin alive after this call for recycling;
        // release, recycle or reset any references here as necessary
        this.scene.dispose();
        this.renderer.dispose();
        this.canvas3d.remove();
        window.removeEventListener('resize', this.updateCanvas3d.bind(this));
    };

    instanceProto.drawGL_earlyZPass = function (glw) {
        this.drawGL(glw);
    };

    instanceProto.drawGL = function (glw) {
        if (this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    };

    // called when saving the full state of the game
    instanceProto.saveToJSON = function () {
        // return a Javascript object containing information about your plugin's state
        // note you MUST use double-quote syntax (e.g. "property": value) to prevent
        // Closure Compiler renaming and breaking the save format
        return {
            "o": this.canvasOrder,
            "s": this.canvasSizing,
            "p": this.canvasPositioning,
            "p3": this.pixelsPer3DUnit,
            "lc": this.ambientLightColor.getHex(),
            "li": this.ambientLightIntensity,
            "fv": this.fov,
            "n": this.threeDimentionalUnitsToPixels(this.near),
            "f": this.threeDimentionalUnitsToPixels(this.far),
            "ft": this.fogType,
            "fc": this.fogColor.getHex(),
            "fd": this.fogDensity,
            "fn": this.threeDimentionalUnitsToPixels(this.fogNear),
            "ff": this.threeDimentionalUnitsToPixels(this.fogFar),
            "bg": this.sceneBackgroundColor.getHex(),
        };
    };

    // called when loading the full state of the game
    instanceProto.loadFromJSON = function (o) {
        // load from the state previously saved by saveToJSON
        // 'o' provides the same object that you saved, e.g.
        // this.myValue = o["myValue"];
        // note you MUST use double-quote syntax (e.g. o["property"]) to prevent
        // Closure Compiler renaming and breaking the save format
        const acts = this.plugin.acts;

        acts.SetCanvasOrder.bind(this)(parseInt(o["o"]));
        acts.SetCanvasSizing.bind(this)(parseInt(o["s"]));
        acts.SetCanvasPositioning.bind(this)(parseInt(o["p"]));
        acts.SetPixelsPer3DUnit.bind(this)(o["p3"]);
        acts.SetAmbientLightColor.bind(this)(o["lc"]);
        acts.SetAmbientLightIntensity.bind(this)(o["li"]);
        acts.SetFogType.bind(this)(o["ft"]);
        acts.SetFogColor.bind(this)(o["fc"]);
        acts.SetFogDensity.bind(this)(o["fd"]);
        acts.SetFogNear.bind(this)(o["fn"]);
        acts.SetFogFar.bind(this)(o["ff"]);
        acts.SetSceneBackgroundColor.bind(this)(o["bg"]);
    };

    instanceProto.tick = function () {
        var dt = this.runtime.getDt(this.inst);
        const canvas2D = this.runtime.canvas;
        const rendererSize = new THREE.Vector3();
        this.renderer.getSize(rendererSize);
        if (this.canvasSizing === CanvasSizing.InSyncWithScreen && (canvas2D.width != rendererSize.x || canvas2D.height != rendererSize.y)) {
            this.updateCanvas3d();
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
            "title": `${this.type.name}: Canvas`,
            "properties": [
                {"name": "canvasOrder", "value": this.canvasOrder},
                {"name": "canvasSizing", "value": this.canvasSizing},
                {"name": "canvasPositioning", "value": this.canvasPositioning},
                {"name": "pixelsPer3DUnit", "value": this.pixelsPer3DUnit},
            ]
        });
        propsections.push({
            "title": `${this.type.name}: Ambient Light`,
            "properties": [
                {"name": "ambientLightColor", "value": `#${this.ambientLightColor.getHexString()}`},
                {"name": "ambientLightIntensity", "value": this.ambientLightIntensity},
            ]
        });
        propsections.push({
            "title": `${this.type.name}: Fog`,
            "properties": [
                {"name": "fogType", "value": this.fogType},
                {"name": "fogColor", "value": `#${this.fogColor.getHexString()}`},
                {"name": "fogDensity", "value": this.fogDensity},
                {"name": "fogNear", "value": this.threeDimentionalUnitsToPixels(this.fogNear)},
                {"name": "fogFar", "value": this.threeDimentionalUnitsToPixels(this.fogFar)},
            ]
        });
        propsections.push({
            "title": `${this.type.name}: Scene`,
            "properties": [
                {"name": "sceneBackgroundColor", "value": `#${this.sceneBackgroundColor.getHexString()}`},
            ]
        });
    };

    instanceProto.onDebugValueEdited = function (header, name, value) {
        const acts = this.plugin.acts;
        switch (name) {
            case "canvasOrder"          :
                acts.SetCanvasOrder.bind(this)(parseInt(value));
                break;
            case "canvasSizing"         :
                acts.SetCanvasSizing.bind(this)(parseInt(value));
                break;
            case "canvasPositioning"    :
                acts.SetCanvasPositioning.bind(this)(parseInt(value));
                break;
            case "pixelsPer3DUnit"      :
                acts.SetPixelsPer3DUnit.bind(this)(value);
                break;
            case "ambientLightColor"    :
                acts.SetAmbientLightColor.bind(this)(value);
                break;
            case "ambientLightIntensity":
                acts.SetAmbientLightIntensity.bind(this)(value);
                break;
            case "fogType"              :
                acts.SetFogType.bind(this)(value);
                break;
            case "fogColor"             :
                acts.SetFogColor.bind(this)(value);
                break;
            case "fogDensity"           :
                acts.SetFogDensity.bind(this)(value);
                break;
            case "fogNear"              :
                acts.SetFogNear.bind(this)(value);
                break;
            case "fogFar"               :
                acts.SetFogFar.bind(this)(value);
                break;
            case "sceneBackgroundColor":
                acts.SetSceneBackgroundColor.bind(this)(value);
                break;
        }
    };

    /**END-PREVIEWONLY**/

    //////////////////////////////////////
    // Conditions
    function Cnds() {
    }

    // TODO: Put conditions here

    pluginProto.cnds = new Cnds();

    //////////////////////////////////////
    // Actions
    function Acts() {
    }

    Acts.prototype.SetCanvasOrder = function (newCanvasOrder) {
        if (newCanvasOrder !== this.canvasOrder) {

            this.canvasOrder = newCanvasOrder;

            if (this.canvasOrder === CanvasOrder.InFront) {
                this.runtime.canvas.before(this.canvas3d);
            } else {
                this.runtime.canvas.after(this.canvas3d);
            }
        }
    };

    Acts.prototype.SetCanvasSizing = function (newCanvasSizing) {
        if (newCanvasSizing !== this.canvasSizing) {
            this.canvasSizing = newCanvasSizing;
            this.updateCanvas3d();
        }
    };

    Acts.prototype.SetCanvasPositioning = function (newCanvasPositioning) {
        if (newCanvasPositioning !== this.canvasPositioning) {
            this.canvasPositioning = newCanvasPositioning;
            this.updateCanvas3d();
        }
    };

    Acts.prototype.SetPixelsPer3DUnit = function (newPixelsPer3DUnit) {
        this.pixelsPer3DUnit = newPixelsPer3DUnit;
        this.runtime.redraw = true;
    };

    Acts.prototype.SetAmbientLightColor = function (newAmbientLightColor) {
        this.ambientLightColor = this.ambientLight.color = new THREE.Color(newAmbientLightColor);
        this.runtime.redraw = true;
    };

    Acts.prototype.SetAmbientLightIntensity = function (newAmbientLightIntensity) {
        this.ambientLightIntensity = this.ambientLight.intensity = newAmbientLightIntensity;
        this.runtime.redraw = true;
    };

    Acts.prototype.SetFogType = function (fogType) {
        this.fogType = fogType;
        this.configureFog();
        this.runtime.redraw = true;
    };

    Acts.prototype.SetFogColor = function (fogColor) {
        this.fogColor = new THREE.Color(fogColor);
        this.configureFog();
        this.runtime.redraw = true;
    };
    Acts.prototype.SetFogDensity = function (fogDensity) {
        this.fogDensity = fogDensity;
        this.configureFog();
        this.runtime.redraw = true;
    };
    Acts.prototype.SetFogNear = function (fogNear) {
        this.fogNear = this.pixelsTo3DUnits(fogNear);
        this.configureFog();
        this.runtime.redraw = true;
    };
    Acts.prototype.SetFogFar = function (fogFar) {
        this.fogFar = this.pixelsTo3DUnits(fogFar);
        this.configureFog();
        this.runtime.redraw = true;
    };
    Acts.prototype.SetSceneBackgroundColor = function (sceneBackgroundColor) {
        this.scene.background = this.sceneBackgroundColor = new THREE.Color(sceneBackgroundColor);
        this.runtime.redraw = true;
    };

    pluginProto.acts = new Acts();

    //////////////////////////////////////
    // Expressions
    function Exps() {
    }

    Exps.prototype.CanvasOrder = function (ret) {
        ret.set_int(this.canvasOrder);
    };

    Exps.prototype.CanvasSizing = function (ret) {
        ret.set_int(this.canvasSizing);
    };

    Exps.prototype.CanvasPositioning = function (ret) {
        ret.set_int(this.canvasPositioning);
    };

    Exps.prototype.HotspotX = function (ret) {
        ret.set_float(this.hotspotX);
    };

    Exps.prototype.HotspotY = function (ret) {
        ret.set_float(this.hotspotY);
    };

    Exps.prototype.PixelsPer3DUnit = function (ret) {
        ret.set_int(this.pixelsPer3DUnit);
    };

    Exps.prototype.AmbientLightColor = function (ret) {
        ret.set_int(this.ambientLightColor.getHex());
    };

    Exps.prototype.AmbientLightIntensity = function (ret) {
        ret.set_float(this.ambientLightIntensity);
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

    Exps.prototype.FogType = function (ret) {
        ret.set_int(this.fogType);
    };
    Exps.prototype.FogColor = function (ret) {
        ret.set_int(this.fogColor.getHex());
    };
    Exps.prototype.FogDensity = function (ret) {
        ret.set_float(this.fogDensity);
    };
    Exps.prototype.FogNear = function (ret) {
        ret.set_float(this.threeDimentionalUnitsToPixels(this.fogNear));
    };
    Exps.prototype.FogFar = function (ret) {
        ret.set_float(this.threeDimentionalUnitsToPixels(this.fogFar));
    };
    Exps.prototype.SceneBackgroundColor = function (ret) {
        ret.set_int(this.sceneBackgroundColor.getHex());
    };

    pluginProto.exps = new Exps();

}());