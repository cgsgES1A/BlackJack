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
                    addModal("Не удалось зарегистрироваться", null, "Error");
            });
    }
    else
        addModal("Введите данные пользователя для того чтобы зарегистрироваться", null, "Error");
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
        addModal("Введите данные пользователя для того чтобы войти", null, "Error");
    else {
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
                    Cookies.set("userName", name);
                    Cookies.set("userPassword", password);
                }
                else
                    addModal("Не удалось войти", null, "Error");
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
            else {
                deleteModal();
                addModal("Не удалось войти", null, "Error");
            }
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
                addModal("Ошибка в регистрации комнаты", null, "Error");
            else {
                roomId = tmpRoomId;
                roomSession();
            }
        });
}

function loginRoom() {
    let tmpRoomId = $("#input_room_id").val();

    if (tmpRoomId == null || tmpRoomId == undefined || tmpRoomId.length == 0)
        addModal("Введите Id комнаты для того чтобы войти", null, "Error");
    else {
        roomId = tmpRoomId;
        roomSession();
    }
}

function roomSession() {
    if (roomId == null || roomId == undefined || roomId.length == 0) {
        addModal("Ошибка в подключении в комнату (неправельный Id)", null, "Error");
        return;
    }
    if (!Cookies.get('userName')) {
        location.href = "index.html";
        return;
    }
    Cookies.set("roomId", roomId);
    location.href = "game.html";
}

function deleteModal() {
    $('.cover, .modal, .content').fadeOut();

    if ($("#modal_button") != null && $("#modal_button") != undefined) {
        $("#modal_button").on("click", () => { return; });
    }
}

function addModal(text, button, type) {
    $("#modal_text").html(text);
    if (button != null && button != undefined)
        $('#modal_inner').append($(`<button id="modal_button" class="modal_button">${button}</button>`));
    else if ($("#modal_button") != null && $("#modal_button") != undefined)
        $("#modal_button").remove();
    if (type == "Error") {
        if ($("#modal_text").hasClass('info'))
            $("#modal_text").removeClass('info');
        $("#modal_text").addClass('error');
    }
    else {
        if ($("#modal_text").hasClass('error'))
            $("#modal_text").removeClass('error');
        $("#modal_text").addClass('info');
    }
    $('.cover, .modal, .content').fadeIn();
    let wrap = $('#wrapper');

    wrap.on('click', function (event) {
        deleteModal();
    });
}

function checkCookies() {
    let cookiesName = Cookies.get('userName');
    let cookiesPassword = Cookies.get('userPassword');

    if (cookiesName != null && cookiesName != undefined &&
        cookiesPassword != null && cookiesPassword != undefined)
        addModal(`Вы можете войти на сайт под именем ${cookiesName}<br> (с использованием сохранённого пароля)`, "Login");
    $("#modal_button").on("click", () => {
        loginCookies();
    });
}

function onLoad() {
    if (window.location.href != 'http://localhost:3000/room.html')
        checkCookies();
    $("#user_logup_button").on("click", () => { logupUser(); });
    $("#user_login_button").on("click", () => { loginUser(); });
    $("#room_logup_button").on("click", () => { logupRoom(); });
    $("#room_login_button").on("click", () => { loginRoom(); });
}

$(onLoad)