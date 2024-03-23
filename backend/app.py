from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import random

from fibble import generate_guesses_fibble
from wordle import generate_guesses_wordle

app = Flask(__name__)
CORS(app)

global fibble_wins
global fibble_losses
global fibble_guesses

global wordle_wins
global wordle_losses
global wordle_guesses

fibble_wins = 0
fibble_losses = 0
fibble_guesses = 0

wordle_wins = 0
wordle_losses = 0
wordle_guesses = 0

# returns guesses for each goal given
@app.route('/guess', methods=['POST'])
def get_guesses():
    global fibble_wins
    global fibble_losses
    global fibble_guesses

    global wordle_wins
    global wordle_losses
    global wordle_guesses
    rounds = []
    if not request.json['fibble']:
        for goal in request.json['goals']:
            rounds.append([guess.to_dict() for guess in generate_guesses_wordle(goal, request.json['fibble'])])
            if len(rounds[0]) > 9:
                wordle_losses += 1
            else:
                wordle_wins += 1
            wordle_guesses += len(rounds[0])
    else:
        for goal in request.json['goals']:
            rounds.append([guess.to_dict() for guess in generate_guesses_fibble(goal, request.json['fibble'])])
            print(rounds)
            if len(rounds[0]) > 9:
                fibble_losses += 1
            else:
                fibble_wins += 1
            fibble_guesses += len(rounds[0])
    
    print("WORDLE LOSSES:", wordle_losses)
    print("WORDLE WINS:", wordle_wins)
    if (wordle_losses + wordle_wins):
        print("WORDLE TURNS:", (wordle_guesses / (wordle_losses + wordle_wins)))
    print("FIBBLE LOSSES:", fibble_losses)
    print("FIBBLE WINS:", fibble_wins)
    if (fibble_losses + fibble_wins):
        print("FIBBLE TURNS:", (fibble_guesses / (fibble_wins + fibble_losses)))
    return jsonify(rounds)


@app.route('/', methods=['GET'])
def index():
    return ""

# 5001 bc 5000 doesn't work for me (something to do with Macs I dunno)
if __name__ == '__main__':
    app.run(debug=True, port=5001)