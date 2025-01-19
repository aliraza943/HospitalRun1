import React from 'react';
import { CgProfile } from "react-icons/cg";
import '../styles/header.css';

const Header = () => {
    return (
        <div className="header">
            <CgProfile className="icon" />
        </div>
    );
};

export default Header;
