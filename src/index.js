import request from 'superagent'

export default function (token) {
  return function (projectSlug, command, callback) {
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
        let builds = {}
        response.body.data.pipeline.builds.edges.forEach(function (build) {
          builds[build.node.number] = build.node.jobs.edges.map((e) => e.node)
        })
        return callback(null, getLastBuildWithCommand(builds, command))
      })
  }
}

function getLastBuildWithCommand (builds, command) {
  let buildNums = Object.keys(builds).sort((a, b) => b - a)
  for (let i = 0; i < buildNums.length; i++) {
    let buildNum = buildNums[i]
    let b = checkBuild(builds[buildNum], command)
    if (b) {
      return buildNum
    }
  }
  return null
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

