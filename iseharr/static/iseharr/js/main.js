var stats = new Stats();
var keyState = {};
var has_GamePad;
var last_time;

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
    var me = new Iseharr.PlayerCharacter(username);
    me.position.x = 576;
    me.position.y = 280;

    // Start socket. This really needs to go somewhere else.
    me.socket = new WebSocket('ws://localhost:8080/socket');

    //var host = window.document.location.host.replace(/:.*/, '');
    //me.socket = new WebSocket('ws://' + host + '/socket');

    me.socket.onopen = function() {
        var data = {
            type: 'connect',
            data: { 'username': me.username, 'position': me.position }
        }
        me.socket.send(JSON.stringify(data));
    }

    me.socket.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        if (msg.type === 'chat') {
            $('#messages').append('<li>' + msg.data.username + ': ' + msg.data.text + '</li>');
            console.log(msg.data.username + ':', msg.data.text);
        }
        if (msg.type === 'connect-ack') {
            me.uuid = msg.data.uuid;
            console.log(me);
        }
        if (msg.type === 'connect-fail') {
            console.log('Fail');
        }
    }

    me.chat = function(message) {
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
        asset_url + '/img/spritesheet.json'
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

function resize() {
    var width = $(window).width(); 
    var height = $(window).height();

    renderer.resize(width, height);
}

function update(time) {
    stats.begin();
    var dt = time - last_time; //Note that last_time is initialized priorly
    last_time = time;
    console.log(dt);
    renderer.render(stage);
    requestAnimFrame(update);
    stats.end();
}