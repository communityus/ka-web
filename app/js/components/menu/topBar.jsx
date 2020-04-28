'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');
var classNames = require('classnames');

var EmpireRPCStore = require('/app/js/stores/rpc/empire');
var MapModeMenuStore = require('/app/js/stores/menu/mapMode');
var ServerRPCStore = require('/app/js/stores/rpc/server');

var EmpireRPCActions = require('/app/js/actions/rpc/empire');
var MapMenuActions = require('/app/js/actions/menu/map');
var WindowActions = require('/app/js/actions/window');
var MailWindowActions = require('/app/js/actions/windows/mail');
var StatsWindowActions = require('/app/js/actions/windows/stats');

var EssentiaWindow = require('/app/js/components/window/essentia');
var PromotionsWindow = require('/app/js/components/window/promotions');

var TopBar = createReactClass({
    displayName: 'TopBar',

    mixins: [
        Reflux.connect(EmpireRPCStore, 'empire'),
        Reflux.connect(ServerRPCStore, 'server'),
        Reflux.connect(MapModeMenuStore, 'mapMode'),
    ],

    mapButtonTip: function() {
        if (this.state.mapMode === MapModeMenuStore.PLANET_MAP_MODE) {
            return 'To Star Map';
        } else {
            return 'To Planet Map';
        }
    },

    render: function() {
        var barClass = classNames('ui inverted compact small menu', {
            red: this.state.empire.self_destruct_active,
            blue: !this.state.empire.self_destruct_active,
        });

        return (
            <div
                className='ui centered grid'
                style={{
                    zIndex: 2000,
                    position: 'relative',
                    top: 15,
                }}
            >
                <div className='center aligned column'>
                    <div className={barClass} ref='bar'>
                        <a
                            className='item'
                            data-tip={this.mapButtonTip()}
                            onClick={MapMenuActions.mapToggleMode}
                        >
                            <i className='map big icon'></i>
                        </a>

                        <a
                            className='item'
                            data-tip='Mail'
                            onClick={MailWindowActions.mailWindowShow}
                        >
                            <i className='mail big icon'></i>
                            {this.state.empire.has_new_messages > 0 ? (
                                <div className='ui yellow label'>
                                    {this.state.empire.has_new_messages}
                                </div>
                            ) : (
                                ''
                            )}
                        </a>

                        <a
                            className='item'
                            data-tip='Essentia'
                            onClick={function() {
                                WindowActions.windowAdd(
                                    EssentiaWindow,
                                    'essentia'
                                );
                            }}
                        >
                            <i className='money big icon'></i>
                            <div className='ui teal label'>
                                {this.state.empire.essentia}
                            </div>
                        </a>

                        <a
                            className='item'
                            data-tip='Universe Rankings'
                            onClick={StatsWindowActions.statsWindowShow}
                        >
                            <i className='find big icon'></i>
                        </a>

                        {this.state.server.promotions.length > 0 ? (
                            <a
                                className='item'
                                data-tip={
                                    this.state.server.promotions.length > 1
                                        ? 'Active Promotions'
                                        : 'Active Promotion'
                                }
                                onClick={function() {
                                    WindowActions.windowAdd(
                                        PromotionsWindow,
                                        'promotions'
                                    );
                                }}
                            >
                                <i className='announcement big icon'></i>
                                <div className='ui orange floated right circular label'>
                                    Event!
                                </div>
                            </a>
                        ) : (
                            ''
                        )}

                        <a
                            className='item'
                            data-tip='Sign Out'
                            onClick={EmpireRPCActions.requestEmpireRPCLogout}
                        >
                            <i className='power big icon'></i>
                        </a>
                    </div>
                </div>
            </div>
        );
    },
});

module.exports = TopBar;
