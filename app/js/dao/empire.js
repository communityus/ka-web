'use strict';

var dao = require('/app/js/dao');
var vex = require('/app/js/vex');
var EmpireRPCActions = require('/app/js/actions/rpc/empire');

function makeEmpireCall(options) {
    dao.makeServerCall('empire', options, EmpireRPCActions);
}

EmpireRPCActions.requestEmpireRPCLogout.listen(function(o) {
    makeEmpireCall({
        method: 'logout',
        params: {},
        success: 'successEmpireRPCLogout',
        error: 'failureEmpireRPCLogout',
    });
});

EmpireRPCActions.requestEmpireRPCGetBoosts.listen(function(o) {
    makeEmpireCall({
        method: 'get_boosts',
        params: {},
        success: 'successEmpireRPCGetBoosts',
        error: 'failureEmpireRPCGetBoosts',
    });
});

EmpireRPCActions.requestEmpireRPCBoost.listen(function(o) {
    var method = 'boost_' + o.type;

    makeEmpireCall({
        method: method,
        params: [o.weeks],
        success: 'successEmpireRPCBoost',
        error: 'failureEmpireRPCBoost',
    });
});

EmpireRPCActions.requestEmpireRPCGetInviteFriendUrl.listen(function(o) {
    makeEmpireCall({
        method: 'get_invite_friend_url',
        params: {},
        success: 'successEmpireRPCGetInviteFriendUrl',
        error: 'failureEmpireRPCGetInviteFriendUrl',
    });
});

EmpireRPCActions.requestEmpireRPCInviteFriend.listen(function(o) {
    makeEmpireCall({
        method: 'invite_friend',
        params: {
            email: o.email,
            custom_message: o.message,
        },
        success: 'successEmpireRPCInviteFriend',
        error: 'failureEmpireRPCInviteFriend',
    });
});

EmpireRPCActions.requestEmpireRPCRedeemEssentiaCode.listen(function(o) {
    makeEmpireCall({
        method: 'redeem_essentia_code',
        params: [o.code],
        success: 'successEmpireRPCRedeemEssentiaCode',
        error: 'failureEmpireRPCRedeemEssentiaCode',
    });
});

EmpireRPCActions.requestEmpireRPCEnableSelfDestruct.listen(function(o) {
    makeEmpireCall({
        method: 'enable_self_destruct',
        params: [],
        success: 'successEmpireRPCEnableSelfDestruct',
        error: 'failureEmpireRPCEnableSelfDestruct',
    });
});

EmpireRPCActions.requestEmpireRPCDisableSelfDestruct.listen(function(o) {
    makeEmpireCall({
        method: 'disable_self_destruct',
        params: [],
        success: 'successEmpireRPCDisableSelfDestruct',
        error: 'failureEmpireRPCDisableSelfDestruct',
    });
});

// I'm not sure these belong here. but for now
//

EmpireRPCActions.successEmpireRPCRedeemEssentiaCode.listen(function(result) {
    vex.alert('Successfully redeemed ' + result.amount + ' Essentia.');
});

EmpireRPCActions.successEmpireRPCEnableSelfDestruct.listen(function(result) {
    vex.alert('Success - your empire will be deleted in 24 hours.');
});

EmpireRPCActions.successEmpireRPCDisableSelfDestruct.listen(function(result) {
    vex.alert('Success - your empire will not be deleted. Phew!');
});

EmpireRPCActions.successEmpireRPCInviteFriend.listen(function(result) {
    vex.alert('Success - your friend has been sent an invite email.');
});

module.exports = EmpireRPCActions;
