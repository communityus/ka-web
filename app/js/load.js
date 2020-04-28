'use strict';

console.log('Assets url:', process.env.KA_ASSETS_URL);
console.log('Server url:', process.env.KA_SERVER_URL);
console.log('Ws server url:', process.env.KA_WS_SERVER_URL);
console.log('Test ws:', process.env.KA_TEST_WS);
console.log('Mock server:', process.env.KA_MOCK_SERVER);

require('/app/vendor-css/yui-reset.css');
require('/app/vendor-css/semantic.css');
require('/app/vendor-css/vex.css');
require('/app/vendor-css/vex-theme-default.css');
require('/app/css/styles.css');
require('react-tabs/style/react-tabs.css');

require('/app/shims/jquery');
require('/app/shims/yahoo');

// RPC and core stuff
require('/app/js-yui/library');
require('/app/js-yui/textboxList');
require('/app/js-yui/smd');
require('/app/js-yui/rpc');
require('/app/js/game');
require('/app/js/dao');

// Empire management and star map
require('/app/js-yui/announce');
require('/app/js-yui/speciesDesigner');
require('/app/js-yui/createSpecies');
require('/app/js-yui/createEmpire');
require('/app/js-yui/login');
require('/app/js-yui/mapper');
require('/app/js-yui/mapStar');

// Buildings
require('/app/js-yui/building');
require('/app/js-yui/building/archaeology');
require('/app/js-yui/building/blackHoleGenerator');
require('/app/js-yui/building/capitol');
require('/app/js-yui/building/development');
require('/app/js-yui/building/distributionCenter');
require('/app/js-yui/building/embassy');
require('/app/js-yui/building/energyReserve');
require('/app/js-yui/building/entertainment');
require('/app/js-yui/building/foodReserve');
require('/app/js-yui/building/geneticsLab');
require('/app/js-yui/building/intelligence');
require('/app/js-yui/building/libraryOfJith');
require('/app/js-yui/building/mercenariesGuild');
require('/app/js-yui/building/miningMinistry');
require('/app/js-yui/building/missionCommand');
require('/app/js-yui/building/network19');
require('/app/js-yui/building/observatory');
require('/app/js-yui/building/oreStorage');
require('/app/js-yui/building/park');
require('/app/js-yui/building/planetaryCommand');
require('/app/js-yui/building/security');
require('/app/js-yui/building/shipyard');
require('/app/js-yui/building/spacePort');
require('/app/js-yui/building/spaceStationLab');
require('/app/js-yui/building/subspaceSupplyDepot');
require('/app/js-yui/building/templeOfTheDrajilites');
require('/app/js-yui/building/themePark');
require('/app/js-yui/building/theDillonForge');
require('/app/js-yui/building/tradeMinistry');
require('/app/js-yui/building/transporter');
require('/app/js-yui/building/wasteExchanger');
require('/app/js-yui/building/wasteRecycling');
require('/app/js-yui/building/waterStorage');
require('/app/js-yui/module/parliament');
require('/app/js-yui/module/policeStation');
require('/app/js-yui/module/stationCommand');

// Menu stuff
require('/app/js-yui/mapPlanet');
require('/app/js-yui/messaging');

require('/app/js-yui/profile');
require('/app/js-yui/stats');
require('/app/js-yui/info');
require('/app/js-yui/notify');
require('/app/js/components/menu');

const mock = require('/app/js/mock');

const init = () => {
    // TODO this code can be improved.
    var l = window.location;
    var query = {};
    var vars = l.hash.substring(1).split('&');
    if (vars.length > 0) {
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            query[pair[0]] = decodeURIComponent(pair[1]);
        }
    }
    if (window.history.replaceState) {
        window.history.replaceState(
            {},
            document.title,
            l.protocol + '//' + l.host + l.pathname + l.search
        );
    } else if (l.hash !== '') {
        l.hash = '';
    }

    if (process.env.KA_MOCK_SERVER === 'enabled') {
        mock.setupMocking();
    }

    // Start everything!
    YAHOO.widget.Logger.enableBrowserConsole();
    YAHOO.lacuna.Game.Start(query);
};

$(init);
