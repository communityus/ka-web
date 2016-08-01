'use strict';

var React           = require('react');

var UserWSActions   = require('js/actions/ws/user');
var WindowActions   = require('js/actions/window');

var RegisterWindow = React.createClass({
    statics : {
        options : {
            title  : 'Register',
            width  : 300,
            height : 200
        }
    },

    onBackClick : function() {
        // Requiring in here to avoid circular dependency.
        var LoginWindow = require('js/components/window/login');

        WindowActions.windowCloseByType('register');
        WindowActions.windowAdd(LoginWindow, 'login');
    },

    onRegisterClick : function() {
        UserWSActions.requestUserWSRegister({
            username : this.refs.username.value,
            email    : this.refs.email.value
        });
    },

    closeWindow : function() {
        WindowActions.windowCloseByType('register');
    },

    render : function() {
        return (
            <div>
                <div className="ui form">
                    <div className="field">
                        <label>Username</label>

                        <div className="ui left icon input">
                            <input
                                type="text"
                                ref="username"
                                placeholder="Batman"
                            ></input>
                            <i className="user icon"></i>
                        </div>
                    </div>

                    <div className="field">
                        <label>Email</label>

                        <div className="ui left icon input">
                            <input
                                type="text"
                                ref="email"
                                placeholder="bruce@waynecorp.com"
                            ></input>
                            <i className="mail icon"></i>
                        </div>
                    </div>

                    <div
                        className="ui red labeled icon button"
                        onClick={this.onBackClick}
                    >
                        <i className="left arrow icon"></i>
                        Back
                    </div>

                    <div
                        className="ui green labeled icon button"
                        onClick={this.onRegisterClick}
                    >
                        <i className="right arrow icon"></i>
                        Register
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = RegisterWindow;
