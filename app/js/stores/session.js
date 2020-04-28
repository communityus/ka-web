'use strict';

var Reflux = require('reflux');

var SessionActions = require('/app/js/actions/session');
var EmpireRPCActions = require('/app/js/actions/rpc/empire');

var StatefulStore = require('/app/js/stores/mixins/stateful');

var SessionStore = Reflux.createStore({
    listenables: [SessionActions, EmpireRPCActions],

    mixins: [StatefulStore],

    getDefaultData: function() {
        return '';
    },

    onSessionSet: function(session) {
        this.emit(session);
    },

    onSessionClear: function() {
        this.emit(this.getDefaultData());
    },

    onSuccessEmpireRPCLogout: function() {
        this.emit(this.getDefaultData());
    },
});

module.exports = SessionStore;
