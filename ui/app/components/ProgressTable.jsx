import React, { Component } from 'react';

import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import WarningIcon from '@material-ui/icons/Warning';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

import TransformationInfo from './TransformationInfo.jsx';

import LoadingIcon from '../assets/images/loading.gif';

class ProgressTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            'migrationData': [],
            'types': {},
            'modalOpened': false,
            'fields': [{"label":"Repository","field":"repoName"},{"label":"Folder","field":"folderName"},{"label":"Mapping","field":"mappingName"}]
        }
    }

    startMigration(data) {
        this.setState(prevState=>{
            prevState.migrationData = data;
            prevState.modalOpened = true;
            return prevState;
        });
    }

    closeModal() {
        this.setState(prevState=>{
            prevState.modalOpened = false;
            return prevState;
        });
    }

    triggerMigration(types) {
        this.setState(prevState=>{
            prevState.types = types;
            prevState.fields = [{"label":"Repository","field":"repoName"},{"label":"Folder","field":"folderName"},{"label":"Mapping","field":"mappingName"},{"label":"Source","field":"source"},{"label":"Target","field":"target"},{"label":"Connection Name","field":"connection"}];
            prevState.migrationData.forEach(row=>{
                row.source = types.source;
                row.target = types.target;
                row.connection = types.connection;
            });
            return prevState;
        }, ()=>{
            this.closeModal();
            this.props.startMigration(this.state.migrationData.filter(d=>d.status === 0 || d.status === 3));
        });
    }

    createRowData(row, i) {
        return this.state.fields.map(field=>{
            if(['source', 'target', 'connection'].indexOf(field.field) > -1) {
                return (<TableCell key={i + '_' + field.field} className={field.field}>{this.state.types[field.field]}</TableCell>);
            }
            else {
                return (<TableCell key={i + '_' + field.field} className={field.field}>{row[field.field]}</TableCell>);
            }
        });
    }

    render() {
        let data = this.props.data.filter(row=>row.show), stats = [0,0,0,0];
        let styles = {
            screenHeight: {
                height: `${window.screen.height - 330}px`
            }
        };
        if(data.length === 0) {
            return (
                <Card className="app-card progress-table">
                    <CardContent>
                        <Typography component="div" className="no-repo-label">No Mapping selected</Typography>
                    </CardContent>
                </Card>
            );
        }
        else {
            data.forEach(row=>{
                stats[row.status]++;
            });
            let disableStartBtn = this.props.disableStartBtn && ((stats[2] + stats[3]) !== data.length),
                headers = this.state.fields.map(field=>(<TableCell key={field.label} className={field.field}>{field.label}</TableCell>));
            return (
                <div>
                    <Card className="app-card progress-table">
                        <CardHeader title={`Migration Progress (Selected ${data.length} of ${this.props.data.length} Mappings)`} />
                        <CardContent style={styles.screenHeight}>
                            <Grid container className="flex-grow">
                                <Grid item xs={8} sm={5}>
                                    <Grid container className="flex-grow stat-labels">
                                        <Grid item xs={3}>
                                            <span>Not Started</span>
                                        </Grid>
                                        <Grid item xs={3} className="in-progress">
                                            <span>In Progress</span>
                                        </Grid>
                                        <Grid item xs={3} className="completed">
                                            <span>Completed</span>
                                        </Grid>
                                        <Grid item xs={3} className="failed">
                                            <span>Failed</span>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={4} sm={7}></Grid>
                            </Grid>
                            <Grid container className="flex-grow">
                                <Grid item xs={8} sm={5}>
                                    <Grid container className="flex-grow overall-stats">
                                        <Grid item xs={3}>
                                            <span title="Not Started">{stats[0]}</span>
                                        </Grid>
                                        <Grid item xs={3} className="in-progress">
                                            <span title="In Progress">{stats[1]}</span>
                                        </Grid>
                                        <Grid item xs={3} className="completed">
                                            <span title="Completed">{stats[2]}</span>
                                        </Grid>
                                        <Grid item xs={3} className="failed">
                                            <span title="Failed">{stats[3]}</span>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={4} sm={7} className="actions">
                                    {disableStartBtn ? 
                                        <Fab color="primary" aria-label="start" title="Start Migration" disabled>
                                            Start
                                        </Fab>
                                        :
                                        <Fab color="primary" aria-label="start" title="Start Migration" onClick={this.startMigration.bind(this, data)}>
                                            Start
                                        </Fab>
                                    }
                                </Grid>
                            </Grid>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {headers}
                                        <TableCell key="Status">Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((row,i)=>(
                                    <TableRow key={row.key}>
                                        {this.createRowData.call(this, row, i)}
                                        <TableCell key={i + '_' + status}>
                                            {row.status === 0 ? <WarningIcon className="warning" title="Not Started" /> : row.status === 1 ? <img className="icon" src={LoadingIcon} title="In Progress" /> : row.status === 2 ? <DoneIcon className="success" title="Completed" /> : <CloseIcon className="failed" title="Failed" />}
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <TransformationInfo opened={this.state.modalOpened} closeModal={this.closeModal.bind(this)} startMigration={this.triggerMigration.bind(this)} types={this.props.types} />
                </div>
            );
        }
    }

}

export default ProgressTable;