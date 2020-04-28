'use strict';

var Reflux = require('reflux');
var ReactTooltip = require('react-tooltip');

var EmpireRPCActions = require('/app/js/actions/rpc/empire');
var UserActions = require('/app/js/actions/user');
var MenuActions = require('/app/js/actions/menu');
var TickerActions = require('/app/js/actions/ticker');
var MapActions = require('/app/js/actions/menu/map');

// TODO What is the purpose of this store? It does not store anything!
// (it should disappear when the yui code is replaced totally)
//
var UserStore = Reflux.createStore({
    listenables: [EmpireRPCActions, UserActions],

    onUserSignIn: function() {
        MenuActions.menuShow();
        TickerActions.tickerStart();
        // TODO This should be possible to be removed. BUT it is needed for
        // now. It is called in the map store by attaching tothe onUserSignin
        // event (as it does here) but perhaps it requires the other stores
        // to complete first before it works?
        console.log('Firing up the planet view');
        MapActions.mapChangePlanet(YAHOO.lacuna.Game.EmpireData.home_planet_id);
    },

    onSuccessEmpireRPCLogout: function(o) {
        // Here be the traditional code to reset the game...
        YAHOO.lacuna.Game.Reset();
        YAHOO.lacuna.MapPlanet.Reset();
        YAHOO.lacuna.Game.DoLogin();

        // Hide all our tooltips
        ReactTooltip.hide();
    },
});

module.exports = UserStore;
