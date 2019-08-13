#!/usr/bin/env node

const program = require('commander');
const { prompt } = require('inquirer');
const { validateAnswer, startTesting } = require('./test');

const questions = [
    {
      type : 'input',
      name : 'initialFolderCreation',
      message : '*** Please, create a folder "C:\\For_testing" and import the whole unzipped suite to there. After that type "done" here. ***'
    }
];

program
    .version('0.0.1')
    .description('Import promotions BX file');

program
    .command('start-testing')
    .alias('start')
    .description('Check whether files were imported into C:\\For_testing')
    .action(() => {
        prompt(questions)
            .then((answers) => {
                if(validateAnswer(answers.initialFolderCreation)) {
                    startTesting();
                }      
            });
    });
    
program.parse(process.argv);