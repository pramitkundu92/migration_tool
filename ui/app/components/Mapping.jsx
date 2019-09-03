import React, { Component } from 'react';

import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import MappingIcon from '../assets/images/mapping.svg';

class Mapping extends Component {

    constructor(props) {
        super(props);
        this.state = props.config;
    }

    handleSelect(value) {
        this.props.updateSelection(this.state.name, value);
    }

    render() {
        return (
            <Typography component="div" className="mapping">
                <Grid container className="flex-grow">
                    <Grid item xs={8} sm={10} md={11}>
                        <img className="icon" src={MappingIcon} />
                        {this.state.name}
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
            </Typography>
        );
    }

}

export default Mapping;