'use strict';

var Reflux = require('reflux');

var WindowMixinStore = require('/app/js/stores/mixins/window');

var MenuActions = require('/app/js/actions/menu');
var UserActions = require('/app/js/actions/user');

var MenuStore = Reflux.createStore({
    mixins: [WindowMixinStore],
    listenables: [MenuActions, UserActions],

    getDefaultData: function() {
        return {
            show: false,
        };
    },

    getData: function() {
        return this.state;
    },

    getInitialState: function() {
        if (!this.state) {
            this.state = this.getDefaultData();
        }
        return this.state;
    },

    init: function() {
        this.state = this.getDefaultData();
    },

    show: function(show) {
        this.state.show = show;
        this.trigger(this.state);
    },

    onMenuShow: function() {
        this.show(true);
    },

    onMenuHide: function() {
        this.show(false);
    },

    onSuccessEmpireRPCLogout: function() {
        this.show(false);
    },
});

module.exports = MenuStore;
