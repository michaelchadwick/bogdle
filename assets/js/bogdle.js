const MAX_LENGTH = '9'
const SIZE = 26
const DICTIONARY_FILE = "./assets/json/words-simple-test.json"

class TrieNode {
  constructor() {
    this.leaf = false;
    this.Child = new Array(SIZE);

    for (let i = 0; i < SIZE; i++) {
      this.Child[i] = null;
    }
  }
}

class Bogdle {
  M = 3;
  N = 3;
  solution = { "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [] };

  constructor(d, b) {
    this.bogdle = b

    if (d) {
      this.dictionary = d
      this.createSolution()
    } else {
      loadDictionary()
    }
  }

  createSolution = () => {
    console.log(`creating solution for ${MAX_LENGTH}-letter word: ${this.bogdle.flat().join('')}...`)

    let root = new TrieNode();

    // insert all words of dictionary into trie
    let n = this.dictionary.length;

    for (let i = 0; i < n; i++) {
      this.insert(root, this.dictionary[i]);
    }

    // loads all words from dictionary found in bogdle into solution
    this.findWords(this.bogdle, root);
  }

  getSolution = () => {
    return this.solution;
  }

  loadDictionary = () => {
    // grabbing word list from json and then picking random word
    fetch(DICTIONARY_FILE)
      .then((response) => {
        console.log('loadDictionary() got json', response)
        return response.json()
      }).then((wordJson) => {
        console.log('wordJson', wordJson)

        this.dictionary = wordJson

        // random starter word
        // let starterIdx = Math.floor(Math.random() * wordList[MAX_LENGTH].length)
        // this.bogdle = wordList[MAX_LENGTH][starterIdx]

        this.createSolution();
      }).catch((err) => {
        console.error('solution set could not be created', err)
      })
  }

  // If not present, inserts a key into the trie
  // If the key is a prefix of trie node, just marks leaf node
  insert = (root, key) => {
    let n = key.length;
    let pChild = root;

    for (let i = 0; i < n; i++) {
      let index = key[i].charCodeAt(0) - 'A'.charCodeAt(0);

      if (pChild.Child[index] == null) {
        pChild.Child[index] = new TrieNode();
      }

      pChild = pChild.Child[index];
    }

    // make last node as leaf node
    pChild.leaf = true;
  }

  // check that current location (i and j) is in matrix range
  isSafe = (i, j, visited) => {
    return (i >= 0
      && i < this.M
      && j >= 0
      && j < this.N
      && !visited[i][j]
    );
  }

  // A recursive function to find all words present on bogdle
  searchWord = (root, bogdle, i, j, visited, str) => {
    // if we found word in trie / dictionary
    if (root.leaf == true) {
      console.log('found word!', str, str.length);
      this.solution[str.length].push(str);
    } else {
      console.log('word not found', str, str.length);
    }

    // If both I and j in range and we visited
    // that element of matrix first time
    if (this.isSafe(i, j, visited)) {
      // make it visited
      visited[i][j] = true;

      // traverse all child of current root
      for (let K = 0; K < SIZE; K++) {
        if (root.Child[K] != null) {
          // current character
          let ch = String.fromCharCode(K + 'A'.charCodeAt(0));

          // Recursively search remaining characters of word in trie
          // for all 8 adjacent cells of bogdle[i][j]
          if (this.isSafe(i + 1, j + 1, visited)
            && bogdle[i + 1][j + 1] == ch)
            this.searchWord(root.Child[K], bogdle,
                i + 1, j + 1,
                visited, str + ch);
          if (this.isSafe(i, j + 1, visited)
            && bogdle[i][j + 1] == ch)
            this.searchWord(root.Child[K], bogdle,
                i, j + 1,
                visited, str + ch);
          if (this.isSafe(i - 1, j + 1, visited)
            && bogdle[i - 1][j + 1] == ch)
            this.searchWord(root.Child[K], bogdle,
                i - 1, j + 1,
                visited, str + ch);
          if (this.isSafe(i + 1, j, visited)
            && bogdle[i + 1][j] == ch)
            this.searchWord(root.Child[K], bogdle,
                i + 1, j,
                visited, str + ch);
          if (this.isSafe(i + 1, j - 1, visited)
            && bogdle[i + 1][j - 1] == ch)
            this.searchWord(root.Child[K], bogdle,
                i + 1, j - 1,
                visited, str + ch);
          if (this.isSafe(i, j - 1, visited)
            && bogdle[i][j - 1] == ch)
            this.searchWord(root.Child[K], bogdle,
                i, j - 1,
                visited, str + ch);
          if (this.isSafe(i - 1, j - 1, visited)
            && bogdle[i - 1][j - 1] == ch)
            this.searchWord(root.Child[K], bogdle,
                i - 1, j - 1,
                visited, str + ch);
          if (this.isSafe(i - 1, j, visited)
            && bogdle[i - 1][j] == ch)
            this.searchWord(root.Child[K], bogdle,
                i - 1, j,
                visited, str + ch);
        }
      }

      // make current element unvisited
      visited[i][j] = false;
    }
  }

  // Finds all words present in dictionary
  // Adds them to class instance's solution
  findWords = (bogdle,root) => {
    // Mark all characters as not visited
    let visited = new Array(this.M);
    for (let i=0; i < this.M; i++) {
      visited[i] = new Array(this.N);
      for (let j=0; j < this.N; j++) {
        visited[i][j] = false;
      }
    }

    let pChild = root;
    let str = "";

    // traverse all matrix elements
    for (let i = 0; i < this.M; i++) {
      for (let j = 0; j < this.N; j++) {
        // we start searching for word in dictionary
        // if we found a character which is child
        // of Trie root
        if (pChild.Child[(bogdle[i][j]).charCodeAt(0) - 'A'.charCodeAt(0)] != null) {
          str = str + bogdle[i][j];
          this.searchWord(pChild.Child[(bogdle[i][j]).charCodeAt(0) - 'A'.charCodeAt(0)],
              bogdle, i, j, visited, str);
          str = "";
        }
      }
    }
  }
}

function createBogdle() {
  let dictionary = [
    'ANT', 'CAT', 'DOG', 'EAT', 'END', 'FAN', 'HOT', 'MAN', 'MAT', 'RAM', 'RAT', 'SEA',
    'CASE', 'CATS', 'DOGS', 'ELMS', 'LATE', 'MART', 'PUPS', 'RAMS', 'SEAS', 'TRAM',
    'CASES', 'CATCH', 'FLICK', 'PRUNE', 'SANDY',
    'CRYSTAL', 'FLICKS', 'MANGOS', 'PEANUT',
    'DOBERMAN', 'FLICKERS',
    'AARDVARK', 'CRYSTALS', 'DOGHOUSE', 'HOTHOUSE', 'SUITCASE',
    'AARDVARKS', 'CATAMARAN', 'ENDEAVORS', 'POSTULATE'
  ]
  let bogdle = [
    ['C', 'A', 'T'],
    ['A', 'M', 'A'],
    ['R', 'A', 'N']
  ];

  // create new Bogdle instance
  let bogdleInstance = new Bogdle(dictionary, bogdle);
  let solution = bogdleInstance.getSolution();

  console.log(solution)
}



// This code was contributed by rag2127, modified by mjchadwick
