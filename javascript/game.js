import _ from 'lodash'
import * as $ from 'jquery';

var num_of_token_cards = 0;
var deck;
var max_token_card = 127;
var opened_user_card = 0;
var opened_dealer_card = 0;
var token_cards = [0, 0, 0, 0, 0, 0];
var started_flag = 0;
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

export function take_card(iter, value) {
    token_cards[iter - 1] += 1;
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
        $('#' + num_of_token_cards).css({ 'left': `${5 + 5 * (token_cards[0] - 1)}%` });
        opened_user_card = num_of_token_cards;
        setTimeout(open_user_card, 2000, opened_user_card, value);
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

export function user_finish_step() {
    $("#start").prop('disabled', true);
    $("#take").prop('disabled', true);
    $("#finish").prop('disabled', true);
}

export function start_game(value1, value2, players, nicknames) {
    let text;
    for (var i = 1; i < players + 1; i++) {
        text = $(`<p>${nicknames[i]}</p>`);
        text.css({ 'top': `${15 + 15 * (i - 1)}%`, 'left': "0%" });
        $("#axis").append(text);
    }
    text = $("<div><p>Dealer</p></div>");
    text.css({ 'color': 'white', 'font-size': '20', 'top': "82px", 'left': "400px" });
    $("#axis").append(text);
    take_card(1, value1);
    for (var j = 0; j < 2; j++)
        for (var i = 1; i < players + 1; i++)
            take_card(i + 1);
    take_card(6);
    take_card(6);
    started_flag = 1;
    setTimeout(take_card, 2000, 1, value2);
}

export function finish_game(players, results, is_win) {
    alert(results.join('\n'));
    if (is_win)
        alert("YOU WIN!!!");
    else
        alert("Don't worry:)");
}