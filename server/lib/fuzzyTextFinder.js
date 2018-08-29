const FuzzySet = require('fuzzyset.js');
const converter = require('number-to-words')

// function to load in input json and return amended version with start/end times
module.exports.getSegmentTimes = (input, windowSize) => {
    const words = getBBCFix(input.words);
    const wordTextArray = words.map(a => a.word);
    const stories = input.rundown;
    const outputJSON = input;

    fuzzyWordSet = FuzzySet();

    words.forEach((word, i) => {
        fuzzyWordSet.add(wordTextArray.slice(i, i + windowSize).join(' '));
    });

    let startIndex = 0;

    stories.forEach((storyData, i) => {
        let startTime = 0;
        let confidence = 0;
        let matchedWindowSize = 0;

        const first = getStartObject(words, fuzzyWordSet, storyData.script, startIndex, windowSize);
        if (first) {
            startIndex = first.index;
            startTime = first.start;
            confidence = first.confidence;
            matchedWindowSize = first.matchedWindowSize;
        }

        else {
            const secondSearch = getStartObject(words, fuzzyWordSet, storyData.script, 0, windowSize);
            if (secondSearch) {
                startIndex = secondSearch.index;
                startTime = secondSearch.start;
                confidence = secondSearch.confidence;
                matchedWindowSize = secondSearch.matchedWindowSize;
            }
            else {
                startTime = null;
            }
        }

        outputJSON.rundown[i].start = startTime;
        if (!startTime) outputJSON.rundown[i].end = null;
        outputJSON.rundown[i].confidence = confidence;
        outputJSON.rundown[i].windowSize = matchedWindowSize;
    });

    // Set each story end time as the start of the next - if next is null, keep going until found
    for (let i = 0; i < outputJSON.rundown.length; i++) {
        if (outputJSON.rundown[i].start && !outputJSON.rundown[i].end) {
            for (let j = i + 1; j < outputJSON.rundown.length; j++) {
                if (outputJSON.rundown[j].start) {
                    outputJSON.rundown[i].end = outputJSON.rundown[j].start;
                    outputJSON.rundown[i].transcript = getTranscript(words, outputJSON.rundown[i].start, outputJSON.rundown[j].start);
                    break;
                }
            }
        }

        if (i === outputJSON.rundown.length - 1) {
            outputJSON.rundown[i].end = words[words.length - 1].end;
            outputJSON.rundown[i].transcript = getTranscript(words, outputJSON.rundown[i].start, words[words.length - 1].start);
        }
    }

    outputJSON.wordchunks = windowSize;
    outputJSON.orphaned = [];

    // Set the orphaned property to be the transcript words before the first matched story
    for (let i = 0; i < outputJSON.rundown.length; i++) {
      if (outputJSON.rundown[i].start) {
        outputJSON.orphaned = getTranscript(words, words[0].start, outputJSON.rundown[i].start)
        break;
      }
    }

    delete outputJSON.words;

    return outputJSON;
}

// return word object for first word of segment
function getStartObject(words, fuzzyWordSet, runningOrder, startIndex, windowSize) {
    let searchWords = getFirstWords(runningOrder, windowSize);
    let fuzzySearch = fuzzyWordSet.get(searchWords);
    let fuzzySearchResult;
    let bestResult = ['', 0];
    let shift = 0;

    // if a confident match (80% or higher) is found, take that as the starting position
    if (fuzzySearch) {
        if (fuzzySearch[0][0] >= 0.75) {
            fuzzySearchResult = fuzzySearch[0][1];
            const wordPosition = getWordPosition(startIndex, words, fuzzySearchResult, windowSize);

            if (wordPosition) {
                return {
                    index: wordPosition,
                    start: words[wordPosition].start,
                    confidence: fuzzySearch[0][0],
                    matchedWindowSize: windowSize
                }
            }
        } else {
            // try different window sizes to find a higher confidence score
            for (let i = windowSize - 2; i < windowSize + 4; i++) {
                searchWords = getFirstWords(runningOrder, i);
                fuzzySearch = fuzzyWordSet.get(searchWords);

                if (fuzzySearch) {
                    if (fuzzySearch[0][0] > bestResult[0]) {
                        bestResult = fuzzySearch[0];
                        bestResult.matchedWindowSize = i;
                    }
                }
            }

            // try and shift starting point of rundown 'capture words'
            for (let i = 1; i < 15; i++) {
                searchWords = getFirstWords(runningOrder.split(' ').slice(i).join(' '), windowSize);
                fuzzySearch = fuzzyWordSet.get(searchWords);

                if (fuzzySearch) {
                    if (fuzzySearch[0][0] > bestResult[0]) {
                        bestResult = fuzzySearch[0];
                        shift = i;
                    }
                }
            }

            if (bestResult[0] >= 0.75) {
                fuzzySearchResult = bestResult[1];
                let wordPosition = getWordPosition(startIndex, words, fuzzySearchResult, windowSize);

                // if there's a shift, loop back through shift + 8 many words and find the word with the biggest time difference
                if (shift !== 0){
                  const returnedWord = words[getWordPosition(0, words, fuzzySearchResult, windowSize)]
                  const returnedWordPos = returnedWord.index
                  let biggestDifference = 0;

                    if (returnedWordPos > shift + windowSize) {
                      for (let i = returnedWordPos - (shift + windowSize); i < returnedWordPos - 1; i++) {
                         if (words[i + 1].start - words[i].start > biggestDifference){
                           biggestDifference = words[i + 1].start - words[i].start
                           wordPosition = i + 1;
                        }
                      }
                    }
                }


                if (wordPosition) {
                    return {
                        index: wordPosition,
                        start: words[wordPosition].start,
                        confidence: bestResult[0],
                        matchedWindowSize: bestResult.matchedWindowSize
                    }
                }
            }
        }
    }

    return null;
}

// return first x words from string and replace any punctuation
// change numbers in rundown into word equivalent so it matches with kaldi
function getFirstWords(str, windowSize) {
    // regular expression variables to remove punctuation - except apostrophe's
    const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
    const stringWithoutPunc = str.toLowerCase().replace(punctRE, '').split(/\s+/)

    stringWithoutPunc.forEach((word, i) => {
        if (word) {
            if (!isNaN(word) && word !== '\n') {
                let convertedWords = converter.toWords(word).replace(punctRE, ' ').replace('  ', ' ');
                stringWithoutPunc.splice(i, 1);

                convertedWords.split(' ').forEach((word, j) => {
                    stringWithoutPunc.splice(i + j, 0, word);
                });
            }
        }
    });

    return stringWithoutPunc.slice(0, windowSize).join(' ');
}

// return first word object from fuzzy search result
// match first word, then try looping through the next 7 to compare and get the correct instance of the word
function getWordPosition(startIndex, words, fuzzSearchResult, windowSize) {
    const fuzzySearchResultArray = fuzzSearchResult.split(' ');

    Loop1:
    for (let i = startIndex; i < words.length; i++) {
        if (words[i].word === fuzzySearchResultArray[0]) {
          Loop2:
            for (let j = 1; j < windowSize; j++) {
                if (words[i + j].word === fuzzySearchResultArray[0 + j]) {
                    if (j === windowSize - 1) {
                        return i;
                    }
                } else {
                    break Loop2;
                }
            }
        }
    }
}

// loop through word array, change b. b. c. / b. c. to bbc and return amended word array
function getBBCFix(words) {
    words.forEach((word, i) => {
        if (words[i].word === 'b.') {
            if (words[i + 1].word === 'b.') {
                if (words[i + 2].word === 'c.') {
                    words.splice(i + 1, 2);
                    words[i].word = 'bbc';
                    words[i].punct = 'BBC';
                }
            } else if (words[i + 1].word === 'c.') {
                  words.splice(i + 1, 1);
                  words[i].word = 'bbc';
                  words[i].punct = 'BBC';
              }
        }
   });

   return words;
}

// loop through kaldi rundown and return word array based on start and end timeout
function getTranscript(words, start, end) {
    let startPos = 0;
    let endPos = 0;
    words.forEach((word, i) => {
        if (words[i].start === start){
            startPos = i;
        }

        if (words[i].start === end){
            endPos = i;
        }
    })

   return words.slice(startPos, endPos);
}
