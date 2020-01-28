// Dependencies
var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");var app = express();
var server = http.Server(app);
var io = socketIO(server);app.set("port", 5000);
app.use("/static", express.static(__dirname + "/static"));// Routing
app.get("/", function(request, response) {
  response.sendFile(path.join(__dirname, "index.html"));
});// Starts the server.
server.listen(5000, function() {
  console.log("Starting server on port 5000");
});

// Add the WebSocket handlers

var player = [];
player[0] = new Object();
var gameStarted = false;

io.on("connection", function(socket) {
    io.sockets.emit("message", "Sending ids");
    socket.on("new player", function() {
        console.log("Players: " + player.length);
        if(gameStarted == true) {
            console.log("New socket joined: " + socket.id + "; Game is already in progress.");
            socket.emit("message", "This socket's ID is " + socket.id + ". Game is already in progress.");
            socket.emit("interrupted");
        } else if(player.length > 4) {
            console.log("New socket joined: " + socket.id + "; Game is full.");
            socket.emit("message", "This socket's ID is " + socket.id + ". Game is full.");
            socket.emit("fullGame");
        } else {
            var i = player.length;
            console.log(i);
            player[i] = new Object;
            var p = player[i];
            p.num = function() {
                num = player.indexOf(this);
                return num;
            }
            p.name = function() {
                name = "Player " + this.num();
                return name;
            }
            p.nick = "Player " + p.num();
            p.colour = 0;
            p.customNick = false;
            p.id = socket.id;
            p.ready = false;
            console.log("New socket joined: " + socket.id);
            socket.emit("message", "This socket's ID is " + socket.id + ". You are player " + p.num());
            changePlayers();
        }
    });
    socket.on("disconnect", function() {
        var p = getSocket(socket.id);
        if(p) {
            player.splice(p.num(), 1);
        }
        changePlayers();
    });
    socket.on("playerName", function(pName) {
        var p = getSocket(socket.id);
        if((pName.length > 7 && pName.slice(0, 7) == "Player ") || !pName.trim()) {
            socket.emit("nameInvalid");
            return;
        }
        for(i = 1; i < player.length; i++) {
            if(player[i].nick == pName && player[i] != p) {
                socket.emit("nameTaken");
                return;
            }
        }
        p.nick = pName;
        p.customNick = true;
        changePlayers();
    });
    socket.on("colourChoice", function(pColour) {
        var p = getSocket(socket.id);
        for(i = 1; i < player.length; i++) {
            if(player[i].colour && (player[i].colour == pColour && player[i] != p)) {
                socket.emit("colourTaken");
                return;
            }
        }
        p.colour = pColour;
        changePlayers();
    });
    socket.on("pReady", function() {
        var p = getSocket(socket.id);
        if(!p.colour) {
            socket.emit("colourNull");
            return;
        }
        p.ready = true;
        changePlayers();
        for(i = 1; i < player.length; i++) {
            if(player[i].ready == false) {
                console.log(i + " is not ready");
                return;
            }
        }
        startGame();
    });
});

function startGame() {
    gameStarted = true;
    io.sockets.emit("startGame");
}

function getSocket(id) {
    var p;
    for(i = 1; i < player.length; i++) {
        if(player[i].id == id) p = player[i];
    }
    return p;
}

function changePlayers() {
    for(n = 1; n < player.length; n++) {
        if(player[n].customNick == false) player[n].nick = "Player " + player[n].num();
        io.to(player[n].id).emit('localData', [player[n].num(), player[n].name(), player[n].nick, player[n].id, player[n].colour, player[n].ready]);
    }
    io.sockets.emit("playerChange", player);
}