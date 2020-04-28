'use strict';

var dao = require('/app/js/dao');

var PoliticsTrainingRPCActions = require('/app/js/actions/rpc/politicsTraining');
var BuildingWindowActions = require('/app/js/actions/windows/building');

function makePoliticsTrainingCall(options) {
    dao.makeServerCall('politicstraining', options, PoliticsTrainingRPCActions);
}

PoliticsTrainingRPCActions.requestPoliticsTrainingRPCView.listen(function(o) {
    makePoliticsTrainingCall({
        method: 'view',
        params: [o],
        success: 'successPoliticsTrainingRPCView',
        error: 'failurePoliticsTrainingRPCView',
    });
});
PoliticsTrainingRPCActions.successPoliticsTrainingRPCView.listen(function(
    result
) {
    BuildingWindowActions.buildingWindowUpdate(result);
});
