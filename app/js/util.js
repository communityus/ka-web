'use strict';

var moment = require('moment');
var _ = require('lodash');

var constants = require('/app/js/constants');

var xPad = function(x, pad, r) {
    if (typeof r === 'undefined') {
        r = 10;
    }
    for (; parseInt(x, 10) < r && r > 1; r /= 10) {
        x = pad.toString() + x;
    }
    return x.toString();
};

module.exports.reduceNumber = function(number, always) {
    if (number >= 100000000000000000 || number <= -100000000000000000) {
        // 101Q
        return Math.floor(number / 1000000000000000) + 'Q';
    } else if (number >= 1000000000000000 || number <= -1000000000000000) {
        // 75.3Q
        return Math.floor(number / 100000000000000) / 10 + 'Q';
    } else if (number >= 100000000000000 || number <= -100000000000000) {
        // 101T
        return Math.floor(number / 1000000000000) + 'T';
    } else if (number >= 1000000000000 || number <= -1000000000000) {
        // 75.3T
        return Math.floor(number / 100000000000) / 10 + 'T';
    } else if (number >= 100000000000 || number <= -100000000000) {
        // 101B
        return Math.floor(number / 1000000000) + 'B';
    } else if (number >= 1000000000 || number <= -1000000000) {
        // 75.3B
        return Math.floor(number / 100000000) / 10 + 'B';
    } else if (number >= 100000000 || number <= -100000000) {
        // 101M
        return Math.floor(number / 1000000) + 'M';
    } else if (number >= 1000000 || number <= -1000000) {
        // 75.3M
        return Math.floor(number / 100000) / 10 + 'M';
    } else if (number >= 10000 || number <= -10000) {
        // 123k
        return Math.floor(number / 1000) + 'k';
    } else if (always) {
        // 8765
        return Math.floor(number);
    } else {
        // 8765
        return Math.floor(number) || '0';
    }
};

module.exports.serverDateToDateObj = function(serverDate) {
    // "23 03 2010 01:20:11 +0000"
    var pieces = serverDate.split(' '); // [day month year hr:min:sec timez
    var time = pieces[3].split(':');
    var dt = new Date();

    dt.setUTCFullYear(pieces[2] * 1);
    dt.setUTCMonth(pieces[1] * 1 - 1, pieces[0] * 1);
    dt.setUTCHours(time[0] * 1);
    dt.setUTCMinutes(time[1] * 1);
    dt.setUTCSeconds(time[2] * 1);

    return dt;
};

module.exports.serverDateToMs = function(serverDate) {
    return module.exports.serverDateToDateObj(serverDate).getTime();
};

module.exports.int = function(number) {
    return parseInt(number, 10);
};

module.exports.formatTime = function(totalSeconds) {
    if (totalSeconds < 0) {
        return '';
    }

    var secondsInDay = 60 * 60 * 24;
    var secondsInHour = 60 * 60;
    var day = Math.floor(totalSeconds / secondsInDay);
    var hleft = totalSeconds % secondsInDay;
    var hour = Math.floor(hleft / secondsInHour);
    var sleft = hleft % secondsInHour;
    var min = Math.floor(sleft / 60);
    var seconds = Math.floor(sleft % 60);

    if (day > 0) {
        return [day, xPad(hour, '0'), xPad(min, '0'), xPad(seconds, '0')].join(
            ':'
        );
    } else if (hour > 0) {
        return [hour, xPad(min, '0'), xPad(seconds, '0')].join(':');
    } else {
        return [min, xPad(seconds, '0')].join(':');
    }
};

module.exports.formatMillisecondTime = function(ms) {
    return this.formatTime(ms / 1000);
};

module.exports.serverDateToMoment = function(str) {
    // There are currently two date formats beig used by the server.
    // This is to handle that.

    var usingOldFormat = moment(str, constants.OLD_SERVER_DATE_FORMAT);
    var usingNewFormat = moment(str, constants.NEW_SERVER_DATE_FORMAT);

    if (usingNewFormat.isValid()) {
        return usingNewFormat;
    } else if (usingOldFormat.isVaid()) {
        return usingOldFormat;
    } else {
        console.error('Cannot parse server date: ' + str);
    }
};

module.exports.formatMomentLong = function(theMoment) {
    return theMoment.format('dddd, Do MMMM HH:mm:ss ZZ');
};

module.exports.clone = function(obj) {
    return $.extend(true, {}, obj);
};

module.exports.commify = function(num) {
    if (num === undefined) {
        return '';
    }

    return Number(num).toLocaleString();
};

var handleString = function(string) {
    if (window.isNaN(string)) {
        return string;
    } else {
        return string * 1;
    }
};

var handleObj = function(obj) {
    if (_.isString(obj)) {
        return handleString(obj);
    } else if (_.isObject(obj)) {
        // NOTE: isObject returns true for arrays.
        if (Array.isArray(obj)) {
            return _.forEach(obj, handleObj);
        } else {
            return _.mapValues(obj, handleObj);
        }
    } else {
        return obj;
    }
};

module.exports.fixNumbers = function(data) {
    return _.mapValues(data, handleObj);
};
