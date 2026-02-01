import React, { useEffect, useState } from 'react'
import {
    Box,
    Container,
    Text,
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import GuestChatPage from './GuestChatPage';
import { useSocket } from '../Context/SocketProvider';
function Home() {
    const {socketInstance} = useSocket();
    const socket= socketInstance;
    console.log(socket);
    const toast = useToast();
    const [name, setName] = useState("");
    const [roomID, setRoomID] = useState(8516);
    const [users, setUsers] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [latestUSer, setLatestUser] = useState("");
    const navigate = useNavigate();
    const handleClick = () => {
        var length = roomID.toString().length;
        if (name.trim() == "") {
            toast({
                title: `Fill the Required details`,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        if (length != 4) {
            toast({
                title: `4 Digit RoomID Required`,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        if (name != "" && length == 4) {
            socket.on('update users', (updatedUsers) => {
                setUsers(updatedUsers);
            });
            socket.on('latest user', (newuser) => {
                toast({
                    title: `${newuser} Joined`,
                    status: "success",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                });
            })
            socket.emit("join as guest", roomID, name);
            setShowChat(true);
        }
        return;
    }

    return (
        <>
            {
                !showChat ? (
                    <Container maxW="xl" centerContent>
                        <Box
                            display="flex"
                            justifyContent="center"
                            p={3}
                            bg="grey"
                            w="100%"
                            m="40px 0 15px 0"
                            borderRadius="lg"
                            borderWidth="1px"
                        >
                            <Text fontSize="4xl" fontFamily="Work sans" color={'white'}>
                                Guest Mode
                            </Text>
                        </Box>
                        <Box bg="grey" w="100%" p={4} borderRadius="lg" borderWidth="1px">
                            <VStack spacing="10px">
                                <FormControl id="email" isRequired>
                                    <FormLabel>Your Name</FormLabel>
                                    <Input
                                        maxLength={15}
                                        backgroundColor={'white'}
                                        type="text"
                                        placeholder="Enter Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}

                                    />
                                </FormControl>
                                <FormControl id="password" isRequired>
                                    <FormLabel>Room ID</FormLabel>
                                    <InputGroup size="md">
                                        <Input
                                            type='number'
                                            backgroundColor={'white'}
                                            placeholder="Enter 4 digit Room ID"
                                            value={roomID}
                                            onChange={(e) => setRoomID(e.target.value)}
                                        />
                                    </InputGroup>
                                </FormControl>
                                <Button
                                    colorScheme="red"
                                    width="100%"
                                    style={{ marginTop: 15 }}
                                    onClick={handleClick}
                                >
                                    Create/Join Room
                                </Button>
                                <Button
                                    colorScheme="blue"
                                    width="100%"
                                    onClick={() => navigate('/')}
                                >
                                    ChatterNet
                                </Button>
                            </VStack>
                        </Box>
                    </Container>
                ) : (
                    <GuestChatPage name={name} socket={socket} roomID={roomID} users={users} latestUSer={latestUSer} />
                )
            }
        </>
    );

}

export default Home
