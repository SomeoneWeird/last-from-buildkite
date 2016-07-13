#!/usr/bin/env node
var argv = require('yargs')
            .env('BUILDKITE')
            .option('token', {
              alias: 't',
              describe: 'Your buildkite API token'
            })
            .option('slug', {
              alias: 's',
              describe: 'Project slug (including org)'
            })
            .option('command', {
              alias: 'c',
              describe: 'Command to search for'
            })
            .option('count', {
              default: 1,
              describe: 'Number of results you wish to fetch'
            })
            .required([ 't', 's', 'c' ])
            .argv

require('../lib')(argv.t)(argv.s, argv.c, function (err, buildNum) {
  if (err) {
    console.error('There was an error fetching your data :(')
    console.error(err)
    process.exit(1)
  }
  if (!buildNum) {
    console.log("Couldn't find a build that has run that command :(")
    return
  }
  if (argv.count === 1) {
    console.log('Build ' + buildNum + ' was the last build to run "' + argv.c + '"')
  } else {
    console.log('Builds', buildNum.join(', '), 'have run "' + argv.c + '"')
  }
}, argv.count)
