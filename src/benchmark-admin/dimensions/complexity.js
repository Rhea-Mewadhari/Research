import { nullDimension } from '../helpers/utils.js';
import { makeEslintConfig, srcGlobs } from '../helpers/eslint-config.js';

export async function runComplexity({ target, srcDir }) {
  const keys = ['cognitiveComplexityTotal', 'functionsOverThreshold', 'maxNestingDepth', 'functionsTooLong', 'findings'];
  try {
    const eslint = makeEslintConfig(target, srcDir, {
      'sonarjs/cognitive-complexity':  ['warn', 0],
      'max-depth':                     ['warn', 0],
      'max-lines-per-function':        ['warn', { max: 0, skipBlankLines: false, skipComments: false }],
    });

    const results = await eslint.lintFiles(srcGlobs(target));

    let cognitiveComplexityTotal = 0;
    let functionsOverThreshold   = 0;
    let maxNestingDepth          = 0;
    let functionsTooLong         = 0;
    const findings = [];

    for (const file of results) {
      for (const msg of file.messages) {
        const entry = { file: file.filePath, line: msg.line, rule: msg.ruleId, value: null };

        if (msg.ruleId === 'sonarjs/cognitive-complexity') {
          const m = msg.message.match(/(\d+)/);
          const val = m ? parseInt(m[1], 10) : 1;
          entry.value = val;
          cognitiveComplexityTotal += val;
          functionsOverThreshold++;
          findings.push(entry);
        } else if (msg.ruleId === 'max-depth') {
          const m = msg.message.match(/(\d+)/);
          const val = m ? parseInt(m[1], 10) : 1;
          entry.value = val;
          if (val > maxNestingDepth) maxNestingDepth = val;
          findings.push(entry);
        } else if (msg.ruleId === 'max-lines-per-function') {
          functionsTooLong++;
          findings.push(entry);
        }
      }
    }

    return { error: null, cognitiveComplexityTotal, functionsOverThreshold, maxNestingDepth, functionsTooLong, findings };
  } catch (e) {
    return nullDimension(keys, String(e.message));
  }
}
