var stats = new Stats();
var walk_cycle_s_down;
var walk_cycle_s_anim;
var walk_cycle_n_anim;
var walk_cycle_e_anim;
var walk_cycle_w_anim;
var slash_n_anim;
var slash_s_anim;
var slash_e_anim;
var slash_w_anim;
var other_character;

var timestamp;

var toggle_char_zoom = false;

var socket;

var character = {
	username: username,
	position: new PIXI.Point(576,280),
	direction: 's',
	animations: {
		'walk': {
			'north': null,
			'south': null,
			'east': null,
			'west': null
		},
		'attack': {
			'north': null,
			'south': null,
			'east': null,
			'west': null
		}
	},
	is_walking: false,
	animation: null,
	is_attacking: false,
};

var characters = [];
var keyState = {};
var has_GamePad;

$(window).resize(resize)
window.onorientationchange = resize;

var asset_url;

$(function() {
	socket = io.connect('http://23.20.193.8');

	socket.on("chat", function(message) {
		$('#messages').append('<li>' + message.sender + ': ' + message.message + '</li>');
	});

	socket.on('user-joined', function(data){
		var new_character = new PIXI.Sprite(walk_cycle_s_down);
		data.pc.sprite = new_character;
		data.pc.sprite.position = data.pc.position;
		characters.push(data.pc);
		console.log(data.pc.username + ' joined the game. :)');
		container.addChildAt(data.pc.sprite, 1);
	});

	socket.on('user-left', function(data) {
		console.log(data.pc.username + ' left the game. :(');
	});

	socket.on('pc-move-ack', function(data) {
		if (data.pc.username == character.username) {
			character.position = character.animation.position = data.pc.position;
		} else {
			_.each(characters, function(character){
				if (character.username == data.pc.username) {
					character.position = character.sprite.position = data.pc.position;
				}
			});
		}
	});

	$("#message-form").submit(function(ev) {
		ev.preventDefault();
		socket.emit("chat", $("#message-input").val());
		$("#message-input").val("");
	});


	stats.setMode(0);
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	document.body.appendChild( stats.domElement );

	renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
	stage = new PIXI.Stage(0x000000);
	bg = new PIXI.Stage(0x000000);

	is_webGL = renderer instanceof PIXI.WebGLRenderer;
	has_GamePad = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
	console.log('WebGL: ' + is_webGL);
	console.log('Gamepad Support: ' + has_GamePad);
	document.body.appendChild(renderer.view);
	//$('#render-target').append(renderer.view);
	asset_url = $('#render-target').attr('asset-url');
	var asset_list = [
		asset_url + '/img/map_bg.png', 
		asset_url + '/img/map_fg.png', 
		asset_url + '/img/spritesheet.json'
	];

	loader = new PIXI.AssetLoader(asset_list);
	loader.onComplete = onAssetsLoaded;
	
	container = new PIXI.DisplayObjectContainer();

	stage.addChild(container);

	$(document).keydown(updateKeyState);
	$(document).keyup(updateKeyState);
	loader.crossorigin = true;

	loader.load();

	$('#about').modal('show');

	$('#close-about').click(function() {
		$('#about').modal('hide');

		return false;
	})
});

function updateKeyState(e) {
	if (e.type == 'keydown') {
		keyState[e.keyCode] = true;
	} else if (e.type == 'keyup') {
		keyState[e.keyCode] = false;
	}
}


function onAssetsLoaded() {
	var map_bg_texture = PIXI.Texture.fromImage(asset_url + '/img/map_bg.png');
	var map_bg = new PIXI.Sprite(map_bg_texture);

	var map_fg_texture = PIXI.Texture.fromImage(asset_url + '/img/map_fg.png');
	var map_fg = new PIXI.Sprite(map_fg_texture);

	container.addChild(map_bg);

	var walk_cycle_n = [];
	var walk_cycle_s = [];
	var walk_cycle_e = [];
	var walk_cycle_w = [];

	var slash_n = [];
	var slash_s = [];
	var slash_e = [];
	var slash_w = [];

	for (var i=0; i < 8; i++) {
	 	var texture_n = PIXI.Texture.fromFrame("walkcycle_north_" + i + ".png");
	 	var texture_s = PIXI.Texture.fromFrame("walkcycle_south_" + i + ".png");
	 	var texture_e = PIXI.Texture.fromFrame("walkcycle_east_" + i + ".png");
	 	var texture_w = PIXI.Texture.fromFrame("walkcycle_west_" + i + ".png");
	 	walk_cycle_n.push(texture_n);
	 	walk_cycle_s.push(texture_s);
	 	walk_cycle_e.push(texture_e);
	 	walk_cycle_w.push(texture_w);
	};

	for (var i=0; i < 5; i++) {
		var texture_n = PIXI.Texture.fromFrame("slash_north_" + i + ".png");
		var texture_s = PIXI.Texture.fromFrame("slash_south_" + i + ".png");
		var texture_e = PIXI.Texture.fromFrame("slash_east_" + i + ".png");
		var texture_w = PIXI.Texture.fromFrame("slash_west_" + i + ".png");
		slash_n.push(texture_n);
		slash_s.push(texture_s);
		slash_e.push(texture_e);
		slash_w.push(texture_w);
	}

	walk_cycle_s_down = walk_cycle_s[0];

	walk_cycle_n_anim = new PIXI.MovieClip(walk_cycle_n);
	walk_cycle_n_anim.position.x = 0;
	walk_cycle_n_anim.animationSpeed = 0.2;
	walk_cycle_n_anim.visible = false;
	container.addChild(walk_cycle_n_anim);
	character.animations.walk.north = walk_cycle_n_anim;

	walk_cycle_s_anim = new PIXI.MovieClip(walk_cycle_s);
	walk_cycle_s_anim.position.x = 0;
	walk_cycle_s_anim.animationSpeed = 0.2;
	walk_cycle_s_anim.visible = true;
	container.addChild(walk_cycle_s_anim);
	character.animations.walk.south = walk_cycle_s_anim;

	walk_cycle_e_anim = new PIXI.MovieClip(walk_cycle_e);
	walk_cycle_e_anim.position.x = 0;
	walk_cycle_e_anim.animationSpeed = 0.2;
	walk_cycle_e_anim.visible = false;
	container.addChild(walk_cycle_e_anim);
	character.animations.walk.east = walk_cycle_e_anim;

	walk_cycle_w_anim = new PIXI.MovieClip(walk_cycle_w);
	walk_cycle_w_anim.position.x = 0;
	walk_cycle_w_anim.animationSpeed = 0.2;
	walk_cycle_w_anim.visible = false;
	container.addChild(walk_cycle_w_anim);
	character.animations.walk.west = walk_cycle_w_anim;

	slash_n_anim = new PIXI.MovieClip(slash_n);
	slash_n_anim.animationSpeed = 0.2;
	slash_n_anim.visible = false;
	container.addChild(slash_n_anim);
	character.animations.attack.north = slash_n_anim;

	slash_s_anim = new PIXI.MovieClip(slash_s);
	slash_s_anim.animationSpeed = 0.2;
	slash_s_anim.visible = false;
	container.addChild(slash_s_anim);
	character.animations.attack.south = slash_s_anim;

	slash_e_anim = new PIXI.MovieClip(slash_e);
	slash_e_anim.animationSpeed = 0.2;
	slash_e_anim.visible = false;
	container.addChild(slash_e_anim);
	character.animations.attack.east = slash_e_anim;

	slash_w_anim = new PIXI.MovieClip(slash_w);
	slash_w_anim.animationSpeed = 0.2;
	slash_w_anim.visible = false;
	container.addChild(slash_w_anim);
	character.animations.attack.west = slash_w_anim;

	container.addChild(map_fg);

	character.animation = character.animations.walk.south;

	socket.emit('join', username, function(successful, users) {
		if (successful) {
			console.log('Connected to server');
			_.each(users, function(user) {
				if (user.username == character.username) {
					console.log('Its just me.');
				} else {
					var new_character = new PIXI.Sprite(walk_cycle_s_down);
					user.sprite = new_character;
					user.sprite.position = user.position;
					characters.push(user);
					container.addChildAt(user.sprite, 1);
				}
			});
		}
	});

	requestAnimFrame(update);
}


build_stage = function() {
	//console.log('Im not sure.');
}

function resize() {
	var width = $(window).width(); 
	var height = $(window).height();

	renderer.resize(width, height);
}


function update() {
	// This is all really ugly and won't actually stay like this. Please don't hold it against me. :)

	stats.begin();

	var gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];

	if (typeof gamepad == 'undefined') {
		gamepad = {};
		gamepad.buttons = [];
	}

	// Move North
	if (gamepad.buttons[12] > 0 || keyState[87]) {
		character.is_walking = true;
		character.animation = character.animations.walk.north;
		character.animation.visible = true;
		character.animation.play();

		character.animations.walk.south.visible = false;
		character.animations.walk.east.visible = false;
		character.animations.walk.west.visible = false;
		character.animations.attack.east.visible = false;

		character.direction = 'n';
		character.position.y -= 1;
		socket.emit('pc-move', character.position);
	} else {
		walk_cycle_n_anim.gotoAndStop(0);
	}

	// Move South
	if (gamepad.buttons[13] > 0 || keyState[83]) {
		character.is_walking = true;
		character.animation = character.animations.walk.south;
		character.animation.visible = true;
		character.animation.play();

		character.animations.walk.north.visible = false;
		character.animations.walk.east.visible = false;
		character.animations.walk.west.visible = false;
		character.animations.attack.east.visible = false;

		character.direction = 's';
		character.position.y += 1;
		socket.emit('pc-move', character.position);
	} else {
		walk_cycle_s_anim.gotoAndStop(0);
	}

	//Move West
	if (gamepad.buttons[14] > 0 || keyState[65]) {
		character.is_walking = true;
		character.animation = character.animations.walk.west;
		character.animation.visible = true;
		character.animation.play();

		character.animations.walk.north.visible = false;
		character.animations.walk.south.visible = false;
		character.animations.walk.east.visible = false;
		character.animations.attack.east.visible = false;

		character.direction = 'w';
		character.position.x -= 1;
		socket.emit('pc-move', character.position);
	} else {
		walk_cycle_w_anim.gotoAndStop(0);
	}

	//Move East
	if (gamepad.buttons[15] > 0 || keyState[68]) {
		character.is_walking = true;
		character.animation = character.animations.walk.east;
		character.animation.visible = true;
		character.animation.play();

		character.animations.walk.north.visible = false;
		character.animations.walk.south.visible = false;
		character.animations.walk.west.visible = false;
		character.animations.attack.east.visible = false;

		character.direction = 'e';
		character.position.x += 1;
		socket.emit('pc-move', character.position);
	} else {
		walk_cycle_e_anim.gotoAndStop(0);
	}

	//Slash
	if (gamepad.buttons[0] > 0 || keyState[32]) {
		walk_cycle_n_anim.visible = false;
		walk_cycle_s_anim.visible = false;
		walk_cycle_e_anim.visible = false;
		walk_cycle_w_anim.visible = false;

		slash_e_anim.visible = true;
		slash_e_anim.play(); 
	}

	if (slash_e_anim.currentFrame >= 5) {
		slash_e_anim.gotoAndStop(0);
	}

	_.each(characters, function(c) {
		walk_cycle_s_anim.position = c.position;
		container.addChildAt(walk_cycle_s_anim, 1)
	});

	//walk_cycle_n_anim.position = character.position;
	//walk_cycle_e_anim.position = character.position;
	//walk_cycle_s_anim.position = character.position;
	//walk_cycle_w_anim.position = character.position;
	//slash_e_anim.position = character.position;

	container.addChildAt(character.animation, 1);

	build_stage();

	renderer.render(stage);
	requestAnimFrame(update);
	stats.end();
}