'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');

var EmpireRPCStore = require('/app/js/stores/rpc/empire');
var LeftSidebarActions = require('/app/js/actions/menu/leftSidebar');

var LeftSidebarButton = createReactClass({
    displayName: 'LeftSidebarButton',
    mixins: [Reflux.connect(EmpireRPCStore, 'empire')],

    clickLeftSidebarButton: function() {
        LeftSidebarActions.show();
    },

    render: function() {
        return (
            <div
                style={{
                    position: 'absolute',
                    zIndex: 2500,
                    left: '15px',
                    top: '15px',
                }}
            >
                <div
                    className='ui left labeled icon blue button'
                    onClick={this.clickLeftSidebarButton}
                >
                    <i className='content icon' />
                    {this.state.empire.name}
                </div>
            </div>
        );
    },
});

module.exports = LeftSidebarButton;
