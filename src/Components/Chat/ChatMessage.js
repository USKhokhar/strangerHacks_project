import React from 'react'
import { BsRobot } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatMessage = ({ messages }) => {
    return (
        <div>
            {messages.map((messageObj, index) => (
                <div key={index}>
                    {messageObj.sender === "ChatGPT" ?
                        <div className="chat-message chat-message-robot" >
                            <span className="chat-message-sender"><BsRobot /></span>
                            <span className="chat-message-text">
                                <ReactMarkdown
                                    children={messageObj.message}
                                    components={{
                                        code({ node, inline, className, children, ...props }) {
                                            // const match = /language-(\w+)/.exec(className || '')
                                            return !inline ? (
                                                <SyntaxHighlighter
                                                    children={String(children).replace(/\n$/, '')}
                                                    style={materialDark}
                                                    language="cpp"
                                                    PreTag="div"
                                                    {...props}
                                                />
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            )
                                        }
                                    }}
                                />
                            </span>
                        </div>
                        : <div className="chat-message chat-message-user" >
                            <span className="chat-message-sender"><FaUserCircle /></span>
                            <span className="chat-message-text">
                                <ReactMarkdown>{messageObj.displayMsg ? messageObj.displayMsg : messageObj.message}
                                </ReactMarkdown>
                            </span>
                        </div>}
                </div>
            ))}
        </div>
    )
}

export default ChatMessage