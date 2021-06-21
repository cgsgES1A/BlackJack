import _ from 'lodash'
import * as $ from 'jquery';
import { io, Socket } from 'socket.io-client';
const Cookies = require('js-cookie');

function roomConnection() {
    let userName = Cookies.get('userName');
    let roomId = Cookies.get('roomId');

    alert(`Room Id: ${roomId}\nUser name: ${userName}`);
    if (userName == null || userName == undefined || roomId == null || roomId == undefined) {
        alert("Error in room connection (not enough data to login)");
        return;
    }
    var socket = io({ query: { name: userName, roomid: roomId } });
    socket.on("entersuccessful", (enterFlag) => {
        if (enterFlag == false) {
            socket.disconnect();
            alert("Error in room connection");
        }
        else {
            alert("You are in the game room");
            location.href = "game.html";
        }
    });
}

function onLoad() {
    roomConnection();
}

$(onLoad)