import React, { useRef } from 'react'
import { useState } from 'react';
import { BsSend } from "react-icons/bs";
import useAutosizeTextArea from '../../utils/useAutoTextArea';
import './Chat.css'
import ChatMessage from './ChatMessage';

const API_KEY = "";

const Chat = () => {

    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [loadingMsg, setLoadingMsg] = useState(false)

    const textAreaRef = useRef(null);

    useAutosizeTextArea(textAreaRef.current, inputMsg);

    async function processMessageChatgpt(chatMessages) {
        let apiMessages = chatMessages.map((messageObj) => {
            let role = ""
            if (messageObj.sender === "ChatGPT") {
                role = "assistant"
            } else {
                role = "user"
            }
            return { role: role, content: messageObj.message }
        })

        const systemMessage = {
            role: "system",
            content: "I'm a student using leetcode to prepare for software engineering interviews. Only answer questions that are relevant to the interview preparation"
        }

        const apiRequestBody = {
            model: "gpt-3.5-turbo",
            messages: [systemMessage, ...apiMessages]
        }

        console.log(apiRequestBody)
        await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(apiRequestBody)
        }).then((data) => {
            return data.json()
        }).then((data) => {
            console.log("ehiowgopiwe")
            console.log(data)
            setMessages([...chatMessages, {
                sender: "ChatGPT",
                message: data.choices[0].message.content
            }])
        })
    }

    const handleSend = async (e) => {
        console.log("Hello")
        e.preventDefault();
        setLoadingMsg(true)
        const newMessage = {
            message: inputMsg,
            sender: "user",
            direction: "outgoing"
        }

        const newMessages = [...messages, newMessage];

        setMessages(newMessages);
        setInputMsg('')
        await processMessageChatgpt(newMessages);
        setLoadingMsg(false)
    }

    const enterPressed = (e) => {
        let code = e.keyCode || e.which;
        if (code === 13) {
            handleSend(e);
        }
    }

    return (
        <div className="chat-container">
            <h2>Mermaid - Your leetcode buddy</h2>
            <div className="chat-messages">
                <ChatMessage messages={messages} />
            </div>
            {loadingMsg && <div>CHATGPT IS THINKING ...</div>}
            {/* A menu with 3 buttons */}
            <div className="chat-menu">
                <button className="chat-menu-btn">📖 Get started hint</button>
                <button className="chat-menu-btn">📚 Optimize hint</button>
                <button className="chat-menu-btn">📝 Solution</button>
                <button className="chat-menu-btn">📝 Debug</button>
            </div>
            <div className='chat-input-box'>
                <form>
                    <div className='chat-input-div'>
                        <textarea
                            className="chat-input"
                            value={inputMsg}
                            onChange={e => setInputMsg(e.target.value)}
                            onKeyDown={enterPressed}
                            rows={1}
                            ref={textAreaRef}
                        ></textarea>
                        <button className="chat-send-btn" onClick={handleSend}><BsSend /></button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Chat