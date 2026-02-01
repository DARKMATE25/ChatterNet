import axios from 'axios';

const URl = "http://localhost:5000";


/////authentication
export const SignUp = async (signupValues) => {

    try {
        const { data } = await axios.post(`${URl}/api/user`, signupValues);
        return data;
    } catch (error) {
        return;
    }
}

export const LoginAPI = async ({ email, password }) => {
    try {
        const { data } = await axios.post(`${URl}/api/user/login`, { email, password });
        return data;
    } catch (error) {
        const data = {
            msg: "Error Ocuured",
            isError: true
        }
        return data;
    }
}

export const handleSearchAPI = async ({ search }) => {
    const Error = {
        msg: "Please Enter Something",
        isError: true
    }
    try {
        if (!search) {
            return Error;
        }
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            return ({
                msg: "Session Expired Please Login again",
                isError: true
            })
        }
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };
        const { data } = await axios.get(`${URl}/api/user?search=${search}`, config);
        return data;
    } catch (error) {
        return ({
            msg: "Some Error Ocuured",
            isError: true
        })
    }
}


export const accessChatAPI = async (userId) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            return ({
                msg: "Session Expired Please Login again",
                isError: true
            })
        }
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };
        const { data } = await axios.post(`${URl}/api/chat`, { userId }, config);
        return data;
    } catch (error) {
        return ({
            msg: "Some Error Ocuured",
            isError: true
        })
    }
}

export const fetchMessagesAPI = async (selectedChat) => {
    if (!selectedChat) return;
    try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            return ({
                msg: "Session Expired Please Login again",
                isError: true
            })
        }
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };
        const { data } = await axios.get(`${URl}/api/message/${selectedChat._id}`, config)
        return data;
    } catch (error) {
        return ({
            msg: "Some Error Ocuured",
            isError: true
        })
    }
}

export const sendMessageAPI = async ({ newMessage, selectedChat }) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            return ({
                msg: "Session Expired Please Login again",
                isError: true
            })
        }
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };
        const { data } = await axios.post(`${URl}/api/message`, {
            content: newMessage,
            chatId: selectedChat,
        }, config);
        return data;
    } catch (error) {
        return ({
            msg: "Some Error Ocuured",
            isError: true
        })
    }
}



export const GroupchatAPI = async ({ groupChatName, selectedUsers }) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            return ({
                msg: "Session Expired Please Login again",
                isError: true
            })
        }
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };
        const { data } = await axios.post(`${URl}/api/chat/group`,
            {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id)),
            },
            config
        );
        return data;
    } catch (error) {
        return ({
            msg: "Some Error Ocuured",
            isError: true
        })
    }
}
export const handleRemoveAPI = async ({ selectedChat, user1 }) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            return ({
                msg: "Session Expired Please Login again",
                isError: true
            })
        }
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };
        const { data } = await axios.put(`${URl}/api/chat/groupremove`, {
            chatId: selectedChat._id,
            userId: user1._id,
        }, config)
        return data;

    } catch (error) {
        return ({
            msg: "Some Error Ocuured",
            isError: true
        })
    }
}

export const handleAddUserAPI=async({selectedChat, user1})=>{
    try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            return ({
                msg: "Session Expired Please Login again",
                isError: true
            })
        }
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };
        const { data } = await axios.put(`${URl}/api/chat/groupadd`, {
            chatId: selectedChat._id,
            userId: user1._id,
        }, config)
        return data;
    } catch (error) {
        return ({
            msg: "Some Error Ocuured",
            isError: true
        })
    }
}
export const GetImage = async (data) => {
    try {
        return await axios.post(`${URl}/file/upload`, data);
    } catch (error) {
        console.log('Error while Uploading the file');

    }
}

export const editMessageAPI = async (messageId, content) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const config = {
    headers: { Authorization: `Bearer ${userInfo.token}` },
  };
  const { data } = await axios.put(
    `${URl}/api/message/${messageId}`,
    { content },
    config
  );
  return data;
};

export const deleteMessageAPI = async (messageId) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const config = {
    headers: { Authorization: `Bearer ${userInfo.token}` },
  };
  const { data } = await axios.delete(
    `${URl}/api/message/${messageId}`,
    config
  );
  return data;
};









