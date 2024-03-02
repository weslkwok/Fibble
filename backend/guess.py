import random
import json
import string
import os
import math
import statistics

# class to store guess data
class GuessData:
    def __init__(self, guess: str, correct: set, almost: set, wrong: set, lie: int):
        self.guess = guess
        self.correct = correct
        self.almost = almost
        self.wrong = wrong
        self.lie = lie
        self.expected_entropy = None
        self.actual_entropy = None
    
    def to_dict(self):
        return {
            'guess': self.guess,
            'correct': list(self.correct),
            'almost': list(self.almost),
            'wrong': list(self.wrong),
            'lie': self.lie,
            'expected_entropy': self.expected_entropy,
            'actual_entropy': self.actual_entropy
        }
    
    def to_tuple(self):
        return (frozenset(self.correct), frozenset(self.almost))

# gets the file paths for the data files
DATA_DIR = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    "data",
)
POSSIBLE_WORD_LIST_FILE = os.path.join(DATA_DIR, "possible_words.txt")
ALLOWED_WORD_LIST_FILE = os.path.join(DATA_DIR, "allowed_words.txt")
WORD_FREQ_FILE = os.path.join(DATA_DIR, "wordle_words_freqs_full.txt")
WORD_FREQ_MAP_FILE = os.path.join(DATA_DIR, "freq_map.json")

# generate guesses for a goal until goal found or 9 guesses made  
def generate_guesses(goal: str):
    guesses = []
    goal = goal.lower()
    possible_ans = get_word_list(False)
    allowed_guesses = get_word_list(True)
    uncertainty = calculate_entropy(1 / len(possible_ans))
    
    # generate guesses until goal found or 9 guesses made
    for i in range(6):
        if i == 0:
            # determined by 3Blue1Brown to be the best first guess
            guess, expected_entropy = "slane", 0.0
        else:
            guess, expected_entropy = generate_guess(goal, possible_ans, allowed_guesses)
        
        guessData = judge_guess(guess, goal, False)
        guessData.expected_entropy = expected_entropy
        
        if len(guessData.correct) == 5:
            # uncertainty is now 0 since an answer has been found so the actual entropy is the previos uncertainty
            guessData.actual_entropy = uncertainty
            guesses.append(guessData)
            print(guessData.to_dict())
            return guesses
        
        # generate new possible answers
        # print(possible_ans)
        possible_ans = generate_possible_answers(guessData, possible_ans)
        
        actual_entropy = uncertainty - calculate_entropy(1 / len(possible_ans))
        uncertainty -= actual_entropy
        guessData.actual_entropy = actual_entropy
        guesses.append(guessData)
        
        print(guessData.to_dict())
        
    return guesses

def generate_guess(goal: str, possible_ans: set, allowed_guesses: set):
    allowed_guesses_to_expected_entropy = {}
    # iterate through all possible guesses
    for guess in possible_ans:
        # iterate through all possible answers and add them to their corresponding pattern
        patterns_to_ans = {}
        for ans in possible_ans:
            ansData = judge_guess(guess, ans, False)
            
            ansDataTuple = ansData.to_tuple()
            if ansDataTuple in patterns_to_ans:
                patterns_to_ans[ansDataTuple].add(ans)
            else:
                patterns_to_ans[ansDataTuple] = set([ans])
        
        # calculate the weighted entropy of each pattern
        patterns_to_weighted_entropy = {}
        for pattern, ans in patterns_to_ans.items():
            probablity = len(ans) / len(possible_ans)
            entropy = calculate_entropy(probablity)
            # entropy of each pattern is weighted by the probability of that pattern occuring
            patterns_to_weighted_entropy[pattern] = probablity * entropy

        #print(guess, patterns_to_expected_entropy)
        
        # add up all the weighted entropies to get the expected entropy of the guess
        allowed_guesses_to_expected_entropy[guess] = sum(patterns_to_weighted_entropy.values())
        # print(guess, allowed_guesses_to_average_expected_entropy[guess])
    
    # return the guess with the highest expected entropy
    best_guess = max(allowed_guesses_to_expected_entropy, key=allowed_guesses_to_expected_entropy.get)
    return best_guess, allowed_guesses_to_expected_entropy[best_guess]
        

# generate new possible answers from a guess, goal, and previous possible answers
def generate_possible_answers(guessData: GuessData, possible_ans: set):
    # filter out answers that don't match the correct letters
    for i in guessData.correct:
        possible_ans = possible_ans.intersection(words_map[(guessData.guess[i], i)])
        
    # filter out answers that don't match the almost letters
    for i in guessData.almost:
        # get all indexes where the letter could be
        indexes = set(x for x in range(5) if x != i)
        
        # filter out all the indexes in correct bc they are already correct
        indexes = indexes.difference(set(guessData.correct))
        
        # create a set of all words that match the almost letter
        almost_set = set()
        for j in indexes:
            almost_set = almost_set.union(words_map[(guessData.guess[i], j)])
            
        # filter out all words that don't match the almost letter
        possible_ans = possible_ans.intersection(almost_set)
    
    # filter out answers that don't match the wrong letters
    wrong_set = set(range(5)).difference(set(guessData.correct)).difference(set(guessData.almost))
    for i in wrong_set:
        possible_ans = possible_ans.difference(words_map[(guessData.guess[i], i)])
    
    return possible_ans        
    
    
# assign correct and almost values given a guess and goal
def judge_guess(guess: str, goal: str, fibble: bool = True):
    correct = set()
    almost = set()
    lie = None
    goal_list = list(goal)
    guess_list = list(guess)
    
    # find correct letters
    for i, letter in enumerate(guess_list):
        if letter == goal[i]:
            correct.add(i)
            guess_list[i] = None
            
            j = goal_list.index(letter)
            goal_list[j] = None
    
    if len(correct) == 5:
        return GuessData(guess, correct, almost, set(), None)
            
    # find almost letters
    for i, letter in enumerate(guess_list):
        if letter and letter in goal_list:
            almost.add(i)
            guess_list[i] = None
            
            j = goal_list.index(letter)
            goal_list[j] = None
    
    # generate a lie
    if fibble:
        lie = random.randint(0, 4)
        if lie in correct:
            coinflip = random.randint(0, 1)
            correct.remove(lie)
            if coinflip:
                almost.add(lie)
        elif lie in almost:
            coinflip = random.randint(0, 1)
            almost.remove(lie)
            if coinflip:
                correct.add(lie)
        else:
            coinflip = random.randint(0, 1)
            if coinflip:
                correct.add(lie)
            else:
                almost.add(lie)
    
    # create a set of wrong letters      
    wrong = set(range(5)).difference(set(correct)).difference(set(almost)) 
    
    return GuessData(guess, correct, almost, wrong, lie)

# returns a map of (every letter, positions 0-4) to every corresponding word
def map_to_words(words: list):
    # Create a list of letters a-z
    letters = list(string.ascii_lowercase)

    # Create a list of numbers 0-4
    numbers = list(range(5))

    # Create a dictionary with keys as tuples (letter, number)
    word_map = {(letter, number): set() for letter in letters for number in numbers}
    
    # For every word in the list, add it to the word_map
    for word in words:
        for i, letter in enumerate(word):
            word_map[(letter, i)].add(word)
    
    return word_map

def calculate_entropy(percent: int):
    return safe_log2(1 / percent)

# next 3 functions are directly from 3Blue1Brown's video on wordle
def safe_log2(x):
    return math.log2(x) if x > 0 else 0

def get_word_list(all=True):
    result = []
    file = ALLOWED_WORD_LIST_FILE if all else POSSIBLE_WORD_LIST_FILE
    with open(file) as fp:
        result.extend([word.strip() for word in fp.readlines()])
    return set(result)

def get_word_frequencies():
    with open(WORD_FREQ_MAP_FILE) as fp:
        result = json.load(fp)
    return result                                    

words_map = map_to_words(get_word_list(False))
generate_guesses("TRACE")   