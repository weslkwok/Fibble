# Fibble Fixer
## CSC 481: Knowledge Based Systems, Cal Poly SLO
### Class instructed by Dr. Rodrigo Canaan

Fibble fixer is a [Fibble](https://fibble.xyz/) solver inspired by [3Blue1Brown's Youtube Video on Solving Wordle via Information Theory](https://www.youtube.com/watch?v=v68zYyaEmEA).

This package requires the use of the following dependencies:

* [Flask](https://flask.palletsprojects.com/en/3.0.x/installation/)
* NPM
* flask_sqlalchemy (pip install it)
* flask_cors (pip install it)

use command "npm run both" while in frontend folder to start both the frontend and backend. This requires the use of Concurrency. Alternatively, you can run "python3 app.y" in the backend folder, and "npm run start" in the frontend folder.

all the logic for fibble guesses should be done in the Python backend.

To validate our results, start up the frontend / backend and use the webpage to generate a bunch of guesses. The results will be logged onto the console on the backend.