'use strict';

var PropTypes = require('prop-types');

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');

var GetBodyStatusRPCStore = require('/app/js/stores/rpc/body/getBodyStatus');

var WindowActions = require('/app/js/actions/window');
var BodyRPCActions = require('/app/js/actions/rpc/body');

var PlanetDetailsTab = require('/app/js/components/window/planetPanel/planetDetailsTab');
var Tabber = require('/app/js/components/tabber');

var Tabs = Tabber.Tabs;
var Tab = Tabber.Tab;

var PlanetPanel = createReactClass({
    displayName: 'PlanetPanel',

    statics: {
        options: {
            title: 'Planet Details',
            width: 700,
            height: 450,
        },
    },

    propTypes: {
        options: PropTypes.object,
    },

    mixins: [Reflux.connect(GetBodyStatusRPCStore, 'getBodyStatusStore')],

    componentWillMount: function() {
        BodyRPCActions.requestBodyRPCGetBodyStatus({
            bodyId: this.props.options.data.id,
        });
    },

    closeWindow: function() {
        WindowActions.windowCloseByType('planetPanel');
    },

    render: function() {
        var tabs = [];
        tabs.push(
            <Tab title='Planet Details' key='Planet Details'>
                <PlanetDetailsTab />
            </Tab>
        );

        tabs.push(
            <Tab title='My Fleets' key='My Fleets'>
                <p>Not Yet Implemented</p>
            </Tab>
        );
        tabs.push(
            <Tab title='Foreign Fleets' key='Foreign Fleets'>
                <p>Not Yet Implemented</p>
            </Tab>
        );
        return (
            <div>
                <div>
                    <Tabs>{tabs}</Tabs>
                </div>
            </div>
        );
    },
});

module.exports = PlanetPanel;
