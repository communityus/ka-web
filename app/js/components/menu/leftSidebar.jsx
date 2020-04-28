'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');

var vex = require('/app/js/vex');
var util = require('/app/js/util');

var LeftSidebarActions = require('/app/js/actions/menu/leftSidebar');
var OptionsWindowActions = require('/app/js/actions/windows/options');
var WindowActions = require('/app/js/actions/window');
var EmpireRPCActions = require('/app/js/actions/rpc/empire');

var AboutWindow = require('/app/js/components/window/about');
var InviteWindow = require('/app/js/components/window/invite');

var ServerClock = require('/app/js/components/window/serverClock');

var EmpireRPCStore = require('/app/js/stores/rpc/empire');
var LeftSidebarStore = require('/app/js/stores/menu/leftSidebar');

// Because there's a bit of special logic going on here, this is in a separate component.
var SelfDestruct = createReactClass({
    displayName: 'SelfDestruct',
    mixins: [Reflux.connect(EmpireRPCStore, 'empireRPCStore')],

    handleDestructClick: function() {
        LeftSidebarActions.hide();

        if (this.state.empireRPCStore.self_destruct_active === 1) {
            EmpireRPCActions.requestEmpireRPCDisableSelfDestruct();
            return;
        }

        vex.confirm(
            'Are you ABSOLUTELY sure you want to enable self destuct?  If enabled, your empire will be deleted after 24 hours.',
            EmpireRPCActions.requestEmpireRPCEnableSelfDestruct
        );
    },

    render: function() {
        var destructMs = this.state.empireRPCStore.self_destruct_ms;
        var destructActive =
            this.state.empireRPCStore.self_destruct_active && destructMs > 0;
        var formattedDestructMs = destructActive
            ? util.formatMillisecondTime(destructMs)
            : '';

        var itemStyle = destructActive
            ? {
                  color: 'red',
              }
            : {};

        var verb = destructActive ? 'Disable' : 'Enable';

        return (
            <a
                className='item'
                style={itemStyle}
                onClick={this.handleDestructClick}
            >
                <i className='bomb icon'></i>
                {verb} Self Destruct{' '}
                {destructActive ? (
                    <span>
                        <p
                            style={{
                                margin: 0,
                            }}
                        >
                            SELF DESTRUCT ACTIVE
                        </p>
                        <p
                            style={{
                                textAlign: 'right !important',
                            }}
                        >
                            {formattedDestructMs}
                        </p>
                    </span>
                ) : (
                    ''
                )}
            </a>
        );
    },
});

var LeftSidebar = createReactClass({
    displayName: 'LeftSidebar',

    mixins: [
        Reflux.connect(EmpireRPCStore, 'empire'),
        Reflux.connect(LeftSidebarStore, 'leftSidebar'),
    ],

    componentDidMount: function() {
        var el = this.refs.sidebar;

        $(el).sidebar({
            context: $('#sidebarContainer'),
            duration: 300,
            transition: 'overlay',
            onHidden: LeftSidebarActions.hide,
            onVisible: LeftSidebarActions.show,
        });
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (prevState.leftSidebar !== this.state.leftSidebar) {
            this.handleSidebarShowing();
        }
    },

    handleSidebarShowing: function() {
        var el = this.refs.sidebar;

        $(el).sidebar(this.state.leftSidebar ? 'show' : 'hide');
    },

    render: function() {
        return (
            <div
                className='ui left vertical inverted sidebar menu'
                ref='sidebar'
            >
                <div className='ui horizontal inverted divider'>Actions</div>

                <a
                    className='item'
                    onClick={function() {
                        LeftSidebarActions.hide();
                        WindowActions.windowAdd(InviteWindow, 'invite');
                    }}
                >
                    <i className='add user icon'></i>
                    Invite a Friend
                </a>
                <a
                    className='item'
                    onClick={function() {
                        LeftSidebarActions.hide();
                        YAHOO.lacuna.MapPlanet.Refresh();
                    }}
                >
                    <i className='refresh icon'></i>
                    Refresh
                </a>

                <div className='ui horizontal inverted divider'>Links</div>

                <a
                    className='item'
                    target='_blank'
                    href='/starmap/'
                    onClick={LeftSidebarActions.hide}
                >
                    <i className='map icon'></i>
                    Alliance Map
                </a>
                <a
                    className='item'
                    target='_blank'
                    href='/changes.txt'
                    onClick={LeftSidebarActions.hide}
                >
                    <i className='code icon'></i>
                    Changes Log
                </a>
                <a
                    className='item'
                    target='_blank'
                    href='http://community.lacunaexpanse.com/forums'
                    onClick={LeftSidebarActions.hide}
                >
                    <i className='comments layout icon'></i>
                    Forums
                </a>
                <a
                    className='item'
                    target='_blank'
                    href='http://www.lacunaexpanse.com/help/'
                    onClick={LeftSidebarActions.hide}
                >
                    <i className='student icon'></i>
                    Help
                </a>
                <a
                    className='item'
                    target='_blank'
                    href='http://www.lacunaexpanse.com/terms/'
                    onClick={LeftSidebarActions.hide}
                >
                    <i className='info circle icon'></i>
                    Terms of Service
                </a>
                <a
                    className='item'
                    target='_blank'
                    href='http://lacunaexpanse.com/tutorial/'
                    onClick={LeftSidebarActions.hide}
                >
                    <i className='marker icon'></i>
                    Tutorial
                </a>
                <a
                    className='item'
                    target='_blank'
                    href='http://community.lacunaexpanse.com/wiki'
                    onClick={LeftSidebarActions.hide}
                >
                    <i className='share alternate icon'></i>
                    Wiki
                </a>

                <div className='ui horizontal inverted divider'>Windows</div>

                <a
                    className='item'
                    onClick={function() {
                        LeftSidebarActions.hide();
                        WindowActions.windowAdd(AboutWindow, 'about');
                    }}
                >
                    <i className='rocket icon'></i>
                    About
                </a>

                <a
                    className='item'
                    onClick={function() {
                        LeftSidebarActions.hide();
                        OptionsWindowActions.optionsWindowShow();
                    }}
                >
                    <i className='options icon'></i>
                    Options
                </a>
                <a
                    className='item'
                    onClick={function() {
                        LeftSidebarActions.hide();
                        WindowActions.windowAdd(ServerClock, 'serverclock');
                    }}
                >
                    <i className='wait icon'></i>
                    Server Clock
                </a>

                <div className='ui horizontal inverted divider'>
                    Self Destruct
                </div>

                <SelfDestruct />
            </div>
        );
    },
});

module.exports = LeftSidebar;
