import { Box } from "@chakra-ui/layout";
import "./style.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";
import { useEffect, useState } from "react";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, socket } = ChatState();
  const [messages, setMessages] = useState([]);

  // useEffect(() => {
  //   if (!socket) return;

  //   socket.on("messagePinUpdated", ({ messageId, isPinned }) => {
  //     setMessages((prev) =>
  //       prev.map((msg) =>
  //         msg._id === messageId
  //           ? { ...msg, isPinned }
  //           : { ...msg, isPinned: false }
  //       )
  //     );
  //   });

  //   return () => socket.off("messagePinUpdated");
  // }, [socket]);

  // const pinnedMessage = messages.find((m) => m.isPinned);

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      padding={3}
      background="white"
      width={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      {/* {pinnedMessage && (
        <Box className="pinned-message">
          📌 {pinnedMessage.content}
        </Box>
      )} */}

      <SingleChat
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
        messages={messages}
        setMessages={setMessages}
      />
    </Box>
  );
};

export default Chatbox;



























// import { Box } from "@chakra-ui/layout";
// import "./style.css";
// import SingleChat from "./SingleChat";
// import { ChatState } from "../Context/ChatProvider";

// const Chatbox = ({ fetchAgain, setFetchAgain }) => {
//   const { selectedChat } = ChatState();
//   return (
//     <Box
//       display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
//       alignItems="center"
//       flexDir="column"
//       padding={3}
//       background="white"
//       width={{ base: "100%", md: "68%" }}
//       borderRadius="lg"
//       borderWidth="1px"
//     >
//       <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
//     </Box>
//   );
// };

// export default Chatbox;