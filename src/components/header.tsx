"use client";
import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { PiHandWavingThin } from "react-icons/pi";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import "../styles/Header.css";
import { useSideBarToggle } from "../hooks/use-sidebar-toggle";
import { useAuth } from "../context/AuthContext";

const Header: React.FC = () => {
  const { toggleCollapse } = useSideBarToggle();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout } = useAuth();

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  const handleProfileClick = () => {
    window.location.href = "/profile";
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/auth";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

        <div className="user-setting" ref={dropdownRef}>
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
