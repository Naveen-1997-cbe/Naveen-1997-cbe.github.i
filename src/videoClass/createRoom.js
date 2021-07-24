import React from "react";
import { v1 as uuid } from "uuid";
import { Button } from "react-bootstrap";

const CreateRoom = (props) => {
    function create() {
        const id = uuid();
        props.history.push(`/room/${id}`);
    }

    return (
        <div className="text-center mt-5">
            <h3>Click below button to join class</h3>
            <Button variant="danger" onClick={create}>Join Class Room</Button>
        </div>
    );
}

export default CreateRoom;