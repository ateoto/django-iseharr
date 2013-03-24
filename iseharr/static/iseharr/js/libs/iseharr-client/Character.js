Iseharr.PlayerCharacter = function(username) {
	this.username = username;
	this.health = 100;
	this.position = new PIXI.Point(0,0);
    this.is_animating = false;
    this.current_animation;
    this.animations = {};
}

Iseharr.PlayerCharacter.constructor = Iseharr.PlayerCharacter;

Iseharr.PlayerCharacter.update = function() {
    this.current_animation.position = this.position;
}

Iseharr.PlayerCharacter.animate = function(animation, loop) {
    //Stop and hide the current animation.
    if (this.current_animation.hasOwnProperty('visible')) {
        this.current_animation.visible = false;
        this.stopAnimation();
    }

    // Set the new animation.
    this.current_animation = this.animations[animation];
    if (!loop) {
        this.current_animation.playOnce();
    } else {
        this.current_animation.play();
    }
    this.current_animation.visible = true;
}

Iseharr.PlayerCharacter.stopAnimation = function() {
    this.current_animation.gotoAndStop(0);
}