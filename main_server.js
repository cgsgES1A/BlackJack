const express = require('express');
const favicon = require('serve-favicon')
const app = express();
const http = require('http');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { randomInt } = require('crypto');
const MongoClient = require('mongodb').MongoClient;
const MongoConnectionURL = "mongodb+srv://SumPracticeProjectBlackJack:PML_30_CGSG_FOREVER@main.sx78q.mongodb.net/Main?retryWrites=true&w=majority";

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var db = null;
var collection = null;

MongoClient.connect(MongoConnectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log(err);
    try {
        db = client.db('Main');
        collection = db.collection('Accounts');
        console.log("Database and collection connected succesfuly");
    }
    catch (err) {
        console.error(err);
    }
});
/*const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    console.log(err);
    client.close();
});*/

/*var debug = fs.createWriteStream('./!logs/errors.log');
process.stdout.write = debug.write.bind(debug);*/

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

var __CurID = randomInt(4294967296.0);

function getNextID() {
    __CurID += 1;

    return __CurID;
}

const Cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];

var rooms = [];

class User {
    socket = 0;
    cards = [];
    AceAmount = 0;

    constructor(id) {
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

        if (this.cardsum() > 21) {
            if (this.AceAmount > 0) {
                this.cards[this.cards.indexOf(11)] = 1;
                this.AceAmount -= 1;
            }
            else {
                return false;
            }
        }

        return true;
    }

    addcard_rnd() {
        let k = Cards[getRandomInt(Cards.length)];

        if (k == 11) {
            this.AceAmount += 1;
        }

        this.cards.push(k);

        if (this.cardsum() > 21) {
            if (this.AceAmount > 0) {
                this.cards[this.cards.indexOf(11)] = 1;
                this.AceAmount -= 1;
            }
            else {
                return false;
            }
        }

        return true;
    }

    isit(id) {
        if (this.socket.id == id) {
            return true;
        }
        else {
            return false;
        }
    }

    socket_default() {
        try {
            this.socket.on('disconnect', () => {
                SocketStdDisconnect(this.socket);
            });

            this.socket.on('take card', () => { });
            this.socket.on('end step', () => { });
            this.socket.on('start game', () => { });
        }
        catch (err) {
            console.error(err);
        }
    }

    socket_send(msg_type, msg) {
        try {
            this.socket.emit(msg_type, msg);
        }
        catch (err) {
            console.error(err);
        }
    }

    socket_get(msg_type, func) {
        try {
            this.socket.on(msg_type, func);
        }
        catch (err) {
            console.error(err);
        }
    }

    get_socket() {
        return this.socket;
    }
}

class Room {
    id = 0;
    users = [-1, -1, -1, -1, -1];
    dealer = null;
    step = 0;
    users_amount = 0;
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
                let socket = this.users[i].get_socket();
                this.users[i].socket_get('start game', () => {
                    this.start_game();
                });
                this.users[i].socket_get('disconnect', () => {
                    this.deluser(socket.id);
                    SocketStdDisconnect(socket);
                });
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
                this.users[i].socket_default();
                this.users[i] = 0;
                return true;
            }
            i += 1;
        }

        return false;
    }

    deluser_i(i) {
        if (this.users[i] != 0) {
            try {
                this.users[i].socket_default();
                this.users[i] = 0;
                return true;
            }
            catch (err) {
                console.error(err);
            }
        }

        return false;
    }

    start_game() {
        if (this.step != 0) {
            return;
        }

        this.step = 1;
        let i = 0, j = 0;
        let new_list = [0, 0, 0, 0, 0];

        while (i < 5) {
            if (!(this.users[i] == 0)) {
                new_list[j] = this.users[i];
                j += 1;
            }
            i += 1;
        }

        this.users = new_list;
        this.users_amount = j;

        if (this.users_amount == 0) {
            console.error("Unexpected error!");
            this.delroom();
            return;
        }

        this.curuser = -1;
    }

    next_user() {
        if (this.curuser >= 0) {
            this.users[this.curuser].socket_get('take card', () => { });
            this.users[this.curuser].socket_get('end step', () => { });
            this.users[this.curuser].socket_send('end step', 0);
        }

        this.curuser += 1;
        if (this.curuser >= this.users_amount) {
            this.step = 2;
            return;
        }

        let i = this.curuser;

        this.users[i].socket_get('take card', () => {
            let k = Cards[getRandomInt(Cards.length)];
            this.users[i].socket_send('take card', k);

            if (this.users[i].addcard(k) == false) {
                this.users[i].socket_send('end step', 0);
                this.next_uset_if(i);
            }
        });
        this.users[this.curuser].socket_get('end step', () => {
            this.next_uset_if(i);
        });
        this.users[i].socket_send('start step', 0);
    }

    next_uset_if(i) {
        if (this.step == 1 & this.curuser == i) {
            this.next_user();
        }
    }

    delroom() {
        step = -1;
        this.users_amount = 0;
    }

    send_all(msg_type, msg) {
        let i = 0;

        try {
            while (i < 5) {
                if (!(this.users[1] == 0)) {
                    this.users[1].socket_send(msg_type, msg);
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}

app.use(cookieParser());
app.use(express.static(__dirname + '/html'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/javascript'));
app.use(express.static(__dirname + '/images'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/create_room', function (req, res) {
    res.writeHead(200);
    let room = new Room(getNextID());
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
        socket.emit("entersuccessful", false);
        return;
    }

    try {
        let roomid = socket.handshake.query.roomid;
        let i = 0;

        while (i < rooms.length) {
            if (rooms[i].isit(roomid)) {
                rooms[i].adduser(socket.id);
                socket.emit("entersuccessful", true);
                return;
            }

            i += 1;
        }
    }
    catch (err) {
        console.log("Error");
        console.error(err);
        socket.emit("entersuccessful", false);
    }


    socket.on('disconnect', () => {
        SocketStdDisconnect(socket);
    });
});

function SocketStdDisconnect(socket) {
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
}

async function CheckLogin(name, pass) {
    if (collection == null) {
        return false;
    }

    let user = await collection.findOne({ name: name });

    if (user == null) {
        return false;
    }

    if (user.pass == pass) {
        return true;
    }
    else {
        return false;
    }
}

async function AddUser(name, pass) {
    if (collection == null) {
        return false;
    }

    if (!(await collection.findOne({ name: name }) == null)) {
        return false;
    }

    try {
        collection.insertOne({ name: name, pass: pass });
        return true;
    }
    catch (err) {
        console.error(err);
    }

    return false;
}

app.post('/login', (req, res) => {
    try {
        let data = "";
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            try {
                let msg = JSON.parse(data);
                CheckLogin(msg.name, msg.password).then(data => {
                    res.end(data.toString());
                });
            }
            catch (err) {
                console.log(err);
            }
        })
    }
    catch (err) {
        console.error(err);
    }

});

app.post('/signup', (req, res) => {
    try {
        let data = "";
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            try {
                let msg = JSON.parse(data);
                AddUser(msg.name, msg.password).then(data => {
                    res.end(data.toString());
                });
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    catch (err) {
        console.log(err);
    }
    return;
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});