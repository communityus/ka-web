'use strict';

var Reflux = require('reflux');
var StatefulStore = require('/app/js/stores/mixins/stateful');

var MapActions = require('/app/js/actions/menu/map');
var UserActions = require('/app/js/actions/user');

var PlanetStore = Reflux.createStore({
    listenables: [MapActions, UserActions],

    mixins: [StatefulStore],

    getDefaultData: function() {
        return 0;
    },

    onMapChangePlanet: function(id) {
        console.log('Changing to planet (#' + id + ').');
        this.emit(id);
    },

    onUserSignIn: function() {
        console.log('Firing up the planet view');
        this.onMapChangePlanet(YAHOO.lacuna.Game.EmpireData.home_planet_id);
    },
});

module.exports = PlanetStore;
