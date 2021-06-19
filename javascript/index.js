document.getElementById("user_logup_button").addEventListener("onclick", logupUser());
document.getElementById("user_login_button").addEventListener("onclick", loginUser());
document.getElementById("room_logup_button").addEventListener("onclick", logupRoom());
document.getElementById("room_login_button").addEventListener("onclick", loginRoom());

function setCookie(name, value) {
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);;
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function logupUser() {
    let name = document.getElementById("input_name").value;
    let password = document.getElementById("input_password").value;

    if (name && password && name.length > 0 && password.length > 0) {
        setCookie('userName', name);
        setCookie('userPassword', password);
        fetch('/signup', {
            method: 'POST',
            body: JSON.stringify({ name: name, password: password }),
        });
    }
    else
        alert("Input user data to logup");
}

function loginUser() {
    let name = document.getElementById("input_name").value;
    let password = document.getElementById("input_password").value;
    let isOkName = true, isOkPassword = true;

    if (!name || name.length == 0)
        if (!(name = getCookie("userName")))
            isOkName = false;
    if (!password || password.length == 0)
        if (!(password = getCookie("userPassword")))
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
    let roomId = document.getElementById("input_room_id").value;

    if (!roomId || roomId.length == 0)
        alert("Input room data to logup new room");
}

function loginRoom() {
    let roomId = document.getElementById("input_room_id").value;

    if (!roomId || roomId.length == 0)
        alert("Input room data to log in room");
}