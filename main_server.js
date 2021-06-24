const express = require('express');
const favicon = require('serve-favicon')
const app = express();
const http = require('http');
const fs = require('fs');
const crypto = require("crypto");
const cookieParser = require('cookie-parser');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require("bcrypt");
const md5 = require("md5");

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const MongoConnectionProjectName = "SumPracticeProjectBlackJack";
const MongoConnectionPassword = "PML_30_CGSG_FOREVER";
const MongoConnectionURL = `mongodb+srv://${MongoConnectionProjectName}:${MongoConnectionPassword}@main.sx78q.mongodb.net/Main?retryWrites=true&w=majority`;

var db = null;
var accounts_collection = null;

MongoClient.connect(MongoConnectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log(err);
    try {
        db = client.db('Main');
        accounts_collection = db.collection('Accounts');
        console.log("Database and collection connected succesfuly");
    }
    catch (err) {
        console.error(err);
    }
});

function getRandomInt(max) {
    return crypto.randomInt(0, max);
}

var __CurID = getRandomInt(65536);

function getNextID() {
    __CurID += 1;
    __CurID = __CurID % 65536;

    return (11259375 + __CurID * 47).toString(16);
}

function Encrypt(data) {
    try {
        const salt = bcrypt.genSaltSync(4);
        return (bcrypt.hashSync(data, salt)).toString("hex");
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

function CheckEncrypted(data, encrypted) {
    try {
        return bcrypt.compareSync(data, encrypted);
    }
    catch (err) {
        return false;
    }
}

const Cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];

var rooms = [];

class User {
    socket = 0;
    cards = [];

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
        this.cards.push(n);

        if (this.cardsum() == 21) {
            return false;
        }

        if (this.cardsum() > 21) {
            let i = this.cards.indexOf(11);

            if (i == -1) {
                return false;
            }
            else {
                this.cards[i] = 1;
                return true;
            }
        }

        return true;
    }

    addcard_rnd() {
        let k = Cards[getRandomInt(Cards.length)];

        this.cards.push(k);

        if (this.cardsum() == 21) {
            return false;
        }

        if (this.cardsum() > 21) {
            let i = this.cards.indexOf(11);

            if (i == -1) {
                return false;
            }
            else {
                this.cards[i] = 1;
                return true;
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
            this.socket.removeAllListeners();

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

    get_name() {
        try {
            return this.socket.handshake.query.name;
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }
}

class Room {
    id = 0;
    users = [-1, -1, -1, -1, -1];
    step = 0;
    users_amount = 0;
    curuser = -1;
    dealer_cards = [];
    dealer_cards_sum = 0;
    creation_time = 0;

    getid() {
        return this.id;
    }

    constructor(id) {
        this.id = id;
        this.creation_time = Date.now();
    }

    is_del_time() {
        if (this.step == -1) {
            return true;
        }
        if (this.step != 0 && this.users[0] == -1 && this.users[1] == -1 && this.users[2] == -1 && this.users[3] == -1 && this.users[4] == -1) {
            return true;
        }
        if (this.step == 0 && this.users_amount <= 0 && (Date.now() - this.creation_time) > 120000) {
            return true;
        }
        if (this.step > 0 && this.users_amount <= 0) {
            return true;
        }

        return false;
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

        if (this.step != 0) {
            return false;
        }

        while (i < 5) {
            if (this.users[i] == -1) {
                this.users_amount += 1;
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
            if (this.users[i] != -1 && this.users[i].isit(id)) {
                this.users[i].socket_default();
                this.users[i] = -1;
                this.users_amount -= 1;
                return true;
            }
            i += 1;
        }

        return false;
    }

    deluser_i(i) {
        if (this.users[i] != -1) {
            try {
                this.users[i].socket_default();
                this.users[i] = -1;
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
        let new_list = [-1, -1, -1, -1, -1];

        while (i < 5) {
            if (!(this.users[i] == -1)) {
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

        i = 0;

        while (i < this.users_amount) {
            try {
                let c1 = Cards[getRandomInt(Cards.length)];
                let c2 = Cards[getRandomInt(Cards.length)];
                this.users[i].addcard(c1);
                this.users[i].addcard(c2);

                let j = 0;
                let Names = [];

                while (j < this.users_amount) {
                    if (j != i) {
                        Names.push(this.users[j].get_name());
                    }
                    j += 1;
                }

                this.users[i].socket_send('start game', [[c1, c2], this.users_amount - 1, Names, this.users[i].cardsum()]);

                this.users[i].socket_get('take card', () => { });
                this.users[i].socket_get('end step', () => { });
                this.users[i].socket_get('start game', () => { });
            }
            catch (err) {
                console.error(err);
            }

            i += 1;
        }

        this.curuser = -1;

        this.next_user();
    }

    next_user() {
        if (this.curuser >= 0) {
            if (this.users[this.curuser] != -1) {
                try {
                    this.users[this.curuser].socket_get('take card', () => { ; });
                    this.users[this.curuser].socket_get('end step', () => { ; });
                    this.users[this.curuser].socket_send('end step', 0);

                    let socket = this.users[this.curuser].get_socket();
                    this.users[this.curuser].socket_get('disconnect', () => {
                        this.deluser(socket.id);
                        SocketStdDisconnect(socket);
                    });
                }
                catch (err) {
                    console.error(err);
                }
            }

            for (let i = 0; i < this.users_amount; i += 1) {
                if (i > this.curuser) {
                    this.users[i].socket_send('end player step', this.curuser);
                }
                else if (i < this.curuser) {
                    this.users[i].socket_send('end player step', this.curuser - 1);
                }
            }
        }

        this.curuser += 1;
        if (this.curuser >= this.users_amount) {
            this.step = 2;
            setTimeout(() => { this.dealer_step_start(); }, 2000);
            return;
        }
        else {
            for (let i = 0; i < this.users_amount; i += 1) {
                if (i > this.curuser) {
                    this.users[i].socket_send('start player step', this.curuser);
                }
                else if (i < this.curuser) {
                    this.users[i].socket_send('start player step', this.curuser - 1);
                }
            }
        }

        let i = this.curuser;
        let user = this.users[i];

        this.users[i].socket_send('start user step', 0);

        try {
            if (user == -1 || user.cardsum() >= 21) {
                this.users[i].socket_send('end user step', user.cardsum());
                this.next_user();
                return;
            }
        }
        catch (err) {
            console.error(err);
            this.next_user();
        }

        this.users[i].socket_get('take card', () => {
            if (this.curuser != i) {
                return;
            }
            let k = Cards[getRandomInt(Cards.length)];
            let flag = user.addcard(k);
            user.socket_send('user card', [k, user.cardsum()]);
            this.player_got_card(i);

            if (flag == false) {
                user.socket_send('end user step', user.cardsum());
                this.next_user_if(i);
            }
        });

        this.users[this.curuser].socket_get('end step', () => {
            if (this.curuser != i) {
                return;
            }
            user.socket_send('end user step', user.cardsum());
            this.next_user_if(i);
        });

        let socket = this.users[i].get_socket();
        this.users[i].socket_get('disconnect', () => {
            if (this.curuser == i) {
                this.next_user();
            }
            this.deluser(socket.id);
            SocketStdDisconnect(socket);
        });
    }

    player_got_card(i) {
        for (let j = 0; j < this.users_amount; j += 1) {
            if (j > i) {
                this.users[j].socket_send('player card', i);
            }
            else if (j < i) {
                this.users[j].socket_send('player card', i - 1);
            }
        }
    }

    next_user_if(i) {
        if (this.step == 1 & this.curuser == i) {
            this.next_user();
        }
    }

    delroom() {
        this.step = -1;
        this.send_all('disconnect_user', 0);
        this.users = [-1, -1, -1, -1, -1];
        this.users_amount = 0;
    }

    send_all(msg_type, msg) {
        let i = 0;

        try {
            while (i < 5) {
                if (!(this.users[i] == -1)) {
                    this.users[i].socket_send(msg_type, msg);
                }

                i += 1;
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    dealer_step_start() {
        let c1 = Cards[getRandomInt(Cards.length)];
        let c2 = Cards[getRandomInt(Cards.length)];

        this.dealer_cards.push(c1);
        this.dealer_cards.push(c2);
        this.dealer_cards_sum += c1 + c2;

        this.send_all('start dealer step', [c1, c2]);

        setTimeout(() => { this.dealer_take_card(); }, 1000 + getRandomInt(1000));
    }

    dealer_take_card() {
        if (this.dealer_cards_sum > 21) {
            let i = this.dealer_cards.indexOf(11);

            if (i == -1) {
                this.send_all('end dealer step', this.dealer_cards_sum);
                setTimeout(() => { this.end_game() }, 2000);
                return;
            }

            this.dealer_cards_sum -= 10;
            this.dealer_cards[i] = 1;
        }

        if (this.dealer_cards_sum < 17) {
            let k = Cards[getRandomInt(Cards.length)];

            this.dealer_cards_sum += k;
            this.dealer_cards.push(k);

            this.send_all('dealer card', k);

            setTimeout(() => { this.dealer_take_card(); }, 2500 + getRandomInt(1500));
        }
        else {
            this.send_all('end dealer step', this.dealer_cards_sum);
            setTimeout(() => { this.end_game() }, 2000);
        }
    }

    end_game() {
        let all_users_score = [-1, -1, -1, -1, -1];

        for (let j = 0; j < this.users_amount; j += 1) {
            if (this.users[j] != -1) {
                all_users_score[j] = this.users[j].cardsum();
            }
        }

        for (let i = 0; i < this.users_amount; i += 1) {
            if (this.users[i] != -1) {
                let sum = all_users_score[i];
                let flag = false;
                let users_score = [];

                for (let j = 0; j < this.users_amount; j += 1) {
                    if (all_users_score[j] != -1 && j != i) {
                        if (typeof all_users_score[j] == 'object') {
                            users_score.push(all_users_score[j][0]);
                        }
                        else {
                            users_score.push(all_users_score[j]);
                        }
                    }
                }

                if (this.users_amount > 0) {
                    if (sum == 21) {
                        flag = true;
                    }
                    else if (sum < this.dealer_cards_sum && this.dealer_cards_sum <= 21) { }
                    else if (sum < 21) {
                        let tmp = true;
                        for (let j = 0; j < users_score.length; j += 1) {
                            if (users_score[j] <= 21 && users_score[j] > sum) {
                                tmp = false;
                                break;
                            }
                        }

                        flag = tmp;
                    }
                }
                else if ((sum >= this.dealer_cards_sum && sum < 21) || sum == 21) {
                    flag == true;
                }

                all_users_score[i] = [all_users_score[i], flag];
            }
        }

        for (let i = 0; i < this.users_amount; i += 1) {
            if (this.users[i] != -1) {
                let tmp = [];

                for (let j = 0; j < this.users_amount; j += 1) {
                    if (i != j) {
                        tmp.push(all_users_score[j]);
                    }
                }

                tmp.push(this.dealer_cards_sum);

                this.users[i].socket_send('end game', [this.users_amount - 1, tmp, all_users_score[i][1]]);
            }
        }

        setTimeout(() => { this.delroom(); }, 10000);
    }
}

function RoomCleaner() {
    let forDel = [];
    rooms.forEach((val, i) => {
        if (val.is_del_time()) {
            forDel.push(i);
        }
    });

    let tmp = rooms.length;

    for (let i = forDel.length - 1; i >= 0; i -= 1) {
        rooms[forDel[i]].send_all('disconnect_user', 0);
        rooms.splice(forDel[i], 1);
    }

    console.log(`Rooms avalible: ${tmp}; Will be deleted: ${forDel.length}; After cleaning: ${rooms.length}`);
}

app.use(cookieParser());
app.use(express.static(__dirname + '/html'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/javascript'));
app.use(express.static(__dirname + '/images'));
app.use(favicon(__dirname + '/images/BlackJack_03.ico'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/create_room', function (req, res) {
    res.writeHead(200);
    let room = new Room(getNextID());
    console.log(`New room created. Id: ${room.getid()}`);
    rooms.push(room);
    res.end(room.getid().toString());
});

io.on('connection', (socket) => {
    try {
        console.log(`${socket.handshake.query.name} connected. IP: ${socket.handshake.address} id: ${socket.id}`);
    }
    catch (err) {
        console.log("Error");
        console.error(err);
        socket.emit("entersuccessful", false);
        return;
    }

    if (CheckBan(socket.handshake.address)) {
        socket.emit("entersuccessful", false);
        return;
    }

    try {
        let roomid = socket.handshake.query.roomid;
        let i = 0;

        while (i < rooms.length) {
            if (rooms[i].isit(roomid)) {
                socket.emit("entersuccessful", rooms[i].adduser(socket.id));
                return;
            }

            i += 1;
        }

        socket.emit("entersuccessful", false);
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
    if (accounts_collection == null) {
        return false;
    }

    try {
        let user = await accounts_collection.findOne({ name: name });

        if (user == null || user.pass == -1) {
            return false;
        }

        if (CheckEncrypted(pass, user.pass)) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (err) {
        console.error(err);
        return false;
    }
}

async function AddUser(name, pass) {
    if (collection == null) {
        return false;
    }

    try {
        if (!(await accounts_collection.findOne({ name: name }) == null)) {
            return false;
        }

        accounts_collection.insertOne({ name: name, pass: Encrypt(pass) });
        return true;
    }
    catch (err) {
        console.error(err);
    }

    return false;
}

function CheckBan(IP) {
    const blacklist = ["192.168.30.3"];

    let ip = IP.slice(7);

    if (blacklist.indexOf(ip) != -1) {
        console.log(`User with ip: ${socket.handshake.address} was is banned!`);
        return true;
    }

    return false;
}

app.post('/login', (req, res) => {
    let forwarded = req.headers['x-forwarded-for'];
    let ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;

    if (CheckBan(ip)) {
        return false;
    }

    try {
        let data = "";
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            try {
                let msg = JSON.parse(data);
                CheckLogin(msg.name, msg.password).then(data => {
                    console.log(`Login try: name: ${msg.name}, pass(hash): ${msg.password}. IP: ${ip} Result: ${data}`);
                    res.writeHead(200);
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
    let forwarded = req.headers['x-forwarded-for'];
    let ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;

    if (CheckBan(ip)) {
        return false;
    }

    try {
        let data = "";
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            try {
                let msg = JSON.parse(data);
                AddUser(msg.name, msg.password).then(data => {
                    console.log(`Sign up try: name: ${msg.name}, pass(hash): ${msg.password}. IP: ${ip} Result: ${data}`);
                    res.writeHead(200);
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

setInterval(() => { RoomCleaner(); }, 60 * 1000);
