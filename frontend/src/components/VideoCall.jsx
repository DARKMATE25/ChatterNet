import React from 'react'
import './VideoCall.css'
import CallAnnimation from './CallAnimations';
import ReactPlayer from 'react-player'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
} from "@chakra-ui/react";
function VideoCall({ myStream, setMyStream, sendStreams, remoteStream, setRemoteStream }) {
  const { onClose } = useDisclosure();
  const handleStopCamera = () => {
    if (myStream) {
      myStream.getTracks().forEach(track => {
        track.stop();
      });
      setMyStream(null); // assuming setMyStream is a state updater function
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => {
        track.stop();
      });
      setRemoteStream(null); // assuming setMyStream is a state updater function
    }

  }
  return (
    <>
      <Modal size="medium" onClose={onClose} isOpen={true} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Video Call - ChatterNet
          </ModalHeader>
          <ModalBody className='modalbody' style={{ width: "100%", height: "600px", border: "2px solid red" }}>
            <div className='callComp' style={{ display: "flex", justifyContent: "space-evenly"  }}>
              {
                myStream ? <><ReactPlayer
                  url={myStream}
                  muted
                  playing
                  width="100%"
                  height="auto"
                />
                </> : 
                  <CallAnnimation />
              }
              {
                remoteStream ? <><ReactPlayer
                  url={remoteStream}
                  muted
                  playing
                  width="100%"
                  height='auto'
                /></> : <>
                   <CallAnnimation />
                </>
              }

            </div>
          </ModalBody>
          <ModalFooter style={{ margin: "auto", width: "40%", display: "flex", justifyContent: "space-around" }}>
            <Button style={{}} onClick={handleStopCamera}> <img width="30" height="30" src="https://img.icons8.com/ios-filled/50/FA5252/call-disconnected.png" alt="call-disconnected" /></Button>
            <Button style={{}} onClick={""}><img width="30" height="30" src="https://img.icons8.com/sf-regular/48/1A1A1A/microphone.png" alt="microphone" /></Button>
            <Button style={{}} onClick={""}> <img width="48" height="48" src="https://img.icons8.com/color/48/info--v1.png" alt="info--v1" /></Button>
            <Button style={{}} onClick={sendStreams}><img width="48" height="48" src="https://img.icons8.com/fluency/48/sent.png" alt="sent" /></Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </>
  );
}

export default VideoCall
