import "./RightStats.css";
import { useTheme } from "./ThemeContext";

export default function RightStats({ list, step, resultFocused }) {
    const { theme } = useTheme();
    // if result focused, index is the length of the list - 1
    // else, index is the step - 1
    let index = resultFocused
        ? list.map((item) => item.guess.trim()).filter((item) => item !== "")
              .length - 1
        : step > 0
        ? step - 1
        : 0;

    return (
        <div className="RightStats">
            {console.log(step, list[step])}
            <div className="RightStatsContent">
                <div className="RightStatsTitles">
                    <div
                        className="Letter Title"
                        style={{
                            color: theme.text,
                        }}
                    >
                        Word
                    </div>
                    <div
                        className="Letter Title"
                        style={{
                            color: theme.text,
                        }}
                    >
                        Expected Info
                    </div>
                </div>
                <div className="RightStatsRows">
                    {list !== null &&
                    list !== undefined &&
                    list[index] !== undefined &&
                    list[index].guesses_to_expected_entropy !== undefined
                        ? Object.entries(
                              list[index].guesses_to_expected_entropy
                          )
                              .sort((a, b) => {
                                  // Compare values
                                  if (a[1] > b[1]) return -1;
                                  if (a[1] < b[1]) return 1;

                                  // If values are equal, compare keys
                                  if (a[0] > b[0]) return -1;
                                  if (a[0] < b[0]) return 1;
                              })
                              .map(([guess, entropy], index) => (
                                  <div key={index} className="RightStatsRow">
                                      <div
                                          className={
                                              index === 0
                                                  ? "RightStatsGuesses First"
                                                  : "RightStatsGuesses"
                                          }
                                          style={{
                                              color: theme.text,
                                          }}
                                      >
                                          {guess}
                                      </div>
                                      <div
                                          className={
                                              index === 0
                                                  ? "RightStatsGuesses First"
                                                  : "RightStatsGuesses"
                                          }
                                          style={{
                                              color: theme.text,
                                          }}
                                      >
                                          {entropy.toFixed(4) + "  bits"}
                                      </div>
                                  </div>
                              ))
                        : null}
                </div>
            </div>
        </div>
    );
}
