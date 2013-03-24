$(function() {

	var me = new Iseharr.PlayerCharacter(username);
	me.position.x = 576;
	me.position.y = 280;

	//me.socket = new WebSocket('ws://localhost:8080');
    var host = window.document.location.host.replace(/:.*/, '');
	me.socket = new WebSocket('ws://' + host + '/socket');

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
});
