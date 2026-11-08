"""Structural audit for the requested law banks; does not validate legal truth."""
import argparse
import datetime as dt
import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import urlparse

TARGETS = {'상법 보험편': 500, '농어업재해보험법령': 500}

def fingerprint(q):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', '|'.join([q['question'], *sorted(q['choices'])]))).lower()

def audit(questions, require_targets=False):
    errors, ids, bodies = [], set(), set()
    counts = {s: {'reviewed': 0, 'pending': 0, 'target': n} for s, n in TARGETS.items()}
    for q in questions:
        if q.get('subject') not in TARGETS:
            continue
        name = q.get('id', '<missing ID>')
        try:
            if name in ids or fingerprint(q) in bodies:
                raise ValueError('duplicate ID or normalized body/choices')
            ids.add(name)
            bodies.add(fingerprint(q))
            if len(q['choices']) != 5 or len(set(q['choices'])) != 5 or not 1 <= q['answer'] <= 5:
                raise ValueError('five distinct choices and answer 1..5 required')
            if q['verificationStatus'] == 'reviewed':
                evidence = q.get('legalReview', {})
                for field in ['statute', 'article', 'effectiveDate', 'retrievedAt', 'sourceUrl', 'sourceExcerpt', 'answerReason', 'reviewNote']:
                    if not isinstance(evidence.get(field), str) or not evidence[field].strip():
                        raise ValueError(f'legalReview.{field} required')
                url = urlparse(evidence['sourceUrl'])
                if url.scheme != 'https' or url.hostname not in {'www.law.go.kr', 'law.go.kr'}:
                    raise ValueError('official law.go.kr HTTPS source required')
                for field in ['effectiveDate', 'retrievedAt']:
                    dt.date.fromisoformat(evidence[field])
                if q['type'] == 'original' and (q['year'] is not None or q['session'] is not None):
                    raise ValueError('authored questions must not invent exam year/session')
                counts[q['subject']]['reviewed'] += 1
            elif q['verificationStatus'] == 'pending':
                counts[q['subject']]['pending'] += 1
            else:
                raise ValueError('unknown review status')
        except (ValueError, KeyError, TypeError) as exc:
            errors.append(f'{name}: {exc}')
    for subject, count in counts.items():
        count['shortfall'] = max(0, count['target'] - count['reviewed'])
        if require_targets and count['reviewed'] != count['target']:
            errors.append(f"{subject}: {count['reviewed']}/{count['target']} reviewed")
    return {'subjects': counts, 'errors': errors, 'note': 'Structure only: source reading and substantive legal review are separate requirements.'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', nargs='+', type=Path)
    parser.add_argument('--require-targets', action='store_true')
    args = parser.parse_args()
    questions = [q for file in args.files for q in json.loads(file.read_text())]
    report = audit(questions, args.require_targets)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return bool(report['errors'])

if __name__ == '__main__':
    raise SystemExit(main())
