import axios from 'axios';
import React, { Component } from 'react';
import { Table } from 'reactstrap'
import openSocket from 'socket.io-client'

const socket = openSocket('http://localhost:4400')

const URL = 'http://geoplugin.net/json.gp'

class LiveVisitors extends Component {
    state = {
        visitors: [

        ]
    }

    componentWillMount(){
        axios.get(URL).then( res => {
            const {
                geoplugin_request,
                geoplugin_countryCode,
                geoplugin_city,
                geoplugin_region,
                geoplugin_countryName,
            } = res.data;

            const visitor = {
                ip:  geoplugin_request,
                countryCode: geoplugin_countryCode,
                city: geoplugin_city,
                state:  geoplugin_region,
                country:  geoplugin_countryName
            }

            socket.emit('new_visitor', visitor)

            socket.on('visitors', visitors => {
                this.setState({
                    visitors: [visitor]
                })
            })

            this.setState({
                visitors: [visitor]
            })
        })
    }

    renderTableBody = () => {
        const { visitors } = this.state;
        return visitors.map((v, index) => {
            return (
                <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{v.ip}</td>
                    <td>{v.city}</td>
                    <td>{v.state}</td>
                    <td>{v.country}</td>
                </tr>
            )
        })
    }

    render() {
        return (
            <React.Fragment>
                <h2>Live Visitors</h2>
                <Table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>IP</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Country</th>
                        </tr>
                    </thead>
                </Table>
            </React.Fragment>
        )
    }
}

export default LiveVisitors;