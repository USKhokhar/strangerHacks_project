import React, { useEffect, useState } from 'react';
import Chat from './Components/Chat/Chat';
import './App.css'
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import Settings from './Pages/Settings';
import Navbar from './Components/Navbar';
import About from './Pages/About';
import ClearData from './Pages/ClearData';
/* eslint-disable no-undef */

function App() {
  const [active, setActive] = useState(false)

  const check = () => {
    const targetSiteUrl = "https://leetcode.com/problems/"
    const regex = /^(https?:\/\/leetcode\.com)?\/problems\/[^\/]+(\/(description\/?)?)?$/

    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      var tabURL = tabs[0].url;
      if (tabURL.startsWith(targetSiteUrl) && regex.test(tabURL)) {
        setActive(true)
      } else {
        setActive(false)
      }
    });
  }

  useEffect(() => {
    check()
  }, [])

  return (
    <div className="App">
      {!active ?
        <div className="not-active">
          Please go to the Problem Description Page of a LeetCode Problem to use this extension.
          LeetCoach needs to be able to see the problem to help you with it :)
        </div> :
        <Router>
          <Navbar />
          <Routes>
            <Route path="/"
              element={
                <Chat
                  platform="leetcode"
                  questionTitleClass='mr-2 text-lg font-medium text-label-1 dark:text-dark-label-1'
                  questionBodyClass='_1l1MA'
                />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
            <Route path="/cleardata" element={<ClearData />} />
          </Routes>
        </Router>
      }
    </div>
  );
}

export default App;
