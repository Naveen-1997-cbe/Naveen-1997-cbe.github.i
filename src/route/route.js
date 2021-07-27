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
                <Route path="/videoCallApp" exact component={CreateRoom} />
                <Route path="/room/:roomID" component={VideoClass} />
              </Switch>
            </Router>   
        </div>
    )
}

export default Routing;
