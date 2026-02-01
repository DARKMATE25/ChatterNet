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
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvtar/UserBadgeItem";
import UserListItem from "../userAvtar/UserListItem";
import { GroupchatAPI, handleSearchAPI } from "../../api";
const GroupChatModel = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const { user, chats, setChats } = ChatState();

    const handleSubmit = async () => {
        if (!groupChatName || selectedUsers.length < 3) {
            toast({
                title: "Please fill all the feilds",
                description: "Atleast three users required for creating a Group chat",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        const data = await GroupchatAPI({ groupChatName, selectedUsers })
        if (!data.isError) {
            setChats([data, ...chats]);
            onClose();
            toast({
                title: "New Group Chat Created!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }else if(data.isError){
            toast({
                title: data.msg,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };
    const handleSearch = async (query) => {
        setSearch(query);
        if (!search) return;
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
    useEffect(() => {
        if (!search) {
            setSearchResult([])
        }
    }, [search])

    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
    };
    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };
    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"
                    >
                        Create Group Chat
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        <FormControl>
                            <Input
                                placeholder="Chat Name"
                                mb={3}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add Users eg: Sahil"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        <Box width="100%" display="flex" flexWrap="wrap">
                            {selectedUsers.map((u) => (
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    handleFunction={() => handleDelete(u)}
                                />
                            ))}
                        </Box>
                        {loading ? (
                            // <ChatLoading />
                            <div>Loading...</div>
                        ) : (
                            searchResult && Array.isArray(searchResult) && searchResult.length > 0 ? (
                                searchResult.slice(0,
                                    4).map((user) => (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            handleFunction={() => handleGroup(user)}
                                        />
                                    ))
                            ) : (
                                <div>No search results found.</div>
                            )
                        )}

                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handleSubmit} colorScheme="blue">
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )

}

export default GroupChatModel;