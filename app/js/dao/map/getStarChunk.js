'use strict';

// var StarmapActions  = require('/app/js/actions/starmap');
// var server          = require('/app/js/server');

// Convert a user request for a get_star_chunk rpc into a server request
// on success, create a getStarChunk event
//
// StarmapActions.requestGetStarChunk.listen(function(o) {
//    console.log('Starmap Action: requestStarChunk [' + o.xChunk + '][' + o.yChunk + ']');

//    server.call({
//        module : 'map',
//        method : 'get_star_chunk',
//        params : [{
//            x_chunk : o.xChunk,
//            y_chunk : o.yChunk
//        }],
//        success : function() {
//            console.log('Starmap Action: successGetStarChunk');
//            StarmapActions.successGetStarChunk();
//        },
//        error : function() {
//            console.log('Starmap Action: failGetStarChunk');
//            StarmapActions.failGetStarChunk();
//    })
// });

