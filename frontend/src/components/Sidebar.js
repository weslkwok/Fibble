import "./Sidebar.css";
import { FaDice } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { VscRunAll } from "react-icons/vsc";
import { GrPowerReset } from "react-icons/gr";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import wordsData from "../assets/words.json";

function SetUp({
    sideBar,
    words,
    setWords,
    setResults,
    goals,
    setGoals
}) {
    // Errors is the array of indices of words that are invalid
    const [Errors, setErrors] = useState([]);
    const { theme } = useTheme();

    const pickRandomWord = () => {
        const randomIndex = Math.floor(Math.random() * wordsData.length);
        return wordsData[randomIndex].toUpperCase();
    };

    // updates results to hold all the guesses for the goals when goals changes
    // goals is only updated when the run button is clicked
    useEffect(() => {
        if (goals.length === 0) {
            return;
        }
        fetch("http://127.0.0.1:5001/guess", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ goals: goals }),
        })
            .then((response) => response.json())
            .then((data) => {
                setResults(data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }, [goals]);

    // only shows if sideBar is true and results is empty
    return (
        <div
            className={sideBar ? "Sidebar active" : "Sidebar"}
            style={{
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
            }}
        >
            <div className="ControlsSideBar">
                <h1
                    className="Header"
                    style={{
                        color: theme.text,
                    }}
                >
                    Consecutive Run
                </h1>
                <div className="Buttons">
                    <button
                        className="Run"
                        style={{
                            backgroundColor: theme.backgroundTertiary,
                            color: theme.text,
                        }}
                        onClick={() => {
                            let errorsFound = false;

                            // sets all empty words to random words
                            // but errors for invalid words
                            for (let i = 0; i < words.length; i++) {
                                if (words[i] === "") {
                                    words[i] = pickRandomWord();
                                } else if (
                                    words[i].length !== 5 ||
                                    !wordsData.includes(words[i].toLowerCase())
                                ) {
                                    setErrors((prevErrors) => {
                                        let newErrors = [...prevErrors];
                                        newErrors.push(i);
                                        return newErrors;
                                    });
                                    errorsFound = true;
                                } else {
                                    setErrors((prevErrors) => {
                                        let newErrors = [...prevErrors];
                                        newErrors = newErrors.filter(
                                            (error) => error !== i
                                        );
                                        return newErrors;
                                    });
                                }
                            }
                            if (errorsFound) return;
                            setGoals(words);
                        }}
                    >
                        <VscRunAll />
                    </button>
                    <button
                        className="Run"
                        style={{
                            backgroundColor: theme.backgroundTertiary,
                            color: theme.text,
                        }}
                        onClick={() => {
                            setWords([""]);
                            setErrors([]);
                        }}
                    >
                        <GrPowerReset />
                    </button>
                    <div className="RowButtons">
                        <button
                            className="Run"
                            style={{
                                backgroundColor: theme.backgroundTertiary,
                                color: theme.text,
                            }}
                            onClick={() => {
                                let newWords = [...words];
                                newWords.push("");
                                setWords(newWords);
                            }}
                        >
                            <FaPlus />
                        </button>
                        <button
                            className="Run"
                            style={{
                                backgroundColor: theme.backgroundTertiary,
                                color: theme.text,
                            }}
                            onClick={() => {
                                if (words.length === 1) return;
                                let newWords = [...words];
                                setErrors((prevErrors) => {
                                    return prevErrors.filter(
                                        (index) => index !== newWords.length
                                    );
                                });
                                newWords.pop();
                                setWords(newWords);
                            }}
                        >
                            <FaMinus />
                        </button>
                    </div>
                </div>
            </div>
            <div className="Attempts">
                {words.map((word, index) => (
                    <div
                        key={index}
                        className="Attempt"
                        style={{
                            backgroundColor: theme.backgroundTertiary,
                            color: theme.text,
                        }}
                    >
                        <div className="AttemptRow">
                            <div className="AttemptInput">
                                <h2>{`Word ${index + 1}:`}</h2>
                                <input
                                    type="text"
                                    placeholder="WORD"
                                    value={words[index]}
                                    maxLength="5"
                                    onChange={(e) => {
                                        let newWords = [...words];
                                        newWords[index] = e.target.value
                                            .toUpperCase()
                                            .replace(/[^A-Za-z]/gi, "");
                                        setWords(newWords);
                                    }}
                                    style={{
                                        backgroundColor: Errors.includes(index)
                                            ? theme.red
                                            : theme.backgroundSecondary,
                                        color: Errors.includes(index)
                                            ? "white"
                                            : theme.text,
                                    }}
                                ></input>
                            </div>
                            <button
                                className="Random"
                                style={{
                                    backgroundColor: theme.backgroundSecondary,
                                    color: theme.text,
                                }}
                                onClick={() => {
                                    let newWords = [...words];
                                    newWords[index] = pickRandomWord();
                                    setWords(newWords);
                                }}
                            >
                                <FaDice />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Results({ sideBar, setResults, results, setGoals, goals, setResultFocused, resultFocused }) {
    const { theme } = useTheme();

    useEffect(() => {
        console.log("results", results);
        console.log("results.length", results.length);
        if (results.length > 0) {
            setResultFocused(0);
        }
    }, [results]);

    // only shows if sideBar is true and results is not empty
    return (
        <div
            className={sideBar ? "Sidebar active" : "Sidebar"}
            style={{
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
            }}
        >
            <div className="ControlsSideBar">
                <h1
                    className="Header"
                    style={{
                        color: theme.text,
                    }}
                >
                    Results
                </h1>
                <div className="Buttons">
                    <button
                        className="Run"
                        style={{
                            backgroundColor: theme.backgroundTertiary,
                            color: theme.text,
                        }}
                        onClick={() => {
                            setResults([]);
                            setGoals([]);
                            setResultFocused(null);
                        }}
                    >
                        <GrPowerReset />
                    </button>
                </div>
            </div>
            <div className="Attempts">
                {results.map((result, index) => {
                    // sums the number of correct and almost guesses
                    const green = result.reduce(
                        (sum, guess) => sum + guess.correct.length,
                        0
                    );
                    const yellow = result.reduce(
                        (sum, guess) => sum + guess.almost.length,
                        0
                    );
                    return (
                        <div
                            key={index}
                            className="Attempt"
                            onClick={
                                () => {
                                    setResultFocused(index);
                                }
                            }
                            style={{
                                backgroundColor:
                                    result[result.length - 1].correct.length ===
                                    5
                                        ? "rgb(54, 153, 72)"
                                        : "rgb(190, 190, 16)",
                                color: theme.text,
                                border: resultFocused === index ? "3px solid" : "",
                            }}
                        >
                            <div className="ResultRow">
                                <h2>{`Word ${index + 1}: ${goals[index]}`}</h2>
                                <div className="AttemptOutput">
                                    <p>{`Guesses: ${result.length}`}</p>
                                    <p>{`Correct: ${green}`}</p>
                                    <p>{`Almost: ${yellow}`}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function Sidebar({ sideBar, setSideBar, setResultFocused, results, setResults, resultFocused }) {
    // words is the array of input words for the sidebar
    const [words, setWords] = useState([""]);
    // goals is updated to be words once the run button is clicked
    const [goals, setGoals] = useState([]);

    return results.length === 0 ? (
        <SetUp
            sideBar={sideBar}
            words={words}
            setWords={setWords}
            results={results}
            setResults={setResults}
            setResultFocused={setResultFocused}
            goals={goals}
            setGoals={setGoals}
        />
    ) : (
        <Results
            sideBar={sideBar}
            setResults={setResults}
            results={results}
            goals={goals}
            setGoals={setGoals}
            setResultFocused={setResultFocused}
            resultFocused = {resultFocused}
        />
    );
}
