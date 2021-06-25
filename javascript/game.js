import _ from 'lodash'
import * as $ from 'jquery';

var num_of_token_cards = 0;
var deck;
var max_token_card = 127;
var opened_user_card = 0;
var opened_dealer_card = 0;
var token_cards = [0, 0, 0, 0, 0, 0];
var started_flag = 0;
var finish_flag = 0;
var dealer_start_cards = [];

export function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export function get_image_url(value) {
    let img_address = "/card_";
    switch (value) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            var suit = getRandomInt(4) + 1;
            img_address += value.toString() + '_' + suit.toString() + ".png";
            break;
        case 10:
            var val = getRandomInt(4) + 10;
            var suit = getRandomInt(4) + 1;
            img_address += val.toString() + '_' + suit.toString() + ".png";
            break;
    }
    return img_address;
}

export function open_user_card(id, value) {
    deck = $("#axis");
    let img = $("<img></img>");
    img.attr('id', "ouc" + (max_token_card + token_cards[0]).toString());
    img.attr('src', get_image_url(value));
    img.attr('class', "object user_card multiple_temp");
    img.css({ 'top': "78%", 'width': '100', 'left': `${(5 + 5 * (token_cards[0] - 1))}%` });
    deck.append(img);
    $('#' + id).remove();
}

export function open_dealer_card(id, value) {
    deck = $("#axis");
    let img = $("<img></img>");
    img.attr('id', "odc" + (max_token_card + token_cards[5]).toString());
    img.attr('src', get_image_url(value));
    img.attr('class', "object user_card multiple_temp2");
    img.css({ 'top': "10%", 'width': '120', 'left': `${(40 + 1.5 * (token_cards[5]))}%` });

    deck.append(img);
    $('#' + id).remove();
}

export function open_dealer_start_cards(value1, value2) {
    $('#' + dealer_start_cards[0].toString()).remove();
    $('#' + dealer_start_cards[1].toString()).remove();
    deck = $("#axis");
    let img1 = $("<img></img>");
    img1.attr('id', "odc" + (max_token_card + token_cards[5] - 1).toString());
    img1.attr('src', get_image_url(value1));
    img1.attr('class', "object dealer_card multiple_temp2");
    img1.css({ 'top': "10%", 'width': '120', 'left': `${(40 + 1.5 * (token_cards[5] - 1))}%` });
    deck.append(img1);
    let img2 = $("<img></img>");
    img2.attr('id', "odc" + (max_token_card + token_cards[5]).toString());
    img2.attr('src', get_image_url(value2));
    img2.attr('class', "object dealer_card multiple_temp3");
    img2.css({ 'top': "10%", 'width': '120', 'left': `${(40 + 1.5 * (token_cards[5]))}%` });
    deck.append(img2);
}

export function points_view(points) {
    let text = $(`<p>${points}</p>`);
    text.attr('id', "pnts" + token_cards[0].toString());
    text.css({ 'position': "absolute", 'color': 'white', 'font-size': '30', 'top': "66%", 'left': "2%" });
    $("#pnts" + (token_cards[0] - 1).toString()).remove();
    $("#axis").append(text);
}

export function free_buttons() {
    if (!finish_flag && started_flag) {
        $("#take").prop('disabled', false);
        $("#finish").prop('disabled', false);
    }
}

export function take_card(iter, value, points) {
    token_cards[iter - 1]++;
    deck = $("#axis");
    let img = $("<img></img>");
    img.attr('src', "/card_shirt.png");
    img.attr('class', "object card");
    img.css({ 'width': '120' });
    num_of_token_cards++;
    img.attr('id', (num_of_token_cards + 1).toString());
    deck.append(img);
    var class_type = "multiple" + iter.toString();
    $('#' + num_of_token_cards).addClass(class_type);

    if (iter == 1) {
        $("#take").prop('disabled', true);
        $("#finish").prop('disabled', true);
        $('#' + num_of_token_cards).css({ 'left': `${5 + 5 * (token_cards[0] - 1)}%` });
        opened_user_card = num_of_token_cards;
        setTimeout(free_buttons, 2000);
        setTimeout(open_user_card, 2000, opened_user_card, value);
        setTimeout(points_view, 2000, points);
    }
    else if (iter == 6) {
        $('#' + num_of_token_cards).css({ 'left': `${40 + 1.5 * (token_cards[iter - 1])}%`, 'top': '10%' });
        dealer_start_cards.push(num_of_token_cards);
        if (started_flag) {
            opened_dealer_card = num_of_token_cards;
            setTimeout(open_dealer_card, 2000, opened_dealer_card, value);
        }
    }
    else
        $('#' + num_of_token_cards).css({ 'left': `${1.5 * (token_cards[iter - 1])}%` });
}

export function user_start_step() {
    $("#take").prop('disabled', false);
    $("#finish").prop('disabled', false);
}

export function user_finish_step(points) {
    finish_flag = 1;
    setTimeout(points_view, 2000, points);
    $("#take").prop('disabled', true);
    $("#finish").prop('disabled', true);
}

export function dealer_finish_step(points) {
    let text = $(`<p>${points}</p>`);
    text.css({ 'position': "absolute", 'color': 'white', 'font-size': '26', 'top': "5.5%", 'left': "43%" });
    $("#axis").append(text);
}

export function start_game(value1, value2, players, nicknames, points) {
    let text;
    for (var i = 1; i < players + 1; i++) {
        text = $(`<p>${nicknames[i - 1]}</p>`);
        text.css({ 'position': "absolute", 'color': 'white', 'font-size': '23', 'top': `${8.5 + 15 * (i - 1)}%`, 'left': "3%" });
        $("#axis").append(text);
    }
    text = $("<p>Dealer</p>");
    text.css({ 'position': "absolute", 'color': 'white', 'font-size': '23', 'top': "6%", 'left': "45%" });
    $("#axis").append(text);
    text = $(`<p>${nicknames[players]}</p>`);
    text.css({ 'position': "absolute", 'color': 'white', 'font-size': '26', 'top': "67%", 'left': "5%" });
    $("#axis").append(text);
    take_card(1, value1, "");
    setTimeout(take_card, 2000, 1, value2, points);
    for (var i = 1, j = 2; i < players + 1; i++, j += 2) {
        setTimeout(take_card, 2000 * (j), i + 1);
        setTimeout(take_card, 2000 * (j + 1), i + 1);
    }
    setTimeout(take_card, 2000 * (j), 6);
    setTimeout(take_card, 2000 * (j + 1), 6);
    setTimeout(() => { started_flag = 1; }, 2000 * (j + 2));
    $("#start").prop('disabled', true);
}

export function winner(is_win) {
    let info = $(`<p>${is_win ? "YOU WIN!" : "Don't worry, be happy :)"}</p><a href="/room.html" class="close2">Close</a>`);
    $("#window2").append(info);
    $(location).attr('href', "#dark2");
}

export function finish_game(players, results, is_win) {
    let text;
    for (var i = 1; i < players + 1; i++) {
        text = $(`<p>${results[i - 1][0]}</p>`);
        text.css({ 'position': "absolute", 'color': 'white', 'font-size': '26', 'top': `${8 + 15 * (i - 1)}%`, 'left': "1.5%" });
        $("#axis").append(text);
    }
    setTimeout(winner, 1500, is_win);
}

export function room_create(id) {
    let text = $(`<p>Room id: ${id}</p>`);
    text.css({ 'position': "absolute", 'color': 'white', 'font-size': '20', 'top': "6px", 'right': "6px" });
    $("#axis").append(text);
}