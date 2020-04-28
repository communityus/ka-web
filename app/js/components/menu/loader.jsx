'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');

var classNames = require('classnames');

var LoaderMenuStore = require('/app/js/stores/menu/loader');

var Loader = createReactClass({
    displayName: 'Loader',
    mixins: [Reflux.connect(LoaderMenuStore, 'loaderMenu')],

    render: function() {
        return (
            <div
                className={classNames('ui large loader', {
                    active: this.state.loaderMenu.show,
                })}
                style={{
                    zIndex: 9999999999,
                    top: '40vh',
                }}
            ></div>
        );
    },
});

module.exports = Loader;
