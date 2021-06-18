function setCookie(name, value) {
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);;
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function registerUser() {
    let name = document.getElementById("input_name").value;
    let password = document.getElementById("input_password").value;

    if (name && password) {
        setCookie('userName', name);
        setCookie('userPassword', password);
        fetch('/', {
            method: 'POST',
            body: `${name}&${password}`,
            keepalive: true
        });
    }
    else
        alert("�� �� ����� ������ ��� ����������� ������������, ���������� ��� ���");
}

function loginUser() {
    let name = document.getElementById("input_name").value;
    let password = document.getElementById("input_password").value;
    let isOkName = true, isOkPassword = true;

    if (!name)
        if (!(name = getCookie("userName")))
            isOkName = false;
    if (!password)
        if (!(password = getCookie("userPassword")))
            isOkPassword = false;

    if (!isOkName || !isOkPassword)
        alert("������������ ������ ��� �����");
    else
        fetch('/', {
            method: 'POST',
            body: `${name}&${password}`,
            keepalive: true
        });
}

function registerRoom() {
    let roomId = document.getElementById("#input_room_id").value;

    if (!roomId)
        alert("������� ������������� �������");
}

function loginRoom() {
    let roomId = document.getElementById("#input_room_id").value;

    if (!roomId)
        alert("������� ������������� �������");
    else
        fetch('/', {
            method: 'POST',
            body: `${roomId}`,
            keepalive: true
        });
}