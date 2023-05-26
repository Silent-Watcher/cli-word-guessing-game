#!/usr/bin/env node
'use strict';
import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import gradient from 'gradient-string';
import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import * as emoji from 'node-emoji';
import { MAX_ATTEMPTS, WORD_LIST } from './config.js';

const words = WORD_LIST;
const sleep = (ms = 2000) => new Promise((res, rej) => setTimeout(res, ms));
let word,
  points = MAX_ATTEMPTS,
  wordWhiteSpaces;

function addIntro() {
  return new Promise((res, rej) => {
    let introduction = 'Word Guessing Game!';
    figlet(introduction, (error, data) => {
      console.log(gradient.pastel.multiline(data));
    });
  });
}

async function welcome() {
  let welcomeText = chalkAnimation.rainbow('Hello and Welcome !').start();
  await sleep(3000);
  welcomeText.stop();
  console.log(`
 ${emoji.get('smirk')} you will be presented with a ${chalk.blue('hidden word')}
 that you must ${chalk.cyan('guess')} one letter at a time
 Each incorrect guess will deduct points from your score, 
 so ${chalk.magenta('be careful')}!
 Good luck! ${emoji.get('v')}
  `);
}

async function askToStartTheGame() {
  const answers = await inquirer.prompt({
    name: 'askToStart',
    type: 'input',
    message: 'start the game ? \n ',
    default() {
      return 'yes/no';
    },
  });
  await handleQuestion(answers.askToStart == 'yes');
}

async function handleQuestion(isCorrect) {
  const spinner = createSpinner('loading ...').start();
  await sleep();
  if (isCorrect) {
    spinner.success({ text: 'your word is ready !' });
  } else {
    spinner.error({ text: 'ok maybe another time' });
    process.exit(1);
  }
}

function chooseAWord() {
  word = words.at(Math.random() * 20);
  wordWhiteSpaces = '_ ,'.repeat(word.length);
  console.log(`
            ${wordWhiteSpaces}
  `);
}

async function askForLetter() {
  const answers = await inquirer.prompt({
    name: 'askForLetter',
    type: 'input',
    message: 'Enter a letter from a to z ? \n ',
  });
  let PositionNumbers = await handleLetterInsertion(answers.askForLetter);
  --points;
  return { PositionNumbers, name: answers.askForLetter };
}

async function handleLetterInsertion(letter) {
  const spinner = createSpinner('loading ...').start();
  let indices = [];
  await sleep(1000);
  if (word.includes(letter)) {
    spinner.success({ text: 'nice job !' });
    for (var i = 0; i < word.length; i++) {
      if (word[i] === letter) indices.push(i);
    }
  } else {
    spinner.error({ text: 'oh try again' });
  }
  return indices;
}

function updateWord(letter) {
  if (letter.PositionNumbers.length === 0) {
    return;
  } else {
    let WhiteSpacesArray = wordWhiteSpaces.split(' ,');
    for (let i = 0; i < letter.PositionNumbers.length; i++) {
      WhiteSpacesArray[letter.PositionNumbers[i]] = letter.name;
    }
    let updatedWord = WhiteSpacesArray.join(' ,');
    wordWhiteSpaces = updatedWord;
    console.log(wordWhiteSpaces);
  }
}

function looser() {
  console.clear();
  console.log(`sorry you loose the word was : ${word}`);
  process.exit(1);
}

async function winner() {
  console.clear();
  await sleep(250);
  chalkAnimation.pulse('you win !').start();
  await sleep(3000);
  console.log(`
  the word was : ${chalk.blue(word)}`);
  process.exit(1);
}

addIntro();
await sleep(1000);
await welcome();
await askToStartTheGame();
chooseAWord();

for (let i = 1; i <= points; i++) {
  console.log('points : ', points);
  let letter = await askForLetter();
  updateWord(letter);
  if (!wordWhiteSpaces.includes('_')) {
    await winner();
  }
}

looser();
