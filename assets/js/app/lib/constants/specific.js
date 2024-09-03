/* lib/constants/specific */
/* global specific constants */
/* eslint-disable no-unused-vars */

const BOGDLE_DEFAULT_GAMEMODE = 'daily'

const EMPTY_OBJ_SET_5 = { 4: {}, 5: {} }
const EMPTY_OBJ_SET_7 = { 4: {}, 5: {}, 6: {}, 7: {} }
const EMPTY_OBJ_SET_9 = { 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {} }

const EMPTY_ARR_SET_5 = { 4: [], 5: [] }
const EMPTY_ARR_SET_7 = { 4: [], 5: [], 6: [], 7: [] }
const EMPTY_ARR_SET_9 = { 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] }

const BOGDLE_DEFINE_LOOKUP_URL =
  'https://api.dictionaryapi.dev/api/v2/entries/en'

const BOGDLE_DICT_FILE_ROOT = '/assets/json/'

const BOGDLE_DIFFICULTY = {
  easy: 'small',
  medium: 'small',
  normal: 'small',
}

const BOGDLE_WORD_SOURCES = {
  small: '01_sm',
  medium: '02_md',
  large: '03_lg',
}

const BOGDLE_DIFF_TO_LENGTH = {
  easy: 5,
  medium: 7,
  normal: 9,
}

const BOGDLE_DEFAULT_CONFIG = {
  dictionary: null,
  hintWord: null,
  hintObscuredWord: [],
  hintObscuredWordCounter: 0,
  letters: [],
  seedWordsFile: null,
  solutionSet: EMPTY_OBJ_SET_9,
  tilesSelected: [],
}
const BOGDLE_DEFAULT_STATE = {
  difficulty: 'normal',
  gameState: 'IN_PROGRESS',
  gameWon: false,
  guessedWords: [],
  hintsUsed: 0,
  lastCompletedTime: null,
  lastPlayedTime: null,
  pangramFound: false,
  seedWord: null,
}
const BOGDLE_DEFAULT_SETTINGS = {
  clearWord: true,
  darkMode: false,
  firstTime: true,
  gameMode: 'daily',
  noisy: false,
}

const BOGDLE_DEFAULTS = {
  config: {
    daily: { ...BOGDLE_DEFAULT_CONFIG },
    free: { ...BOGDLE_DEFAULT_CONFIG },
  },
  state: {
    daily: [{ ...BOGDLE_DEFAULT_STATE }],
    free: [{ ...BOGDLE_DEFAULT_STATE }],
  },
  settings: BOGDLE_DEFAULT_SETTINGS,
}
