import React, { Component } from 'react';

import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

import QueryService from '../services/queryService';

class RepositoryInfo extends Component {

    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = this.getDefaultState();
        this.queryService = new QueryService();
    }

    componentDidMount() {
        this._isMounted = true;
        this.queryService.getSavedData().then(data=>{
            this.safeUpdateState(prevState=>{
                return data;
            });
        }, err=>{
            console.error(err);
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    safeUpdateState(callback, postUpdateCallback) {
        this._isMounted && this.setState(callback, postUpdateCallback);
    }

    getDefaultState() {
        let state = {
            'repo': {},
            'database': {}
        };
        let fields = ['repoName', 'username', 'password', 'domain', 'gatewayHost', 'gatewayPort', 'clientPath'],
            dbFields = ['dbUser', 'dbPass', 'dbName', 'dbPort', 'dbService'];
        fields.forEach(field=>{
            state.repo[field] = '';
        });
        dbFields.forEach(field=>{
            state.database[field] = '';
        });
        state.database.dbPort = 1521;
        state.repo.domain = 'Native';
        return state;
    }

    clearForm() {
        this.safeUpdateState(prevState=>{
            return this.getDefaultState();
        });
    }

    saveData() {
        this.queryService.saveRepositoryInfo(this.state).then(resp=>{
            this.props.history.push('/progress');
        }, err=>{
            console.error('Error in saving Repository info');
        });        
    }

    handleFieldChange(event, newValue, field) {
        this.safeUpdateState(prevState=>{
            prevState.repo[field] = newValue;
            return prevState;
        });
    }

    handleFieldChangeDB(event, newValue, field) {
        this.safeUpdateState(prevState=>{
            prevState.database[field] = newValue;
            return prevState;
        });
    }

    render() {
        return (
            <Container maxWidth="sm" className="repo-info content">
                <Card className='app-card'>
                    <CardHeader title="Repository / Database Details" />
                    <CardContent>
                        <Typography component="label">Repository</Typography>
                        <Grid container className="flex-grow">
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="repoName"
                                    value={this.state.repo.repoName}
                                    onChange={e => this.handleFieldChange(e, e.target.value, 'repoName')}
                                    label="Repository Name"
                                    InputProps={{
                                        placeholder: 'Enter Repository Name'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="username"
                                    value={this.state.repo.username}
                                    onChange={e => this.handleFieldChange(e, e.target.value, 'username')}
                                    label="Username"
                                    InputProps={{
                                        placeholder: 'User Name'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="password"
                                    value={this.state.repo.password}
                                    onChange={e => this.handleFieldChange(e, e.target.value, 'password')}
                                    label="Password"
                                    type="password"
                                    InputProps={{
                                        placeholder: 'Password'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="domain"
                                    value={this.state.repo.domain}
                                    onChange={e => this.handleFieldChange(e, e.target.value, 'domain')}
                                    label="Security Domain"
                                    InputProps={{
                                        placeholder: 'Enter Security Domain'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="gatewayHost"
                                    value={this.state.repo.gatewayHost}
                                    onChange={e => this.handleFieldChange(e, e.target.value, 'gatewayHost')}
                                    label="Gateway Host"
                                    InputProps={{
                                        placeholder: 'Enter Gateway Host'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="gatewayPort"
                                    value={this.state.repo.gatewayPort}
                                    onChange={e => this.handleFieldChange(e, e.target.value, 'gatewayPort')}
                                    label="Gateway Port"
                                    InputProps={{
                                        placeholder: 'Enter Gateway Port'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="clientPath"
                                    value={this.state.repo.clientPath}
                                    onChange={e => this.handleFieldChange(e, e.target.value, 'clientPath')}
                                    label="PC Client Install Path"
                                    InputProps={{
                                        placeholder: 'Enter PC Client Install Path'
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <br/>
                        <br/>
                        <Typography component="label">Database</Typography>
                        <Grid container className="flex-grow">
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="dbName"
                                    value={this.state.database.dbName}
                                    onChange={e => this.handleFieldChangeDB(e, e.target.value, 'dbName')}
                                    label="DB Name"
                                    InputProps={{
                                        placeholder: 'DB Name'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="dbUser"
                                    value={this.state.database.dbUser}
                                    onChange={e => this.handleFieldChangeDB(e, e.target.value, 'dbUser')}
                                    label="DB User"
                                    InputProps={{
                                        placeholder: 'DB User'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="dbPass"
                                    value={this.state.database.dbPass}
                                    onChange={e => this.handleFieldChangeDB(e, e.target.value, 'dbPass')}
                                    label="DB Password"
                                    type="password"
                                    InputProps={{
                                        placeholder: 'DB Password'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="dbPort"
                                    value={this.state.database.dbPort}
                                    onChange={e => this.handleFieldChangeDB(e, e.target.value, 'dbPort')}
                                    label="DB Port"
                                    InputProps={{
                                        placeholder: 'DB Port'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="dbService"
                                    value={this.state.database.dbService}
                                    onChange={e => this.handleFieldChangeDB(e, e.target.value, 'dbService')}
                                    label="DB Service"
                                    InputProps={{
                                        placeholder: 'DB Service'
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions>
                        <IconButton className="close" title="Clear Form" onClick={this.clearForm.bind(this)}>
                            <CloseIcon />
                        </IconButton>
                        <IconButton className="done" title="Save Repository Information" onClick={this.saveData.bind(this)}>
                            <DoneIcon />
                        </IconButton>
                    </CardActions>
                </Card>
            </Container>
        );
    }

}

export default RepositoryInfo;