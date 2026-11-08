import {createHash} from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BASE_BANK, SUBJECTS, createExam, grade, emptyStore, answerExam, submitExam, restoreStore, validateQuestion, fingerprint, importQuestions, parseCsv, startPractice, checkPractice, nextPractice } from '../src/model';
import type { Question } from '../src/model';
// Test-only authored fixtures exercise exam mechanics without approving pending public content.
const fixtures: Question[] = SUBJECTS.flatMap((subject,i)=>BASE_BANK.slice(0,25).map(q=>({...q,subject,id:`TEST-${i}-${q.id}`,verificationStatus:'reviewed' as const})));
describe('손해평가사 데이터와 확인 대기 보호',()=>{
 it('1000 internally reviewed, 64 concept and 936 explicit numeric variants',()=>{
 expect(BASE_BANK).toHaveLength(1000);
 expect(BASE_BANK.filter(q=>q.verificationStatus==='reviewed')).toHaveLength(1000);
 expect(new Set(BASE_BANK.map(fingerprint)).size).toBe(1000);
 expect(new Set(BASE_BANK.map(q=>q.id)).size).toBe(1000);
 for(const q of BASE_BANK){expect(()=>validateQuestion(q)).not.toThrow();expect(q.year).toBeNull();expect(q.session).toBeNull();expect(q.type).toBe('original');expect(q.choices).toHaveLength(5);}
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

const evaluators: Record<string,(v:number[])=>number> = {
 area:v=>v[0]*v[1], density:v=>v[0]/(v[1]*v[2]), germination:v=>100*v[0]/v[1], purity:v=>100*v[0]/v[1], seeding:v=>v[0]*v[1], nutrient:v=>v[0]*v[1]/100, fertilizer:v=>100*v[0]/v[1], water:v=>v[0]*v[1]*0.001, flow:v=>v[0]/v[1], moisture:v=>100*v[1]/v[0], drymass:v=>v[0]-v[1], dryratio:v=>100*v[0]/v[1], yield:v=>10*v[0]/v[1], harvest:v=>100*v[0]/v[1], loss:v=>100*(1-v[1]/v[0]), samplemean:v=>v.reduce((a,b)=>a+b,0)/v.length, fruit:v=>v[0]*v[1]/1000, dilution:v=>v[0]*v[1]/1000, concentration:v=>v[0]/v[1], degree:v=>Math.max(0,v[0]-v[1])*v[2], leafarea:v=>v[0]/v[1], spacing:v=>v[0]/v[1], retention:v=>v[0]*v[1]/100, efficiency:v=>100*v[0]/v[1]
};
describe('independent numeric and variant audit',()=>{
 it('24 families × 39 variants; 64 concepts; 50 excluded legal drafts retained',()=>{
 const numeric=BASE_BANK.filter(q=>q.calculation);expect(numeric).toHaveLength(936);expect(BASE_BANK.filter(q=>!q.calculation)).toHaveLength(64);const families=new Set(numeric.map(q=>q.family));expect(families.size).toBe(24);for(const f of families){const group=numeric.filter(q=>q.family===f);expect(group).toHaveLength(39);expect(new Set(group.map(q=>JSON.stringify(q.calculation!.values))).size).toBe(39);}const drafts=JSON.parse(readFileSync('src/data/drafts.json','utf8'));expect(drafts).toHaveLength(50);expect(drafts.every((q:Question)=>q.verificationStatus==='pending')).toBe(true);
 });
 for(const q of BASE_BANK.filter(q=>q.calculation))it(q.id,()=>{
 const c=q.calculation!;expect(evaluators[c.kind]).toBeDefined();const independent=Number(evaluators[c.kind](c.values).toFixed(2));expect(c.result).toBeCloseTo(independent,8);const parsed=q.choices.map(choice=>Number(choice.split(' ')[0]));expect(new Set(parsed).size).toBe(5);expect(parsed[q.answer-1]).toBe(c.result);expect(parsed.filter(x=>Math.abs(x-independent)<1e-8)).toHaveLength(1);expect(q.explanation).toContain(c.unit);expect(q.year).toBeNull();expect(q.type).toBe('original');
 });
});

it('preserves original 25 reviewed IDs, content, answers and review metadata',()=>expect(createHash('sha256').update(JSON.stringify(BASE_BANK.slice(0,25))).digest('hex')).toBe('528694ccf4612c95f5c3106002249ce67ff3abdfe332b4e31053b90fa4c63f1e'));
