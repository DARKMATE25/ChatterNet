import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { useNavigate } from "react-router-dom";
import {
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
} from "@chakra-ui/menu";
import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon, NotAllowedIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useCallback, useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import UserListItem from "../userAvtar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/chatLogic";
import { useMemo } from "react";
import { handleSearchAPI, accessChatAPI } from "../../api";
const SideDrawer = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const {
        setSelectedChat,
        user,
        notification,
        setNotification,
        chats,
        setChats,
    } = ChatState();

    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();


    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate('/');
    };

    const handleClearButton = () => {
        setSearchResult([]);
        setSearch("");
    }

    const handleSearch = async () => {
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
    }

    const accessChat = async (userId) => {
        setLoadingChat(true);
        const data = await accessChatAPI(userId);
        if (!data.isError) {
            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setLoadingChat(false);
            onClose();
        } else if (data.isError) {
            setLoadingChat(false);
            toast({
                title: data.msg,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }

    return <>
        <>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                background="white"
                width="100%"
                padding="5px 10px 5px 10px"
                borderWidth="5px"
            >
                <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
                    <Button variant="ghost" onClick={onOpen}>
                        <i className="fas fa-search"></i>
                        <Text d={{ base: "none", md: "flex" }} px={4}>
                            Search User
                        </Text>
                    </Button>
                </Tooltip>
                <Text fontSize="2xl" fontFamily="Work sans">
                    ChatterNet
                </Text>
                <div>
                    {/* <Menu>
                        <MenuButton p={1}>
                             <NotificationBadge
                                count={notification.length}
                                effect={Effect.SCALE}
                            /> 
                             <BellIcon fontSize="2xl" m={1} /> 
                        </MenuButton>
                        <MenuList pl={2}>

                            {!notification.length && "No new Message"}
                            {notification.map((notif) => (
                                <MenuItem key={notif._id} onClick={() => {
                                    setSelectedChat(notif.chat)
                                    setNotification(notification.filter((prev) => prev != notif))
                                }}>
                                    {notif.chat.isGroupChat ? `New Message in ${notif.chat.chatName}` : `New Message from ${getSender(user, notif.chat.users)}`}
                                </MenuItem>
                            ))}

                        </MenuList>
                    </Menu> */}
                    <Menu>
                        <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
                            <Avatar
                                size="sm"
                                cursor="pointer"
                                name={user.name}
                                src={user.pic}
                            />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />

                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box display="flex" pb={2}>
                            <Input
                                placeholder="Search by name or email"
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? (
                            <ChatLoading />
                        ) : (
                            searchResult?.map((usere) => (
                                <UserListItem
                                    key={usere._id}
                                    user={usere}
                                    handleFunction={() => accessChat(usere._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml="auto" d="flex" />}
                        {searchResult && searchResult.length > 0 && (
                            <Button variant="solid"
                                colorScheme="red"
                                width="100%" onClick={handleClearButton}>Clear</Button>
                        )}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    </>
}
export default SideDrawer;