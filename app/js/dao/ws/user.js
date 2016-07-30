'use strict';

var vex                 = require('js/vex');
var ws                  = require('js/ws');
var UserWSActions       = require('js/actions/ws/user');

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

UserWSActions.failureUserWSLoginWithPassword.listen(function(result) {
    if (result.message.includes('Incorrect credentials')) {
        vex.alert('Invalid username or password');
    }
});

module.exports = UserWSActions;
