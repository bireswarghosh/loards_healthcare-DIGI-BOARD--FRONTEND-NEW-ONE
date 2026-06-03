import fs from 'fs';
import readline from 'readline';

const logFilePath = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\ca457efc-5bf4-4c10-8781-517cdc29335b\\.system_generated\\logs\\transcript.jsonl';

async function extract() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const output = [];
  output.push('Scanning transcript.jsonl for file modifications...');
  for await (const line of rl) {
    try {
      const step = JSON.parse(line);
      if (step.tool_calls) {
        for (const call of step.tool_calls) {
          if (call.name === 'multi_replace_file_content' || call.name === 'replace_file_content' || call.name === 'write_to_file') {
            const args = typeof call.args === 'string' ? JSON.parse(call.args) : call.args;
            const target = args.TargetFile || args.TargetFile;
            if (target && (target.includes('MoneyReceipt.jsx') || target.includes('LabrotaryQuery.jsx') || target.includes('AccessControl.jsx') || target.includes('App.jsx') || target.includes('OtherCharges.jsx') || target.includes('VisitList.jsx'))) {
              output.push(`\n========================================`);
              output.push(`STEP INDEX: ${step.step_index} | TOOL: ${call.name}`);
              output.push(`TARGET FILE: ${target}`);
              output.push(`DESCRIPTION: ${args.Description || args.Instruction || ''}`);
              if (call.name === 'multi_replace_file_content') {
                output.push(`CHUNKS COUNT: ${args.ReplacementChunks?.length || 0}`);
                const chunks = typeof args.ReplacementChunks === 'string' ? JSON.parse(args.ReplacementChunks) : args.ReplacementChunks;
                chunks.forEach((chunk, i) => {
                  output.push(`--- Chunk ${i+1} (lines ${chunk.StartLine}-${chunk.EndLine}) ---`);
                  output.push(`Target Content:\n${chunk.TargetContent}\n`);
                  output.push(`Replacement Content:\n${chunk.ReplacementContent}\n`);
                });
              } else if (call.name === 'replace_file_content') {
                output.push(`StartLine: ${args.StartLine}, EndLine: ${args.EndLine}`);
                output.push(`Target Content:\n${args.TargetContent}\n`);
                output.push(`Replacement Content:\n${args.ReplacementContent}\n`);
              }
            }
          }
        }
      }
    } catch (e) {
      // Ignore parse errors on truncated lines
    }
  }
  fs.writeFileSync('extracted.txt', output.join('\n'), 'utf8');
  console.log('Done writing to extracted.txt');
}

extract();
