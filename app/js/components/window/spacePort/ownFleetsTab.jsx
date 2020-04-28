'use strict';

var PropTypes = require('prop-types');

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');

var constants = require('/app/js/constants');

var ViewAllFleetsSpacePortRPCStore = require('/app/js/stores/rpc/spacePort/viewAllFleets');

var OwnFleetItem = require('/app/js/components/window/spacePort/ownFleets/item');

var OwnFleetsTab = createReactClass({
    displayName: 'OwnFleetsTab',

    propTypes: {
        buildingId: PropTypes.number.isRequired,
    },

    getInitialState: function() {
        return {
            task: 'all',
            tag: 'all',
            type: 'all',
            name: '',
        };
    },

    mixins: [
        Reflux.connect(ViewAllFleetsSpacePortRPCStore, 'viewAllFleetsStore'),
    ],

    handleTaskChange: function(e) {
        this.setState({
            task: e.target.value,
        });
    },

    handleTagChange: function(e) {
        this.setState({
            tag: e.target.value,
        });
    },

    handleTypeChange: function(e) {
        this.setState({
            type: e.target.value,
        });
    },

    handleNameChange: function(e) {
        this.setState({
            name: e.target.value,
        });
    },

    render: function() {
        var fleetTypes = constants.FLEET_TYPES;
        var renderFleetTypes = [];
        for (var prop in fleetTypes) {
            if (fleetTypes.hasOwnProperty(prop)) {
                renderFleetTypes.push(
                    <option value={prop}>{fleetTypes[prop]}</option>
                );
            }
        }

        var fleetTags = constants.FLEET_TAGS;
        var renderFleetTags = [];
        for (var prop2 in fleetTags) {
            if (fleetTags.hasOwnProperty(prop2)) {
                renderFleetTags.push(
                    <option value={prop2}>{fleetTags[prop2]}</option>
                );
            }
        }

        var fleetTasks = constants.FLEET_TASKS;
        var renderFleetTasks = [];
        for (var prop3 in fleetTasks) {
            if (fleetTasks.hasOwnProperty(prop3)) {
                renderFleetTasks.push(
                    <option value={prop3}>{fleetTasks[prop3]}</option>
                );
            }
        }

        var fleetItems = this.state.viewAllFleetsStore.fleets.slice(0);

        // Filter based on Task
        if (this.state.task !== 'all') {
            fleetItems = $.grep(fleetItems, function(item, index) {
                return item.task === this.state.task;
            });
        }

        // Filter based on Type
        if (this.state.type !== 'all') {
            fleetItems = $.grep(fleetItems, function(item, index) {
                return item.details.type === this.state.type;
            });
        }

        // Filter based on Tag
        if (this.state.tag !== 'all') {
            fleetItems = $.grep(fleetItems, function(item, index) {
                return 1;
            });
        }

        var renderFleetItems = [];

        for (var i = 0; i < fleetItems.length; i++) {
            renderFleetItems.push(
                <OwnFleetItem
                    obj={fleetItems[i]}
                    buildingId={this.props.buildingId}
                />
            );
        }

        return (
            <div className='ui form'>
                <div className='equal width fields'>
                    <div className='field'>
                        <label>Task</label>
                        <select
                            className='ui small dropdown'
                            ref='task'
                            onChange={this.handleTaskChange}
                        >
                            <option value='All'>All</option>
                            {renderFleetTasks}
                        </select>
                    </div>

                    <div className='field'>
                        <label>Tag</label>
                        <select
                            className='ui small dropdown'
                            ref='tag'
                            onChange={this.handleTagChange}
                        >
                            <option value='All'>All</option>
                            {renderFleetTags}
                        </select>
                    </div>

                    <div className='field'>
                        <label>Type</label>
                        <select
                            className='ui small dropdown'
                            ref='type'
                            onChange={this.handleTypeChange}
                        >
                            <option value='all'>All</option>
                            {renderFleetTypes}
                        </select>
                    </div>

                    <div className='field'>
                        <label>Name</label>
                        <input
                            type='text'
                            ref='name'
                            onChange={this.handleNameChange}
                        />
                    </div>
                </div>

                <div className='ui divider'></div>

                <div>{renderFleetItems}</div>
            </div>
        );
    },
});

module.exports = OwnFleetsTab;
