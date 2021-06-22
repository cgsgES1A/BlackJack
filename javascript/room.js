import _ from 'lodash'
import * as $ from 'jquery';
import { io, Socket } from 'socket.io-client';
const Cookies = require('js-cookie');

var socket;

function roomConnection() {
    let userName = Cookies.get('userName');
    let roomId = Cookies.get('roomId');

    alert(`Room Id: ${roomId}\nUser name: ${userName}`);
    if (userName == null || userName == undefined || roomId == null || roomId == undefined) {
        alert("Error in room connection (not enough data to login)");
        return;
    }
    socket = io({ query: { name: userName, roomid: roomId } });
    socket.on("entersuccessful", (enterFlag) => {
        if (enterFlag == false) {
            socket.disconnect();
            alert("Error in room connection");
        }
        else {
            alert("You are in the game room");
            SocketCallbackInit();
        }
    });
}

function SocketCallbackInit() {
    socket.on('start game', function (msg) { startGame(msg); });
    socket.on('start user step', function (msg) { startUserStep(msg) });
    socket.on('end user step', function (msg) { endUserStep(msg) });
    socket.on('user card', function (msg) { userCardDistr(msg) });
    socket.on('player card', function (msg) { enemyCardDistr(msg) });
    socket.on('dealer card', function (msg) { croupierCardDistr(msg) });
    socket.on('start player step', function (msg) { startEnemyStep(msg) });
    socket.on('end player step', function (msg) { endEnemyStep(msg) });
    socket.on('start dealer step', function (msg) { startCroupierStep(msg) });
    socket.on('end dealer step', function (msg) { endCroupierStep(msg) });
    socket.on('end game', function (msg) { endGame(msg) });
}

/*
 * Game start and end functions.
 */

function startGame(Message) {
    console.log(`This is start game message`);
    console.log(Message);
    /* Distribute two cards to every player */
    ;
}

function endGame(Message) {
    console.log(`This is end game message`);
    console.log(Message);
    /* Output all players score */
    ;
    /* Output if user won or not */
    ;
}

/*
 * Gamers steps functions.
 */

function startUserStep(Message) {
    console.log(`This is start user step message`);
    console.log(Message);
    /* The UI appears */
    ;
}

function endUserStep(Message) {
    console.log(`This is end user step message`);
    console.log(Message);
    /* The UI disappears */
    ;
}

function startEnemyStep(Message) {
    console.log(`This is start player step message`);
    console.log(Message);
    ;
}

function endEnemyStep(Message) {
    console.log(`This is end player step message`);
    console.log(Message);
    ;
}

function startCroupierStep(Message) {
    console.log(`This is start croupier step message`);
    console.log(Message);
    ;
}

function endCroupierStep(Message) {
    console.log(`This is end croupier step message`);
    console.log(Message);
    ;
}

/*
 * Playing card distribution functions.
 */

function userCardDistr(Message) {
    console.log(`This is user card message`);
    console.log(Message);
    ;
}

function enemyCardDistr(Message) {
    console.log(`This is player card message`);
    console.log(Message);
    ;
}

function croupierCardDistr(Message) {
    console.log(`This is croupier card message`);
    console.log(Message);
    ;
}

function onLoad() {
    roomConnection();
    $("#start").on("click", () => { socket.emit('start game', 0) });
}

$(onLoad)