"use client";
import React, { useState } from "react";
import classNames from "classnames";
import { PiHandWavingThin } from "react-icons/pi";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import "../styles/Header.css";
import { useSideBarToggle } from "../hooks/use-sidebar-toggle";

const Header: React.FC = () => {
  const { toggleCollapse } = useSideBarToggle();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleProfileClick = () => {
    // window.location.href = "/admin/profile"; // Chuyển hướng tới trang profile
  };

  const handleLogout = () => {
    
  };

  const headerStyle = classNames({
    ["header isWide"]: !toggleCollapse,
    ["header isNarrow"]: toggleCollapse,
  });

  return (
    <div className={headerStyle}>
      <div className="hello">
        <div className="first-line">
          Hello!! {<PiHandWavingThin className="icon" size={25} />}
        </div>
        <div className="second-line">Welcome back!</div>
      </div>

      <div className="right-items">

        <div className="notification">
          <IoNotificationsOutline size={20} />
        </div>

        <div className="user-setting">
          <FaUserCircle
            size={35}
            className="user-icon"
            onClick={toggleDropdown}
          />
          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleProfileClick}>
                <FaUserCircle className="dropdown-icon" /> Profile
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                <FaSignOutAlt className="dropdown-icon" /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Header);
