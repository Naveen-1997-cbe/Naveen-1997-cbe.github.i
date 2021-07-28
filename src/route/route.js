import React from 'react'
import { v1 as uuid } from "uuid";
import {BrowserRouter as Router,Route,Switch} from "react-router-dom";
import VideoClass from '../videoClass/videoClass';
import CreateRoom from '../videoClass/createRoom';
function Routing() {
    const roomId = uuid();
    return (
        <div>
            <Router>
              <Switch>
                <Route exact path="/" component={VideoClass} />
                <Route exact path="/feedback"  component={CreateRoom} />
              </Switch>
            </Router>   
        </div>
    )
}

export default Routing;
