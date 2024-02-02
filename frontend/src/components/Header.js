import { IoMenu } from "react-icons/io5";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { MdLeaderboard } from "react-icons/md";
import { FaGear } from "react-icons/fa6";
import Popup from "reactjs-popup";
import { useState } from "react";
import Switch from "@mui/material/Switch";
import { grey } from "@mui/material/colors";
import { alpha, styled } from '@mui/material/styles';

import "./Header.css";
import { useTheme } from "./ThemeContext";

// just used to change color of darkmode switch :|
const WhiteSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: grey[200],
      '&:hover': {
        backgroundColor: alpha(grey[200], theme.palette.action.hoverOpacity),
      },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: grey[200],
    },
  }));

export default function Header({ setSideBar }) {
    // openHelp is the boolean value of whether the help modal is open or not
    const [openHelp, setOpenHelp] = useState(true);
    const closeModalHelp = () => setOpenHelp(false);

    // openSettings is the boolean value of whether the settings modal is open or not
    const [openSettings, setOpenSettings] = useState(false);
    const closeModalSettings = () => setOpenSettings(false);

    // darkMode is the boolean value of whether dark mode is on or not
    const { darkMode, toggleDarkMode, theme } = useTheme();

    const handleChange = (event) => {
        toggleDarkMode();
    };

    return (
        <header style = {{backgroundColor:theme.background}}>
            <Popup
                open={openHelp}
                contentStyle = {{background: theme.background}}
                overlayStyle = {{background: "rgb(86, 86, 86, 0.25)"}}
                closeOnDocumentClick
                onClose={closeModalHelp}
                modal
            >
                {(close) => (
                    <div className="modal" style={{color: theme.text}}>
                        <button className="close" onClick={close}>
                            &times;
                        </button>
                        <h1 className="Headings">How To Play</h1>
                        <h2 className="Headings">Guess the Fibble in 9 tries.</h2>
                        <ul>
                            <li>Each guess must be a valid 5-letter word.</li>
                            <li>Each row has one lie!</li>
                            <li>
                                The color of the tiles will change to show how
                                close your guess was to the word.
                            </li>
                            <ul>
                                <li>
                                    <span style={{color: "rgb(54, 153, 72)"}}>Green</span> means
                                    the letter is in the correct position.
                                </li>
                                <li>
                                    <span style={{color: "rgb(190, 190, 16)"}}>Yellow</span> means
                                    the letter is in the word but in the wrong
                                    position.
                                </li>
                                <li>
                                    <span style={{color: "red"}}>Red</span> means
                                    the letter is the lie.
                                </li>
                            </ul>
                        </ul>
                    </div>
                )}
            </Popup>
            <Popup
                open={openSettings}
                style={{backgroundColor: 'red'}}
                contentStyle = {{background: theme.background}}
                overlayStyle = {{background: "rgb(86, 86, 86, 0.25)"}}
                closeOnDocumentClick
                onClose={closeModalSettings}
                modal
            >
                {(close) => (
                    <div className="modal" style={{color: theme.text}}>
                        <button className="close" onClick={close}>
                            &times;
                        </button>
                        <h1>Settings</h1>
                        <div className="settingsRow">
                            <h2 className="Headings">Dark Mode</h2>
                            <WhiteSwitch
                                checked={darkMode}
                                onChange={handleChange}
                                inputProps={{ "aria-label": "controlled" }}
                                color="warning"
                            />
                        </div>
                    </div>
                )}
            </Popup>
            <div className="LeftHeader">
                <IoMenu className="Icon" style = {{color:theme.text}} onClick={() => setSideBar((o) => !o)}/>
            </div>
            <h1 className="MidHeader" style = {{color:theme.text}}>Fibble</h1>
            <div className="RightHeader">
                <button
                    className="iconButton"
                    onClick={() => setOpenHelp((o) => !o)}
                >
                    <HiOutlineQuestionMarkCircle className="Icon" style = {{color:theme.text}}/>
                </button>
                <button className="iconButton">
                    <MdLeaderboard className="Icon" style = {{color:theme.text}}/>
                </button>

                <button
                    className="iconButton"
                    onClick={() => setOpenSettings((o) => !o)}
                >
                    <FaGear className="Icon" style = {{color:theme.text}}/>
                </button>
            </div>
        </header>
    );
}
