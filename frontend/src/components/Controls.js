import { GrPowerReset } from "react-icons/gr";
import { VscRunAll } from "react-icons/vsc";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import { MdSubdirectoryArrowLeft } from "react-icons/md";
import { FaRegSquare } from "react-icons/fa";

import "./Controls.css";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeContext";
import wordsData from "../assets/words.json";

export default function Controls({
    setGoal,
    setStep,
    step,
    guesses,
    setGuesses,
    goal,
}) {
    // text is the inputted word for the main board (not the goal)
    // goal is set to text when the submit button is clicked
    const [text, setText] = useState("");

    // isIncrementing is the boolean value of whether step is incrementing or not
    const [isIncrementing, setIsIncrementing] = useState(false);

    // error is the error message that is displayed when the inputted word is invalid
    const [error, setError] = useState("");
    const { theme } = useTheme();

    // need to use refs bc of the async nature of the incrementStep function
    const stepRef = useRef(step);
    const isIncrementingRef = useRef(isIncrementing);
    const guessesRef = useRef(guesses);

    // fetches the guesses for the goal when the goal is set
    useEffect(() => {
        if (goal === "") {
            return;
        }
        stopIncrementing();
        setStep(0);
        fetch("http://127.0.0.1:5001/guess", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ goals: [goal] }),
        })
            .then((response) => response.json())
            .then((data) => {
                setGuesses(data[0]);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }, [goal]);

    // updates the stepRef when step is updated
    useEffect(() => {
        stepRef.current = step;
    }, [step]);

    // updates the isIncrementingRef when isIncrementing is updated
    useEffect(() => {
        isIncrementingRef.current = isIncrementing;
        incrementStep();
    }, [isIncrementing]);

    // updates the guessesRef when guesses is updated
    useEffect(() => {
        guessesRef.current = guesses;
    }, [guesses]);

    // continues to increment step until isIncrementing is false or step is 8
    const incrementStep = () => {
        // console.log("incrementStep", stepRef.current, isIncrementingRef.current);
        if (
            isIncrementingRef.current &&
            stepRef.current <= 8 &&
            stepRef.current < guessesRef.current.length
        ) {
            setTimeout(() => {
                if (
                    isIncrementingRef.current &&
                    stepRef.current <= 8 &&
                    stepRef.current < guessesRef.current.length
                ) {
                    setStep((prevStep) =>
                        prevStep <= 8 ? prevStep + 1 : prevStep
                    );
                    incrementStep();
                }
                else {
                    setIsIncrementing(false);
                }
            }, 300);
        }
    };

    const startIncrementing = () => {
        setIsIncrementing(true);
    };

    const stopIncrementing = () => {
        setIsIncrementing(false);
    };

    // picks a random word from the list of known words
    const pickRandomWord = () => {
        const randomIndex = Math.floor(Math.random() * wordsData.length);
        return wordsData[randomIndex].toUpperCase();
    };

    return (
        <div className="Controls">
            <div className="ControlsRow">
                <button
                    className="Run"
                    style={{
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                    }}
                    onClick={() => {
                        startIncrementing();
                    }}
                >
                    <VscRunAll />
                </button>
                <button
                    className="Reset"
                    style={{
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                    }}
                    onClick={() => {
                        stopIncrementing();
                        setStep(0);
                    }}
                >
                    <GrPowerReset />
                </button>
                <button
                    className="Out"
                    style={{
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                    }}
                    onClick={() => {
                        stopIncrementing();
                        setStep((prevStep) => {
                            // console.log("Out", stepRef.current);
                            return prevStep > 0 ? prevStep - 1 : prevStep;
                        });
                    }}
                >
                    <MdSubdirectoryArrowLeft />
                </button>
                <button
                    className="In"
                    style={{
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                    }}
                    onClick={() => {
                        stopIncrementing();
                        setStep((prevStep) => {
                            // console.log("In", stepRef.current, guessesRef.current.length);
                            return prevStep < 9 &&
                                prevStep < guessesRef.current.length
                                ? prevStep + 1
                                : prevStep;
                        });
                    }}
                >
                    <MdSubdirectoryArrowRight />
                </button>
                <button
                    className="Stop"
                    style={{
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                    }}
                    onClick={() => {
                        stopIncrementing();
                    }}
                >
                    <FaRegSquare />
                </button>
            </div>

            <div className="ControlsRow">
                <h3 style={{ color: theme.text }}>Word: </h3>
                <input
                    type="text"
                    className="Input"
                    placeHolder="5-Letter Word"
                    maxLength="5"
                    onChange={(e) => {
                        setText(
                            e.target.value
                                .toUpperCase()
                                .replace(/[^A-Za-z]/gi, "")
                        );
                    }}
                    value={text}
                />
                <button
                    className="Random"
                    style={{ backgroundColor: theme.backgroundTertiary }}
                    onClick={() => {
                        setText(pickRandomWord());
                    }}
                >
                    <img
                        className="Dice"
                        src="https://static.vecteezy.com/system/resources/previews/009/385/437/non_2x/casino-dice-clipart-design-illustration-free-png.png"
                        alt="dice"
                    />
                </button>
                <button
                    className="Submit"
                    style={{
                        backgroundColor: theme.backgroundTertiary,
                        color: theme.text,
                    }}
                    onClick={() => {
                        if (
                            text.length !== 5 ||
                            !wordsData.includes(text.toLowerCase())
                        ) {
                            setError(
                                "Text must be 5 letters long and in the list of known words."
                            );
                        } else {
                            setError("");
                            setGoal(text);
                        }
                    }}
                >
                    Submit
                </button>
            </div>
            <div className="Error">
                {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
            </div>
        </div>
    );
}
