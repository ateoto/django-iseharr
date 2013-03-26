$(function() {
    var start_tick = Date.now();
    var current_tick = start_tick;
    var last_tick = start_tick;
    var tickcount = current_tick - start_tick;
    var me = new Iseharr.PlayerCharacter(username);
    me.position.x = 576;
    me.position.y = 280;

    //me.socket = new WebSocket('ws://localhost:8080/socket');
    var host = window.document.location.host.replace(/:.*/, '');
    me.socket = new WebSocket('ws://' + host + '/socket');

    me.socket.onopen = function() {
        current_tick = Date.now();
        tickcount = current_tick - start_tick;
        var data = {
            type: 'connect',
            data: { 
                'username': me.username, 
                'position': me.position,
                time: current_tick,
                tickcount: tickcount
            }
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
        if (msg.type === 'ping') {
            var data = {
                type: 'pong',
                data: {
                    uuid: me.uuid,
                    tickcount: msg.data.tickcount
                }
            }
            me.socket.send(JSON.stringify(data));
            $('#ping').text(msg.data.ping);
        }
    }

    me.hello = function() {
        current_tick = Date.now();
        tickcount = current_tick - start_tick;
        var data = {
            type: 'time-check',
            data: {
                uuid: me.uuid,
                time: current_tick,
                tickcount: tickcount
            }
        }
        console.log(data.data.time);
        me.socket.send(JSON.stringify(data));
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

    $('#message-input').keyup(function(e) {
        if (e.which === 13) {
            var message = $('#message-input').val();
            me.chat(message);
            $('#message-input').val('');
        }
        e.preventDefault();
        e.stopPropagation();
    });

    //setInterval(me.hello, 10000);
});