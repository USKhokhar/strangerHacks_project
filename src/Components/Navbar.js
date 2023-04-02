import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

/* eslint-disable no-undef */
const Navbar = () => {
    const openOptions = () => {
        chrome.tabs.create({ url: 'options.html' });
    }
    return (
        <div className="nav-main">
            <div>
                <Link to="/"><h2>Leet<span className="color-primary">Coach</span></h2></Link>
            </div>
            <div>
                <button onClick={openOptions}>Settings</button>
            </div>
        </div >
    )
}

export default Navbar