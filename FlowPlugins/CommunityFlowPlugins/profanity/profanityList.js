/**
 * Profanity list categorized by severity level
 * To update this list, modify the arrays below with the words you want to filter
 */
const profanityList = {
  mild: [
    'damn', 'hell', 'ass', 'crap', 'piss', 'god', 'christ', 'jesus', 'butt'
  ],
  medium: [
    'damn', 'hell', 'ass', 'crap', 'piss', 'god', 'christ', 'jesus', 'butt',
    'shit', 'bitch', 'bastard', 'dick', 'prick', 'arse', 'boob', 'boobs', 'tit', 'tits',
    'anal', 'anus', 'balls', 'butthole', 'dumbass', 'negro', 'nipple', 'nipples',
    'penis', 'poop', 'pussy', 'vagina'
  ],
  strong: [
    'damn', 'hell', 'ass', 'crap', 'piss', 'god', 'christ', 'jesus', 'butt',
    'shit', 'bitch', 'bastard', 'dick', 'prick', 'arse', 'boob', 'boobs', 'tit', 'tits',
    'anal', 'anus', 'balls', 'butthole', 'dumbass', 'negro', 'nipple', 'nipples',
    'penis', 'poop', 'pussy', 'vagina',
    'fuck', 'cunt', 'cock', 'twat', 'nigger', 'faggot', 'asshole', 'motherfucker',
    'bullshit', 'fag', 'whore', 'slut', 'dickhead', 'pissed', 'bollocks', 'bugger',
    'goddamn', 'shithead', 'wanker', 'jizz', 'cum', 'spunk', 'rimjob', 'blowjob',
    'handjob', 'jackoff', 'jerkoff', 'wank', 'dildo', 'buttplug', 'arsehole',
    'ballsack', 'boner', 'titties', 'titty', 'hooker', 'hoe', 'ho', 'retard',
    'retarded', 'spastic', 'spaz', 'tranny', 'chink', 'gook', 'kike', 'wetback',
    'beaner', 'spic', 'wop', 'raghead', 'towelhead', 'paki', 'dago', 'mick', 'kraut',
    'jap', 'dyke', 'lesbo', 'homo', 'fudgepacker', 'queef', 'skank', 'minge', 'poon',
    'poonani', 'punani', 'snatch', 'twunt', 'kak', 'cuntface', 'dickwad', 'dickface',
    'dickweed', 'fuckface', 'fuckwit', 'fucktard', 'shitface', 'shitbag', 'douchebag',
    'douche', 'cuntrag', 'dickrag', 'fuckrag', 'fuckboy', 'fuckboi', 'cumbubble',
    'cumguzzler', 'cumslut', 'cumdumpster', 'dicksucker', 'cocksmoker', 'cocksucker',
    'dickless', 'dickhole', 'shithole', 'asswipe', 'asslicker', 'assmuncher',
    'assfucker', 'motherfucking', 'motherfuckin', 'fuckin', 'fucking', 'fucker',
    'fucked', 'fucks', 'fuckoff', 'fuckup', 'fuckwad', 'fuckhead', 'fucknut',
    'fucknugget', 'fuckstick', 'fuckery', 'shitting', 'shitter', 'shitty', 'shits',
    'shitfaced', 'shitstain', 'shitshow', 'bullshitter', 'horseshit', 'chickenshit',
    'dipshit', 'dumbshit', 'goddamnit', 'goddam', 'dammit', 'damnit',
    'anilingus', 'apeshit', 'assmunch', 'ball sack', 'bitches', 'bitching', 'blow job',
    'boobies', 'booby', 'buttcheeks', 'carpet muncher', 'carpetmuncher', 'clit',
    'clitoris', 'clusterfuck', 'cocks', 'coon', 'coons', 'cornhole', 'cumming',
    'cumshot', 'cumshots', 'coccaine', 'daterape', 'deepthroat', 'dong',
    'dumbfuck', 'eat my ass', 'face-fucks', 'fingerbang', 'fisting', 'fuckbox',
    'husk-fucked', 'fuck buttons', 'fuckers', 'fucktards', 'fudge packer',
    'gang bang', 'gangbang', 'gay sex', 'genitals', 'giant cock', 'goatse',
    'god damn', 'hellhole', 'jugs', 'knockers', 'motherfuck', 'motherfuckers',
    'muffdiving', 'nigga', 'niggers', 'piece of shit', 'poopchute', 'rape',
    'raping', 'rapist', 'shitblimp', 'shitheel', 'vibrator', 'god\'s', 'gods',
    'goddamn', 'godspeed', 'god-aweful', 'godaweful', 'god awefull', 'god aweful',
    'godforsaken', 'jesus christ', 'christ\'s'
  ]
};

/**
 * Function to check if a word matches any profanity in the list
 * Uses case-insensitive matching
 * 
 * @param {string} word - The word to check
 * @param {string} level - The profanity filter level (mild, medium, strong)
 * @returns {boolean} - True if the word is profanity, false otherwise
 */
function isProfanity(word, level = 'medium') {
  if (!word) return false;
  
  // Default to medium if invalid level is provided
  const filterLevel = profanityList[level] ? level : 'medium';
  
  // Convert word to lowercase for case-insensitive matching
  const lowerWord = word.toLowerCase();
  
  // Handle contractions and possessives specially to avoid false positives
  // For example, "he'll" should not match "hell", "she's" should not match "ass"
  if (lowerWord.includes("'")) {
    // For contractions, we need to be more careful
    // Don't remove apostrophes for matching
    return profanityList[filterLevel].some(badWord =>
      lowerWord === badWord.toLowerCase()
    );
  } else {
    // For regular words, remove punctuation
    const wordWithoutPunct = lowerWord.replace(/[.,!?;:'"()\-\s]+/g, '');
    
    // Simple case-insensitive exact match, following Bleeper's implementation
    return profanityList[filterLevel].some(badWord =>
      wordWithoutPunct === badWord.toLowerCase().replace(/[.,!?;:'"()\-\s]+/g, '')
    );
  }
}

module.exports = {
  profanityList,
  isProfanity
};