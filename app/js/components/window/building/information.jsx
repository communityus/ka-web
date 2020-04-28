'use strict';

var PropTypes = require('prop-types');

var React = require('react');

var constants = require('/app/js/constants');
var resources = require('/app/js/resources');

class BuildingInformation extends React.Component {
    static propTypes = {
        options: PropTypes.object.isRequired,
    };

    getImageUrl = () => {
        return (
            constants.ASSETS_URL +
            'planet_side/100/' +
            this.props.options.image +
            '.png'
        );
    };

    render() {
        return (
            <div
                style={{
                    paddingBottom: 5,
                    display: 'inline-block',
                }}
            >
                <div
                    style={{
                        width: 100,
                        height: 100,
                        backgroundImage: 'url(' + this.getImageUrl() + ')',
                        float: 'left',
                    }}
                />

                <div
                    style={{
                        display: 'inline-block',
                        marginLeft: 10,
                        width: 550,
                        float: 'right',
                    }}
                >
                    <strong style={{ fontSize: '1.2em' }}>
                        {this.props.options.name} {this.props.options.level}{' '}
                        (ID: {this.props.options.id})
                    </strong>

                    <p>
                        {
                            resources.buildings[this.props.options.url]
                                .description
                        }
                        <br />
                        <a
                            target='_blank'
                            href={
                                resources.buildings[this.props.options.url].wiki
                            }
                        >
                            More information on Wiki.
                        </a>
                    </p>
                </div>
            </div>
        );
    }
}

module.exports = BuildingInformation;
