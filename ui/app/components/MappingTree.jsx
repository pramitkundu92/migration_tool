import React, { Component } from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';

import Folder from '../components/Folder.jsx';

import QueryService from '../services/queryService';
import socketIOClient from "socket.io-client";

class MappingTree extends Component {

    constructor(props) {
        super(props);
        this._isMounted = false;
        this.queryService = new QueryService();
        this.state = {
            "treeData": [],
            "allSelected": false,
            "socketEndpoint": window.location.port === '7792' ? window.location.origin : `https://localhost:7792`
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.socket = socketIOClient(this.state.socketEndpoint);
        this.socket.on("statusUpdate", data=>{
            this.safeUpdateState(prevState=>{
                if(data.multiple) {
                    let mappingList = data.mappings.map(mapping=>mapping.key);
                    prevState.treeData.forEach(repo=>{
                        repo.folders.forEach(folder=>{
                            folder.mappings.forEach(mapping=>{
                                if(mappingList.indexOf(mapping.key) > -1) {
                                    mapping.status = data.status;
                                }
                            });
                        });
                    });                                            
                }
                else {
                    prevState.treeData.every(repo=>{
                        if(repo.name === data.repoName) {
                            repo.folders.every(folder=>{
                                if(folder.name === data.folderName) {
                                    folder.mappings.every(mapping=>{
                                        if(mapping.name === data.mappingName) {
                                            mapping.status = data.status;
                                            return false;
                                        }
                                        return true;
                                    })
                                    return false;
                                }
                                return true;
                            });
                            return false;
                        }
                        return true;
                    });
                }
                return prevState;
            }, ()=>{
                this.prepareAndSendTableData(this.state.treeData);
            });
        });
        this.queryService.getFolderMappings().then(data=>{
            this.safeUpdateState(prevState=>{
                prevState.treeData = data.length > 0 ? data : [];
                if(data.length > 0) {
                    prevState.allSelected = data[0].folders.every(folder=>folder.selected);
                }
                return prevState;
            }, ()=>{
                this.prepareAndSendTableData(this.state.treeData);
            });
        }, err=>{
            console.error(err);
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.socket.disconnect();
    }

    safeUpdateState(callback, postUpdateCallback) {
        this._isMounted && this.setState(callback, postUpdateCallback);
    }

    toggleExpanded(folderName) {
        let data = this.state.treeData;
        data[0].folders.every(folder=>{
            if(folder.name === folderName) {
                folder.expanded = !folder.expanded;
                return false;
            }
            return true;
        });
        this.safeUpdateState(prevState=>{
            prevState.treeData = data;
            return prevState;
        });
    }

    handleSelect(value) {
        this.state.treeData.forEach(repo=>{
            repo.folders.forEach(folder=>{
                folder.selected = value;
                folder.mappings.forEach(mapping=>{
                    mapping.selected = value;
                });
            });
        });
        this.safeUpdateState(prevState=>{
            prevState.allSelected = value;
            return prevState;
        }, ()=>{
            this.prepareAndSendTableData(this.state.treeData);
        });
    }

    handleSelectionUpdate() {
        let data = this.state.treeData;
        if(arguments.length === 3) {
            data[0].folders.every(folder=>{
                if(folder.name === arguments[0]) {
                    folder.mappings.every(mapping=>{
                        if(mapping.name === arguments[1]){
                            mapping.selected = arguments[2];
                            return false;
                        }
                        return true;
                    });
                    folder.selected = folder.mappings.every(mapping=>mapping.selected);
                    return false;
                }
                return true;
            });
        }
        else {
            data[0].folders.every(folder=>{
                if(folder.name === arguments[0]) {
                    folder.mappings.every(mapping=>{
                        mapping.selected = arguments[1];
                        return true;
                    });
                    folder.selected = arguments[1];
                    return false;
                }
                return true;
            });
        }
        this.safeUpdateState(prevState=>{
            prevState.treeData = data;
            prevState.allSelected = data[0].folders.every(folder=>folder.selected);
            return prevState;
        }, ()=>{
            this.prepareAndSendTableData(this.state.treeData);
        });
    }

    prepareAndSendTableData(data) {
        let tableData = [];
        data.forEach(repo=>{
            repo.folders.forEach(folder=>{
                folder.mappings.forEach(mapping=>{
                    tableData.push({
                        "repoName": repo.name,
                        "folderName": folder.name,
                        "mappingName": mapping.name,
                        "show": mapping.selected,
                        "key": mapping.key,
                        "status": mapping.status
                    });
                });
            });
        });
        this.props.mappingTreeUpdate(tableData);
    }

    render() {
        if(this.state.treeData.length === 0) {
            return (
                <Card className="app-card mapping-tree">
                    <CardContent>
                        <Typography component="div" className="no-repo-label">No repository connected</Typography>
                    </CardContent>
                </Card>
            );
        }
        else {
            let repo = this.state.treeData[0];
            let tree = repo.folders.map(folder=>{
                return (
                    <Folder config={folder} key={folder.name} updateSelection={this.handleSelectionUpdate.bind(this)} toggleExpanded={this.toggleExpanded.bind(this)} />
                );
            });
            let styles = {
                screenHeight: {
                    height: `${window.screen.height - 330}px`
                }
            };
            return (
                <Card className="app-card mapping-tree">
                    <CardHeader title="Repository Tree" />
                    <CardContent style={styles.screenHeight}>
                        <Grid container className="flex-grow">
                            <Grid item xs={8} sm={10} md={11} className="repo-name">Name: {repo.name}</Grid>
                            <Grid item xs={4} sm={2} md={1}>
                                <Checkbox
                                    checked={this.state.allSelected}
                                    onChange={e=>this.handleSelect(e.target.checked)}
                                    inputProps={{
                                      'aria-label': 'primary checkbox'
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Collapse in={repo.folders.length > 0} timeout="auto" unmountOnExit>
                            {tree}
                        </Collapse>
                    </CardContent>
                </Card>
            );
        }
    }

}

export default MappingTree;