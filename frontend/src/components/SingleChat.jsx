import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { useCallback } from "react";
import "./style.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/chatLogic";
import { useEffect, useState } from "react";
import ProfileModal from "./miscellanious/ProfileModal";
import VideoCall from "./VideoCall";
import axios from 'axios'
import { ArrowBackIcon, AttachmentIcon, PhoneIcon } from "@chakra-ui/icons";
import { ChatState } from "../Context/ChatProvider";
import ScrollabelChat from "./ScrollabelChat";
import UpdateGroupChatModal from './miscellanious/UpdateGroupChatModal';
import Lottie from 'react-lottie';
import annimations from '../annimations/Animation - 1707797831472.json';
import { GetImage } from "../api";
import peer from "../service/peer";
import { fetchMessagesAPI, sendMessageAPI } from "../api";
import { useSocket } from "../Context/SocketProvider";
// import { handleStopCamera } from "./VideoCall";
import CreatePollModal from "./Poll/CreatePollModal";

var socket, selectedChatCompare;
function SingleChat({ fetchAgain, setFetchAgain }) {

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: annimations,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };
    const [messages, setMessages] = useState([]);
    const [file, setFile] = useState('');
    // const [fileData, setFileData] = useState('');
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [myStream, setMyStream] = useState();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [remoteStream, setRemoteStream] = useState();
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const [incomingCall, setIncomingCall] = useState(false);
    const [callerName, setCallerName] = useState("User");
    const [isPollOpen, setIsPollOpen] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);

    const toast = useToast();
    const { selectedChat, setSelectedChat, user, notification,
        setNotification } =
        ChatState();

    const { socketInstance } = useSocket();
    useEffect(() => {
        socket = socketInstance
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true))
        socket.on("typing", () => {
            setIsTyping(true);
        })
        socket.on("stop typing", () => {
            setIsTyping(false);
        })
        return ()=>{
            socket.off("typing", () => {
                setIsTyping(true);
            })
            socket.off("stop typing", () => {
                setIsTyping(false);
            })
        }
        // return () => {
        //     // Disconnect the WebSocket when the component is unmounted
        //     socket.disconnect();
        // };
    }, [socketInstance, user])


    useEffect(() => {
  if (!socket || !selectedChat) return;

  socket.emit("join chat", selectedChat._id);

  return () => {
    socket.emit("leave chat", selectedChat._id);
  };
}, [selectedChat]);

    useEffect(() => {
  if (!socket) return;

  socket.on("messagePinUpdated", ({ messageId, isPinned }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? { ...msg, isPinned }
          : { ...msg, isPinned: false }
      )
    );
  });

  return () => {
    socket.off("messagePinUpdated");
  };
}, [socket]);


    useEffect(() => {
        const getImage = async () => {
            if (file) {
                const data = new FormData();
                data.append("name", file.name);
                data.append("file", file);
                const response = await GetImage(data);
                setNewMessage(response.data);
            }
        }
        getImage();
    }, [file])


    // const sendMessage = async (e) => {
    //     if (e.key === "Enter" && newMessage) {
    //         socket.emit("stop typing", selectedChat._id);
    //         setNewMessage("");
    //         const data = await sendMessageAPI({ newMessage, selectedChat });
    //         if (!data.isError) {
    //             socket.emit("new message", data);
    //             setMessages([...messages, data]);
    //         } else if (data.isError) {
    //             toast({
    //                 title: data.msg,
    //                 description: "Failed to send the Message",
    //                 status: "error",
    //                 duration: 5000,
    //                 isClosable: true,
    //                 position: "bottom",
    //             });
    //         }
    //     }
    // }

    const handleSend = async () => {
  if (!newMessage.trim()) return;

  try {
    if (editingMessage) {
      const { data } = await axios.put(
        `/api/message/${editingMessage._id}`,
        { content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

    //   setMessages(prev =>
    // prev.map(m =>
    //     m._id === data._id
    //     ? { ...m, content: data.content, updatedAt: data.updatedAt }
    //     : m
    // )
    // );

      setEditingMessage(null);
      setNewMessage("");
      return;
    }

const data = await sendMessageAPI({
  newMessage,
  selectedChat: selectedChat._id,
});

const enrichedMessage = {
  ...data,
  sender: {
    _id: user._id,
    name: user.name,
    pic: user.pic,
  },
};

socket.emit("new message", enrichedMessage);
setMessages(prev => [...prev, enrichedMessage]);

setNewMessage("");

  } catch (err) {
    console.error(err);
  }
};

const handleDeleteMessage = async (messageId) => {
  try {
    await axios.delete(`/api/message/${messageId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    socket.emit("message-deleted", {
      messageId,
      chatId: selectedChat._id,
    });
  } catch (err) {
    console.error(err);
  }
};

    const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    };


const handleCreatePoll = async (pollData) => {
  try {
    const { data } = await axios.post(
      "/api/message",
      {
        chatId: selectedChat._id,
        content: "📊 Poll", 
        type: "poll",
        poll: {
          question: pollData.question,
          options: pollData.options.map(o => ({
            text: o,
            votes: [],
          })),
          anonymous: pollData.anonymous,
          multipleChoice: pollData.multipleChoice,
          expiresAt: pollData.expiresAt,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    setMessages(prev => [...prev, data]);
    setIsPollOpen(false);
  } catch (err) {
    console.error("Poll create error:", err);
  }
};



    const typingHandler = (e) => {
        setNewMessage(e.target.value)
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    const fetchMessages = async () => {
        if (!selectedChat) return
        const data = await fetchMessagesAPI(selectedChat);
        if (!data.isError) {
            setMessages(data);
            setLoading(false);
            // socket.emit("join chat", selectedChat._id);
        } else if (data.isError) {
            toast({
                title: data.msg,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    ///socket
    const handleUserJoined = useCallback(({ id }) => {
        setRemoteSocketId(id);
    }, []);

    // const handleCallUser = useCallback(async () => {
    //     const stream = await navigator.mediaDevices.getUserMedia({
    //         audio: true,
    //         video: true,
    //     });
    //     const offer = await peer.getOffer();
    //     setMyStream(stream);
    //     socket.emit("user:call", { to: remoteSocketId, offer });
    // }, [remoteSocketId, socket]);

    const handleIncommingCall = useCallback(
        async ({ from, offer }) => {
            setRemoteSocketId(from);
            if (window.confirm('Do you want to accept the incoming call?')) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: true,
                    });
                    setMyStream(stream);

                    const ans = await peer.getAnswer(offer);
                    socket.emit("call:accepted", { to: from, ans });
                } catch (error) {
                    console.error('Error accessing media devices:', error);
                    // Handle error condition
                }
            } else {
                socket.emit("call:declined", { to: from });
                // User declined the call
                // You might want to handle this case
            }
        },
        [socket]
    );

    const sendStreams = () => {
        const existingTracks = peer.peer.getSenders().map(sender => sender.track);

        for (const track of myStream.getTracks()) {
            if (!existingTracks.includes(track)) {
                peer.peer.addTrack(track, myStream);
            }
        }

        if (existingTracks.length > 0) {
            toast({
                title: "Request Sent",
                description: "Request Sent",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: "top",
            });
            return;
        }
    }
    const handleCallAccepted = useCallback(
        ({ from, ans }) => {
            peer.setLocalDescription(ans);
            sendStreams();
        },
        [sendStreams]
    );
    const handleCallDeclinded = useCallback(
        ({ from, msg }) => {
            if (myStream) {
                myStream.getTracks().forEach(track => {
                    track.stop();
                });
                setMyStream(null);
            }
            toast({
                title: msg,
                description: "Failed to send the Message",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        },
        []
    );
    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncomming = useCallback(
        async ({ from, offer }) => {
            const ans = await peer.getAnswer(offer);
            socket.emit("peer:nego:done", { to: from, ans });
        },
        [socket]
    );

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);

    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const stream = ev.streams;
            setRemoteStream(stream[0]);
        });
    }, []);
    useEffect(() => {
        socket.on("user:joined", handleUserJoined)
        socket.on("incoming:call", handleIncommingCall)
        socket.on("call:accepted", handleCallAccepted);
        socket.on("call:declined", handleCallDeclinded);
        socket.on("peer:nego:needed", handleNegoNeedIncomming)
        socket.on("peer:nego:final", handleNegoNeedFinal)
        return () => {
            socket.off("user:joined", handleUserJoined)
            socket.off("incoming:call", handleIncommingCall)
            socket.off("call:accepted", handleCallAccepted);
            socket.off("call:declined", handleCallDeclinded);
            socket.off("peer:nego:needed", handleNegoNeedIncomming)
            socket.off("peer:nego:final", handleNegoNeedFinal)
        }
    }, [
        socket,
        handleUserJoined,
        handleIncommingCall,
        handleCallAccepted,
        handleNegoNeedIncomming,
        handleNegoNeedFinal,
    ])

    useEffect(() => {
  if (!socket) return;

  const handleNewMessage = (newMessageReceived) => {
    if (
      !selectedChatCompare ||
      selectedChatCompare._id !== newMessageReceived.chat._id
    ) {
      if (!notification.find(n => n.chat._id === newMessageReceived.chat._id)) {
        setNotification(prev => [...prev, newMessageReceived]);
        setFetchAgain(prev => prev);
      }
    } else {
      setMessages(prev => [...prev, newMessageReceived]);
    }
  };

  socket.on("message received", handleNewMessage);

  return () => {
    socket.off("message received", handleNewMessage);
  };
}, [socket, notification]);


    useEffect(() => {
  if (!socket) return;

  socket.on("message-edited", (updatedMsg) => {
    setMessages(prev =>
      prev.map(m =>
        m._id === updatedMsg._id ? updatedMsg : m
      )
    );
  });

  return () => {
    socket.off("message-edited");
  };
}, [socket]);

useEffect(() => {
  if (!socket) return;

  socket.on("messageDeleted", ({ messageId }) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
  });

  return () => socket.off("messageDeleted");
}, [socket]);


useEffect(() => {
  if (!socket) return;

  socket.on("poll-voted", (updatedMsg) => {
    setMessages(prev =>
      prev.map(m =>
        m._id === updatedMsg._id ? updatedMsg : m
      )
    );
  });

  return () => {
    socket.off("poll-voted");
  };
}, [socket]);

    return <>
        {
            selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        width="100%"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />
                        {
                            !selectedChat.isGroupChat ? (
                                <>
                                {/* Changes */}

                                    {/* <Box style={{ display: "flex" }}>{getSender(user, selectedChat.users)}
                                        {istyping ? (
                                            <div>
                                                <Lottie
                                                    options={defaultOptions}
                                                    width={70}
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                            </div>
                                        )}</Box> */}

                                        <Box display="flex" flexDirection="column">
                                        <Text fontWeight="bold">
                                            {getSender(user, selectedChat.users)}
                                        </Text>

                                        <Text fontSize="xs" color="green.400">
                                            🟢 Active now
                                        </Text>

                                        {istyping && (
                                            <Lottie options={defaultOptions} width={70} />
                                        )}
                                        </Box>


                                    <div style={{ display: 'flex' }}>
                                        <IconButton
                                        icon={<PhoneIcon />}
                                        colorScheme="green"
                                        aria-label="Call"
                                        onClick={() => {
                                            setCallerName(getSender(user, selectedChat.users));
                                            setIncomingCall(true);
                                        }}
                                        />

                                        {/* <IconButton icon={<PhoneIcon />} style={{ marginRight: '15px' }} onClick={handleCallUser} /> */}
                                        <ProfileModal user={getSenderFull(user, selectedChat.users)}></ProfileModal>
                                    </div>
                                </>
                            ) : (
                                <> {selectedChat.chatName.toUpperCase()}
                                    <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                                </>
                            )
                        }
                    </Text>

                    {
                        myStream ? <VideoCall myStream={myStream} setMyStream={setMyStream} remoteStream={remoteStream} setRemoteStream={setRemoteStream} sendStreams={sendStreams}> </VideoCall> :
                            <>
                                <Box
                                position="relative"
                                display="flex"
                                flexDir="column"
                                backgroundImage="https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png"
                                width="100%"
                                height="100%"
                                borderRadius="lg"
                                overflow="hidden"
                                >

                                    {messages?.find(m => m.isPinned) && (
                                    <Box
                                        position="absolute"
                                        top="0"
                                        left="0"
                                        right="0"
                                        zIndex="20"
                                        bg="yellow.100"
                                        px={4}
                                        py={2}
                                        display="flex"
                                        alignItems="center"
                                        gap={2}
                                        borderBottom="1px solid #e2e8f0"
                                    >
                                        <Text>📌</Text>
                                        <Text fontWeight="500" noOfLines={1}>
                                        {messages.find(m => m.isPinned).content}
                                        </Text>
                                    </Box>
                                    )}


                                    {loading ? (
                                        <Spinner
                                            size="xl"
                                            width={20}
                                            height={20}
                                            alignSelf="center"
                                            margin="auto"
                                        />
                                    ) : (
                                        <div
                                        className="messages"
                                        style={{
                                            marginTop: messages.find(m => m.isPinned) ? "52px" : "0px",
                                            padding: "12px",
                                            overflowY: "auto",
                                            flex: 1,
                                        }}
                                        >
                                        <ScrollabelChat
                                        messages={messages}
                                        onEdit={handleEditMessage}
                                        onDelete={handleDeleteMessage}
                                        user={user}
                                        />
                                        </div>

                                    )}
                                        <FormControl
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSend();
                                            }
                                         }}
                                         >

                                         <Box
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="space-between"
                                            padding={3}
                                            overflowY="hidden"
                                         >

                                            <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                                                <AttachmentIcon style={{ fontSize: "20px", marginRight: "10px" }} />
                                            </label>
                                            <input
                                                type="file"
                                                id="fileInput"
                                                // accept="image/*,.pdf,.doc,.docx"
                                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                                style={{ display: "none" }}
                                                onChange={(e) => setFile(e.target.files[0])}
                                                />
                                            
                                            <IconButton
                                                icon={<Text fontSize="lg">📊</Text>}
                                                variant="ghost"
                                                onClick={() => setIsPollOpen(true)}
                                                bg="transparent"
                                                _hover={{ bg: "transparent" }}
                                                _active={{ bg: "transparent" }}
                                                _focus={{ bg: "transparent" }}
                                                />

                                            <Input
                                                variant="filled"
                                                bg="#E0E0E0"
                                                placeholder="Enter a message.."
                                                value={newMessage}
                                                onChange={typingHandler}
                                            />
                                        </Box>
                                    </FormControl>
                                </Box>
                            </>
                    }

                </>
            ) : (

                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                        Click on a user to start chatting
                    </Text >
                </Box >
            )
        }
        <Modal isOpen={incomingCall} onClose={() => setIncomingCall(false)}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>📞 Incoming Call</ModalHeader>
            <ModalBody>
            <Text>{callerName} is calling you</Text>
            </ModalBody>
            <ModalFooter>
            <Button colorScheme="green" mr={3}>Accept</Button>
            <Button colorScheme="red" onClick={() => setIncomingCall(false)}>
                Decline
            </Button>
            </ModalFooter>
        </ModalContent>
        </Modal>

        <CreatePollModal
            isOpen={isPollOpen}
            onClose={() => setIsPollOpen(false)}
            onCreate={handleCreatePoll}
            />

    </>
}

export default SingleChat
