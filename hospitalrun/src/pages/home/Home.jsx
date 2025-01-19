import React from 'react';
import Header from '../../components/Header';
import SidebarComp from '../../components/Sidebar';
import './home.css';
import Notification from '../../components/Notification';

const Home = () => {
    return (
        <div className="home-container">
            <SidebarComp />
            <div className="main-content">
                <Header />
                <div className="content">
                    <h1 class="text-3xl font-bold  mt-5"  >
                        Dashboard
                    </h1>

                    <Notification />
                </div>
            </div>
        </div>
    );
};

export default Home;
