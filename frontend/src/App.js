import "./App.css";
import Header from "./components/Header";
import Board from "./components/Board";
import Controls from "./components/Controls";
import { ThemeProvider } from "./components/ThemeContext";
import { useState } from "react";
import { useTheme } from "./components/ThemeContext";
import Sidebar from "./components/Sidebar";

function MainPage() {
    // goal is the inputted word of the main board
    // ex: "Hello"
    const[goal, setGoal] = useState("");

    // guesses is the array of guesses for goal for the main board
    // ex: [{guess: "Hello", correct: [0, 1, 4], almost: [3], lie: 3}, ...]
    const[guesses, setGuesses] = useState([]);

    // step is the current step of the main board
    // ex: 0-8
    const[step, setStep] = useState(0);

    // sideBar is the boolean value of whether the sidebar is open or not
    const[sideBar, setSideBar] = useState(false);

    // resultFocused is the index of the result that is currently focused
    const[resultFocused, setResultFocused] = useState(null);

    // results is the array of results for goals in the sidebar
    const [results, setResults] = useState([]);

    const { theme } = useTheme();

    return (
        <div className="App" style={{ backgroundColor: theme.background }}>
            <Header setSideBar={setSideBar}/>
            <div className="Main">
                <Sidebar sideBar={sideBar} setSideBar={setSideBar} setResultFocused={setResultFocused} results={results} setResults={setResults} resultFocused = {resultFocused}/>
                <div className="Content">
                    <div className="ContentBoard">
                        <Board guesses={guesses} setGuesses={setGuesses} step={step} resultFocused={resultFocused} results={results} setResultFocused={setResultFocused} />
                    </div>
                    {resultFocused === null ? <Controls setGoal={setGoal} setStep={setStep} step={step} guesses={guesses} setGuesses={setGuesses} goal={goal}/> : null}
                </div>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <MainPage />
        </ThemeProvider>
    );
}
