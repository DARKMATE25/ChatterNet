import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { Box, Stack, Text } from "@chakra-ui/layout";
import { FormControl } from "@chakra-ui/form-control";
import '../components/style.css'
import './GuestChatPage.css'
import { Input } from "@chakra-ui/input";
import { Tooltip } from "@chakra-ui/tooltip";
import { Button } from "@chakra-ui/react";
import Scrollchat from './Scrollchat';
import { useToast } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import Lottie from 'react-lottie';
import annimations from '../annimations/Animation - 1707797831472.json'


import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
} from "@chakra-ui/modal";
import { useDisclosure } from "@chakra-ui/hooks";
function GuestChatPage({ name, roomID, users, socket, latestUSer }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        socket.on("typing", () => {
            setIsTyping(true);
        })
        socket.on("stop typing", () => {
            setIsTyping(false);
        })
    }, [])
    useEffect(() => {
        socket.on("receive_message", (data) => {
            setMessageList((list) => [...list, data]);
        });
        socket.on('user leaved', (name) => {
            toast({
                title: `${name} Leaved Room`,
                status: "error",
                duration: 10000,
                isClosable: true,
                position: "bottom",
            });
        })
    }, [socket]);
    const sendMessage = async (e) => {
        if (e.key == "Enter" && currentMessage) {
            socket.emit("stop typing", roomID);
            const messageData = {
                room: roomID,
                author: name,
                message: currentMessage,
                time:
                    new Date(Date.now()).getHours() +
                    ":" +
                    new Date(Date.now()).getMinutes(),
            };
            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };

    const handleLeave = (name, roomID) => {
        socket.emit("leave group", { name, roomID })
        navigate('/');
    }

    const typingHandler = (e) => {
        setCurrentMessage(e.target.value);
        if (!typing) {
            setTyping(true);
            socket.emit("typing", roomID);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", roomID);
                setTyping(false);
            }
        }, timerLength);
    }
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: annimations,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };
    return (
        <Box className='GuestComp' display="flex" justifyContent="space-between" width="100%" height="91.5vh" padding="10px">
            <Box
                className='InnerDiv'
                display={'flex'}
                flexDir="column"
                alignItems="center"
                p={3}
                bg="white"
                width={{ base: "100%", md: "31%" }}
                borderRadius="lg"
                borderWidth="1px"
            >
                <Box
                    pb={3}
                    px={3}
                    fontSize={{ base: "28px", md: "30px" }}
                    fontFamily="Work sans"
                    display="flex"
                    width="100%"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box display="flex" width={'100%'} alignItems={'center'} justifyContent={'space-between'} pb={2} my={4}>
                        <Text fontSize={'25px'}>RoomID : {roomID}</Text>
                        <Button colorScheme="red" onClick={() => handleLeave(name, roomID)} >Leave</Button>
                    </Box>

                </Box>
                <Box
                    display="flex"
                    flexDir="column"
                    p={3}
                    bg="#F8F8F8"
                    width="100%"
                    height="100%"
                    borderRadius="lg"
                    overflowY="hidden"
                >
                    {users ? (
                        <Stack overflowY="scroll">
                            {users.map((user) => (
                                <Box
                                    cursor="pointer"
                                    px={3}
                                    py={2}
                                    borderRadius="lg"
                                    key={user.id}
                                    bg={true ? "#38B2AC" : "#E8E8E8"}
                                    color={"white"}
                                >
                                    <Text>
                                        {user.name}
                                    </Text>
                                </Box>
                            ))}
                        </Stack>
                    ) : (
                        <>No Chats </>
                    )}

                </Box>
            </Box>
            <Box
                className='drawerBox'
                display={'none'}
                background="white"
                justifyContent={'space-between'}
                alignItems={'center'}
                width="100%"
                padding="5px 10px 5px 10px"
                borderWidth="5px"
            >
                <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
                    <Button variant="ghost" onClick={onOpen}>
                        <Text d={{ base: "none", md: "flex" }} px={4}>
                            {`Room- ${roomID}`}
                        </Text>
                    </Button>
                </Tooltip>
                <Text fontSize="2xl" fontFamily="Work sans">
                    GuestMode
                </Text>
            </Box>

            {
                users.length > 1 ? (
                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        padding={3}
                        bg="#E8E8E8"
                        width="100%"
                        height="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        <div className="messages">
                            <Scrollchat messages={messageList} currentUser={name} latestUSer={latestUSer} />
                        </div>
                        <FormControl
                            onKeyDown={sendMessage}
                            id="first-name"
                            isRequired
                            mt={3}
                        >
                            {istyping ? (
                                <div>
                                    <Lottie
                                        options={defaultOptions}
                                        // height={50}
                                        width={70}
                                        style={{ marginBottom: 15, marginLeft: 0 }}
                                    />
                                </div>
                            ) : (
                                <></>
                            )}
                            <Input
                                variant="filled"
                                bg="#E0E0E0"
                                placeholder="Enter a message.."
                                value={currentMessage}
                                onChange={typingHandler}
                            />

                        </FormControl>
                    </Box>
                ) : (
                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        padding={3}
                        bg="#E8E8E8"
                        width="100%"
                        height="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                            <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                                No one in the Room
                            </Text >
                        </Box >
                    </Box >
                )
            }
             <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerBody>
                        <Box display="flex" alignItems={'center'} justifyContent={'space-between'}  pb={2} my={4}>
                            <Text>Active Users</Text>
                            <Button colorScheme="red" onClick={() => handleLeave(name, roomID)}>Leave Group</Button>
                        </Box>
                        {users ? (
                            <Stack overflowY="scroll" my={8}>
                                {users.map((user) => (
                                    <Box
                                        cursor="pointer"
                                        px={3}
                                        py={2}
                                        borderRadius="lg"
                                        key={user.id}
                                        bg={true ? "#38B2AC" : "#E8E8E8"}
                                        color={"white"}
                                    >
                                        <Text>
                                            {user.name}
                                        </Text>
                                    </Box>
                                ))}
                            </Stack>
                        ) : (
                            <>No Chats </>
                        )}
                    </DrawerBody>
                </DrawerContent>
            </Drawer> 
        </Box>




    );
}

export default GuestChatPage;
