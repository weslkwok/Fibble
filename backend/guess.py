import random

class Guess:
    def __init__(self, guess: str, correct: list, almost: list, lie: int):
        self.guess = guess
        self.correct = correct
        self.almost = almost
        self.lie = lie
    
    def to_dict(self):
        return {
            'guess': self.guess,
            'correct': self.correct,
            'almost': self.almost,
            'lie': self.lie,
        }

# generate guesses for a goal until goal found or 9 guesses made  
def generate_guesses(goal: str):
    guesses = []
    
    for _ in range(9):
        guess = ""
        for _ in range(5):
            guess += random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
        guesses.append(judge_guess(guess, goal))
        
    return guesses

# assign correct and almost values given a guess and goal
def judge_guess(guess: str, goal: str):
    correct = []
    almost = []
    lie = None
    
    for i, letter in enumerate(guess):
        if letter == goal[i]:
            correct.append(i)
        elif letter in goal:
            almost.append(i)
    
    lie = random.randint(0, 4)
    if lie in correct:
        coinflip = random.randint(0, 1)
        correct.remove(lie)
        if coinflip:
            almost.append(lie)
    elif lie in almost:
        coinflip = random.randint(0, 1)
        almost.remove(lie)
        if coinflip:
            correct.append(lie)
    else:
        coinflip = random.randint(0, 1)
        if coinflip:
            correct.append(lie)
        else:
            almost.append(lie)    
    
    return Guess(guess, correct, almost, lie)