'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var Reflux = require('reflux');

var NotesWindowActions = require('/app/js/actions/windows/notes');
var BodyRPCActions = require('/app/js/actions/rpc/body');

var NotesWindowStore = require('/app/js/stores/windows/notes');
var NotesBodyRPCStore = require('/app/js/stores/rpc/body/notes');

var Panel = require('/app/js/components/window/panel');

var NotesWindow = createReactClass({
    displayName: 'NotesWindow',

    mixins: [
        Reflux.connect(NotesWindowStore, 'notesWindowShow'),
        Reflux.connect(NotesBodyRPCStore, 'notes'),
    ],

    handleClose: function() {
        // TODO We need to get the body ID from the NotesWindowStore
        BodyRPCActions.requestBodyRPCSetColonyNotes({
            bodyId: 1,
            notes: this.state.notes,
        });
        NotesWindowActions.notesHide();
    },

    handleChange: function(e) {
        NotesWindowActions.notesSet(e.target.value);
    },

    render: function() {
        return (
            <Panel
                show={this.state.notesWindowShow}
                onClose={this.handleClose}
                title='Notes'
            >
                <div className='ui attached info message'>
                    <i className='info icon'></i>
                    Closing this window will save your notes.
                </div>
                <form className='ui form'>
                    <div className='field'>
                        <textarea
                            value={this.state.notes}
                            onChange={this.handleChange}
                            style={{
                                height: '450px',
                            }}
                        ></textarea>
                    </div>
                </form>
            </Panel>
        );
    },
});

module.exports = NotesWindow;
