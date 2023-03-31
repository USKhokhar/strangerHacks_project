import './App.css';
import React from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const API_KEY = "";


function App() {

  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false)

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
      content: "Explain all concepts like I am computer science student preparing for software interviews"
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
      console.log(data)
      setMessages([...chatMessages, {
        sender: "ChatGPT",
        message: data.choices[0].message.content
      }])
    })
  }

  const handleSend = async () => {
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

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((messageObj, index) => (
            <div className="chat-message" key={index}>
              <span className="chat-message-sender">{messageObj.sender}:</span>
              <span className="chat-message-text">
                <ReactMarkdown>{messageObj.message}
                </ReactMarkdown>
              </span>
            </div>
          ))}
        </div>
        {loadingMsg && <div>CHATGPT IS THINKING ...</div>}
        <input className="chat-input" value={inputMsg} onChange={e => setInputMsg(e.target.value)} />
        <button className="chat-send-btn" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;
