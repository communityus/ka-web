'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');

var TopBar = require('/app/js/components/menu/topBar');
var BottomBar = require('/app/js/components/menu/bottomBar');

var LeftSidebarButton = require('/app/js/components/menu/leftSidebarButton');
var RightSidebarButton = require('/app/js/components/menu/rightSidebarButton');

var Loader = require('/app/js/components/menu/loader');

var MenuStore = require('/app/js/stores/menu');

var Menu = createReactClass({
    displayName: 'Menu',
    mixins: [Reflux.connect(MenuStore, 'menuStore')],

    render: function() {
        if (this.state.menuStore.show) {
            return (
                <div>
                    <LeftSidebarButton />
                    <RightSidebarButton />
                    <TopBar />

                    <div id='oldYUIPanelContainer'></div>

                    <Loader />
                    <BottomBar />
                </div>
            );
        } else {
            return <div></div>;
        }
    },
});

module.exports = Menu;
