'use strict';

var constants           = require('js/constants');
var UserWSActions       = require('js/actions/ws/user');

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

    var index   = routeMethod.lastIndexOf('/');
    var route   = routeMethod.substring(1, index);
    var method  = routeMethod.substring(index + 1);
    var action  = 'success';

    var actionClass  = actionMap[route];

    // Capitalize first letter of 'method' and 'route'
    method      = method.charAt(0).toUpperCase() + method.slice(1);
    route       = route.charAt(0).toUpperCase() + route.slice(1);

    if (!actionClass) {
        console.error('ERROR: could not find route to [' + routeMethod + ']');
        return;
    }

    if (json.status > 0) {
        action = 'failure';
    }

    // Combine to create the action name
    action  = action + route + 'WS' + method;

    // Convert the route and method into an action
    actionClass[action](json.content);
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
});

module.exports.clientCode   = clientCode;
module.exports.call         = call;
