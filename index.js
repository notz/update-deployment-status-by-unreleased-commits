const core = require('@actions/core');
const github = require('@actions/github');

import { execFile } from 'child_process';
import { Readable } from 'stream';
import through from 'through2';

const main = async () => {
    const inputs = parseInputs();
  
    const commits = await getCommits(inputs.tag);
    core.debug(commits);

    const repoRegex = new RegExp(inputs.repoRegex);
    const deploymentIdRegex = new RegExp(inputs.deploymentIdRegex);

    const octokit = github.getOctokit(inputs.token);

    let count = 0;
    commits.forEach((commit) => {
        let repoMatches = repoRegex.exec(commit);
        let deploymentIdMatches = deploymentIdRegex.exec(commit);
        if (repoMatches && deploymentIdMatches) {
            updateDeploymentStatus(octokit, repoMatches[1], deploymentIdMatches[1], 'success');
            count++;
        }
    });
  
    core.setOutput('count', count);
};

const parseInputs = () => {
    return {
        token: core.getInput('token') || process.env.GITHUB_TOKEN,
        repoRegex: core.getInput('repo-regex'),
        deploymentIdRegex: core.getInput('deployment-id-regex'),
        tag: core.getInput('tag') || "deployed",
    };
};

const run = async (cmd, args) => {
    const readable = new Readable();
    readable._read = () => { };
  
    let isError = false;
  
    const child = execFile(cmd, args, {
      maxBuffer: Infinity
    });
  
    child.stdout
      .pipe(through((chunk, enc, cb) => {
        readable.push(chunk);
        isError = false;
        cb();
      }, (cb) => {
        setImmediate(() => {
          if (!isError) {
            readable.push(null);
            readable.emit('close');
          }
          cb();
        })
      }));
  
    child.stderr
      .pipe(through.obj((chunk) => {
        isError = true;
        readable.emit('error', new Error(chunk));
        readable.emit('close');
      }));
  
    let data = '';
    for await (const chunk of readable) {
      data += chunk;
    }
    return data;
}

const getCommits = async (tag) => {
    const cmd = `git`;
    const range = `${tag}..HEAD`;
    const args = ['log', range, `--format={{filter:%B}}online//`].filter((s) => {
      return s !== '';
    });
    const result = await run(cmd, args);
  
    return result.split('//\n').map((s) => {
      return s.replace(/{{filter:.+?}}/gs, '');
    });
};

const updateDeploymentStatus = async (octokit, repo, deployment_id, state, auto_inactive = true) => {
    const owner = github.context.repo.owner;

    const req = {
        owner,
        repo,
        deployment_id,
        state,
        auto_inactive,
    };

    core.debug(JSON.stringify(req));
    const resp = await octokit.request('POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', req);
    core.debug(JSON.stringify(resp));
};

try {
    await main();
} catch (error) {
    core.setFailed(error.message);
}