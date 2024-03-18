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
        self.entropy = None
        self.actual_bits = None
        self.possibilities = None
        self.uncertainty = None
        self.guesses_to_entropy = None
    
    def to_dict(self):
        return {
            'guess': self.guess,
            'correct': list(self.correct),
            'almost': list(self.almost),
            'wrong': list(self.wrong),
            'lie': self.lie,
            'expected_entropy': self.entropy,
            'actual_entropy': self.actual_bits,
            'possibilities': self.possibilities,
            'uncertainty': self.uncertainty,
            'guesses_to_expected_entropy': self.guesses_to_entropy
        }
    
    def to_tuple(self):
        return (frozenset(self.correct), frozenset(self.almost), frozenset(self.wrong))
    
    def copy(self):
        return GuessData(self.guess, self.correct.copy(), self.almost.copy(), self.wrong.copy(), self.lie)

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
def generate_guesses_fibble(goal: str, fibble: bool = True):
    guesses = []
    goal = goal.lower()
    possible_ans = get_word_list(False)
    allowed_guesses = get_word_list(True)
    uncertainty = calculate_bits(1 / len(possible_ans))
    guessData = None
    
    # generate guesses until goal found or 9 guesses made
    for i in range(9):
        if i == 0:
            # determined by 3Blue1Brown to be the best first guess
            guess, expected_entropy, guesses_to_entropy = "slane", 0.0, {"slane": 0.0}
        else:
            guess, expected_entropy, guesses_to_entropy = generate_guess(guessData, possible_ans, allowed_guesses)
        
        # find out how the guess actually did
        guessData = judge_guess(guess, goal, fibble)
        
        # update the guess data
        guessData.uncertainty = round(uncertainty, 2)
        guessData.entropy = expected_entropy
        guessData.guesses_to_entropy = guesses_to_entropy
        guessData.possibilities = len(possible_ans)
        
        # check if the goal has been found
        if len(guessData.correct.difference({guessData.lie})) == 5:
            # uncertainty is now 0 since an answer has been found so the actual bits is the previous uncertainty
            guessData.actual_bits = uncertainty
            guesses.append(guessData)
            print(guessData.to_dict())
            return guesses
        
        # update the possible answers by iterating through all possible lie patterns and union their possible answers
        new_possible_ans = set()
        for pattern in generate_lies(guessData):
            guessDataLie = GuessData(guessData.guess, pattern[0], pattern[1], pattern[2], None)
            possible_ans_for_lie = generate_possible_answers(guessDataLie, possible_ans)
            new_possible_ans = new_possible_ans.union(possible_ans_for_lie)
        possible_ans = new_possible_ans
                
        # update more variables
        actual_bits = uncertainty - calculate_bits(1 / len(possible_ans))
        uncertainty -= actual_bits
        guessData.actual_bits = actual_bits
        guesses.append(guessData)
        
    return guesses

def generate_lies(guessData: GuessData):
    lies = []
    # loop through all the correct letters and generate possible patterns
    for i in guessData.correct:
        copy1 = guessData.copy()
        copy1.correct.remove(i)
        copy1.almost.add(i)
        lies.append(copy1.to_tuple())
        
        copy2 = guessData.copy()
        copy2.correct.remove(i)
        copy2.wrong.add(i)
        lies.append(copy2.to_tuple())
    
    # loop through all the almost letters and generate possible patterns
    for i in guessData.almost:
        copy1 = guessData.copy()
        copy1.almost.remove(i)
        copy1.correct.add(i)
        lies.append(copy1.to_tuple())
        
        copy2 = guessData.copy()
        copy2.almost.remove(i)
        copy2.wrong.add(i)
        lies.append(copy2.to_tuple())
    
    # loop through all the wrong letters and generate possible patterns
    for i in guessData.wrong:
        copy1 = guessData.copy()
        copy1.wrong.remove(i)
        copy1.correct.add(i)
        lies.append(copy1.to_tuple())
        
        copy2 = guessData.copy()
        copy2.wrong.remove(i)
        copy2.almost.add(i)
        lies.append(copy2.to_tuple())
    
    return lies

def generate_guess(guessData: GuessData, possible_ans: set, allowed_guesses: set):
    allowed_guesses_to_avg_entropy = {}
    
    # iterate through all possible patterns
    for pattern in generate_lies(guessData):
        guessDataLie = GuessData(guessData.guess, pattern[0], pattern[1], pattern[2], None)
        
        # generate possible answers given that pattern
        possible_ans_for_lie = generate_possible_answers(guessDataLie, possible_ans)
        
        allowed_guesses_to_entropy_for_lie = {}
        # iterate through all possible guesses
        for guess in possible_ans_for_lie:
            # iterate through all possible answers and add them to their corresponding pattern
            patterns_to_ans = {}
            for ans in possible_ans_for_lie:
                ansData = judge_guess(guess, ans, False)
                
                ansDataTuple = ansData.to_tuple()

                if ansDataTuple in patterns_to_ans:
                    patterns_to_ans[ansDataTuple].add(ans)
                else:
                    patterns_to_ans[ansDataTuple] = set([ans])
            
            # calculate the weighted bits of each pattern
            patterns_to_weighted_bits = {}
            for pattern, ans in patterns_to_ans.items():
                probablity = len(ans) / len(possible_ans_for_lie)
                bits = calculate_bits(probablity)
                # bits of each pattern is weighted by the probability of that pattern occuring
                patterns_to_weighted_bits[pattern] = probablity * bits
            
            # add up all the weighted bits to get the entropy of the guess
            allowed_guesses_to_entropy_for_lie[guess] = sum(patterns_to_weighted_bits.values())
        
        # Create a set of all keys from both dictionaries
        all_keys = set(list(allowed_guesses_to_avg_entropy.keys()) + list(allowed_guesses_to_entropy_for_lie.keys()))
        
        # Create a new dictionary with the average values
        avg_dict = {}
        for key in all_keys:
            if key in allowed_guesses_to_avg_entropy and key in allowed_guesses_to_entropy_for_lie:
                avg_dict[key] = (allowed_guesses_to_avg_entropy[key] + allowed_guesses_to_entropy_for_lie[key]) / 2
            elif key in allowed_guesses_to_avg_entropy:
                avg_dict[key] = allowed_guesses_to_avg_entropy[key]
            else:
                avg_dict[key] = allowed_guesses_to_entropy_for_lie[key]
                
        allowed_guesses_to_avg_entropy = avg_dict
        
    # return the guess with the highest avg entropy (then by alphabetical order desc if there is a tie)
    best_guess = max(allowed_guesses_to_avg_entropy.items(), key=lambda item: (item[1], item[0]))
    return best_guess[0], best_guess[1], allowed_guesses_to_avg_entropy
        

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

def calculate_bits(percent: int):
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
# print(data.to_dict() for data in generate_guesses("TRACE", True))   