#!/usr/bin/env python3
"""Check checklist structure/evidence and keep the human-readable report in sync.

Passing this check never means a feature or release gate is complete.
"""
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'docs/implementation/checklist.json'
REPORT = ROOT / 'docs/implementation/PHASE_0_TO_2_MASTER_CHECKLIST.md'
REQUIRED = {'phase', 'feature', 'requirement', 'status', 'source', 'api', 'model', 'tests', 'result', 'security', 'frontend', 'remaining'}
PHASES = ('0', '1', '2A', '2B', '2C')
STATUSES = {'verified', 'partial', 'missing', 'blocked', 'failed'}


def main():
    data = json.loads(DATA.read_text())
    entries = data['entries']
    seen = set()
    for item in entries:
        if set(item) != REQUIRED or any(not isinstance(item[key], str) or not item[key].strip() for key in REQUIRED):
            raise ValueError('Checklist row has missing or invalid fields')
        if item['phase'] not in PHASES or item['status'] not in STATUSES:
            raise ValueError(f"Invalid phase/status: {item['feature']}")
        key = (item['phase'], item['feature'])
        if key in seen:
            raise ValueError(f'Duplicate checklist entry: {key}')
        seen.add(key)
        for field in ('source', 'tests', 'model'):
            path = item[field]
            if path != 'none' and not (ROOT / path).exists():
                raise ValueError(f'Missing {field}: {path}')
        if item['status'] == 'verified':
            for field in ('source', 'tests'):
                path = ROOT / item[field]
                if item[field] == 'none' or not path.is_file() or not path.stat().st_size:
                    raise ValueError(f'Verified item lacks nonempty {field}: {key}')
            if any(word in item['result'].lower() for word in ('todo', 'skipped', 'pending')):
                raise ValueError(f'Verified item has non-passing result: {key}')
    if set(item['phase'] for item in entries) != set(PHASES):
        raise ValueError('Checklist must cover all five release gates')
    lines = ['# Phase 0–2 master implementation checklist', '',
             'Generated from `checklist.json` by `scripts/ci/checkImplementationChecklist.py`. '
             'Evidence is scoped to each entry; partial, missing, blocked and failed entries remain unchecked. '
             'Automated existence checks do not establish functional coverage or release readiness.', '',
             '| Gate | Entries | Verified | Partial | Missing | Blocked | Failed |', '|---|---:|---:|---:|---:|---:|---:|']
    for phase in PHASES:
        subset = [item for item in entries if item['phase'] == phase]
        counts = Counter(item['status'] for item in subset)
        lines.append(f"| {phase} | {len(subset)} | {counts['verified']} | {counts['partial']} | {counts['missing']} | {counts['blocked']} | {counts['failed']} |")
    for item in entries:
        checked = 'x' if item['status'] == 'verified' else ' '
        lines.extend(['', f"## [{checked}] Phase {item['phase']}: {item['feature']}", '',
                      f"- **Requirement:** {item['requirement']}", f"- **Status:** {item['status']}", f"- **Source:** `{item['source']}`", f"- **API:** {item['api']}",
                      f"- **Prisma model:** `{item['model']}`", f"- **Test:** `{item['tests']}`", f"- **Result/evidence:** {item['result']}",
                      f"- **Security:** {item['security']}", f"- **Frontend:** {item['frontend']}", f"- **Remaining/limitations:** {item['remaining']}"])
    report = '\n'.join(lines) + '\n'
    if '--write' in sys.argv:
        REPORT.write_text(report)
    elif not REPORT.exists() or REPORT.read_text() != report:
        raise ValueError('Checklist report is out of date: run python3 scripts/ci/checkImplementationChecklist.py --write')
    release = (ROOT / 'docs/implementation/RELEASE_READINESS_REPORT.md').read_text()
    for phase in PHASES:
        subset = [item for item in entries if item['phase'] == phase]
        counts = Counter(item['status'] for item in subset)
        row = f"| Phase {phase} | {len(subset)} | {counts['verified']} | {counts['partial']} | {counts['failed']} | {counts['blocked'] + counts['missing']} |"
        if row not in release:
            raise ValueError(f'Release report count differs from checklist: Phase {phase}')
    print(f'Checklist structure, evidence paths and release totals checked for {len(entries)} entries; this is not release certification.')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as error:
        print(f'Checklist check failed: {error}', file=sys.stderr)
        sys.exit(1)
