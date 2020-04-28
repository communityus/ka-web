'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');

var BodyRPCGetBodyStatusStore = require('/app/js/stores/rpc/body/getBodyStatus');

var PlanetPanelLine = require('/app/js/components/window/planetPanel/line');

var constants = require('/app/js/constants');

var PlanetDetails = createReactClass({
    displayName: 'PlanetDetails',

    mixins: [
        Reflux.connect(BodyRPCGetBodyStatusStore, 'bodyRPCGetBodyStatusStore'),
    ],

    render: function() {
        var bodyStatus = this.state.bodyRPCGetBodyStatusStore;
        var location = bodyStatus.x + 'x : ' + bodyStatus.y + 'y';

        return (
            <div className='ui grid'>
                <div className='five wide column'>
                    <img
                        src={
                            constants.ASSETS_URL +
                            'star_system/' +
                            bodyStatus.image +
                            '.png'
                        }
                        style={{
                            width: 100,
                            height: 100,
                        }}
                    />
                </div>
                <div className='eleven wide column'>
                    <PlanetPanelLine title='Name' value={bodyStatus.name} />
                    <PlanetPanelLine title='Type' value={bodyStatus.type} />
                    <PlanetPanelLine title='Empire' value='' />
                    <PlanetPanelLine title='Water' value={bodyStatus.water} />
                    <PlanetPanelLine
                        title='Planet Size'
                        value={bodyStatus.size}
                    />
                    <PlanetPanelLine title='Location' value={location} />
                    <PlanetPanelLine title='Zone' value={bodyStatus.zone} />
                    <PlanetPanelLine title='Body ID' value={bodyStatus.id} />
                    <PlanetPanelLine
                        title='Star'
                        value={
                            bodyStatus.star_name +
                            '(ID: ' +
                            bodyStatus.star_id +
                            ')'
                        }
                    />
                    <PlanetPanelLine title='Orbit' value={bodyStatus.orbit} />
                </div>
            </div>
        );
    },
});

module.exports = PlanetDetails;
