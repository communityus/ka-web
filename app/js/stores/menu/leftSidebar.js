'use strict';

var Reflux = require('reflux');

var LeftSidebarActions = require('/app/js/actions/menu/leftSidebar');

var StatefulStore = require('/app/js/stores/mixins/stateful');

var LeftSidebarStore = Reflux.createStore({
    listenables: [LeftSidebarActions],

    mixins: [StatefulStore],

    getDefaultData: function() {
        return false;
    },

    onShow: function() {
        console.log('Showing left sidebar');
        this.emit(true);
    },

    onHide: function() {
        console.log('Hiding left sidebar');
        this.emit(false);
    },
});

module.exports = LeftSidebarStore;
