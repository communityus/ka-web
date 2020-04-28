'use strict';

var PropTypes = require('prop-types');

var React = require('react');

var ResourceAttribute = require('/app/js/components/window/shipyard/resourceAttribute');
var SubsidizeButton = require('/app/js/components/window/shipyard/buildQueue/subsidizeButton');
var CountdownTimer = require('/app/js/components/countdownTimer');

var util = require('/app/js/util');
var constants = require('/app/js/constants');

class BuildQueueItem extends React.Component {
    static propTypes = {
        obj: PropTypes.object.isRequired,
        buildingId: PropTypes.number.isRequired,
    };

    render() {
        var starfieldStyle = {
            width: 100,
            height: 100,
            background:
                'transparent url(' +
                constants.ASSETS_URL +
                'star_system/field.png) no-repeat center',
        };

        var obj = this.props.obj;
        var shipImage =
            constants.ASSETS_URL + 'ships/' + this.props.obj.type + '.png';

        return (
            <div>
                <div className='ui grid'>
                    <div className='three wide column'>
                        <div>{obj.type_human}</div>
                        <div style={starfieldStyle}>
                            <img
                                src={shipImage}
                                style={{
                                    width: 100,
                                    height: 100,
                                }}
                                className='shipImage'
                            />
                        </div>
                    </div>

                    <div className='four wide column'>
                        <ResourceAttribute
                            name={'Quantity'}
                            attr={obj.quantity}
                        />
                        <ResourceAttribute
                            name={'Speed'}
                            attr={obj.attributes.speed}
                        />
                        <ResourceAttribute
                            name={'Berth Level'}
                            attr={obj.attributes.berth_level}
                        />
                        <ResourceAttribute
                            name={'Hold Size'}
                            attr={obj.attributes.hold_size}
                        />
                        <ResourceAttribute
                            name={'Max Occupants'}
                            attr={obj.attributes.max_occupants}
                        />
                        <ResourceAttribute
                            name={'Combat'}
                            attr={obj.attributes.combat}
                        />
                        <ResourceAttribute
                            name={'Stealth'}
                            attr={obj.attributes.stealth}
                        />
                    </div>

                    <div className='four wide column'>
                        <CountdownTimer
                            endDate={util.formatMomentLong(
                                util.serverDateToMoment(obj.date_completed)
                            )}
                        />
                    </div>

                    <div className='five wide column'>
                        <SubsidizeButton
                            obj={obj}
                            buildingId={this.props.buildingId}
                        />
                    </div>
                </div>

                <div className='ui divider' />
            </div>
        );
    }
}

module.exports = BuildQueueItem;
