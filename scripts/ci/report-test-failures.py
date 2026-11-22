"""Expose concise Vitest failures as annotations when CI logs aren't accessible."""
import json
from pathlib import Path

report = Path('/tmp/vitest-results.json')
if report.exists():
    data = json.loads(report.read_text())
    for suite in data.get('testResults', []):
        for test in suite.get('assertionResults', []):
            if test.get('status') == 'failed':
                text = test.get('fullName', '') + '\n' + '\n'.join(test.get('failureMessages', []))
                print('::error::' + text[:7000].replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A'))
        if suite.get('status') == 'failed' and not suite.get('assertionResults'):
            print('::error::' + suite.get('message', '')[:7000].replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A'))
