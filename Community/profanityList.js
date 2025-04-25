/**
 * Profanity list categorized by severity level
 * To update this list, modify the arrays below with the words you want to filter
 */
const profanityList = {
  mild: [
    'damn', 'hell', 'ass', 'crap', 'piss'
  ],
  medium: [
    'damn', 'hell', 'ass', 'crap', 'piss',
    'shit', 'bitch', 'bastard', 'dick', 'prick'
  ],
  strong: [
    'damn', 'hell', 'ass', 'crap', 'piss',
    'shit', 'bitch', 'bastard', 'dick', 'prick',
    'fuck', 'cunt', 'cock', 'pussy', 'twat', 'nigger', 'faggot',
    'asshole', 'motherfucker', 'bullshit', 'fag', 'whore', 'slut',
    'dickhead', 'pissed', 'bollocks', 'bugger', 'goddamn', 'shithead',
    'wanker', 'tits', 'jizz', 'cum', 'spunk', 'rimjob', 'blowjob',
    'handjob', 'jackoff', 'jerkoff', 'wank', 'dildo', 'buttplug',
    'butthole', 'anus', 'arsehole', 'ballsack', 'balls', 'boner',
    'boob', 'boobs', 'tit', 'titties', 'titty', 'hooker', 'hoe',
    'ho', 'retard', 'retarded', 'spastic', 'spaz', 'tranny',
    'chink', 'gook', 'kike', 'wetback', 'beaner', 'spic', 'wop',
    'raghead', 'towelhead', 'paki', 'dago', 'mick', 'kraut',
    'jap', 'dyke', 'lesbo', 'homo', 'fudgepacker', 'queef',
    'skank', 'minge', 'poon', 'poonani', 'punani', 'snatch',
    'twunt', 'kak', 'cuntface', 'dickwad', 'dickface', 'dickweed',
    'fuckface', 'fuckwit', 'fucktard', 'shitface', 'shitbag',
    'douchebag', 'douche', 'cuntrag', 'dickrag', 'fuckrag',
    'fuckboy', 'fuckboi', 'cumbubble', 'cumguzzler', 'cumslut',
    'cumdumpster', 'dicksucker', 'cocksmoker', 'cocksucker',
    'dickless', 'dickhole', 'shithole', 'asswipe', 'asslicker',
    'assmuncher', 'assfucker', 'motherfucking', 'motherfuckin',
    'fuckin', 'fucking', 'fucker', 'fucked', 'fucks', 'fuckoff',
    'fuckup', 'fuckwad', 'fuckhead', 'fucknut', 'fucknugget',
    'fuckstick', 'fuckface', 'fuckwit', 'fuckwad', 'fuckery',
    'shitting', 'shitter', 'shitty', 'shits', 'shitfaced',
    'shithead', 'shitstain', 'shitshow', 'shitbag', 'bullshitter',
    'bullshit', 'horseshit', 'chickenshit', 'dipshit', 'dumbshit',
    'goddamnit', 'goddamn', 'goddam', 'dammit', 'damnit'
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
  const lowerWord = word.toLowerCase().trim();
  
  // Check if the word is in the profanity list for the specified level
  return profanityList[filterLevel].some(badWord => 
    lowerWord === badWord || lowerWord.includes(badWord)
  );
}

module.exports = {
  profanityList,
  isProfanity
};