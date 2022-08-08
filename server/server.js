var express = require('express');
var socket = require('socket.io');
var app = express();

var server = app.listen(process.env.PORT || 3001, function(){
	console.log("Snake WS Server running on", this.address().port);
});

var io = socket(server);

const generatePosition = () => {
    let x = Math.floor(Math.trunc(Math.random() * (20 - 0) + 0));
    let y = Math.floor(Math.trunc(Math.random() * (30 - 0) + 0));

    return {x, y};
}

var players = [];
var food = generatePosition();

io.on('connection', async (socket) => {
    socket.on('join', () => {
        let { x, y } = generatePosition();
        players.push({ socketId: socket.id, x, y, points: 0 });
        io.emit('update players', players);
        socket.emit('update food', food);
    });

    socket.on('move', (key) => {
        move(socket.id, key);

        players.forEach(player => {
            if (player.x === food.x && player.y === food.y) {
                player.points++;
                food = generatePosition();
                io.emit('update food', food);
            }
        });

        io.emit('update players', players.sort((a, b) => b.points - a.points));
    });

	socket.on('disconnect', () => {
        players = players.filter(player => player.socketId !== socket.id);
        socket.broadcast.emit('update players', players);
    });
});

const move = (socketId, direction) => {
    switch(direction) {
        case 'w' || 'ArrowUp':
            if (players.find(p => p.socketId === socketId).x == 0) players.find(p => p.socketId === socketId).x = 19;
            else players.find(p => p.socketId === socketId).x -= 1;
            break;
        case 'a' || 'ArrowLeft':
            if (players.find(p => p.socketId === socketId).y == 0) players.find(p => p.socketId === socketId).y = 29;
            else players.find(p => p.socketId === socketId).y -= 1;
            break;
        case 's' || 'ArrowDown':
            if (players.find(p => p.socketId === socketId).x == 19) players.find(p => p.socketId === socketId).x = 0;
            else players.find(p => p.socketId === socketId).x += 1;
            break;
        case 'd' || 'ArrowRight':
            if (players.find(p => p.socketId === socketId).y == 29) players.find(p => p.socketId === socketId).y = 0;
            else players.find(p => p.socketId === socketId).y += 1;
            break;
    }
}