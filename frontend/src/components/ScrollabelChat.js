import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import { IconButton, Box, Text } from "@chakra-ui/react";
import { useSocket } from "../Context/SocketProvider";
import { useState } from "react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/chatLogic";
import { ChatState } from "../Context/ChatProvider";
import { AUDIO, IMAGE, PDF, VIDEO } from "./MessageComponents";
import axios from "axios";

const Message = ({ message }) => {
  if (!message || typeof message !== "string") return null;

  if (message.includes(".png") || message.includes(".jpg") || message.includes(".jpeg"))
    return <IMAGE message={message} />;

  if (message.includes(".mp3") || message.includes(".wav"))
    return <AUDIO message={message} />;

  if (message.includes(".mp4") || message.includes(".avi") || message.includes(".mov"))
    return <VIDEO message={message} />;

  if (message.includes(".pdf")) return <PDF message={message} />;

  return <>{message}</>;
};

const ScrollabelChat = ({ messages, onEdit, onDelete, user }) => {
  const { selectedChat } = ChatState();
  const { socketInstance } = useSocket();
  const [activeMessageId, setActiveMessageId] = useState(null);

  const handlePinToggle = (messageId) => {
    if (!socketInstance || !selectedChat?._id) return;

    socketInstance.emit("togglePinMessage", {
      messageId,
      chatId: selectedChat._id,
    });
  };

  const handleVote = async (messageId, optionIndex) => {
  try {
    await axios.put(
      `/api/message/vote/${messageId}`,
      { optionIndex },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
  } catch (err) {
    console.error("Vote failed", err);
  }
};


  return (
    <Box height="100%" overflowY="auto">
      <ScrollableFeed>
        {messages &&
          messages.map((m, i) => {
            // const senderId = typeof m.sender === "string" ? m.sender : m.sender?._id;
            // const isOwnMessage = senderId?.toString() === user?._id?.toString();

            // const senderId = typeof m.sender === "object" ? m.sender._id : m.sender;
            // const isOwnMessage = senderId === user._id;

            const senderId =
            m.sender && typeof m.sender === "object"
              ? m.sender._id?.toString()
              : m.sender?.toString();
          const isOwnMessage = senderId === user._id?.toString();

            return (
              <div key={`${m._id}-${m.updatedAt}`} style={{ display: "flex" }}>
                {m?.sender &&
                  (isSameSender(messages, m, i, user._id) ||
                    isLastMessage(messages, i, user._id)) && (
                    <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                      <Avatar
                        mt="7px"
                        mr={1}
                        size="sm"
                        cursor="pointer"
                        name={m.sender.name}
                        src={m.sender.pic}
                      />
                    </Tooltip>
                  )}

                <Box
                  role="group"
                  position="relative"
                  display="flex"
                  flexDirection="column"
                  maxWidth="75%"
                  ml={isSameSenderMargin(messages, m, i, user._id)}
                  mt={isSameUser(messages, m, i, user._id) ? 3 : 10}
                  pr="32px"
                >
                  <Box
                    onDoubleClick={() => isOwnMessage && setActiveMessageId(
                      activeMessageId === m._id ? null : m._id
                    )}
                    bg={
                      m.isPinned
                        ? "#FFF9C4"
                        : isOwnMessage
                        ? "#B9F5D0"
                        : "white"
                    }
                    borderRadius="20px"
                    px={4}
                    py={2}
                    width="fit-content"
                    cursor={isOwnMessage ? "pointer" : "default"}
                  >
                    {m.type === "poll" && m.poll ? (
                    <Box bg="white" p={3} borderRadius="md">
                      <Box fontWeight="bold" mb={2}>
                        📊 {m.poll.question}
                      </Box>

                      {m.poll.options.map((opt, idx) => {
                        const hasVoted = opt.votes.includes(user._id);

                        return (
                          <Box
                            key={idx}
                            bg={hasVoted ? "#B9F5D0" : "#f1f1f1"}
                            p={2}
                            mb={1}
                            borderRadius="md"
                            cursor="pointer"
                            _hover={{ bg: "#e2e2e2" }}
                            onClick={() => {
                              if (!hasVoted) handleVote(m._id, idx);
                            }}
                          >
                            {opt.text} ({opt.votes.length})
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Message message={m.content} />
                  )}

                  </Box>

                  <Box
                    position="absolute"
                    top="50%"
                    right="4px"
                    transform="translateY(-50%)"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                  >
                    <IconButton
                      size="xs"
                      icon={<span>📌</span>}
                      variant="ghost"
                      onClick={() => handlePinToggle(m._id)}
                    />
                  </Box>

                  {activeMessageId === m._id && isOwnMessage && (
                    <Box mt={1} display="flex" gap={3} justifyContent="flex-end">
                      <span style={{ cursor: "pointer" }} onClick={() => onEdit(m)}>
                        ✏️ Edit
                      </span>
                      <span style={{ cursor: "pointer" }} onClick={() => onDelete(m._id)}>
                        🗑️ Delete
                      </span>
                    </Box>
                  )}
                </Box>
              </div>
            );
          })}
      </ScrollableFeed>
    </Box>
  );
};

export default ScrollabelChat;
