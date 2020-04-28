'use strict';

var dao = require('/app/js/dao');
var TheftTrainingRPCActions = require('/app/js/actions/rpc/theftTraining');
var BuildingWindowActions = require('/app/js/actions/windows/building');

function makeTheftTrainingCall(options) {
    dao.makeServerCall('thefttraining', options, TheftTrainingRPCActions);
}

TheftTrainingRPCActions.requestTheftTrainingRPCView.listen(function(o) {
    makeTheftTrainingCall({
        method: 'view',
        params: [o],
        success: 'successTheftTrainingRPCView',
        error: 'failureTheftTrainingRPCView',
    });
});
TheftTrainingRPCActions.successTheftTrainingRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});
