var socket = io();

var localP = new Object();

var colours = {
    0: "none",
    1: "red",
    2: "white",
    3: "green",
    4: "blue"
}

var readyTxt = {
    true: "Ready",
    false: "Not Ready"
}

socket.on("message", function(data) {
    console.log(data);
});

socket.on("playerChange", function(player) {
    console.log("Players online have changed.")
    console.log(player);
    document.getElementById("pList").innerHTML = "";
    for(i = 1; i < player.length; i++) {
        document.getElementById("pList").innerHTML += "<li>" + player[i].nick + ", " + colours[player[i].colour] + ", " + readyTxt[player[i].ready] + "</li>";
    }
    document.getElementById("pQuantity").innerHTML = player.length - 1;
});

socket.on("localData", function(data) {
    localP.num = data[0];
    localP.name = data[1];
    localP.nick = data[2];
    localP.id = data[3];
    localP.colour = data[4];
    localP.ready = data[5];

    document.getElementById("pNameDisplay").innerHTML = localP.nick;
    if(localP.colour) document.getElementById("pColourTxt").innerHTML = "Your colour is " + colours[localP.colour];
    if(localP.ready == true) document.getElementById("readyButton").disabled = true;
});

socket.emit("new player");

socket.on("fullGame", function() {
    document.getElementById("game-full").style.visibility = "visible";
    document.getElementById("lobby").style.visibility = "hidden";
});

socket.on("interrupted", function() {
    document.getElementById("game-interrupt").style.visibility = "visible";
    document.getElementById("lobby").style.visibility = "hidden";
});

socket.on("nameTaken", function() {
    document.getElementById("pNameInput").value = "";
    document.getElementById("pNameInput").placeholder = "Name already in use.";
});

socket.on("colourTaken", function() {
    document.getElementById("pColourTxt").innerHTML = "Colour taken";
});

socket.on("colourNull", function() {
    document.getElementById("pColourTxt").innerHTML = "Please choose a colour";
});

socket.on("nameInvalid", function() {
    document.getElementById("pNameInput").value = "";
    document.getElementById("pNameInput").placeholder = "Name invalid.";
});

socket.on("startGame", function() {
    console.log("game start!!");
    document.getElementById("lobby").style.visibility = "hidden";
});

function initPage() {
    document.pNameForm.addEventListener("submit", function(e) {
        e.preventDefault();
    }, false);
}

function playerName(pName) {
    socket.emit("playerName", pName);
}

function chooseColour(pColour) {
    socket.emit("colourChoice", pColour);
}

function ready() {
    socket.emit("pReady");
}