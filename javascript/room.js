import _ from 'lodash'
import * as $ from 'jquery';
import { io, Socket } from 'socket.io-client';
import * as Game from "./game.js"
const Cookies = require('js-cookie');

var socket;
const user_num = 1;
const croupier_num = 6;

function roomConnection() {
    let userName = Cookies.get('userName');
    let roomId = Cookies.get('roomId');

    if (userName == null || userName == undefined || roomId == null || roomId == undefined) {
        alert("Error in room connection (not enough data to login)");
        location.href = "room.html";
        return;
    }
    socket = io({ query: { name: userName, roomid: roomId } });
    socket.on("entersuccessful", (enterFlag) => {
        if (enterFlag == false) {
            socket.disconnect();
            alert("Error in room connection");
            location.href = "room.html";
        }
        else {
            Game.room_create(Cookies.get("roomId"));
            SocketCallbackInit();
        }
    });
}

function disconnectUser() {
    socket.disconnect();
    location.href = "room.html";
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
    socket.on('end game', function (msg) { endGame(msg) })
    socket.on('disconnect_user', function () { disconnectUser() });
}

/*
 * Game start and end functions.
 */

function startGame(Message) {
    if (Message == null || Message == undefined ||
        Message[0] == undefined || Message[1] == undefined || Message[2] == undefined || Message[3] == undefined ||
        Message.length < 3 || Message[0].length != 2 ||
        Message[1].length != undefined || Message[1] < 0 || Message[1] > 4 || Message[2].length != Message[1]) {
        return;
    }

    let card_val1 = Message[0][0] == 11 ? 1 : Message[0][0];
    let card_val2 = Message[0][1] == 11 ? 1 : Message[0][1];

    Message[2].push(Cookies.get("userName"));
    /* Distribute two cards to every player */
    Game.start_game(card_val1, card_val2, Message[1], Message[2], Message[3]);
}

function endGame(Message) {
    if (Message == null || Message == undefined ||
        Message[0] == undefined || Message[1] == undefined || Message[2] == undefined ||
        Message[0] < 0 || Message[0] > 4) {
        return;
    }
    Game.finish_game(Message[0], Message[1], Message[2]);
}

/*
 * Gamers steps functions.
 */

function startUserStep(Message) {
    /* The UI appears */
    Game.user_start_step();
}

function endUserStep(Message) {
    if (Message == null || Message == undefined) {
        return;
    }
    /* The UI disappears */
    Game.user_finish_step(Message);
}

function startEnemyStep(Message) {
    if (Message == null || Message == undefined ||
        Message < 0 || Message > 3) {
        return;
    }
}

function endEnemyStep(Message) {
    if (Message == null || Message == undefined) {
        return;
    }
    /* IDK what */;
}

function startCroupierStep(Message) {
    if (Message == null || Message == undefined ||
        Message[0] == undefined || Message[1] == undefined ||
        Message[0].length != undefined || Message[1].length != undefined ||
        Message[0] < 2 || Message[0] > 11 || Message[1] < 2 || Message[1] > 11) {
        return;
    }
    let card_val1, card_val2;

    card_val1 = Message[0] == 11 ? 1 : Message[0];
    card_val2 = Message[1] == 11 ? 1 : Message[1];
    Game.open_dealer_start_cards(card_val1, card_val2);
}

function endCroupierStep(Message) {
    if (Message == null || Message == undefined) {
        return;
    }
    Game.dealer_finish_step(Message);
}

/*
 * Playing card distribution functions.
 */

function userCardDistr(Message) {
    if (Message == null || Message == undefined ||
        Message[0] == undefined || Message[1] == undefined ||
        Message[0] < 2 || Message[0] > 11) {
        return;
    }

    let card_val = Message[0] == 11 ? 1 : Message[0];
    Game.take_card(1, card_val, Message[1]);
}

function enemyCardDistr(Message) {
    if (Message == null || Message == undefined ||
        Message < 0 || Message > 3) {
        return;
    }
    Game.take_card(Message + 2, -1);
}

function croupierCardDistr(Message) {
    if (Message == null || Message == undefined ||
        Message < 2 || Message > 11) {
        return;
    }
    let card_val = Message == 11 ? 1 : Message;
    Game.take_card(6, card_val);
}

/*
 * UI-connected functions
 */

function helpButtonFunction() {
}

function startButtonFunction() {
    socket.emit("start game");
}

function takeButtonFunction() {
    socket.emit("take card");
}

function finishButtonFunction() {
    socket.emit("end step");
}

function onLoad() {
    roomConnection();
    $("#help").on("click", () => { helpButtonFunction(); });
    $("#start").on("click", () => { startButtonFunction(); });
    $("#take").on("click", () => { takeButtonFunction(); });
    $("#finish").on("click", () => { finishButtonFunction(); });
}

$(onLoad)