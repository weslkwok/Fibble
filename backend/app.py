from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import random

from guess import generate_guesses

app = Flask(__name__)
CORS(app)


# returns guesses for each goal given
@app.route('/guess', methods=['POST'])
def get_guesses():
    rounds = []
    
    for goal in request.json['goals']:
        print(goal)
        rounds.append([guess.to_dict() for guess in generate_guesses(goal)])
        
    return jsonify(rounds)


@app.route('/', methods=['GET'])
def index():
    return ""

# 5001 bc 5000 doesn't work for me (something to do with Macs I dunno)
if __name__ == '__main__':
    app.run(debug=True, port=5001)