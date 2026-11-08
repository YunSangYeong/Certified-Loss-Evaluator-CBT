import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BASE_BANK, SUBJECTS, createExam, grade, emptyStore, answerExam, submitExam, restoreStore, validateQuestion, fingerprint, importQuestions, parseCsv, startPractice, checkPractice, nextPractice } from '../src/model';
import type { Question } from '../src/model';
// Test-only authored fixtures exercise exam mechanics without approving pending public content.
const fixtures: Question[] = BASE_BANK.map(q=>({...q,id:`TEST-${q.id}`,verificationStatus:'reviewed'}));
describe('손해평가사 데이터와 확인 대기 보호',()=>{
 it('75 registered, 25 internally reviewed, 50 pending; no past or numeric variants',()=>{
 expect(BASE_BANK).toHaveLength(75);
 expect(BASE_BANK.filter(q=>q.verificationStatus==='reviewed')).toHaveLength(25);
 expect(new Set(BASE_BANK.map(fingerprint)).size).toBe(75);
 expect(new Set(BASE_BANK.map(q=>q.id)).size).toBe(75);
 for(const q of BASE_BANK){expect(()=>validateQuestion(q)).not.toThrow();expect(q.year).toBeNull();expect(q.session).toBeNull();expect(q.type).toBe('original');expect(q.family).toBeUndefined();expect(q.choices).toHaveLength(5);}
 });
 it('does not start an exam with unreviewed law questions',()=>expect(()=>createExam(BASE_BANK,'main')).toThrow('25'));
 it('creates 75 distinct questions, 25 per subject, 90 minute deadline',()=>{
 const e=createExam(fixtures,'main',1000);expect(e.deadline-e.startedAt).toBe(5400000);expect(new Set(e.questions.map(q=>q.id)).size).toBe(75);SUBJECTS.forEach(s=>expect(e.questions.filter(q=>q.subject===s)).toHaveLength(25));
 });
 it.each([[15,15,15,true],[25,20,0,false],[14,15,15,false],[10,10,25,true],[9,11,25,false]])('grades correct per subject %s/%s/%s = %s with raw cutoff', (a,b,c,passed)=>{
 const e=createExam(fixtures,'main');[a,b,c].forEach((n,i)=>e.questions.filter(q=>q.subject===SUBJECTS[i]).slice(0,Number(n)).forEach(q=>e.answers[q.id]=q.answer));expect(grade(e).passed).toBe(passed);
 });
 it('fifth choice accepted; expired answer not accepted; submission idempotent',()=>{
 let s={...emptyStore(),exam:createExam(fixtures,'main',1000)};const id=s.exam.questions[0].id;s=answerExam(s,id,5,1001) as typeof s;expect(s.exam.answers[id]).toBe(5);const expired=answerExam(s,s.exam.questions[1].id,1,s.exam.deadline);expect(expired.exam).toBeNull();expect(expired.results[0].answers).toEqual({[id]:5});expect(submitExam(expired).results).toHaveLength(1);
 });
 it('restores absolute deadlines, results and corrupted-store guard',()=>{
 const s={...emptyStore(),exam:createExam(fixtures,'main')};expect(restoreStore(JSON.stringify(s)).exam?.deadline).toBe(s.exam.deadline);expect(()=>restoreStore('{broken')).toThrow();
 });
 it('imports five-option CSV as pending; duplicate reordered choices excluded',()=>{
 const csv=readFileSync('public/templates/questions.csv','utf8');const imported=importQuestions(parseCsv(csv),BASE_BANK);expect(imported.added).toHaveLength(1);expect(imported.added[0].choices).toHaveLength(5);expect(imported.added[0].verificationStatus).toBe('pending');expect(importQuestions([{...BASE_BANK[0],id:'REORDER',choices:[...BASE_BANK[0].choices].reverse()}],BASE_BANK).duplicates).toBe(1);
 });
 it('practice scores once and preserves no-repeat traversal',()=>{
 let s={...emptyStore(),practice:startPractice(BASE_BANK,'main')};const q=BASE_BANK.find(q=>q.id===s.practice.currentId)!;s.practice.selected=q.answer;s=checkPractice(s,BASE_BANK) as typeof s;expect(checkPractice(s,BASE_BANK).attempts).toHaveLength(1);expect(nextPractice(s.practice,BASE_BANK).currentId).not.toBe(q.id);
 });
});
