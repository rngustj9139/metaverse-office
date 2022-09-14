var Trigger = pc.createScript('trigger');

// initialize code called once per entity
Trigger.prototype.initialize = function () {
    this.entity.collision.on("triggerenter", this.onTriggerEnter);
};

Trigger.prototype.onTriggerEnter = function () {
    console.log('touched');
};

// update code called every frame
Trigger.prototype.update = function (dt) {

};

// swap method called for script hot-reloading
// inherit your script state here
// Trigger.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/