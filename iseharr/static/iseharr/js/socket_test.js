$(function() {
	var socket = io.connect('http://localhost:9000');
	
	socket.emit('join', username, function(successful, users) {
		if (successful) {
			console.log(users);
		}
	});

	socket.on("chat", function(message) {
		$('#messages').append('<li>' + message.sender + ': ' + message.message + '</li>');
	});

	socket.on('pc-move-ack', function(pc) {
		console.log(pc.username + ' is now at ' + pc.position);
	});

	$("#message-form").submit(function(ev) {
		ev.preventDefault();
		socket.emit("chat", $("#message-input").val());
		$("#message-input").val("");
	});

});
