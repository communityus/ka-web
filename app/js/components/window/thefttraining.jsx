'use strict';

var PropTypes = require('prop-types');

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');

var GenericBuildingStore = require('/app/js/stores/genericBuilding');

var WindowActions = require('/app/js/actions/window');
var BuildingWindowActions = require('/app/js/actions/windows/building');
var TheftTrainingRPCActions = require('/app/js/actions/rpc/theftTraining');

var StandardTabs = require('/app/js/components/window/building/standardTabs');
var BuildingInformation = require('/app/js/components/window/building/information');
var SpyTrainingStatus = require('/app/js/components/window/spyTraining/spyTrainingStatus');

var Tabber = require('/app/js/components/tabber');
var Tabs = Tabber.Tabs;
var Tab = Tabber.Tab;

var TheftTraining = createReactClass({
    displayName: 'TheftTraining',

    statics: {
        options: {
            title: 'Theft Training',
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
        TheftTrainingRPCActions.requestTheftTrainingRPCView(
            this.props.options.id
        );
    },

    closeWindow: function() {
        WindowActions.windowCloseByType('building');
    },

    render: function() {
        var building = this.state.genericBuildingStore;
        var tabs = StandardTabs.tabs(this.props.options, building);
        if (building.extraViewData.spies) {
            tabs.push(
                <Tab title='Spy Training' key='Spy Training'>
                    <SpyTrainingStatus
                        inTraining={building.extraViewData.spies.in_training}
                        pointsPerHour={building.extraViewData.spies.points_per}
                        maxPoints={building.extraViewData.spies.max_points}
                    />
                </Tab>
            );
        }

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

module.exports = TheftTraining;
