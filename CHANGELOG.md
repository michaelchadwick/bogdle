# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Number of hints used now tracked

### Changed

- Bogdle.config and Bogdle.state getting/setting now use proper functions
- Daily game will have only one pangram
  - Remove 9-letter words that have anagrams of each other.
- `localStorage` now keeps track of all games in object array, not just most recent one in an object
- Moved some functions into their own js files
- Statistics now devised on-the-fly from `localStorage`
- var -> const/let
- Word sources pruned of uncommon and offensive words. Using [nltk](https://www.nltk.org/api/nltk.corpus.html) to assist.

### Removed

- Bogdle.state[mode].statistics
- Semicolons

## [1.0.0] - 2022-10-22

### Added

- Everything
