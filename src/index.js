import request from 'superagent'

export default function (token) {
  return function (projectSlug, command, callback, count = 1) {
    let query = `query Query {
      pipeline(slug: "${projectSlug}") {
        builds {
          edges {
            node {
              number
              jobs {
                edges {
                  node {
                    ... on JobTypeCommand {
                      type
                      label
                      state
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`

    request
      .post('https://graphql.buildkite.com/v1')
      .send({ query })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .end(function (err, response) {
        if (err) {
          return callback(err)
        }
        if (response.body.errors) {
          return callback(response.body.errors)
        }
        if (!response.body.data.pipeline) {
          return callback()
        }
        let builds = {}
        response.body.data.pipeline.builds.edges.forEach(function (build) {
          builds[build.node.number] = build.node.jobs.edges.map((e) => e.node)
        })
        return callback(null, getLastBuildWithCommand(builds, command, count))
      })
  }
}

function getLastBuildWithCommand (builds, command, count) {
  let buildNums = Object.keys(builds).sort((a, b) => b - a)
  let foundNumbers = []
  for (let i = 0; i < buildNums.length; i++) {
    let buildNum = buildNums[i]
    let b = checkBuild(builds[buildNum], command)
    if (b) {
      if (count === 1) {
        return buildNum
      } else {
        foundNumbers.push(buildNum)
        if (foundNumbers.length === count) {
          return foundNumbers
        }
      }
    }
  }
  return foundNumbers.length > 1 ? foundNumbers : null
}

function checkBuild (build, command) {
  for (let i = 0; i < build.length; i++) {
    let job = build[i]
    if (job.type !== 'script') continue
    if (job.label !== command) continue
    if (job.state === 'finished') {
      return true
    }
  }
  return false
}

