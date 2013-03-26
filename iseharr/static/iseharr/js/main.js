var stats = new Stats();
var keyState = {};
var has_GamePad;
var last_time;
var player;

$(function() {
    // Bind to events.
    $(document).keydown(updateKeyState);
    $(document).keyup(updateKeyState);
    $(window).resize(resize)
    window.onorientationchange = resize;
    
    // Setup stats.
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild( stats.domElement );

    // Setup Player
    player = new Iseharr.PlayerCharacter(username);
    player.position.x = 576;
    player.position.y = 280;

    // Start socket. This really needs to go somewhere else.
    player.socket = new WebSocket('ws://localhost:8080/socket');

    //var host = window.document.location.host.replace(/:.*/, '');
    //player.socket = new WebSocket('ws://' + host + '/socket');

    player.socket.onopen = function() {
        var data = {
            type: 'connect',
            data: { 'username': player.username, 'position': player.position }
        }
        player.socket.send(JSON.stringify(data));
    }

    player.socket.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        if (msg.type === 'chat') {
            $('#messages').append('<li>' + msg.data.username + ': ' + msg.data.text + '</li>');
            console.log(msg.data.username + ':', msg.data.text);
        }
        if (msg.type === 'connect-ack') {
            player.uuid = msg.data.uuid;
            console.log(player);
        }
        if (msg.type === 'connect-fail') {
            console.log('Fail');
        }
        if (msg.type === 'position-update') {
            //console.log(msg.data.position, player.position);
            player.position = msg.data.position;
        }
    }

    player.chat = function(message) {
        console.log(this.socket);

        var data = {
            type: 'chat',
            data: {
                username: this.username,
                uuid: this.uuid,
                text: message
            }
        }
        this.socket.send(JSON.stringify(data));
    }

    // Set up Pixi
    renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
    stage = new PIXI.Stage(0x000000);
    bg = new PIXI.Stage(0x000000);

    is_webGL = renderer instanceof PIXI.WebGLRenderer;
    has_GamePad = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;

    document.body.appendChild(renderer.view);
    //$('#render-target').append(renderer.view);
    container = new PIXI.DisplayObjectContainer();
    stage.addChild(container);

    asset_url = $('#render-target').attr('asset-url');
    var asset_list = [
        asset_url + '/img/map_bg.png', 
        asset_url + '/img/map_fg.png', 
        asset_url + '/img/character.json'
    ];

    loader = new PIXI.AssetLoader(asset_list);
    loader.onComplete = onAssetsLoaded;
    loader.crossorigin = true;
    loader.load();
});

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

    walk_cycle_s_anim = new PIXI.MovieClip(walk_cycle_s);
    walk_cycle_s_anim.position.x = 0;
    walk_cycle_s_anim.animationSpeed = 0.2;
    walk_cycle_s_anim.visible = true;
    container.addChild(walk_cycle_s_anim);
    player.animations.walk_south = walk_cycle_s_anim;
    player.current_animation = player.animations.walk_south;
    console.log(player);

    container.addChild(player.current_animation);

    container.addChild(map_fg);

    last_time = new Date().getTime();
    requestAnimFrame(update);
}

function updateKeyState(e) {
    if (e.type == 'keydown') {
        keyState[e.keyCode] = true;
    } else if (e.type == 'keyup') {
        keyState[e.keyCode] = false;
    }
}

handle_input = function(gamepad, time, dt) {
    var direction = new PIXI.Point(0,0);
    var moving = false;

    // North
    if (gamepad.buttons[12] > 0 || keyState[87]) {
        direction.y = -1;
        moving = true;
    }
    // South
    if (gamepad.buttons[13] > 0 || keyState[83]) {
        direction.y = 1;
        moving = true;
    }
    // West
    if (gamepad.buttons[14] > 0 || keyState[65]) {
        direction.x = -1;
        moving = true;
    }
    // East
    if (gamepad.buttons[15] > 0 || keyState[68]) {
        direction.x = 1;
        moving = true;
    }

    if (moving) {
        player.move(direction, time);
    } else {
        player.stop_move(time);
    }

}

function resize() {
    var width = $(window).width(); 
    var height = $(window).height();

    renderer.resize(width, height);
}

function update(time) {
    stats.begin();

    var gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];

    if (typeof gamepad == 'undefined') {
        gamepad = {};
        gamepad.buttons = [];
    }

    var dt = time - last_time; //Note that last_time is initialized priorly
    last_time = time;
    handle_input(gamepad, time, dt);
    player.update(dt);
    renderer.render(stage);
    requestAnimFrame(update);
    stats.end();
}
