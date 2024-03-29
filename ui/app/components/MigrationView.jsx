import React, { Component } from 'react';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import QueryService from '../services/queryService';
import MappingTree from '../components/MappingTree.jsx';
import ProgressTable from '../components/ProgressTable.jsx';

class MigrationView extends Component {

    constructor(props) {
        super(props);
        this._isMounted = false;
        this.queryService = new QueryService();
        this.state = {
            "tableData": [],
            "types": {},
            "disableStartBtn": false
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.queryService.getMappingTypes().then(({types})=>{
            this.safeUpdateState(prevState=>{
                prevState.types = types;
                return prevState;
            });
        }, err=>{
            console.error(err);
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    safeUpdateState(callback) {
        this._isMounted && this.setState(callback);
    }

    mappingTreeUpdate(data) {
        this.safeUpdateState(prevState=>{
            prevState.tableData = data;
            return prevState;
        });
    }

    startMigration(data) {
        this.queryService.startMigration(data).then(resp=>{
            this.safeUpdateState(prevState=>{
                prevState.disableStartBtn = true;
                if(data.length > 0) {
                    prevState.types = {
                        'source': data[0].source,
                        'target': data[0].target,
                        'connection': data[0].connection
                    };
                }
                return prevState;
            });
        }, err=>{
            console.error(err);
        });
    }

    render(){
        return (
            <Container className="content">
                <Grid container className="flex-grow">
                    <Grid item xs={12} sm={4} md={3}>
                        <MappingTree mappingTreeUpdate={this.mappingTreeUpdate.bind(this)} />
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                        <ProgressTable data={this.state.tableData} disableStartBtn={this.state.disableStartBtn} startMigration={this.startMigration.bind(this)} types={this.state.types} />
                    </Grid>
                </Grid>
            </Container>
        );
    }

}

export default MigrationView;