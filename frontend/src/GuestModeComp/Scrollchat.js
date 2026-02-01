import React from 'react'
import ScrollableFeed from "react-scrollable-feed";
function Scrollchat({ messages, currentUser }) {
    return (
        <ScrollableFeed>
            {messages &&
                messages.map((m, i) => (
                    <div style={{ display: "flex" }} key={m.id}>
                        <span
                            style={{
                                backgroundColor: `${m.author === currentUser ? "#BEE3F8" : "#B9F5D0"
                                    }`,
                                marginLeft: `${m.author === currentUser ? "auto" : "5px"
                                    }`,
                                marginTop: `${m.author === currentUser ? "3px" : "10px"
                                    }`,
                                borderRadius: "20px",
                                padding: "5px 15px",
                                maxWidth: "75%",
                            }}
                        >
                            {m.message}
                        </span>
                    </div>
                ))}
        </ScrollableFeed>
    );
}

export default Scrollchat
