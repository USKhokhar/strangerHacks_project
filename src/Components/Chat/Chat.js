import React, { useEffect, useRef } from 'react'
import { useState } from 'react';
import { BsArrowBarUp, BsSend } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { PulseLoader } from 'react-spinners';
import { extractCodeFromHtml } from '../../utils/extractCodeFromHtml';
import { extractTextFromHtml } from '../../utils/extractTextFromHtml';
import useAutosizeTextArea from '../../utils/useAutoTextArea';
import './Chat.css'
import ChatMessage from './ChatMessage';
import landingImg from '../../Assets/landing.svg'
import { prompts } from '../../Data/prompts';
/* eslint-disable no-undef */

const API_KEY = "";

const Chat = ({ platform, questionTitleClass, questionBodyClass }) => {
    const [tmpMessage, setTmpMessage] = useState('')
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");

    const [questionTitle, setQuestionTitle] = useState('')
    const [questionData, setQuestionData] = useState('')

    const [loadingMsg, setLoadingMsg] = useState(false)
    const [triggerSend, setTriggerSend] = useState(false)
    const [displayPromts, setDisplayPrompts] = useState(true)

    const textAreaRef = useRef(null);

    useAutosizeTextArea(textAreaRef.current, inputMsg);

    useEffect(() => {
        handleSend(0)
        // eslint-disable-next-line
    }, [triggerSend])

    useEffect(() => {
        if (!questionTitleClass || questionTitleClass === '' || !questionBodyClass || questionBodyClass === '') return
        getQuestionData(questionBodyClass)
        getQuestionTitle(questionTitleClass)
        // eslint-disable-next-line
    }, [questionTitleClass, questionBodyClass])



    useEffect(() => {
        async function fetchData() {
            if (questionTitle === '' || !platform) {
                return;
            }
            await chrome.storage.sync.get(`${platform}_${questionTitle.replace(/\s/g, '')}messages`, result => {
                if (result[`${platform}_${questionTitle.replace(/\s/g, '')}messages`]) {
                    setMessages(JSON.parse(result[`${platform}_${questionTitle.replace(/\s/g, '')}messages`]))
                }
            })
            await chrome.storage.sync.get(`${platform}_${questionTitle.replace(/\s/g, '')}displayPrompts`, result => {
                if (result[`${platform}_${questionTitle.replace(/\s/g, '')}displayPrompts`] !== undefined) {
                    setDisplayPrompts((result[`${platform}_${questionTitle.replace(/\s/g, '')}displayPrompts`]))
                }
            })
        }
        fetchData()
        // eslint-disable-next-line
    }, [questionTitle, platform])

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
            content: `Your name is "LeetCoach". You are "LeetCoach". Identify yourself as "LeetCoach". I will call you that. I'm a student using leetcode to prepare for software engineering interviews. I'm currently trying the
                ${questionTitle} question. Here is the full description of the question: 
                ${questionData}. You will help me with my doubts related to this question. You must not answer anything that is not relevant to the question or to my interview preparation. This is very important.`
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
            await chrome.storage.sync.set({
                [`${platform}_${questionTitle.replace(/\s/g, '')}messages`]: JSON.stringify(msgs)
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
    const getQuestionTitle = async (questionTitleClassName) => {
        const getQT = (arg1) => {
            const element = document.getElementsByClassName(arg1)[0];
            if (element) {
                return element.innerText;
            }
            return null;
        }
        await chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            let activeTabId = tabs[0].id;
            await chrome.scripting.executeScript(
                {
                    target: { tabId: activeTabId },
                    func: getQT,
                    args: [questionTitleClassName]
                },
                (result) => {
                    let qt = result[0].result.slice(result[0].result.indexOf('.') + 1)
                    setQuestionTitle(qt)
                }
            );
        });
    };

    const getQuestionData = async (questionBodyClassName) => {
        const getQB = (arg1) => {
            const element = document.getElementsByClassName(arg1)[0];
            if (element) {
                return element.innerHTML;
            }
            return null;
        }
        await chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            let activeTabId = tabs[0].id;
            await chrome.scripting.executeScript(
                {
                    target: { tabId: activeTabId },
                    func: getQB,
                    args: [questionBodyClassName]
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
                    setInputMsg(code + "\nWhat's the error here?")
                }
            );
        });
    }

    const toggleDisplayPrompts = async (val) => {
        setDisplayPrompts(val)
        await chrome.storage.sync.set({
            [`${platform}_${questionTitle.replace(/\s/g, '')}displayPrompts`]: val
        })
    }

    const prefilledPrompt = (promptNum) => {
        if (questionTitle === '') {
            getQuestionData()
            getQuestionTitle()
        }
        setInputMsg(prompts[promptNum - 1].actualMessage)
        setTmpMessage(prompts[promptNum - 1].displayMessage)
        // switch (promptNum) {
        //     case 0:
        //         setInputMsg("Explain the question like I am new to this. Also provide examples if you can")
        //         setTmpMessage("Explain the question")
        //         break;
        //     case 1:
        //         setInputMsg("Give me a hint on how to start solving this question. Just give me a hint on the most obvious solution (usually the brute-force one), don't reveal the best solution.")
        //         setTmpMessage("Give me a hint on how to start solving this question")
        //         break;
        //     case 2:
        //         setInputMsg("I got the brute-force solution. Give me a hint on how I can optimize to get a better solution. I just need a hint, don't reveal the full solution")
        //         setTmpMessage("How can I optimize my solution?")
        //         break;
        //     case 3:
        //         setInputMsg("List the different approaches for solving this question")
        //         setTmpMessage("List all approaches")
        //         break;
        //     case 4:
        //         setInputMsg("What is the time complexity of the most optimal solution. Just tell the time complexity, don't explain the approach or solution.")
        //         setTmpMessage("What is the expected optimal time complexity?")
        //         break;
        //     case 5:
        //         setInputMsg("Ask me a question that would be asked in a real interview based on this question")
        //         setTmpMessage("Ask me a potential interview question")
        //         break;
        //     case 6:
        //         setInputMsg("List some questions that are similar to the concepts used in this question")
        //         setTmpMessage("List similar questions")
        //         break;
        //     case 7:
        //         setInputMsg("Tell me why my code for this question is wrong")
        //         setTmpMessage("Tell me what's wrong with my code")
        //         break;
        //     default:
        //         setInputMsg('')
        //         setTmpMessage('')
        //         break
        // }
        setTriggerSend(!triggerSend)
    }

    const debugSolution = () => {
        getCode()
    }

    return (
        <div className="chat-container">
            {questionTitle === '' ?
                <div>
                    <h2 className='error-msg'>Oops - Error fetching question, please close and open the extension once the page completes loading</h2>
                </div> :
                <>
                    {!messages || (messages && messages.length === 0) ?
                        <div className="chat-welcome-msg">
                            <div>
                                <img src={landingImg} alt="LeetCoach" />
                            </div>
                            <div>
                                <h3>I'm Leet<span className="color-primary">Coach</span></h3>
                                <p>I see that you're trying the {questionTitle} problem.</p>
                                <p>I'm here to help you with any doubts you have on that :)</p>
                                <p>Ask me anything!</p>
                            </div>
                        </div> :
                        <div className="chat-messages">
                            <ChatMessage messages={messages} />
                        </div>
                    }
                    {loadingMsg && <div className="chat-loading-msg"><PulseLoader color="#ffbf00" /></div>}
                    <div className='chat-bottom'>
                        {displayPromts ?
                            <div className="chat-menu">
                                <button className="chat-prompt-toggle-close-btn" onClick={() => toggleDisplayPrompts(false)}><MdCancel /></button>
                                {prompts.map(prompt => (
                                    <button className="chat-prefilled-btn" onClick={() => prefilledPrompt(prompt.id)}>{prompt.displayMessage}</button>
                                ))}
                            </div> :
                            <button className="chat-prompt-toggle-btn" onClick={() => toggleDisplayPrompts(true)}><BsArrowBarUp /> Prompt Suggestions</button>
                        }
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
                </>}
        </div>
    )
}

export default Chat