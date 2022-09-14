var Collider = pc.createScript('collider');

// initialize code called once per entity
Collider.prototype.initialize = function() {
    this.entity.collision.on('collisionstart', this.collisionStart, this);
};

Collider.prototype.collisionStart = function (result) {
    if(result.other.rigidbody) {
        if(result.other.name === "Box") {
            this.app.fire("boxHit", {message: "box is hit"});
            // window.postMessage({ type:"boxHit", message: "box is hit" })
        }
    }
};

// update code called every frame
Collider.prototype.update = function(dt) {

};

// swap method called for script hot-reloading
// inherit your script state here
// Collider.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/