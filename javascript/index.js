import _ from 'lodash'
import * as $ from 'jquery';
import { io, Socket } from 'socket.io-client';
const Cookies = require('js-cookie');
const md5 = require("md5");
const sha256 = require("sha256");

function logupUser() {
    let name = $("#input_name").val();
    let password = sha256.x2($("#input_password").val() + md5(name));

    if (!(name == null) && !(password == null) && !(name == undefined) && !(password == undefined) && name.length > 0 && password.length > 0) {
        fetch('/signup', {
            method: 'POST',
            body: JSON.stringify({ name: name, password: password }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Response status is: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                if (text == "true") {
                    location.href = "room.html";
                    Cookies.set('userName', name);
                    Cookies.set('userPassword', password);
                }
                else
                    alert("Failed to register user");
            });
    }
    else
        alert("Input user data to logup");
}

function loginUser() {
    let name = $("#input_name").val();
    let password = $("#input_password").val();
    let isOkName = true, isOkPassword = true;

    if (name == null || name == undefined || name.length == 0) {
        name = Cookies.get('userName');
        if (name == null || name == undefined)
            isOkName = false;
    }
    if (password == null || password == undefined || password.length == 0) {
        password = Cookies.get('userPassword');
        if (password == null || password == undefined)
            isOkPassword = false;
    }
    else
        password = sha256.x2($("#input_password").val() + md5(name));

    if (!isOkName || !isOkPassword)
        alert("Input user data to login");
    else {
        Cookies.set("userName", name);
        Cookies.set("userPassword", password);
        fetch('/login', {
            method: 'POST',
            body: JSON.stringify({ name: name, password: password })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Response status is: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                if (text == "true") {
                    location.href = "./room.html";
                }
                else
                    alert("Failed to login user");
            });
    }
}

function loginCookies() {
    let name = Cookies.get("userName");
    let password = Cookies.get("userPassword");
    fetch('/login', {
        method: 'POST',
        body: JSON.stringify({ name: name, password: password })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Response status is: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            if (text == "true") {
                location.href = "./room.html";
            }
            else
                alert("Failed to login user");
        });
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

            if (tmpRoomId == null || tmpRoomId == undefined || tmpRoomId.length == 0)
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
    if (roomId == null || roomId == undefined || roomId.length == 0) {
        alert("Error in room connection (wrong id)");
        return;
    }
    if (!Cookies.get('userName')) {
        location.href = "index.html";
        return;
    }
    Cookies.set("roomId", roomId);
    location.href = "game.html";
}

function addModal(text, button) {
    $('.cover, .modal, .content').fadeIn();
    $("#modal_text").html(text);
    $("#modal_button").html(button);

    let wrap = $('#wrapper');

    wrap.on('click', function (event) {
        var select = $('.content');
        if ($(event.target).closest(select).length)
            return;
        $('.cover, .modal, .content').fadeOut();
        wrap.unbind('click');
        $("#modal_button").on("click", () => { return; });
    });
}

function checkCookies() {
    let cookiesName = Cookies.get('userName');
    let cookiesPassword = Cookies.get('userPassword');

    if (cookiesName != null && cookiesName != undefined &&
        cookiesPassword != null && cookiesPassword != undefined)
        addModal(`Вы можете войти на сайт под именем ${cookiesName}<br> (с использованием сохранённого пароля)`, "Login");
    $("#modal_button").on("click", () => { loginCookies() });
}

function onLoad() {
    checkCookies();
    $("#user_logup_button").on("click", () => { logupUser(); });
    $("#user_login_button").on("click", () => { loginUser(); });
    $("#room_logup_button").on("click", () => { logupRoom(); });
    $("#room_login_button").on("click", () => { loginRoom(); });
}

$(onLoad)