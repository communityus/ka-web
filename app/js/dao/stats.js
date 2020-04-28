'use strict';

var dao = require('/app/js/dao');

var StatsRPCActions = require('/app/js/actions/rpc/stats');

function makeStatsCall(options) {
    dao.makeServerCall('stats', options, StatsRPCActions);
}

StatsRPCActions.requestStatsRPCGetCredits.listen(function(o) {
    makeStatsCall({
        method: 'credits',
        params: [],
        success: 'successStatsRPCGetCredits',
        error: 'failureStatsRPCGetCredits',
    });
});

module.exports = StatsRPCActions;
