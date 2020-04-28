'use strict';

var PropTypes = require('prop-types');

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');
var _ = require('lodash');

var GenericBuildingStore = require('/app/js/stores/genericBuilding');
var BodyRPCStore = require('/app/js/stores/rpc/body');

var WindowActions = require('/app/js/actions/window');
var BuildingWindowActions = require('/app/js/actions/windows/building');
var SpacePortRPCActions = require('/app/js/actions/rpc/spacePort');

var StandardTabs = require('/app/js/components/window/building/standardTabs');
var BuildingInformation = require('/app/js/components/window/building/information');
var SpacePortOwnFleetsTab = require('/app/js/components/window/spacePort/ownFleetsTab');

var Tabber = require('/app/js/components/tabber');

var Tabs = Tabber.Tabs;
var Tab = Tabber.Tab;

var SpacePort = createReactClass({
    displayName: 'SpacePort',

    statics: {
        options: {
            title: 'SpacePort',
            width: 700,
            height: 420,
        },
    },

    propTypes: {
        options: PropTypes.object,
    },

    mixins: [
        Reflux.connect(GenericBuildingStore, 'genericBuildingStore'),
        Reflux.connect(BodyRPCStore, 'bodyStore'),
    ],

    componentWillMount: function() {
        BuildingWindowActions.buildingWindowClear();
        SpacePortRPCActions.requestSpacePortRPCView(this.props.options.id);
    },

    closeWindow: function() {
        WindowActions.windowCloseByType('building');
    },

    render: function() {
        var building = this.state.genericBuildingStore;
        var tabs = StandardTabs.tabs(this.props.options, building);
        tabs.push(
            <Tab
                title='Own Fleets'
                key='Own Fleets'
                onSelect={_.partial(
                    SpacePortRPCActions.requestSpacePortRPCViewAllFleets,
                    building.id
                )}
            >
                <SpacePortOwnFleetsTab />
            </Tab>
        );

        tabs.push(
            <Tab title='Foreign Orbiting' key='Foreign Orbiting'>
                <p>Not Yet Implemented</p>
            </Tab>
        );
        tabs.push(
            <Tab title='Battle Logs' key='Battle Logs'>
                <p>Not Yet Implemented</p>
            </Tab>
        );
        tabs.push(
            <Tab title='Send Fleet' key='Send Fleet'>
                <p>Not Yet Implemented</p>
                <p>This will combine the current 'send' and 'fleet' tabs</p>
            </Tab>
        );

        return (
            <div>
                <BuildingInformation options={this.props.options} />
                <div>
                    <Tabs>{tabs}</Tabs>
                </div>
            </div>
        );
    },
});

module.exports = SpacePort;
