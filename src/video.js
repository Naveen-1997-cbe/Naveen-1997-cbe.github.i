import React, { useEffect, useRef, useState } from "react";
import './App.css';
import { Button } from 'react-bootstrap';

const App = () => {
  const [stream,setStream] = useState();
  const myVideo = useRef();

  const playVideo=(stream)=>{
    myVideo.current.srcObject =  new MediaStream(stream);
    }

  useEffect(() => {
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((currentStream) => {
    console.log('stream',currentStream);
      setStream(currentStream);
      myVideo.current.srcObject = currentStream;
    });
  }, [])


  //step 6
  const audioBtnPlay = () =>{
    let newStream = stream.getTracks();
            newStream.forEach(track => {
                if(track.kind === 'audio') {
                    track.enabled = true;
                }
            })
            playVideo(newStream);
  };

  //step 7
  const videoBtnPlay = () => {
    let newStream = stream.getTracks();
    newStream.forEach(track => {
      if(track.kind === 'video') { // logic to find video tracks
          track.enabled = true; // enableing video tracks.
      }
      })
      playVideo(newStream);
  };

  // step 8
  const audioBtnStop = () => {
    let newStream = stream.getTracks();
            newStream.forEach(track => {
                if(track.kind === 'audio') {
                    track.enabled = false;
                }
            })
            playVideo(newStream);
  };


  //step 9
  const videoBtnStop = () => {
    let newStream = stream.getTracks();
            newStream.forEach(track => {
                if(track.kind === 'video') {
                    track.enabled = false;
                }
            })
            playVideo(newStream);
  };


  return (
    <div className="text-center">
      <h1>Good Day Classes</h1>
      <div className="mb-5"> 
        <Button onClick={videoBtnPlay} variant="info" size="sm">Play Video</Button>{' '}
        <Button onClick={audioBtnPlay} variant="info" size="sm">Play Audio</Button>{' '}
        <Button onClick={videoBtnStop}variant="info" size="sm">Stop Video</Button>{' '}
        <Button onClick={audioBtnStop} variant="info" size="sm">Stop Audio</Button>{' '}
      </div>

      <div id="room">
         <video playsInline autoPlay ref={myVideo} width="720px" height="360px" />
      </div>
      
    </div>
  )
}

export default App;