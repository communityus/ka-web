'use strict';

var Reflux = require('reflux');

var WindowMixinStore = require('/app/js/stores/mixins/window');

var StatsWindowActions = require('/app/js/actions/windows/stats');
var KeyboardActions = require('/app/js/actions/keyboard');

var StatsWindowStore = Reflux.createStore({
    mixins: [WindowMixinStore],
    listenables: [StatsWindowActions, KeyboardActions],

    getDefaultData: function() {
        return {
            show: false,
        };
    },

    getData: function() {
        return this.state;
    },

    getInitialState: function() {
        if (this.state) {
            this.state = this.getDefaultData();
        }
        return this.state;
    },

    init: function() {
        this.state = this.getDefaultData();
    },

    onStatsWindowShow: function() {
        this.state.show = true;
        this.trigger(this.state);
    },

    onStatsWindowHide: function() {
        this.state.show = false;
        this.trigger(this.state);
    },
});

module.exports = StatsWindowStore;
