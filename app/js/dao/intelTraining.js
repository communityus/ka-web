'use strict';

var dao = require('/app/js/dao');

var IntelTrainingRPCActions = require('/app/js/actions/rpc/intelTraining');
var BuildingWindowActions = require('/app/js/actions/windows/building');

function makeIntelTrainingCall(options) {
    dao.makeServerCall('inteltraining', options, IntelTrainingRPCActions);
}

IntelTrainingRPCActions.requestIntelTrainingRPCView.listen(function(o) {
    makeIntelTrainingCall({
        method: 'view',
        params: [o],
        success: 'successIntelTrainingRPCView',
        error: 'failureIntelTrainingRPCView',
    });
});
IntelTrainingRPCActions.successIntelTrainingRPCView.listen(function(result) {
    BuildingWindowActions.buildingWindowUpdate(result);
});
