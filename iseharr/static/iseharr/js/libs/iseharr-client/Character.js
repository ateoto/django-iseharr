Iseharr.PlayerCharacter = function(username) {
	this.username = username;
	this.health = 100;
	this.position = new PIXI.Point(0,0);
    this.direction = new PIXI.Point(0,-1);
    this.is_animating = false;
    this.is_moving = false;
    this.current_animation;
    this.animations = {};
    this.speed = 0.08;
}

Iseharr.PlayerCharacter.constructor = Iseharr.PlayerCharacter;

Iseharr.PlayerCharacter.prototype.update = function(dt) {
    if (this.is_moving) {
        this.position.x = (this.position.x + (this.direction.x * this.speed * dt));
        this.position.y = (this.position.y + (this.direction.y * this.speed * dt));
    }
    this.current_animation.position = this.position;
}

Iseharr.PlayerCharacter.prototype.move = function(direction) {
    console.log(this.direction, direction);
    if (this.is_moving) {
        if (this.direction.x != direction.x || this.direction.y != direction.y) {
            this.start_move(direction);
        }
    } else {
        this.start_move(direction);
    }
}

Iseharr.PlayerCharacter.prototype.start_move = function(direction) {
    //Tell the server.
    this.is_moving = true;
    this.direction = direction;
    var data = {
        type: 'player-startmove',
        data: {
            'uuid': this.uuid,
            'username': this.username,
            'position': player.position,
            'speed': this.speed,
            'direction': this.direction
        }
    }
    this.socket.send(JSON.stringify(data));
}

Iseharr.PlayerCharacter.prototype.stop_move = function() {
    //Tell the server.
    this.is_moving = false;
    var data = {
        type: 'player-stopmove',
        data: {
            'uuid': this.uuid,
            'username': this.username,
            'position': player.position,
            'direction': this.direction
        }
    }
    this.socket.send(JSON.stringify(data));
}

Iseharr.PlayerCharacter.prototype.animate = function(animation, loop) {
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
    this.is_animating = true;
}

Iseharr.PlayerCharacter.prototype.stopAnimation = function() {
    this.current_animation.gotoAndStop(0);
}