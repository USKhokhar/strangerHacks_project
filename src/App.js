import React, { useEffect, useState } from 'react';
import Chat from './Components/Chat/Chat';
import './App.css'

function App() {
  const [active, setActive] = useState(false)

  const check = () => {
    const targetSiteUrl = "https://leetcode.com/problems/"
    /* eslint-disable no-undef */
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      var tabURL = tabs[0].url;
      if (tabURL.startsWith(targetSiteUrl)) {
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
      {active ? <Chat /> : <div className="not-active">Please go to leetcode.com to use this extension</div>}
    </div>
  );
}

export default App;
