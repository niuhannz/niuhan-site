import {readingQuestions} from './reading-questions.js';

export const slides = readingQuestions;
// The original room's approach mechanic stays dormant during this reading test.
export const THREAT_START = Infinity;

const TRANSITION_SECONDS = 0.88;
const FEEDBACK_SECONDS = 1.8;
const EPSILON = 1e-8;
const optionText = option => typeof option === 'string'
  ? option : option?.chinese ?? option?.english ?? '';

export class TestSession {
  constructor(deck = slides) {
    this.deck = Array.isArray(deck) ? deck : (deck?.deck ?? slides);
    this.reset();
  }

  reset() {
    this.phase = 'intro';
    this.stage = 'intro';
    this.index = 0;
    this.elapsed = 0;
    this.slideTime = 0;
    this.stageTime = 0;
    this.lock = 0;
    this.danger = 0;
    this.pendingPressure = 0;
    this.observed = false;
    this.focus = 0;
    this.answers = [];
    this.result = null;
    this._readingElapsed = 0;
    this._latestFeedback = null;
  }

  start() {
    this.reset();
    if (!this.deck.length) { this.finish('complete'); return; }
    this.phase = 'playing';
    this._enterTransition();
  }

  get question() { return this.deck[this.index] ?? null; }
  get activeThreat() { return false; }
  get duration() {
    const configured = Number(this.question?.seconds);
    return Number.isFinite(configured) && configured > 0
      ? Math.max(0.1, configured)
      : (this.index < 4 ? 12 : this.index < 10 ? 10 : 8);
  }
  get remaining() { return Math.max(0, this.duration - this._readingElapsed); }
  get readingTime() { return this._readingElapsed; }
  get elapsedReading() { return this._readingElapsed; }
  get readingElapsed() { return this._readingElapsed; }
  get score() { return this.answers.filter(answer => answer.correct).length; }
  get timeouts() { return this.answers.filter(answer => answer.timedOut).length; }
  get latestFeedback() { return this._latestFeedback; }
  get statistics() {
    const responses = this.answers.filter(answer => !answer.timedOut);
    const sum = responses.reduce((total, answer) => total + answer.seconds, 0);
    const average = responses.length ? sum / responses.length : 0;
    return {
      score: this.score,
      correct: this.score,
      total: this.deck.length,
      recorded: this.answers.length,
      answered: responses.length,
      timeouts: this.timeouts,
      accuracy: this.answers.length ? this.score / this.answers.length : 0,
      averageResponseSeconds: average,
      averageResponseMilliseconds: Math.round(average * 1000),
      responseAverageSeconds: average,
      responseAverageMilliseconds: Math.round(average * 1000),
      totalSeconds: this.elapsed,
      completed: this.phase === 'ended' && this.result === 'complete'
    };
  }
  get stats() { return this.statistics; }

  update(delta) {
    if (this.phase !== 'playing') return null;
    const numeric = Number(delta);
    // The caller passes wall-clock delta separately from capped render delta.
    // Hidden tabs are paused by main; a slow visible frame still spends time.
    let dt = Number.isFinite(numeric) ? Math.min(Math.max(numeric, 0), 60) : 0;
    this.elapsed += dt;
    if (this.stage === 'transition') {
      const step = Math.min(dt, TRANSITION_SECONDS - this.stageTime);
      this.stageTime += step;
      dt -= step;
      this.lock = Math.max(0, TRANSITION_SECONDS - this.stageTime);
      if (this.lock > EPSILON) return null;
      this.stage = 'reading';
      this.stageTime = 0;
      this.lock = 0;
    }
    if (this.stage === 'reading') {
      this._readingElapsed = Math.min(this.duration, this._readingElapsed + dt);
      this.stageTime = this._readingElapsed;
      this.slideTime = this._readingElapsed;
      if (this.remaining <= EPSILON) {
        this._record(null);
        return 'feedback';
      }
      return null;
    }
    if (this.stage === 'feedback') {
      this.stageTime += dt;
      this.lock = Math.max(0, FEEDBACK_SECONDS - this.stageTime);
      if (this.lock > EPSILON) return null;
      if (this.index + 1 >= this.deck.length) {
        this.finish('complete');
        return 'complete';
      }
      this.index += 1;
      // Every new question gets a visible transition, even after a slow frame.
      this._enterTransition();
      return 'next';
    }
    return null;
  }

  answer(value) {
    if (this.phase !== 'playing' || this.stage !== 'reading') return 'wait';
    this._record(this.remaining <= EPSILON ? null : value === true ? 0 : 1);
    return 'feedback';
  }

  _record(chosen) {
    const question = this.question;
    const options = question?.options ?? question?.choices ?? [];
    const correctIndex = question?.correctIndex === 1 ? 1 : 0;
    const timedOut = chosen === null;
    const seconds = timedOut ? this.duration : this._readingElapsed;
    const record = {
      index: this.index,
      questionId: question?.id ?? this.index + 1,
      choice: chosen,
      chosen,
      chosenIndex: chosen,
      chosenLabel: timedOut ? null : chosen === 0 ? 'A' : 'B',
      chosenText: timedOut ? null : optionText(options[chosen]),
      correctIndex,
      correctLabel: correctIndex === 0 ? 'A' : 'B',
      correctText: optionText(options[correctIndex]) || question?.answer || '',
      correctEnglish: typeof options[correctIndex] === 'object' ? options[correctIndex].english ?? '' : '',
      correct: !timedOut && chosen === correctIndex,
      timedOut,
      seconds,
      milliseconds: Math.round(seconds * 1000)
    };
    this.answers.push(record);
    this._latestFeedback = record;
    this.stage = 'feedback';
    this.stageTime = 0;
    this.lock = FEEDBACK_SECONDS;
  }

  _enterTransition() {
    this.stage = 'transition';
    this.stageTime = 0;
    this.slideTime = 0;
    this._readingElapsed = 0;
    this._latestFeedback = null;
    this.lock = TRANSITION_SECONDS;
  }

  finish(result = 'complete') {
    this.result = result;
    this.phase = 'ended';
    this.stage = 'ended';
    this.lock = 0;
  }
  pause() { if (this.phase === 'playing') this.phase = 'paused'; }
  resume() { if (this.phase === 'paused') this.phase = 'playing'; }
}
