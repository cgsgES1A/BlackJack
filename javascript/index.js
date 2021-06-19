import _ from 'lodash'
import * as $ from 'jquery';
import { io, Socket } from 'socket.io-client';
const Cookies = require('js-cookie');

let userName = null;

function logupUser() {
    let name = $("#input_name").val();
    let password = $("#input_password").val();

    if (!(name == null) && !(password == null) && !(name == undefined) && !(password == undefined) && name.length > 0 && password.length > 0) {
        fetch('/signup', {
            method: 'POST',
            body: JSON.stringify({ name: name, password: password }),
        });
        Cookies.set('userName', name);
        Cookies.set('userPassword', password);
    }
    else
        alert("Input user data to logup");
}

function loginUser() {
    let name = $("#input_name").val();
    let password = $("#input_password").val();
    let isOkName = true, isOkPassword = true;

    if (name == null || name == undefined || name.length == 0)
        if (!Cookies.get('userName'))
            isOkName = false;
    if (password == null || password == undefined || password.length == 0)
        if (!Cookies.get('userPassword'))
            isOkPassword = false;

    if (!isOkName || !isOkPassword)
        alert("Input user data to login");
    else {
        fetch('/login', {
            method: 'POST',
            body: JSON.stringify({ name: name, password: password }),
        });
        userName = name;
    }
}

let roomId = null;

function logupRoom() {
    roomId = 0;

    fetch('/create_room', { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Response status is: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            let tmpRoomId = text;

            if (!tmpRoomId)
                alert("Error in room logup");
            else {
                roomId = tmpRoomId;
                roomSession();
            }
        });
}

function loginRoom() {
    let tmpRoomId = $("#input_room_id").val();

    if (tmpRoomId == null || tmpRoomId == undefined || tmpRoomId.length == 0)
        alert("Input room data to log in room");
    else {
        roomId = tmpRoomId;
        roomSession();
    }
}

function roomSession() {
    if (!roomId || roomId.length == 0) {
        alert("Error in room connection (wrong id)");
        return;
    }
    if (!Cookies.get('userName'))
        alert("You need to login before room connecting");
    var socket = io({ query: { name: Cookies.get('userName'), room_id: roomId } });
    socket.on("entersuccessful", (result) => {
        let enterFlag = parseInt(result);

        if (!enterFlag)
            socket.disconnect();
        else
            ;///smthg
    });
}

function onLoad() {
    $("#user_logup_button").on("click", () => { logupUser(); });
    $("#user_login_button").on("click", () => { loginUser(); });
    $("#room_logup_button").on("click", () => { logupRoom(); });
    $("#room_login_button").on("click", () => { loginRoom(); });
}

$(onLoad)