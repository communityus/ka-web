'use strict';

var PropTypes = require('prop-types');

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');
var _ = require('lodash');

var GenericBuildingStore = require('/app/js/stores/genericBuilding');

var WindowActions = require('/app/js/actions/window');
var BuildingWindowActions = require('/app/js/actions/windows/building');
var ShipyardRPCActions = require('/app/js/actions/rpc/shipyard');

var StandardTabs = require('/app/js/components/window/building/standardTabs');
var BuildingInformation = require('/app/js/components/window/building/information');
var BuildFleetTab = require('/app/js/components/window/shipyard/buildFleetTab');
var BuildQueueTab = require('/app/js/components/window/shipyard/buildQueueTab');

var Tabber = require('/app/js/components/tabber');
var Tabs = Tabber.Tabs;
var Tab = Tabber.Tab;

var Shipyard = createReactClass({
    displayName: 'Shipyard',

    statics: {
        options: {
            title: 'Shipyard',
            width: 700,
            height: 420,
        },
    },

    propTypes: {
        options: PropTypes.object,
    },

    mixins: [Reflux.connect(GenericBuildingStore, 'genericBuildingStore')],

    componentWillMount: function() {
        BuildingWindowActions.buildingWindowClear();
        ShipyardRPCActions.requestShipyardRPCView(this.props.options.id);
    },

    closeWindow: function() {
        WindowActions.windowCloseByType('building');
    },

    render: function() {
        var building = this.state.genericBuildingStore;
        var tabs = StandardTabs.tabs(this.props.options, building);
        tabs.push(
            <Tab title='Build Queue' key='Build Queue'>
                <BuildQueueTab buildingId={building.id} />
            </Tab>
        );

        tabs.push(
            <Tab
                title='Build Ships'
                key='Build Ships'
                onSelect={_.partial(
                    ShipyardRPCActions.requestShipyardRPCGetBuildable,
                    building.id
                )}
            >
                <BuildFleetTab buildingId={building.id} />
            </Tab>
        );

        tabs.push(
            <Tab title='Repair Ships' key='Repair Ships'>
                <p>Not Yet Implemented</p>
                <p>
                    Fleets of ships damaged in an attack can be repaired (at
                    less cost than building from scratch
                </p>
            </Tab>
        );

        tabs.push(
            <Tab title='Refit Ships' key='Refit Ships'>
                <p>Not Yet Implemented</p>
                <p>
                    Fleets of ships will be able to be upgraded to the empires
                    current spec.
                </p>
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

module.exports = Shipyard;
