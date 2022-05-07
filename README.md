# Bogdle

A Boggle clone, visually-inspired by [Wordle](https://nytimes.com/games/wordle), and mechanically-inspired by [Wordsmyth](https://apps.apple.com/us/app/wordsmyth-a-daily-word-game/id1534959553) (and a little by [Crosswordle](https://crosswordle.vercel.app)).

## Animation

Animation is provided by [Animate.css](https://animate.style), a very cool drop-in CSS file that allows you to add simple animations to things easily.

## Audio

There are a few optional sound effects to turn on. Loading is done through [CacheStorage](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage) to avoid making a bunch of needless XHR calls.

## Dictionary

I always wanted a quick way to look up an unknown-to-me word in a game, so I added a quick lookup. Thanks to [Free Dictionary API](https://api.dictionaryapi.dev) for existing!

## License

All parts of this app are free to use and abuse under the [open-source MIT license](LICENSE.md), although the list of English words was taken and modified from the below word lists.

* [small (~25k) - github/dolph/dictionary](https://raw.githubusercontent.com/dolph/dictionary/master/popular.txt)
* [medium (~138k) - github/benhoyt/boggle](https://raw.githubusercontent.com/benhoyt/boggle/master/word-list.txt)
* [large (~370k) - github/dwyl/english-words](https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt)
