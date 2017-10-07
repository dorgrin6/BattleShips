// took from https://stackoverflow.com/questions/3028490/calling-a-java-servlet-from-javascript?rq=1

// URIs
const USERS_SERVLET_URI = '/gamesRoom/users';
const GAME_RECORDS_SERVLET_URI = '/gamesRoom/gameRecords';
const UPLOAD_XML_URI = '/readResource/readxml';
const GET_USERNAME_URI = '/gamesRoom/currentUser';
const LOGOUT_SERVLET_URI = '/registration/logout';
const GAMES_ROOM_URI = '/pages/gamesRoom/gamesRoom.html';
const SIGN_UP_URI = '/pages/signup/signup.html';
const ADD_USER_URI = '/gamesRoom/gameRecords/addUser';

// ATTRIBUTES
const USERNAME_ATTRIBUTE = "USERNAME";
const CALLER_URI_ATTRIBUTE = 'CALLER_URI';
const GAME_NAME_ATTRIBUTE = 'GAME_NAME';
const USER_ROLE_ATTRIBUTE = 'USER_ROLE';

// CONSTS
// USER_ROLE
const USER_PARTICIPANT = 'PARTICIPANT';
const USER_WATCHER = 'WATCHER';

// GAME_STATUS
const ONE_PLAYER = 'ONE_PLAYER';
const EMPTY_GAME = 'EMPTY';
const FULL_GAME = 'FULL';

const INTERVAL_LENGTH = 5000;

var intervalRefreshLists = null;

function ajaxCurrentUserName() {
    $.ajax({
        url: GET_USERNAME_URI,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        success: function (users) {
            $.each(users || [], function (index, username) {
                $("#usernameNav").text(username);
            });
        }
    });
}

function stopListsRefresh() {
    if (intervalRefreshLists !== null) {
        clearInterval(intervalRefreshLists);
    }
}

function refreshGamesList(games) {
    //clear all current users
    $("#table_games").find("tr:gt(0)").remove();

    var rows = "";

    $.each(games || [], function (index, game) {
        //console.log("Adding game #" + index + ": " + game.gameName);
        rows += "<tr><td>" + game.gameName + "</td>" +
            "<td>" + game.creator.username + "</td>" +
            "<td>" + game.boardSize + "</td>" +
            "<td>" + translateGameStatus(game.gameStatus) + "</td>" +
            "<td>" + createJoinGameLink(game) + "</td>";

        $('#table_games').on('click', '.joinLink', function () {
            joinGame(game);
        });

        $('#table_games').on('click', '.watchLink', function () {
            watchGame(game);
        });

    });



    $(rows).appendTo("#table_games tbody");
}

function createJoinGameLink(game) {
    var result = "";
    switch (game.gameStatus) {
        case ONE_PLAYER:
            result += "<a href='' onclick='return false;' class='joinLink'>"
                + "Play" + "</a>";
            break;
        case FULL_GAME:
            result += "<a href='' onclick='return false;' class='watchLink'>"
                + "Watch" + "</a>";
            break;
        case EMPTY_GAME:
            result += "-";
            break;
        default:
            break;
    }



    //console.log("In crate game result is" + result);

    return result;
}

function ajaxJoinOrWatch(userRole, game) {
    $.ajax({
            type: 'GET',
            url: ADD_USER_URI,
            dataType : 'html',
            data: { // should match Constants
                "USERNAME": $("#usernameNav").text(),
                "GAME_NAME": game.gameName,
                "USER_ROLE": userRole
            },
            success: function (data, textStatus, request) {
                var errorHeader = request.getResponseHeader("username_error");
                if (errorHeader !== null){
                    alert(errorHeader);
                }
            }
        }
    );
}

function joinGame(game) {
    // check that game can be joined
    if (game.gameStatus !== ONE_PLAYER) {
        return;
    }

    ajaxJoinOrWatch(USER_PARTICIPANT, game);
}

function watchGame(game) {
    // check that game can be watched
    if (game.gameStatus !== FULL_GAME) {
        return;
    }

    ajaxJoinOrWatch(USER_WATCHER, game);
}

function translateGameStatus(gameStatus) {
    switch (gameStatus) {
        case ONE_PLAYER:
            return "One player waiting";
            break;
        case EMPTY_GAME:
            return "Empty";
            break;
        case FULL_GAME:
            return "Game is full";
            break;
    }

    return "";
}

function refreshUsersList(users) {
    //clear all current users
    $("#table_users").find("tr:gt(0)").remove();


    // rebuild the list of users: scan all users and add them to the list of users
    var rows = "";
    $.each(users || [], function (index, username) {
        //console.log("Adding user #" + index + ": " + username);
        rows += "<tr><td>" + username + "</td></tr>";
    });

    $(rows).appendTo("#table_users tbody");
}

function ajaxUsersList() {
    $.ajax({
        url: USERS_SERVLET_URI,
        dataType: 'json',
        success: function (users) {
            refreshUsersList(users);
        }
    });
}

function ajaxGamesList() {
    $.ajax({
        url: GAME_RECORDS_SERVLET_URI,
        dataType: 'json',
        success: function (games) {
            refreshGamesList(games);
        }
    });
}

function refreshLists() {
    ajaxUsersList();
    ajaxGamesList();
}

// logout assumes #usernamenav is set to username
function logout() {
    $.ajax({
        type: 'GET',
        url: LOGOUT_SERVLET_URI,
        data: {
            "username": $("#usernameNav").text(),
            "CALLER_URI": GAMES_ROOM_URI
        },
        success: function (response) {
            window.location.replace(SIGN_UP_URI);
        }
    });
}

$(window).on('load', function () {
    ajaxCurrentUserName();

    intervalRefreshLists = setInterval(function () {
        refreshLists()
    }, INTERVAL_LENGTH);
});