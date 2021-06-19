import _ from 'lodash'
import * as $ from 'jquery';

function logupUser() {
    let name = $("#input_name").value;
    let password = $("#input_password").value;

    if (name && password && name.length > 0 && password.length > 0) {
        fetch('/signup', {
            method: 'POST',
            body: JSON.stringify({ name: name, password: password }),
        });
    }
    else
        alert("Input user data to logup");
}

function loginUser() {
    let name = $("#input_name").value;
    let password = $("#input_password").value;
    let isOkName = true, isOkPassword = true;

    if (!name || name.length == 0)
        isOkName = false;
    if (!password || password.length == 0)
        isOkPassword = false;

    if (!isOkName || !isOkPassword)
        alert("Input user data to login");
    else
        fetch('/login', {
            method: 'POST',
            body: JSON.stringify({ name: name, password: password }),
        });
}

function logupRoom() {
    let roomId = $("#input_room_id").value;

    if (!roomId || roomId.length == 0)
        alert("Input room data to logup new room");
}

function loginRoom() {
    let roomId = $("#input_room_id").value;

    if (!roomId || roomId.length == 0)
        alert("Input room data to log in room");
}

function onLoad() {
    $("#user_logup_button").on("click", () => { logupUser(); });
    $("#user_login_button").on("click", () => { loginUser(); });
    $("#room_logup_button").on("click", () => { logupRoom(); });
    $("#room_login_button").on("click", () => { loginRoom(); });
}

$(onLoad)