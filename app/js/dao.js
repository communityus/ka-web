'use strict';

var server = require('/app/js/server');
var _ = require('lodash');

// TODO Can we replace this with a function to recursively require them?

require('/app/js/dao/stats');
require('/app/js/dao/empire');
require('/app/js/dao/captcha');
require('/app/js/dao/essentiaVein');
require('/app/js/dao/intelTraining');
require('/app/js/dao/mayhemTraining');
require('/app/js/dao/politicsTraining');
require('/app/js/dao/theftTraining');
require('/app/js/dao/genericBuilding');
require('/app/js/dao/shipyard');
require('/app/js/dao/spacePort');
require('/app/js/dao/trade');
require('/app/js/dao/transporter');
require('/app/js/dao/map');
require('/app/js/dao/body');
require('/app/js/dao/ws');

require('/app/js/ws');

module.exports.makeServerCall = function(uri, options, actions) {
    var defaults = {
        module: uri,
        params: {},
        success: 'noop',
        error: 'noop',
    };
    options = _.merge({}, defaults, options || {});

    server.call({
        module: options.module,
        method: options.method,
        params: options.params,
        success: function(result) {
            console.log(
                'makeServerCall: SUCCESS ' +
                    uri +
                    ' - ' +
                    options.method +
                    '_success'
            );
            actions[options.success](result);
        },
        error: function(error) {
            console.log(
                'makeServerCall: FAILURE ' +
                    uri +
                    ' - ' +
                    options.method +
                    '_success'
            );
            actions[options.error](error);
        },
    });
};
