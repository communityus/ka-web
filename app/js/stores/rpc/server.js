'use strict';

var Reflux = require('reflux');
var _ = require('lodash');
var moment = require('moment');
var util = require('/app/js/util');
var clone = util.clone;

var StatefulMixinStore = require('/app/js/stores/mixins/stateful');

var ServerStatusActions = require('/app/js/actions/serverStatus');
var TickerActions = require('/app/js/actions/ticker');
var EmpireRPCActions = require('/app/js/actions/rpc/empire');

var ServerRPCStore = Reflux.createStore({
    listenables: [ServerStatusActions, TickerActions, EmpireRPCActions],

    mixins: [StatefulMixinStore],

    getDefaultData: function() {
        return {
            time: '01 31 2010 13:09:05 +0600',
            serverMoment: moment(),
            clientMoment: moment(),
            serverFormattedTime: '',
            clientFormattedTime: '',
            version: 1.0,
            announcement: 0,
            promotions: [],
            rpc_limit: 10000,
            star_map_size: {
                x: [-15, 15],
                y: [-15, 15],
                z: [-15, 15],
            },
        };
    },

    onServerStatusUpdate: function(server) {
        // TODO: show announcement window if needed.

        server.serverMoment = util.serverDateToMoment(server.time).utcOffset(0);
        server.clientMoment = util.serverDateToMoment(server.time);

        // The server won't return the promotions block if there aren't any but components
        // will expect it to exist.
        if (!server.promotions) {
            server.promotions = [];
        }

        this.emit(server);
    },

    onServerStatusClear: function() {
        this.emit(this.getDefaultData());
    },

    onSuccessEmpireRPCLogout: function() {
        this.emit(this.getDefaultData());
    },

    onTickerTick: function() {
        var server = clone(this.state);

        server.serverMoment = server.serverMoment.add(1, 'second');
        server.serverFormattedTime = util.formatMomentLong(server.serverMoment);

        server.clientMoment = server.clientMoment.add(1, 'second');
        server.clientFormattedTime = util.formatMomentLong(server.clientMoment);

        var now = Date.now();

        server.promotions = _.chain(server.promotions)
            .filter(function(promotion) {
                // Note: date objects can be compared numeracally,
                // see: http://stackoverflow.com/a/493018/1978973
                return now < util.serverDateToDateObj(promotion.end_date);
            })
            .map(function(promotion) {
                promotion.header = promotion.title;
                promotion.ends = moment().to(
                    util.serverDateToMoment(promotion.end_date)
                );

                return promotion;
            })
            .value();

        this.emit(server);
    },
});

module.exports = ServerRPCStore;
