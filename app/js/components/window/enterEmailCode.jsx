'use strict';

var React = require('react');

var EnterEmailCodeWindow = React.createClass({
    statics : {
        options : {
            title  : 'Enter Email Code',
            width  : 300,
            height : 200
        }
    },

    propTypes : {
        options : React.PropTypes.object.isRequired
    },

    render : function() {
        return (
            <div>
                Hello there: {this.props.options.username}
            </div>
        );
    }
});

module.exports = EnterEmailCodeWindow;
