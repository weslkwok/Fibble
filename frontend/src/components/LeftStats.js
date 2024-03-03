import "./LeftStats.css";
import { useTheme } from "./ThemeContext";

export default function LeftStats({ list }) {
    const { theme } = useTheme();

    return (
        <div className="Stats">
            <div className="StatsContent">
                <div className="StatsTitles">
                    <div
                        className="Letter Title"
                        style={{
                            color: theme.text,
                        }}
                    >
                        Possibilities
                    </div>
                    <div
                        className="Letter Title"
                        style={{
                            color: theme.text,
                        }}
                    >
                        Uncertainty
                    </div>
                </div>

                {list.map((word, index) => (
                    <div key={index} className="StatsRow">
                        <div
                            className="Letter"
                            style={{
                                color: theme.text,
                            }}
                        >
                            {word.possibilities}
                        </div>
                        <div
                            className="Letter"
                            style={{
                                color: theme.text,
                            }}
                        >
                            {word.uncertainty !== undefined &&
                            word.uncertainty !== null
                                ? word.uncertainty + " bits"
                                : ""}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
