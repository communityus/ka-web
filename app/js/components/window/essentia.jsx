'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');

var WindowActions = require('/app/js/actions/window');
var EmpireRPCActions = require('/app/js/actions/rpc/empire');

var SessionStore = require('/app/js/stores/session');
var EmpireRPCStore = require('/app/js/stores/rpc/empire');
var BoostsEmpireRPCStore = require('/app/js/stores/rpc/empire/boosts');

var BoostsTab = require('/app/js/components/window/essentia/boostsTab');
var GetEssentiaTab = require('/app/js/components/window/essentia/getEssentiaTab');

var Tabber = require('/app/js/components/tabber');
var Tabs = Tabber.Tabs;
var Tab = Tabber.Tab;

var Essentia = createReactClass({
    displayName: 'Essentia',

    mixins: [
        Reflux.connect(EmpireRPCStore, 'empireStore'),
        Reflux.connect(BoostsEmpireRPCStore, 'boostsStore'),
        Reflux.connect(SessionStore, 'session'),
    ],

    statics: {
        options: {
            title: 'Essentia',
            width: 600,
            height: 350,
        },
    },

    closeWindow: function() {
        WindowActions.windowCloseByType('essentia');
    },

    render: function() {
        return (
            <Tabs>
                <Tab
                    title='Boosts'
                    onSelect={EmpireRPCActions.requestEmpireRPCGetBoosts}
                >
                    <BoostsTab
                        essentia={this.state.empireStore.essentia}
                        exactEssentia={this.state.empireStore.exactEssentia}
                        boosts={this.state.boostsStore}
                    />
                </Tab>

                <Tab title='Get More Essentia'>
                    <GetEssentiaTab session={this.state.session} />
                </Tab>
            </Tabs>
        );
    },
});

module.exports = Essentia;
