import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch } from "react-router-dom";

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import MigrationView from './components/MigrationView.jsx';
import RepositoryInfo from './components/RepositoryInfo.jsx';

import InfaLogo from './assets/images/informatica_logo.svg';

class Application extends Component {

    constructor(props) {
        super(props);
    }

    goToHome() {
        window.location.hash = '#/repo';
    }

    render(){
        return (
            <Container className="main-container">
                <AppBar position="fixed">
                    <Toolbar variant="dense">
                        <img className="infa-logo" src={InfaLogo} onClick={this.goToHome.bind(this)} />
                        <span className="brand">Mapping Migration Tool</span>
                    </Toolbar>
                </AppBar>
                <Router>
                    <Switch>
                        <Route exact path="/" component={RepositoryInfo} />
                        <Route path="/progress" component={MigrationView} />
                        <Route path="/repo" component={RepositoryInfo} />
                    </Switch>
                </Router>
            </Container>
        );
    }

}

export default Application;