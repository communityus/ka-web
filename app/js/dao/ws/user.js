'use strict';

var vex                  = require('js/vex');
var ws                   = require('js/ws');

var EnterEmailCodeWindow = require('js/components/window/enterEmailCode');

var UserWSActions        = require('js/actions/ws/user');
var WindowActions        = require('js/actions/window');

UserWSActions.requestUserWSLoginWithPassword.listen(function(content) {
    ws.call({
        route   : '/user/loginWithPassword',
        content : content
    });
});

UserWSActions.requestUserWSRegister.listen(function(content) {
    ws.call({
        route   : '/user/register',
        content : content
    });
});

UserWSActions.successUserWSRegister.listen(function(result) {
    if (result.loginStage === 'enterEmailCode') {
        WindowActions.windowCloseAll();
        WindowActions.windowAdd(EnterEmailCodeWindow, 'enterEmailCodeWindow', {
            username : result.username
        });
    }
});

UserWSActions.failureUserWSRegister.listen(function(result) {
    vex.alert(result.message);
});

UserWSActions.failureUserWSLoginWithPassword.listen(function(result) {
    if (result.message.includes('Incorrect credentials')) {
        vex.alert('Invalid username or password');
    }
});

module.exports = UserWSActions;
