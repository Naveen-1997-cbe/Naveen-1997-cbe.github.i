import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./video.css";
import { Button, Form, Modal } from "react-bootstrap";
import chatBtn from "../assets/chat-btn.svg";
import cameraOn from "../assets/camera-on.svg";
import cameraOff from "../assets/camera-off.svg";
import micOn from "../assets/mic-on.svg";
import micOff from "../assets/mic-off.svg";
import call from "../assets/call.svg";
import record from "../assets/record.svg";
import screenShare from "../assets/screen-share.svg";
import hand from "../assets/hand.svg";
import attach from "../assets/attach.svg";
import send from "../assets/send.svg";
import volume from "../assets/volume.svg";
import { useHistory } from "react-router";
// import streamSaver from "streamsaver";
import Downloadjs from "downloadjs";

//  const socket = io.connect('https://bro-video-call.herokuapp.com/');
const socket = io.connect("http://localhost:5000");

const App = (props) => {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [remoteUserStream, setRemoteUserStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerName, setCallerName] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callerNameone, setCallerNameone] = useState("");
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [muteName, setMuteName] = useState("");
  const [notMuted, setNotMuted] = useState(false);
  const [renderer, setRender] = useState(false);
  const [renderId, setRenderId] = useState([]);
  const [name, setName] = useState("");
  const [chat, setChat] = useState([]);
  const [sendBool, setSendBool] = useState(false);
  const [state, setState] = useState({ message: "", name: "" });
  const [muteBool, setMuteBool] = useState(false);
  const [videoBool, setvideoBool] = useState(false);
  const [share, setshare] = useState();
  const [peerConn, setPeerConn] = useState();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [connectionEstablished, setConnection] = useState(true);
  const [file, setFile] = useState();
  const [gotFile, setGotFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const demoRef = useRef();
  const RoomID = props.match.params.roomID;
  const history = useHistory();
  const shareRef = useRef();

  const fileNameRef = useRef("");

  useEffect(() => {
	  let myStream = stream
	  let remoteStream = remoteUserStream
    setShow(true);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      console.log("socketid", id);
      setMe(id);
    });

    socket.emit("join-room", RoomID);

    socket.on("USer Connected", (msg) => {
      console.log("connected ", msg);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
      demoRef.current = data.signal;
    });

    socket.on("mutePerson", (payload) => {
      setMuteName(payload.name);
      setNotMuted(payload.access);
      console.log("return for frontend mute useeffect", payload);
    });

    socket.on("unmutePerson", (payload) => {
      setMuteName(payload.name);
      setNotMuted(payload.access);
      console.log("return for frontend umute useeffect", payload);
    });

    socket.on("take id to call", (id) => {
      setRenderId((oldArray) => [...oldArray, id]);
      setRender(true);

      console.log("returned to front-end", id);
    });

    socket.on("screenshare", (screen) => {
      console.log("screenshare", screen);
    });
    socket.on("message", ({ name, message }) => {
      setChat([...chat, { name, message }]);
    });
    socket.on("endCallRoute", (value) => {
      console.log("value", value);
      if (value) {
        history.push("/");
      }
    });

    socket.on("fileName", (fileName) => {
      console.log("fileName", fileName);
      setFileName(fileName);
    });

	socket.on("endCall", (data) => {
		console.log("endCall", data);
		console.log("mystream", myStream);
		console.log("remoteStream", remoteStream);
		if (data) {
		 stream.getTracks().forEach(function(track) {
			track.stop();
		  });
		  remoteUserStream.getTracks().forEach(function(track) {
			track.stop();
		  });
		  connectionRef.current.destroy();
  
		  history.push('/');
		}
	  });
  }, []);

  useEffect(() => {
    socket.on("message", ({ name, message }) => {
      setChat([...chat, { name, message }]);
    });
  }, [chat]);

  const onTextChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const onMessageSubmit = (e) => {
    // e.preventDefault()
    const { name, message } = state;
    socket.emit("message", { name, message });

    setState({ message: "", name });
    socket.on("message", ({ name, message }) => {
      setChat([...chat, { name, message }]);
    });
  };

  const renderChat = () => {
    return chat.map(({ name, message }, index) => (
      <div key={index}>
        <h6>
          {name}: <span className="chat-bg">{message}</span>
        </h6>
      </div>
    ));
  };

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: state.name,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
      setRemoteUserStream(stream);
    });

    socket.on("callAccepted", (data) => {
      setCallAccepted(true);
      peer.signal(data.signal);
      setCallerName(data.from);
    });

    connectionRef.current = peer;
    setGotFile(true);
    setPeerConn(connectionRef.current._pc.getSenders());
    console.log("Callername", callerName);
    socket.emit("otherUserName", name);
    socket.on("otherUserName", (othersName) => {
      setCallerNameone(othersName);
    });
    setShow(false);
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller, from: state.name });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
      setRemoteUserStream(stream);
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
    // peer.on("data", handleReceivingData);
    setGotFile(true);
    setPeerConn(connectionRef.current._pc.getSenders());
    setShow(false);
  };

  // function handleReceivingData(data) {
  //     if (data.toString().includes("done")) {
  //         setGotFile(true);
  //         const parsed = JSON.parse(data);
  //         fileNameRef.current = parsed.fileName;
  //     } else {
  //         worker.postMessage(data);
  //     }
  // }

  function download() {
    // setGotFile(false);
    // worker.postMessage("download");
    // worker.addEventListener("message", event => {
    //     const streams = event.data.stream();
    //     const fileStream = streamSaver.createWriteStream(fileNameRef.current);
    //     streams.pipeTo(fileStream);
    // })

    let peer = connectionRef.current;
    // peer.on('data',data=>{
    // 	const file = new Blob([data])
    // 	Downloadjs(file, 'test.png');
    // })
    const fileChunks = [];
    peer.on("data", (data) => {
      if (data.toString() === "Done!") {
        // Once, all the chunks are received, combine them to form a Blob
        const file = new Blob(fileChunks);

        console.log("Received", file);
        // Download the received file using downloadjs
        Downloadjs(file, fileName);
      } else {
        // Keep appending various file chunks
        fileChunks.push(data);
      }
    });

    peer.send("");

    console.log(fileName);
    setFile("");
    setFileName("");
    socket.emit("fileName", "");
  }
  useEffect(() => {
    console.log("support fileName");
  }, [fileName]);

  function selectFile(e) {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
    socket.emit("fileName", e.target.files[0].name);
  }

  function sendFile() {
    shareRef.current.value = null;
    console.log(shareRef.current);
    const peer = connectionRef.current;
    file.arrayBuffer().then((buffer) => {
      // peer.send(buffer)

      const chunkSize = 16 * 1024;
      while (buffer.byteLength) {
        const chunk = buffer.slice(0, chunkSize);
        buffer = buffer.slice(chunkSize, buffer.byteLength);

        // Off goes the chunk!

        peer.send(chunk);
      }
      peer.send("Done!");
    });
    // const stream = file.stream();
    // const reader = stream.getReader();

    // reader.read().then(obj => {
    //     handlereading(obj.done, obj.value);
    // });

    // function handlereading(done, value) {
    //     if (done) {
    //         peer.write(JSON.stringify({ done: true, fileName: file.name }));
    //         return;
    //     }

    //     peer.write(value);
    //     reader.read().then(obj => {
    //         handlereading(obj.done, obj.value);
    //     })
    // }
    setFile("");
    setFileName("");
  }

  //mute toggle function
  const playVideo = (stream) => {
    myVideo.current.srcObject = new MediaStream(stream);
  };

  const muteCall = async () => {
    setSendBool(true);
    setMuteBool(true);
    let newStream = stream.getTracks();
    newStream.forEach((track) => {
      if (track.kind === "audio") {
        track.enabled = false;
      }
    });
    playVideo(newStream);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    socket.emit("mutePerson", state.name);
    try {
      await socket.on("mutePerson", (payload) => {
        setMuteName(payload.name);
        setNotMuted(payload.access);
        console.log("return for frontend mute useeffect", payload);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const unMute = async () => {
    socket.emit("unmutePerson", { name: state.name });
    try {
      await socket.on("unmutePerson", (payload) => {
        setMuteName(payload.name);
        setNotMuted(payload.access);
        console.log("return for frontend umute useeffect", payload);
      });
    } catch (err) {
      console.log(err);
    }
    setMuteBool(false);
    let newStream = stream.getTracks();
    newStream.forEach((track) => {
      if (track.kind === "audio") {
        track.enabled = true;
      }
    });
    console.log("my unmute is hitted");
    playVideo(newStream);
  };

  const showVideo = () => {
    setvideoBool(false);
    let newStream = stream.getTracks();
    newStream.forEach((track) => {
      if (track.kind === "video") {
        track.enabled = true;
      }
    });
    playVideo(newStream);
  };

  const hideVideo = () => {
    setvideoBool(true);
    let newStream = stream.getTracks();
    newStream.forEach((track) => {
      if (track.kind === "video") {
        track.enabled = false;
      }
    });
    playVideo(newStream);
  };

  const leaveCall = () => {
    setCallEnded(true);
    // connectionRef.current.destroy()
    console.log("mystream", stream.getTracks());
    console.log("remoteStream", remoteUserStream.getTracks());
    // socket.emit("endCall", true);
    socket.emit('endCallRoute', true);
    socket.on('endCallRoute', (value) => {
    	console.log('value', value)
    	if (value) {
    		history.push('/');
    	}
    })
  };
  const handleKeypress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onMessageSubmit();
    }
  };

  useEffect(() => {
    console.log("supprotinmg");
  }, [share]);

  const shareScreen = () => {
    navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((display) => {
      let videoTrack = display.getVideoTracks()[0];
      videoTrack.onended = function () {
        stopScreenShare();
      };
      let sender = peerConn.find(function (s) {
        return s.track.kind == videoTrack.kind;
      });
      sender.replaceTrack(videoTrack);
    });
  };
  const stopScreenShare = () => {
    let videoTrack = stream.getVideoTracks()[0];
    var sender = peerConn.find(function (s) {
      return s.track.kind == videoTrack.kind;
    });
    sender.replaceTrack(videoTrack);
  };

  return (
    <div className="container-fluid bg-yellow">
      <div className="row position-relative">
        {/* videoooooooo part */}
        <div className="col-md-6 col-lg-7 user-video ml-5 mt-4 p-0">
          {callAccepted && !callEnded ? (
            <div>
              {callerName || callerNameone ? (
                <p className="userName user2 d-flex">
                  <div className="pink-dot "></div>
                  {callerName}
                </p>
              ) : (
                <p className="userName">{callerNameone}</p>
              )}
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "100%", objectFit: "cover" }}
              />
            </div>
          ) : null}
          <div className="user-mute">
            {notMuted ? (
              <Button className="mute mute2" size="md" variant="secondary">
                <img
                  src={micOff}
                  alt="chat-btn"
                  width="15px"
                  height="15px"
                ></img>
              </Button>
            ) : (
              <Button className="mute" size="md" variant="secondary">
                <img
                  src={micOn}
                  alt="chat-btn"
                  width="15px"
                  height="15px"
                ></img>
              </Button>
            )}
          </div>
        </div>

        <div className="col-md-6 col-lg-4 offset-1 my-video mt-4 ml-4 p-0">
          <p className="userName d-flex">
            {" "}
            <div className="pink-dot "></div> {state.name}
          </p>
          {stream && (
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              style={{ width: "100%", objectFit: "cover" }}
            />
          )}
        </div>

        {/* control buttons */}
        <div className="col-md-6 col-lg-7 ml-5 mt-4 bg-button">
          <div className="space d-flex">
            <div>
              <Button className="bg-btn mr-4" variant="secondary" size="md">
                <img
                  src={chatBtn}
                  alt="chat-btn"
                  width="20px"
                  height="20px"
                ></img>
              </Button>
              <span className="sub-name ml-2">Chatting</span>
            </div>

            <div>
              {videoBool ? (
                <div>
                  <Button
                    onClick={showVideo}
                    className="bg-gray active-pink mr-4"
                    size="md"
                    variant="secondary"
                  >
                    <img
                      src={cameraOff}
                      alt="chat-btn"
                      width="20px"
                      height="20px"
                    ></img>
                  </Button>
                  <span className="sub-name">Camera On</span>
                </div>
              ) : (
                <div>
                  <Button
                    onClick={hideVideo}
                    className="bg-gray  mr-4"
                    size="md"
                    variant="secondary"
                  >
                    <img
                      src={cameraOn}
                      alt="chat-btn"
                      width="20px"
                      height="20px"
                    ></img>
                  </Button>
                  <span className="sub-name">Camera Off</span>
                </div>
              )}
            </div>

            <div>
              {muteBool ? (
                <div>
                  <Button
                    onClick={unMute}
                    className="bg-gray active-pink mr-4 "
                    size="md"
                    variant="secondary"
                  >
                    <img
                      src={micOff}
                      alt="chat-btn"
                      width="20px"
                      height="20px"
                    ></img>
                  </Button>
                  <span className="sub-name ml-2">Unmute</span>{" "}
                </div>
              ) : (
                <div>
                  <Button
                    onClick={muteCall}
                    className="bg-gray mr-4 "
                    size="md"
                    variant="secondary"
                  >
                    <img
                      src={micOn}
                      alt="chat-btn"
                      width="20px"
                      height="20px"
                    ></img>
                  </Button>
                  <span className="sub-name ml-3">Mute</span>
                </div>
              )}
            </div>

            <div>
              {callAccepted && !callEnded ? (
                <div>
                  <Button
                    className="call mr-4 "
                    size="md"
                    variant="secondary"
                    onClick={leaveCall}
                  >
                    {" "}
                    End Call
                    <img
                      className="ml-2"
                      src={call}
                      alt="chat-btn"
                      width="26px"
                      height="26px"
                    ></img>
                  </Button>
                </div>
              ) : (
                <div>
                  <Button
                    className="call mr-4 "
                    size="md"
                    variant="secondary"
                    onClick={() => callUser(idToCall)}
                  >
                    {" "}
                    Call
                    <img
                      className="ml-2"
                      src={call}
                      alt="chat-btn"
                      width="26px"
                      height="26px"
                    ></img>
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Button className="bg-gray mr-4" size="md" variant="secondary">
                <img
                  src={record}
                  alt="chat-btn"
                  width="20px"
                  height="20px"
                ></img>
              </Button>
              <span className="sub-name ml-3">Record</span>
            </div>

            <div>
              <Button
                className="bg-gray mr-4"
                size="md"
                variant="secondary"
                onClick={shareScreen}
              >
                <img
                  src={screenShare}
                  alt="chat-btn"
                  width="20px"
                  height="20px"
                ></img>
              </Button>
              <span className="sub-name">Share screen</span>
            </div>

            <div>
              <Button className="bg-gray " size="md" variant="secondary">
                <img
                  src={volume}
                  alt="chat-btn"
                  width="20px"
                  height="20px"
                ></img>
              </Button>
              <span className="sub-name ml-2">Volume</span>
            </div>

            {/* <Button className="bg-btn" size="sm" variant="secondary"><img src={cameraOff} alt="chat-btn" width="20px" height="20px"></img></Button>{' '} */}

            {/* <Button className="bg-btn" size="sm" variant="secondary"><img src={micOff} alt="chat-btn" width="20px" height="20px"></img></Button>{' '} */}
          </div>
        </div>

        {/* chat Box */}
        <div className="col-md-6 col-lg-4 mt-4 ml-4 bg-chat">
          <div>
            <p className="chat-name m-1">Chat Room</p>
            <hr className="hr" />

            <div className="render-chat">{renderChat()}</div>
            <div className="d-flex">
              {/* attach button */}
              <div className="">
                <Button className="attach mr-3 " size="md" variant="secondary">
                  <img
                    className="pb-1"
                    src={attach}
                    alt="attach"
                    width="20px"
                    height="20px"
                  ></img>
                </Button>
              </div>

              {/* text message */}
              <div className="">
                <input
                  className="form-control send"
                  name="message"
                  onChange={(e) => onTextChange(e)}
                  value={state.message}
                  onKeyPress={handleKeypress}
                  placeholder="Write your message..."
                />
              </div>

              {/* send button */}
              <div>
                <Button
                  onClick={onMessageSubmit}
                  className="attach ml-3"
                  size="md"
                  variant="secondary"
                >
                  <img
                    className="pl-1 pb-1"
                    src={send}
                    alt="send"
                    width="20px"
                    height="20px"
                  ></img>
                </Button>
              </div>
            </div>
            {/* {connectionEstablished ? <div>
							<input onChange={selectFile}  ref={shareRef} type="file" />
                			<button onClick={sendFile}>Send file</button>
						</div> : 
							<h1>Once you have a peer connection, you will be able to share files</h1>
						}
						{
							gotFile ?
							<div>
								<span className='download-btn'>You have received a file. Would you like to download the file?</span>
                				<button onClick={()=>download()}>Yes</button>
							</div>
							:
							null
						} */}
          </div>
        </div>
      </div>

      {/* <Form.Control label="Name"
				value={state.name}
				// onChange={(e) => setName(e.target.value)}
                 onChange={(e) => onTextChange(e)}
                 name="name"
				placeholder="Enter Name" />

			<CopyToClipboard text={me} >
				<Button>Copy ID</Button>
			</CopyToClipboard>

			<Form.Control label="ID to call"
				value={idToCall}
				onChange={(e) => setIdToCall(e.target.value)}
				placeholder="ID to call" />

			<div>
				{receivingCall && !callAccepted ? (
					<div>
						<h1>{callerName} is calling you!</h1>
						<Button color="primary" onClick={answerCall}>
							Answer
						</Button>
					</div>
				) : null}
			</div> */}

      {/* <Button variant="primary" onClick={handleShow}>
				open join meeting
			</Button> */}

      <div>
        <Modal
          className=" bg-light"
          show={show}
          backdrop="static"
          onHide={handleClose}
        >
          <div className="join-meeting">
            <Modal.Header className="header">
              <Modal.Title className="join-tag">Join Meeting</Modal.Title>
            </Modal.Header>
            <Modal.Body className="join-body">
              <Form.Control
                className="mb-3"
                size="sm"
                type="text"
                label="Name"
                name="name"
                value={state.name}
                // onChange={(e) => setName(e.target.value)}
                onChange={(e) => onTextChange(e)}
                placeholder="Your Name"
              />

              <Form.Control
                className="mb-3"
                size="sm"
                type="text"
                label="ID to call"
                value={idToCall}
                onChange={(e) => setIdToCall(e.target.value)}
                placeholder="Enter meeting ID to join"
              />

              <CopyToClipboard text={me}>
                <Button
                  className="ID-btn cancle-btn d-block mb-5"
                  variant="secondary"
                >
                  Copy Meeting ID
                </Button>
              </CopyToClipboard>

              <Button
                className="join-btn d-block mb-2"
                variant="secondary"
                onClick={() => callUser(idToCall)}
              >
                Join
              </Button>
              <Button
                className="cancle-btn mb-4"
                variant="secondary"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </Modal.Body>
          </div>
          <div>
            {receivingCall && !callAccepted ? (
              <div className="mt-3 ml-3 d-flex">
                <h3>{callerName} is calling you...!</h3>
                <Button
                  className="ml-1"
                  size="sm"
                  variant="danger"
                  onClick={answerCall}
                >
                  Answer
                </Button>
              </div>
            ) : null}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default App;
