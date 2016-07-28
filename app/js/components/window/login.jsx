'use strict';

var React           = require('react');

var WindowActions   = require('js/actions/window');
var UserWSActions   = require('js/actions/ws/user');

var LoginWindow = React.createClass({
    statics : {
        options : {
            title  : 'Login',
            width  : 500,
            height : 200
        }
    },

    onLoginClick : function() {
        UserWSActions.requestUserWSLoginWithPassword({
            username : this.refs.username.value,
            password : this.refs.password.value
        });
    },

    onRegisterClick : function() {
        console.log('TODO: onRegisterClick called');
    },

    closeWindow : function() {
        WindowActions.windowCloseByType('login');
    },

    render : function() {
        return (
            <div>
                <div className="ui two column middle aligned very relaxed stackable grid">
                    <div className="column">
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
                                <label>Password</label>

                                <div className="ui left icon input">
                                    <input type="password" ref="password"></input>
                                    <i className="lock icon"></i>
                                </div>
                            </div>

                            <div className="ui blue submit labeled icon button" onClick={this.onLoginClick}>
                                <i className="rocket icon"></i>
                                Login
                            </div>
                        </div>
                    </div>

                    {
                    // This is an awful hack, but it works for now...
                    }
                    <div
                        style={{
                            borderLeft   : '1px solid white',
                            display      : 'inline-block',
                            height       : 200,
                            left         : 275,
                            paddingLeft  : 0,
                            paddingRight : 0,
                            position     : 'absolute',
                            top          : 35,
                            width        : 1
                        }}
                    ></div>

                    <div className="center aligned column">
                        <p style={{fontWeight : 'bold'}}>
                            New to Kenó Antigen?
                        </p>

                        <div
                            className="ui large green labeled icon button"
                            onClick={this.onRegisterClick}
                        >
                            <i className="signup icon"></i>
                            Register
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = LoginWindow;
