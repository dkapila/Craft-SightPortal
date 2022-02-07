import { v4 as uuidv4 } from 'uuid';

import {
  FrequencyFilterType,
  FrequencyResult,
  PortalResultBlock,
} from 'src/Types';

import stopWordListEn from '../config/stopWords';

const applySortFilters = (results: FrequencyResult[], filter: FrequencyFilterType) => {
  filter.frequencyColumns.forEach((column) => {
    if (column.sortOrder === 'None') {
      return;
    }

    let sortFirstItemBeforeSecond = 1;
    let sortSecondItemBeforeFirst = -1;

    if (column.sortOrder === 'Descending') {
      sortFirstItemBeforeSecond = -1;
      sortSecondItemBeforeFirst = 1;
    }

    results.sort((firstItem, secondItem) => {
      if (firstItem[column.type] > secondItem[column.type]) {
        return sortFirstItemBeforeSecond;
      }
      if (firstItem[column.type] < secondItem[column.type]) {
        return sortSecondItemBeforeFirst;
      }

      return 0;
    });
  });

  return results;
};

const reverseString = (str: string) => str.split('').reduce((reversed, character) => character + reversed, '');

const getFrequencyData = (blockResults: PortalResultBlock[], filter: FrequencyFilterType) => {
  const stopWordMap: { [key: string]: boolean } = {};
  stopWordListEn.forEach((item) => { stopWordMap[item] = true; });
  const results: FrequencyResult[] = [];
  const isSubpagesEnabled = filter.includeSubPages;

  const fullString = blockResults.map((item) => {
    if (isSubpagesEnabled) {
      return item.portalBlock.fullString;
    }
    if (!isSubpagesEnabled && item.level <= 1) {
      return item.portalBlock.fullString;
    }

    return '';
  }).join(' ');

  const frequencyMap: { [name: string]: number } = {};
  fullString.split(' ').forEach((newWord) => {
    let word = newWord.trim();
    word = word.replace(/^([\p{P}]*)/gu, '');
    word = reverseString(reverseString(word).replace(/^([\p{P}]*)/gu, ''));
    word = word.charAt(0).toUpperCase() + word.slice(1);
    if (word === '' || word.length === 1) {
      return;
    }

    if (word in frequencyMap) {
      frequencyMap[word] += 1;
    } else {
      frequencyMap[word] = 1;
    }
  });

  Object.keys(frequencyMap).forEach((key: string) => {
    if (!filter.includeStopWords && stopWordMap[key.toLowerCase()] !== undefined) {
      return;
    }

    results.push({
      word: key,
      length: key.length,
      frequency: frequencyMap[key],
      id: uuidv4(),
    });
  });

  return applySortFilters(results, filter);
};

export default getFrequencyData;
