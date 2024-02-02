import "./Board.css";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { FaChevronRight } from "react-icons/fa";
import { FaChevronLeft } from "react-icons/fa";
import { HiMiniXMark } from "react-icons/hi2";

export default function Board({
    guesses,
    setGuesses,
    step,
    resultFocused,
    results,
    setResultFocused,
}) {
    // list is the array of guesses that are visible on the main board
    // guesses[:step] if resultFocused is null, else results[resultFocused]
    const [list, setList] = useState([]);
    const { theme } = useTheme();

    // updates list to either the main or sidebar results
    useEffect(() => {
        let newList = [];

        // if resultFocused is null, then list shows sideBar results
        if (typeof resultFocused === "undefined" || resultFocused === null) {
            newList = guesses.slice(0, step);
        } else {
            newList = results[resultFocused];
        }
        
        // list needs to be padded with empty spaces to be 9 words long
        setList((prevList) => {
            while (newList.length < 9) {
                newList.push({
                    guess: "     ",
                    correct: [],
                    almost: [],
                    lie: null,
                });
            }

            return newList;
        });
    }, [guesses, step, resultFocused]);

    // also displays controls for sidebar results if resultFocused is not null
    return (
        <div className= "EntireBoard">
            <div className="Board">
                {console.log("list", list)}
                {list.map((word, wordIndex) => (
                    <div key={wordIndex} className="Row">
                        {word.guess.split("").map((letter, letterIndex) => (
                            <div
                                key={letterIndex}
                                className="Letter"
                                style={{
                                    color: theme.text,
                                    backgroundColor: word.correct.includes(
                                        letterIndex
                                    )
                                        ? "rgb(54, 153, 72)"
                                        : word.almost.includes(letterIndex)
                                        ? "rgb(190, 190, 16)"
                                        : "transparent",
                                    border:
                                        word.lie === letterIndex
                                            ? "3px solid red"
                                            : "2px solid rgb(86, 86, 86)",
                                }}
                            >
                                {letter}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {resultFocused != null && (
                <div className="ResultsControls">
                    <button
                        className="Run"
                        style={{
                            backgroundColor: theme.backgroundSecondary,
                            color: theme.text,
                        }}
                        onClick={(prevResultFocused) => {
                            setResultFocused((prevResultFocused) => {
                                return prevResultFocused - 1 >= 0
                                    ? prevResultFocused - 1
                                    : prevResultFocused;
                            });
                        }}
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        className="Stop StopResults"
                        style={{
                            backgroundColor: theme.backgroundSecondary,
                            color: theme.text,
                        }}
                        onClick={() => {
                            setResultFocused(null);
                        }}
                    >
                        <HiMiniXMark />
                    </button>
                    <button
                        className="Run"
                        style={{
                            backgroundColor: theme.backgroundSecondary,
                            color: theme.text,
                        }}
                        onClick={() => {
                            setResultFocused((prevResultFocused) => {
                                return prevResultFocused + 1 < results.length
                                    ? prevResultFocused + 1
                                    : prevResultFocused;
                            });
                        }}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
}
