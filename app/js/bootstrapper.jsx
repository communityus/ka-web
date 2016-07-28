'use strict';

var React            = require('react');
var ReactDom         = require('react-dom');
var ReactTooltip     = require('react-tooltip');

var EmpireRPCActions = require('js/actions/rpc/empire');
var MapActions       = require('js/actions/menu/map');
var MenuActions      = require('js/actions/menu');
var SessionActions   = require('js/actions/session');
var TickerActions    = require('js/actions/ticker');
var WindowActions    = require('js/actions/window');

var GameWindow       = require('js/components/gameWindow');
var LoginWindow      = require('js/components/window/login');

var server           = require('js/server');

function handleTooltips() {
    // The tooltips can often disappear because their parent elements are removed from the
    // DOM and then replaced later. For example, switching between tabs that each have
    // tooltips in them. Calling this every tick ensures that the tooltips are rebuilt if
    // they disappear. This is a really dumb solution. I hope to find something better.
    TickerActions.tickerTick.listen(function() {
        ReactTooltip.rebuild();
    });
}

function initializeReactStuff() {
    var body = document.getElementById('body');
    var container = document.createElement('div');

    container.id = 'mainGameContainer';
    body.appendChild(container);

    ReactDom.render(
        <GameWindow />,
        document.getElementById('mainGameContainer')
    );
}

function handleQuery(query) {
    if (query.referral) {
        // TODO: handle regerral codes
    }

    if (query.reset_password) {
        // TODO: handle password reset
    }
}

function startGame(query) {
    console.log('Starting Keno Antigen');

    var Game = YAHOO.lacuna.Game;
    Game.handleLegacySetup();

    initializeReactStuff();
    handleTooltips();
    handleQuery(query || {});

    // See if we can continue from the previous session.
    var possibleSession = Game.GetSession();

    if (possibleSession) {
        server.call({
            module : 'empire',
            method : 'get_status',
            params : {
                session_id : possibleSession
            },
            addSession : false,
            success    : function(result) {
                handleSession(possibleSession);
                runGame(result.status);
            },
            error : function(error) {
                Game.Reset();
                showLoginWindow(error);
            }
        });
    } else {
        showLoginWindow();
    }
}

function showLoginWindow(error) {
    MenuActions.menuHide();

    WindowActions.windowAdd(LoginWindow, 'login', {
        error : error
    });
}

function handleSession(session) {
    SessionActions.sessionSet(session);

    // Legacy stuff, once again
    YAHOO.lacuna.Game.SetSession(session);
}

function onLoginSuccessful(result) {
    handleSession(result.session_id);
    runGame(result.status);
}

function runGame(status) {
    console.log('Running game');

    var Game = YAHOO.lacuna.Game;

    Game.startLegacyGameLoop();
    Game.initializeLegacyEvents();

    document.title = status.empire.name + ' - Keno Antigen';

    MenuActions.menuShow();
    TickerActions.tickerStart();

    console.log('Firing up the planet view');
    MapActions.mapChangePlanet(status.empire.home_planet_id);
}

EmpireRPCActions.successEmpireRPCLogin.listen(function(result) {
    WindowActions.windowCloseByType('login');
    onLoginSuccessful(result);
});

EmpireRPCActions.successEmpireRPCLogout.listen(function(result) {
    // Here be the traditional code to reset the game...
    YAHOO.lacuna.Game.Reset();

    // Hide all our tooltips
    ReactTooltip.hide();

    showLoginWindow();
});

module.exports = {
    startGame : startGame
};
