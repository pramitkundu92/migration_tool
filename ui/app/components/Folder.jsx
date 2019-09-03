import React, { Component } from 'react';

import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FolderIcon from '../assets/images/folder.svg';

import Mapping from '../components/Mapping.jsx';

class Folder extends Component {

    constructor(props) {
        super(props);
        this.state = props.config;
    }

    handleExpandClick() {
        this.props.toggleExpanded(this.state.name);
    }

    handleSelect(value) {
        this.props.updateSelection(this.state.name, value);
    }

    updateSelection(mapping, value) {
        this.props.updateSelection(this.state.name, mapping, value);
    }

    render() {
        let mappings = this.state.mappings.map(mapping=>{
            return (
                <Mapping config={mapping} key={mapping.name} updateSelection={this.updateSelection.bind(this)} />
            );
        });
        return (
            <Typography component="div" className="folder">
                <Grid container className="flex-grow">
                    <Grid item xs={8} sm={10} md={11} onClick={this.handleExpandClick.bind(this)}>
                        <IconButton 
                            className={this.state.expanded ? 'collapse' : 'expand'}
                            aria-expanded={this.state.expanded} >
                            <ExpandMoreIcon />
                        </IconButton>
                        <img className="icon" src={FolderIcon} />
                        <span>{this.state.name}</span>
                    </Grid>
                    <Grid item xs={4} sm={2} md={1}>
                        <Checkbox
                            checked={this.state.selected}
                            onChange={e=>this.handleSelect(e.target.checked)}
                            inputProps={{
                              'aria-label': 'primary checkbox'
                            }}
                        />
                    </Grid>
                </Grid>
                <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
                    {mappings}
                </Collapse>
            </Typography>
        );
    }

}

export default Folder;