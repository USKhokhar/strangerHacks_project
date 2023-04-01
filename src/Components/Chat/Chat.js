import React, { useEffect, useRef } from 'react'
import { useState } from 'react';
import { BsSend } from "react-icons/bs";
import { extractCodeFromHtml } from '../../utils/extractCodeFromHtml';
import { extractTextFromHtml } from '../../utils/extractTextFromHtml';
import useAutosizeTextArea from '../../utils/useAutoTextArea';
import './Chat.css'
import ChatMessage from './ChatMessage';
/* eslint-disable no-undef */

const API_KEY = "";

const Chat = () => {
    const [tmpMessage, setTmpMessage] = useState('')
    const [tabId, setTabId] = useState(0)
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [loadingMsg, setLoadingMsg] = useState(false)
    const [triggerSend, setTriggerSend] = useState(false)

    const [questionTitle, setQuestionTitle] = useState('')
    const [questionData, setQuestionData] = useState('')
    const [code, setCode] = useState('')

    const textAreaRef = useRef(null);

    useAutosizeTextArea(textAreaRef.current, inputMsg);

    useEffect(() => {
        handleSend(0)
        // eslint-disable-next-line
    }, [triggerSend])

    useEffect(() => {
        async function fetchTab() {
            await chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
                let activeTabId = tabs[0].id;
                setTabId(activeTabId)
            })
        }
        fetchTab()
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        async function fetchData() {
            getQuestionData()
            getQuestionTitle()
            await chrome.storage.local.get(`${tabId}messages`, result => {
                if (result[`${tabId}messages`]) {
                    setMessages(JSON.parse(result[`${tabId}messages`]))
                }
            })
        }
        fetchData()
        // eslint-disable-next-line
    }, [tabId])

    useEffect(() => {
        async function fetchTabData() {
            await chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
                let activeTabId = tabs[0].id;
                setTabId(activeTabId)
            })
        }
        fetchTabData()
        // eslint-disable-next-line
    }, [])

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
            content: "I'm a student using leetcode to prepare for software engineering interviews. Only answer questions that are relevant to the interview preparation. I'm currently trying the " + questionTitle + " question. Here is the full description of the question: " + questionData
        }

        const apiRequestBody = {
            model: "gpt-3.5-turbo",
            messages: [systemMessage, ...apiMessages]
        }

        await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(apiRequestBody)
        }).then((data) => {
            return data.json()
        }).then(async (data) => {
            let msgs = [...chatMessages, {
                sender: "ChatGPT",
                message: data.choices[0].message.content
            }]
            setMessages(msgs)
            await chrome.storage.local.set({
                [`${tabId}messages`]: JSON.stringify(msgs)
            })
        })
    }

    const handleSend = async (e) => {
        if (inputMsg === '')
            return;
        if (e !== 0) e.preventDefault();
        setLoadingMsg(true)
        let newMessage = {}
        if (tmpMessage !== '') {
            newMessage = {
                message: inputMsg,
                displayMsg: tmpMessage,
                sender: "user",
                direction: "outgoing"
            }
            setTmpMessage('')
        } else {
            newMessage = {
                message: inputMsg,
                sender: "user",
                direction: "outgoing"
            }
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

    // mr-2 text-lg font-medium text-label-1 dark:text-dark-label-1
    const getQuestionTitle = async (e) => {
        await chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            let activeTabId = tabs[0].id;
            await chrome.scripting.executeScript(
                {
                    target: { tabId: activeTabId },
                    func: () => {
                        const element = document.getElementsByClassName('mr-2 text-lg font-medium text-label-1 dark:text-dark-label-1')[0];
                        if (element) {
                            return element.innerText;
                        }
                        return null;
                    }
                },
                (result) => {
                    let qt = result[0].result.slice(result[0].result.indexOf('.') + 1)
                    setQuestionTitle(qt)
                }
            );
        });
    };

    const getQuestionData = async (e) => {
        await chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            let activeTabId = tabs[0].id;
            await chrome.scripting.executeScript(
                {
                    target: { tabId: activeTabId },
                    func: () => {
                        const element = document.getElementsByClassName('_1l1MA')[0];
                        if (element) {
                            return element.innerHTML;
                        }
                        return null;
                    }
                },
                (result) => {
                    const rawString = extractTextFromHtml(result[0].result)
                    const questionText = rawString.slice(0, rawString.indexOf('Example 1'))
                    setQuestionData(questionText)
                    // setInputMsg("Give me a hint for the " + result[0].result.slice(result[0].result.indexOf('.') + 1) + " problem on Leetcode");
                    // setTriggerSend(!triggerSend)
                }
            );
        });
    }

    const getCode = async (e) => {
        await chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            let activeTabId = tabs[0].id;
            await chrome.scripting.executeScript(
                {
                    target: { tabId: activeTabId },
                    func: () => {
                        const element = document.getElementsByClassName('lines-content')[0];
                        if (element) {
                            return element.innerHTML;
                        }
                        return null;
                    }
                },
                (result) => {
                    //========= WIP ========= //
                    const code = extractCodeFromHtml(result[0].result)
                    setCode(code)
                    setInputMsg(code + "\nWhat's the error here?")
                }
            );
        });
    }

    const prefilledPrompt = (promptNum) => {
        if (questionTitle === '') {
            getQuestionData()
            getQuestionTitle()
        }
        switch (promptNum) {
            case 1:
                setInputMsg("Give me a hint")
                setTmpMessage("This is the first prefill")
                break;
            case 2:
                setInputMsg("Give me a solution")
                setTmpMessage("This is the second prefill")
                break;
            case 3:
                setInputMsg("Give me an ideal solution")
                setTmpMessage("This is the third prefill")
                break;
        }
        setTriggerSend(!triggerSend)
    }

    const debugSolution = () => {
        getCode()
    }

    return (
        <div className="chat-container">
            <h2>Mermaid - Your leetcode buddy</h2>
            <div className="chat-messages">
                <ChatMessage messages={messages} />
            </div>
            {loadingMsg && <div>mermaid IS THINKING ...</div>}
            <div className="chat-menu">
                <button className="chat-menu-btn" onClick={() => prefilledPrompt(1)}>📖 How do I start</button>
                <button className="chat-menu-btn" onClick={() => prefilledPrompt(2)}>📝 Solution</button>
                <button className="chat-menu-btn" onClick={() => prefilledPrompt(3)}>📝 Ideal TC</button>
                <button className="chat-menu-btn" onClick={debugSolution}>📝 Interview Me</button>
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
                            required
                        ></textarea>
                        <button className="chat-send-btn" onClick={handleSend}><BsSend /></button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Chat