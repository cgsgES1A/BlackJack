const express = require('express');
const favicon = require('serve-favicon')
const app = express();
const http = require('http');
const fs = require('fs');
var cookieParser = require('cookie-parser');

const server = http.createServer(app);
const { Server } = require("socket.io");
const { randomInt } = require('crypto');
const io = new Server(server);

/*var debug = fs.createWriteStream('./!logs/errors.log');
process.stdout.write = debug.write.bind(debug);*/

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const Cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];

var rooms = [];

class User {
    id = 0;
    cards = [];
    socket = 0;
    AceAmount = 0;

    constructor(id) {
        this.id = id;
        this.socket = io.sockets.sockets.get(id);
    }

    cardsum() {
        let n = 0;

        this.cards.forEach(val => {
            n += val;
        });

        return n;
    }

    addcard(n) {
        cards.push(n);

        if (this.cardsum() > 21 & this.AceAmount > 0) {
            this.cards[this.cards.indexOf(11)] = 1;
            this.AceAmount -= 1;
        }
    }

    addcard_rnd() {
        let k = Cards[getRandomInt(Cards.length)];

        if (k == 11) {
            this.AceAmount += 1;
        }

        this.cards.push(k);

        if (this.cardsum() > 21 & this.AceAmount > 0) {
            this.cards[this.cards.indexOf(11)] = 1;
            this.AceAmount -= 1;
        }
    }

    isit(id) {
        if (this.id == id) {
            return true;
        }
        else {
            return false;
        }
    }
}

class Room {
    id = 0;
    users = [-1, -1, -1, -1, -1];
    dealer = null;
    step = 0;
    curuser = -1;

    getid() {
        return this.id;
    }

    constructor(id) {
        this.id = id;
    }

    isit(id) {
        if (this.id == id) {
            return true;
        }
        else {
            return false;
        }
    }

    adduser(id) {
        let i = 0;

        while (i < 5) {
            if (this.users[i] == -1) {
                this.users[i] = new User(id);
                return true;
            }
            i += 1;
        }

        return false;
    }

    deluser(id) {
        let i = 0;

        while (i < 5) {
            if (this.users[i] != 0 & this.users[i].isit(id)) {
                this.users[i] = 0;
                return true;
            }
            i += 1;
        }

        return false;
    }
}

app.use(cookieParser());
app.use(express.static('html'));
app.use(express.static('css'));
app.use(express.static('javascript'));
app.use(express.static('images'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/create_room', function (req, res) {
    res.writeHead(200);
    let room = new Room(randomInt(4294967296.0));
    rooms.push(room);
    res.end(room.getid().toString());
});

io.on('connection', (socket) => {
    try {
        console.log(`${socket.handshake.query.name} connected. id: ${socket.id}`);
    }
    catch (err) {
        console.log("Error");
        console.error(err);
        return;
    }

    try {
        let roomid = socket.handshake.query.roomid;
        let i = 0;

        while (i < rooms.length) {
            if (rooms[i].isit(roomid)) {
                rooms[i].adduser(socket.id);
                return;
            }

            i += 1;
        }
    }
    catch (err) {
        console.log("Error");
        console.error(err);
    }


    socket.on('disconnect', () => {
        try {
            console.log(`${socket.handshake.query.name} disconnected. id: ${socket.id}`);
            let roomid = socket.handshake.query.roomid;
            let i = 0;

            while (i < rooms.length) {
                if (rooms[i].isit(roomid)) {
                    rooms[i].deluser(socket.id);
                    return;
                }

                i += 1;
            }
        }
        catch (err) {
            console.log("Error");
            console.error(err);
        }
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});