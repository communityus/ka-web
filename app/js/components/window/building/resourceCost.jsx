'use strict';

var PropTypes = require('prop-types');

var React = require('react');

var ResourceLine = require('/app/js/components/window/building/resourceLine');

var util = require('/app/js/util');

class ResourceCost extends React.Component {
    static propTypes = {
        icon: PropTypes.string.isRequired,
        number: PropTypes.number.isRequired,
        stored: PropTypes.number,
    };

    render() {
        var red = false;

        if (
            typeof this.props.stored === 'number' &&
            this.props.number > this.props.stored
        ) {
            red = true;
        }

        return (
            <ResourceLine
                icon={this.props.icon}
                content={util.reduceNumber(this.props.number)}
                title={util.commify(this.props.number)}
                red={red}
            />
        );
    }
}

module.exports = ResourceCost;
