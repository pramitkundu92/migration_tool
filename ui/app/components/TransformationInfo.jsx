import React, { Component } from 'react';

import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Modal from '@material-ui/core/Modal';
import IconButton from '@material-ui/core/IconButton';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

class TransformationInfo extends Component {

    constructor(props) {
        super(props);
        this.state = this.props.types || {
            'source': '',
            'target': '',
            'connection': ''
        }
    }

    handleModalClose() {
        this.props.closeModal();
    }

    handleFieldChange(event, value, field) {
        this.setState(prevState=>{
            prevState[field] = value;
            return prevState;
        });
    }

    clearForm() {
        this.setState(prevState=>{
            return {
                'source': '',
                'target': '',
                'connection': ''
            };
        });
        this.handleModalClose();
    }

    startMigration() {
        this.props.startMigration(this.state);
    }

    render() {
        return (
            <Modal className="app-modal"
                aria-labelledby="mapping-types"
                open={this.props.opened}
                onClose={this.handleModalClose.bind(this)}
            >
                <Card className="app-card transformation-info">
                    <CardHeader title="Enter Source & Target mapping types" />
                    <CardContent>
                        <Grid container className="flex-grow">
                            <Grid item xs={12}>
                                <TextField
                                    id="source"
                                    value={this.state.source}
                                    onChange={e => this.handleFieldChange(e, e.target.value, 'source')}
                                    label="Source"
                                    InputProps={{
                                        placeholder: 'Source'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="target"
                                    value={this.state.target}
                                    onChange={e => this.handleFieldChange(e, e.target.value, 'target')}
                                    label="Target"
                                    InputProps={{
                                        placeholder: 'Target'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="connection"
                                    value={this.state.connection}
                                    onChange={e => this.handleFieldChange(e, e.target.value, 'connection')}
                                    label="Connection Name"
                                    InputProps={{
                                        placeholder: 'Connection Name'
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions>
                        <IconButton className="close" title="Close" onClick={this.clearForm.bind(this)}>
                            <CloseIcon />
                        </IconButton>
                        <IconButton className="done" title="Start Migration" onClick={this.startMigration.bind(this)}>
                            <DoneIcon />
                        </IconButton>
                    </CardActions>
                </Card>
            </Modal>
        );
    }

}

export default TransformationInfo;