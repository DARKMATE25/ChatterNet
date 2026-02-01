import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/chatLogic";
import ChatLoading from "./ChatLoading";
import GroupChatModel from "./miscellanious/GroupChatModel";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import { Badge } from "@chakra-ui/react";
import { Avatar, HStack, VStack } from "@chakra-ui/react";

const MyChats = ({ fetchAgain }) => {

    const [loggedUser, setLoggedUser] = useState();
    const { selectedChat, setSelectedChat, user, chats, setChats, setUser } = ChatState();
    const toast = useToast();
    const navigate = useNavigate();
    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get("/api/chat", config);

            setChats(Array.isArray(data) ? data : data.data || []);
          
        } catch {
            toast({
                title: "Error Occurred!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
            navigate('/');
        }

    };

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats();
    }, [fetchAgain]);

    return (
        <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
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
                My Chats
                <GroupChatModel>
                    <Button
                        display="flex"
                        fontSize={{ base: "17px", md: "10px", lg: "17px" }}
                        rightIcon={<AddIcon />}
                    >
                        New Group Chat
                    </Button>
                </GroupChatModel>
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
                {Array.isArray(chats) ? (
                    <Stack overflowY="scroll">
                        {chats.map((chat) => (

                            <Box
                                onClick={() => setSelectedChat(chat)}
                                cursor="pointer"
                                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                                color={selectedChat === chat ? "white" : "black"}
                                px={3}
                                py={2}
                                borderRadius="lg"
                                key={chat._id}
                            >
                                <Box>
                                {/* <Text fontWeight="bold" fontSize="md">
                                    {chat.isGroupChat ? "👥 " : "👤 "}
                                    {chat.isGroupChat
                                    ? chat.chatName
                                    : chat.users.find(u => u._id !== user._id)?.name}
                                </Text> */}

                                {chat.isGroupChat && (
                                    <Badge mt={1} colorScheme="purple" fontSize="0.7em">
                                    Group · {chat.users.length} members
                                    </Badge>
                                )}
                                </Box>

                                {/* <Text>
                                    {!chat.isGroupChat
                                        ? getSender(loggedUser, chat.users)
                                        : chat.chatName}
                                </Text> */}

                                <HStack spacing={3}>
                                <Avatar
                                    name={chat.isGroupChat ? chat.chatName : getSender(loggedUser, chat.users)}
                                    size="sm"
                                />

                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold">
                                    {chat.isGroupChat
                                        ? chat.chatName
                                        : getSender(loggedUser, chat.users)}
                                    </Text>

                                    <Text fontSize="xs" color="gray.500">
                                    {chat.isGroupChat ? "Group Chat" : "Personal Chat"}
                                    </Text>
                                </VStack>
                                </HStack>

                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <ChatLoading />
                )}
            </Box>
        </Box>
    );
};

export default MyChats;