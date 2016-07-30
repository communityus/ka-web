'use strict';

var _             = require('lodash');

var constants     = require('js/constants');
var UserWSActions = require('js/actions/ws/user');

var actionMap = {
    user : require('js/actions/ws/user')
};

// TODO clientCode should come from local store
// TODO we need to be able to reconnect to the WebSocket if it fails
var ws          = new window.WebSocket(constants.WS_BASE);
var clientCode  = 'bad';
var msgId       = 0;

// Handle messages from the Server
//
// for example: if the route comes in as '/user/clientCode'
// We need to do actions from 'js/actions/ws/user'
// and call action 'successUserWsClientCode' or 'failureUserWsClientCode'
//
ws.onmessage = function(event) {

    var json = JSON.parse(event.data);
    var routeMethod = json.route;

    console.log('Web Socket: RECEIVED:', json);

    var splitted = _.compact(json.route.split('/'));
    var route   = splitted[0] || '';
    var method  = splitted[1] || '';
    var action  = json.status === 0 ? 'success' : 'failure';

    var actionObj  = actionMap[route];

    // Capitalize first letter of 'method' and 'route'
    var capitalizedMethod      = method.charAt(0).toUpperCase() + method.slice(1);
    var capitalizedRoute       = route.charAt(0).toUpperCase() + route.slice(1);

    if (!actionObj) {
        console.error('Could not route response from [' + routeMethod + ']');
        return;
    }

    // Combine to create the action name
    var fullAction  = action + capitalizedRoute + 'WS' + capitalizedMethod;

    // Call the relevant action with the relevant data.
    if (action === 'success') {
        actionObj[fullAction](json.content);
    } else if (action === 'failure') {
        actionObj[fullAction](json);
    }
};

ws.onopen = function(event) {
    // TODO: Validate the clientCode
    // console.log('Validate clientCode');

    call({
        route : '/user/clientCode'
    });
};

// Send the message.
// Add the clientCode
// Add the msgId (next number in series)
//
var call = function(message) {
    message.msgId       = ++msgId;
    message.clientCode  = clientCode;

    console.log('Web Socket: SENDING:', message);

    ws.send(JSON.stringify(message));

    return msgId;
};

// Listen for the success return of a client code
UserWSActions.successUserWSClientCode.listen(function(result) {
    clientCode = result.clientCode;
    console.log('Using client code:', clientCode);
});

module.exports.clientCode   = clientCode;
module.exports.call         = call;
