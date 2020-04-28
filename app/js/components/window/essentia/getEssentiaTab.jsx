'use strict';

var PropTypes = require('prop-types');

var React = require('react');

var EmpireRPCActions = require('/app/js/actions/rpc/empire');

var WindowActions = require('/app/js/actions/window');

var InviteWindow = require('/app/js/components/window/invite');

var constants = require('/app/js/constants');

class GetEssentiaTab extends React.Component {
    static propTypes = {
        session: PropTypes.string.isRequired,
    };

    purchase = () => {
        var url = constants.RPC_BASE + 'pay?session_id=' + this.props.session;
        window.open(
            url,
            'essentiaPayment',
            'status=0,toolbar=0,location=0,menubar=0,resizable=1,scrollbars=1,height=550,width=600,directories=0'
        );
    };

    redeem = () => {
        var node = this.refs.code;
        EmpireRPCActions.requestEmpireRPCRedeemEssentiaCode({
            code: node.value,
        });
        node.value = '';
    };

    invite = () => {
        WindowActions.windowAdd(InviteWindow, 'invite');
    };

    render() {
        return (
            <div style={{ textAlign: 'center' }}>
                <div
                    className='ui large green labeled icon button'
                    onClick={this.purchase}
                >
                    <i className='payment icon'></i>
                    Purchase Essentia
                </div>

                <h3>OR</h3>

                <div className='ui large fluid action input'>
                    <input type='text' placeholder='Essentia code' ref='code' />
                    <button className='ui blue button' onClick={this.redeem}>
                        Redeem
                    </button>
                </div>

                <h3>OR</h3>

                <p>
                    Invite your friends to the game and you get{' '}
                    <strong>free Essentia!</strong> For every university level
                    past 4 that they achieve, you'll get 5 Essentia. That's up
                    to{' '}
                    <u>
                        <strong>130 Essentia</strong>
                    </u>{' '}
                    per friend!
                </p>

                <div
                    className='ui large green labeled icon button'
                    onClick={this.invite}
                >
                    <i className='add user icon'></i>
                    Invite a Friend
                </div>
            </div>
        );
    }
}

module.exports = GetEssentiaTab;
