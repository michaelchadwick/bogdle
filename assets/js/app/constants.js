/* constants */
/* set any global app constants */
/* eslint-disable no-unused-vars */

const BOGDLE_STATE_DAILY_KEY = 'bogdle-state-daily'
const BOGDLE_STATE_FREE_KEY = 'bogdle-state-free'

const BOGDLE_SETTINGS_KEY = 'bogdle-settings'

const BOGDLE_DEFINE_LOOKUP_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en'
const BOGDLE_ENV_PROD_URL = [
  'bogdle.fun',
  'bogdle.neb.host'
]
const BOGDLE_DAILY_SCRIPT = './assets/scripts/daily.php'

const BOGDLE_DIFFICULTY = {
  'simple': 'small',
  'easy': 'small',
  'medium': 'small',
  'normal': 'small'
}

const BOGDLE_WORD_SOURCES = {
  'small': '01_sm',
  'medium': '02_md',
  'large': '03_lg'
}

const BOGDLE_DIFF_TO_LENGTH = {
  'simple': 3,
  'easy': 5,
  'medium': 7,
  'normal': 9
}

const EMPTY_OBJ_SET = { '3': {}, '4': {}, '5': {}, '6': {}, '7': {}, '8': {}, '9': {} }
const EMPTY_OBJ_SET_3 = { '3': {} }
const EMPTY_OBJ_SET_5 = { '3': {}, '4': {}, '5': {} }
const EMPTY_OBJ_SET_7 = { '3': {}, '4': {}, '5': {}, '6': {}, '7': {} }

const EMPTY_ARR_SET = { '3': [], '4': [], '5': [], '6': [], '7': [], '8': [], '9': [] }
const EMPTY_ARR_SET_3 = { '3': [] }
const EMPTY_ARR_SET_5 = { '3': [], '4': [], '5': [] }
const EMPTY_ARR_SET_7 = { '3': [], '4': [], '5': [], '6': [], '7': [] }

const BOGDLE_DEFAULTS = {
  'config': {
    'daily': {
      'hintWord': null,
      'hintObscuredWord': [],
      'hintObscuredWordCounter': 0,
      'solutionSet': EMPTY_OBJ_SET
    },
    'free': {
      'hintWord': null,
      'hintObscuredWord': [],
      'hintObscuredWordCounter': 0,
      'solutionSet': EMPTY_OBJ_SET
    }
  },
  'state': {
    'daily': {
      'gameState': 'IN_PROGRESS',
      'guessedWords': [],
      'lastCompletedTime': null,
      'lastPlayedTime': null,
      'seedWord': null,
      'statistics': {
        'gamesPlayed': 0,
        'wordsFound': 0
      }
    },
    'free': {
      'difficulty': 'normal',
      'gameState': 'IN_PROGRESS',
      'guessedWords': [],
      'lastCompletedTime': null,
      'lastPlayedTime': null,
      'seedWord': null,
      'statistics': {
        'gamesPlayed': 0,
        'wordsFound': 0
      }
    }
  },
  'settings': {
    'clearWord': true,
    'darkMode': false,
    'gameMode': 'daily',
    'noisy': false
  }
}

const NEBYOOAPPS_SOURCE_URL = 'https://dave.neb.host/?sites'
