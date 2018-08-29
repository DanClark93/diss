## fuzzyTextFinder.js

Two parameters are provided to the function:

* An input object, consisting of:
  * A words array of the transcript from Kaldi
  * A rundown array, detailing the `story` and `script` for each section wishing to be segmented
  * A vpid, for distinguishing the alignment job
* A window size - showing the number of words to scope into a fuzzy matching block

---
There are some pre-processing steps before the matching that occur.

* The words array is pre-processed for instances of `b.b.c.` counting as three words
* Because Kaldi transcribes `122` as `one hundred and twenty two`, we get discrepancies between the transcript word count and the rundown word count. This also can cause a loss of accuracy in the fuzzy matching. To counter this, we convert numbers that exist in the rundown to their word-written counterparts.
* A fuzzy set is populated by taking chunks of the transcript (according to the `windowSize` parameter) and adding each possibility to the set. For example:
  * A windowSize of 8 captures first: `Our first report is from our assistant political`, which is added to the set
  * At which point it moves along to: `first report is from our assistant political editor`, and so forth.

Starting with each story in the rundown, we then:
1. Get the first `x` number of words in the rundown (according to `windowSize`)
2. Look for that passage of words in the fuzzy set
3. If a match is found, compare it's confidence score to the set threshold
  * If it's higher than the threshold, search for that passage in the kaldi words array, and return the start time of the first word
  * If not, perform some tweaks in order to get a better match:
    * Loop through various window sizes and attempt to match again, keeping track of the highest match
    * Shift the rundown along (ie. rather than looking for words 1-8 in the fuzzy set, look for 2-9, etc.), and keep track of the best match there.
    * Finally, search for the best matching passage in the kaldi words array, and return the start time of the first word.
    * Keep track of the `startIndex`, so that the subsequent stories only search after the previous one
4. If there is no match using the `startIndex`, repeat step 3, using `0` as the `startIndex`. This is to counteract false matches that stagger the rest of the programme.
