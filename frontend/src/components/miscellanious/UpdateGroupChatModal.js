import { ViewIcon } from "@chakra-ui/icons";
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
    FormControl,
    Input,
    useToast,
    Box,
    IconButton,
    Spinner,
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvtar/UserBadgeItem";
import UserListItem from "../userAvtar/UserListItem";
import { handleAddUserAPI, handleRemoveAPI, handleSearchAPI } from "../../api";
const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameLoading] = useState(false);
    const toast = useToast();
    const { selectedChat, setSelectedChat, user } = ChatState();

    const handleRemove = async (user1) => {
        setLoading(true);
        if (selectedChat.groupAdmin._id == user1._id) {
            toast({
                title: "Make other user as a admin Before Leaving",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            setLoading(false);
            return;
        }
        const data = await handleRemoveAPI({ selectedChat, user1 });
        if (!data.isError) {
            user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } else if (data.isError) {
            toast({
                title: data.msg,
                description: "Failed to Remove the User",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
        setGroupChatName("");
    }
    const handleSearch = async (query) => {
        setSearch(query);
        if (!search) return;
        setLoading(true);
        const data = await handleSearchAPI({ search });
        if (!data.isError) {
            setLoading(false);
            setSearchResult(data.data);
        } else if (data.isError) {
            setLoading(false);
            toast({
                title: data.msg,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };
    const handleRename = async () => {
        if (!groupChatName) return;
        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `https://chatternet-backend.onrender.com/api/chat/rename`,
                {
                    chatId: selectedChat._id,
                    chatName: groupChatName,
                },
                config
            );
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setRenameLoading(false);
        }
        setGroupChatName("");
    }
    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id == user1._id)) {
            toast({
                render: () => (
                    <Box color='white' p={3} bg='blue.500'>
                        User Alredy Exist in the Group
                    </Box>
                ),
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        setLoading(true);
        const data = await handleAddUserAPI({ selectedChat, user1 });
        if (!data.isError) {
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
            toast({
                title: "User Added to the Group",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top",
            });
        }else if(data.isError){
            toast({
                title: data.msg,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }else{
            setLoading(false);
        }
       
    };
    return (
        <>
            <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
            <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="40px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"
                    >
                        {selectedChat.chatName}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                    >
                        <Box width="100%" display="flex" flexWrap="wrap" pb={3}>
                            {selectedChat.users.map((u) => (
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    currentuser={user}
                                    admin={selectedChat.groupAdmin}
                                    handleFunction={() => handleRemove(u)}
                                />
                            ))}
                        </Box>

                        {
                            selectedChat.groupAdmin._id === user._id ? <>
                                <FormControl display="flex">
                                    <Input
                                        placeholder="Chat Name"
                                        mb={3}
                                        value={groupChatName}
                                        onChange={(e) => setGroupChatName(e.target.value)}
                                    />
                                    <Button
                                        variant="solid"
                                        colorScheme="teal"
                                        ml={1}
                                        isLoading={renameloading}
                                        onClick={handleRename}
                                    >
                                        Update
                                    </Button>
                                </FormControl>
                                <FormControl>
                                    <Input
                                        placeholder="Add User to group"
                                        mb={1}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </FormControl>
                                {loading ? (
                                    <Spinner size="lg" />
                                ) : (
                                    searchResult?.map((user) => (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            handleFunction={() => handleAddUser(user)}
                                        />
                                    ))
                                )}
                            </>
                                : <>
                                    <Text>Only Admins are allowed to make changes</Text>
                                </>
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => handleRemove(user)} colorScheme="red">
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UpdateGroupChatModal;