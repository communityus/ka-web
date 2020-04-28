'use strict';

var dao = require('/app/js/dao');
var vex = require('/app/js/vex');
var ws = require('/app/js/ws');
var UserWSActions = require('/app/js/actions/ws/user');

UserWSActions.requestUserWSLoginWithPassword.listen(function(content) {
    ws.call({
        route: '/user/loginWithPassword',
        content: content,
    });
});

UserWSActions.requestUserWSRegister.listen(function(content) {
    ws.call({
        route: '/user/register',
        content: content,
    });
});

// I'm not sure these belong here. but for now
//

UserWSActions.successUserWSClientCode.listen(function(result) {
    vex.alert(
        'Successful Web Socket call for client code - ' + result.clientCode
    );
});

UserWSActions.successUserWSLoginWithPassword.listen(function(result) {
    vex.alert('Successful Web Socket login - ');
});

UserWSActions.failureUserWSLoginWithPassword.listen(function(result) {
    vex.alert('Failure Web Socket login - ');
});

module.exports = UserWSActions;
