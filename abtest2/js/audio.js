/**
 * Original native contacts and original CRT electronics for SignalRoom.
 * Start from a user gesture; the context resumes before any fetch or decode.
 * All public methods deliberately tolerate unavailable / blocked Web Audio.
 */
export class RoomAudio {
  constructor(options = {}) {
    this.ctx = null;
    this.volume = this._clamp(options.volume ?? 0.68);
    this.muted = false;
    this.paused = false;
    this._disposed = false;
    this._ready = false;
    this._starting = null;
    this._suspendTimer = null;
    this._nodes = [];
    this._sources = new Set();
    this._voices = new Set();
    this._amount = 0;
    this._pan = -0.7;
    this._buttonCount = 0;
    this._clockTickCount = 0;
    this._lastClockTick = -Infinity;
    this._clockAlternate = false;
    this._nativeEnabled = options.nativeAssets !== false;
    this._assetData = new Map();
    this._assetBuffers = new Map();
    this._assetErrors = [];
    this._assetLoading = null;
    this._assetDecoding = null;
    this._nativeRoomSource = null;
    this._tvSource = null;
    this._tvPan = 0;
    this._tvLevel = 1;
    this._hidden = typeof document !== 'undefined' && Boolean(document.hidden);
    this._visibilityListener = () => {
      this._hidden = Boolean(document.hidden);
      this._updateSuspension();
    };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', this._visibilityListener);
    this.ready = this.loadAssets();
  }

  /** Prefetch source PCM without constructing an AudioContext or playing. */
  loadAssets() {
    if (this._assetLoading) return this._assetLoading;
    if (!this._nativeEnabled || typeof fetch !== 'function') return Promise.resolve(false);
    const names = ['S_ButtonYes', 'S_ButtonNo', 'S_TVChange', 'S_Knock', 'S_RoomLoop', 'S_TVLoop'];
    this._assetLoading = Promise.all(names.map(async name => {
      const url = new URL(`../assets/audio/${name}.wav`, import.meta.url).href;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${response.status} ${name}.wav`);
        const data = await response.arrayBuffer();
        if (!this._disposed) this._assetData.set(name, data);
      } catch (error) { this._assetErrors.push(String(error?.message || error)); }
    })).then(() => this._assetData.size === names.length);
    return this._assetLoading;
  }

  _decodeAssets(context) {
    if (this._assetDecoding) return this._assetDecoding;
    this._assetDecoding = this.ready.then(async () => {
      await Promise.all([...this._assetData].map(async ([name, data]) => {
        try {
          const buffer = await context.decodeAudioData(data.slice(0));
          if (!this._disposed && this.ctx === context) this._assetBuffers.set(name, buffer);
        } catch (error) { this._assetErrors.push(`decode ${name}: ${String(error?.message || error)}`); }
      }));
      if (!this._disposed && this.ctx === context) {
        this._beginNativeRoomLoop();
        this._beginTVLoop();
      }
    });
    return this._assetDecoding;
  }

  async start() {
    if (this._disposed) return false;
    if (this._starting) return this._starting;

    // Create and resume immediately, before yielding, to preserve the gesture.
    try {
      if (!this.ctx) {
        const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AudioContext) return false;
        this.ctx = new AudioContext({ latencyHint: 'interactive' });
        this._buildGraph();
      }
      const context = this.ctx;
      const resume = context.state !== 'running' && context.state !== 'closed' ? context.resume() : Promise.resolve();
      this._starting = Promise.resolve(resume)
        .then(async () => {
          if (this._disposed || this.ctx !== context) return false;
          this._applyMaster(0.2);
          await this._decodeAssets(context);
          return context.state === 'running';
        })
        .catch(() => false)
        .finally(() => { this._starting = null; });
      return await this._starting;
    } catch {
      this._teardown();
      return false;
    }
  }

  /**
   * Invoke directly from the button/key gesture. The returned Promise resolves
   * true when the switch voice is scheduled, false if audio remains unavailable.
   * Calling without awaiting it is supported; this method never rejects.
   */
  click(answer) {
    if (this._disposed || this.paused || this.muted || this._hidden || this.volume <= 0) return Promise.resolve(false);
    const play = () => {
      if (!this._canSound()) return false;
      try {
        const negative = answer === false || /^(no|否|不是|n|0)$/i.test(String(answer));
        this._duckTV(0.80, 0.12);
        const native = this._nativeVoice(negative ? 'S_ButtonNo' : 'S_ButtonYes', 1, 0);
        if (!native) this._buttonVoice(this.ctx.currentTime + 0.004, negative);
        this._buttonCount += 1;
        return true;
      } catch { return false; }
    };
    try {
      // start() constructs/resumes synchronously before its first await, keeping
      // Safari's user-activation requirement intact after tab interruptions.
      if (!this.ctx || !this._ready) return this.start().then(play).catch(() => false);
      if (this.ctx.state === 'running') return Promise.resolve(play());
      if (this.ctx.state === 'closed') return Promise.resolve(false);
      const resumed = this.ctx.resume();
      return Promise.resolve(resumed).then(() => {
        this._applyMaster(0.012);
        return play();
      }).catch(() => false);
    } catch { return Promise.resolve(false); }
  }

  // A rare, quiet contact flutter can accompany a brief loss of CRT sync.
  signalDrop(strength = 1) {
    if (!this._canSound()) return false;
    try {
      const amount = this._clamp(strength);
      const now = this.ctx.currentTime;
      this._noiseHit(now, 0.048, 0.025 * amount, 2900, this._tvPan, 'highpass', 650);
      this._noiseHit(now + 0.052, 0.023, 0.012 * amount, 1700, this._tvPan, 'highpass', 260);
      return true;
    } catch { return false; }
  }

  /** A short escapement tap. Scheduling belongs to the visible reading clock. */
  clockTick(urgency = 0, alternate = false) {
    if (!this._canSound()) return false;
    try {
      const now = this.ctx.currentTime;
      if (now - this._lastClockTick < 0.18) return false;
      const pressure = this._clamp(urgency);
      const tock = Boolean(alternate);
      const time = now + 0.004;
      const level = 0.90 + pressure * 0.24;
      const pan = tock ? 0.10 : -0.10;
      this._duckTV(0.70, 0.085);
      // Band-limited contact above the TV hum, with a damped casing resonance.
      // Two fixed pitches produce a physical tick / tock instead of a beep.
      this._noiseHit(time, 0.038, 0.135 * level, tock ? 4200 : 4800, pan, 'highpass', 780);
      this._tone(time, 0.075, tock ? 682 : 836, 0.082 * level, pan, 'sine', tock ? 682 : 836);
      this._tone(time + 0.003, 0.090, tock ? 172 : 193, 0.044 * level, pan, 'sine', tock ? 172 : 193);
      this._lastClockTick = now;
      this._clockAlternate = tock;
      this._clockTickCount += 1;
      return true;
    } catch { return false; }
  }

  timeoutSound() {
    if (!this._canSound()) return false;
    try {
      const time = this.ctx.currentTime + 0.004;
      this._duckTV(0.66, 0.22);
      this._noiseHit(time, 0.090, 0.115, 2300, 0, 'highpass', 260);
      this._tone(time, 0.23, 238, 0.062, 0, 'sine', 107);
      return true;
    } catch { return false; }
  }

  feedbackSound(correct = false) {
    if (!this._canSound()) return false;
    try {
      const time = this.ctx.currentTime + 0.004;
      this._duckTV(0.76, 0.15);
      this._noiseHit(time, 0.027, 0.040, 2400, 0, 'highpass', 500);
      this._tone(time, 0.13, correct ? 496 : 221, 0.040, 0, 'sine', correct ? 496 : 178);
      return true;
    } catch { return false; }
  }

  get diagnostics() {
    return { state: this.ctx?.state ?? 'unavailable', ready: this._ready,
      muted: this.muted, paused: this.paused, volume: this.volume,
      buttonCount: this._buttonCount, nativeAssets: this._assetBuffers.size,
      clockTickCount: this._clockTickCount, clockAlternate: this._clockAlternate,
      prefetchedAssets: this._assetData.size, nativeRoomLoop: Boolean(this._nativeRoomSource),
      type: 'crt-television', tvLoop: Boolean(this._tvSource), tvPan: this._tvPan,
      tvLevel: this._tvLevel, tvFallback: this._ready && !this._tvSource, hidden: this._hidden,
      assetErrors: [...this._assetErrors] };
  }

  slide() {
    if (!this._canSound()) return;
    try {
      this._duckTV(0.76, 0.72);
      // The native and fallback voices both follow the 0.88-second CRT change:
      // relay contact -> untuned snow -> drifting receiver -> picture locks.
      if (this._nativeVoice('S_TVChange', 0.88, this._tvPan)) return true;
      return this._bufferVoice(this._tvChangeFallback, 0.88, this._tvPan);
    } catch { /* Audio is optional. */ }
    return false;
  }

  knock(pan = -0.7) {
    if (!this._canSound()) return;
    try {
      this._duckTV(0.78, 0.25);
      if (this._nativeVoice('S_Knock', 0.85, this._clamp(pan, -1, 1) * 0.15)) return true;
      const now = this.ctx.currentTime;
      const side = this._clamp(pan, -1, 1);
      const taps = Math.random() < 0.42 ? 1 : 2;
      for (let i = 0; i < taps; i += 1) {
        const time = now + i * 0.235;
        const strength = i === 0 ? 1 : 0.72;
        this._noiseHit(time, 0.17, 0.057 * strength, 690, side, 'highpass', 70);
        this._tone(time, 0.29, i === 0 ? 126 : 111, 0.042 * strength, side, 'sine', 66);
        this._tone(time + 0.01, 0.15, 245, 0.008 * strength, side, 'sine', 202);
      }
    } catch { /* Audio is optional. */ }
  }

  threat(amount, pan = -0.7) {
    this._amount = this._clamp(amount);
    this._pan = this._clamp(pan, -1, 1);
    if (this._ready) this._applyThreat();
  }

  /** Camera-relative CRT perspective. Its electronics remain on through cuts. */
  television(pan = 0, level = 1) {
    const nextPan = this._clamp(pan, -1, 1);
    const nextLevel = this._clamp(level, 0, 1.6);
    if (Math.abs(nextPan - this._tvPan) > 0.002) {
      this._tvPan = nextPan;
      this._smooth(this._tvPanner?.pan, nextPan, 0.16);
    }
    if (Math.abs(nextLevel - this._tvLevel) > 0.002) {
      this._tvLevel = nextLevel;
      this._smooth(this._tvGain?.gain, nextLevel * 0.78, 0.22);
    }
  }

  pause(value) {
    this.paused = Boolean(value);
    this._updateSuspension();
  }

  _updateSuspension() {
    clearTimeout(this._suspendTimer);
    this._suspendTimer = null;
    if (!this.ctx || this._disposed) return;
    this._applyMaster(0.065);
    if (this.paused || this._hidden) {
      const context = this.ctx;
      this._suspendTimer = setTimeout(() => {
        if ((this.paused || this._hidden) && !this._disposed && this.ctx === context) {
          try { Promise.resolve(context.suspend()).catch(() => {}); } catch { /* Optional. */ }
        }
      }, 260);
    } else {
      try {
        Promise.resolve(this.ctx.resume()).then(() => this._applyMaster(0.18)).catch(() => {});
      } catch { /* A later start() can retry from a user gesture. */ }
    }
  }

  setVolume(value) {
    if (Number.isFinite(Number(value))) this.volume = this._clamp(value);
    this._applyMaster(0.065);
  }

  setMuted(value) {
    this.muted = Boolean(value);
    this._applyMaster(0.065);
  }

  dispose() {
    this._disposed = true;
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this._visibilityListener);
    this._teardown();
  }

  _buildGraph() {
    const c = this.ctx;
    this._master = this._node(c.createGain());
    this._master.gain.value = 0;
    const limiter = this._node(c.createDynamicsCompressor());
    limiter.threshold.value = -18;
    limiter.knee.value = 18;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.18;
    this._master.connect(limiter);
    limiter.connect(c.destination);

    this._white = this._makeNoise(false);
    this._brown = this._makeNoise(true);
    this._switchBuffers = [this._makeSwitch(false), this._makeSwitch(true)];
    this._tvChangeFallback = this._makeTVChange();

    // Keep a single ambience source. The synthesized bus supplies sound while
    // native assets decode, and is silenced when the native loop starts.
    this._ambientBus = this._gain(1);
    this._ambientBus.connect(this._master);

    // One persistent CRT layer: mains hum, transformer buzz and receiver hiss.
    // Native PCM replaces only this fallback, preserving a single audible bed.
    this._tvPanner = this._node(this._panner(this._tvPan));
    this._tvPanner.connect(this._master);
    this._tvDuckGain = this._gain(1);
    this._tvDuckGain.connect(this._tvPanner);
    this._tvGain = this._gain(this._tvLevel * 0.78);
    this._tvGain.connect(this._tvDuckGain);
    this._tvFallbackBus = this._gain(1);
    this._tvFallbackBus.connect(this._tvGain);

    // Tape hiss is band-limited; no sharp full-spectrum noise at the output.
    const hissHP = this._filter('highpass', 1450, 0.5);
    const hissLP = this._filter('lowpass', 6200, 0.5);
    const hissGain = this._gain(0.006);
    this._loop(this._white, hissHP);
    hissHP.connect(hissLP);
    hissLP.connect(hissGain);
    hissGain.connect(this._ambientBus);

    const hum = this._gain(0.022);
    hum.connect(this._tvFallbackBus);
    this._osc(60, 'sine', hum);
    const overtone = this._gain(0.008);
    overtone.connect(this._tvFallbackBus);
    this._osc(120, 'sine', overtone);
    this._lfo(0.2, 0.0012, hum.gain);
    const buzzFilter = this._filter('lowpass', 820, 0.6);
    const buzzGain = this._gain(0.0025);
    this._osc(120, 'sawtooth', buzzFilter);
    buzzFilter.connect(buzzGain);
    buzzGain.connect(this._tvFallbackBus);
    const staticHP = this._filter('highpass', 640, 0.5);
    const staticLP = this._filter('lowpass', 5300, 0.5);
    const staticGain = this._gain(0.016);
    this._loop(this._white, staticHP, 2.13);
    staticHP.connect(staticLP);
    staticLP.connect(staticGain);
    staticGain.connect(this._tvFallbackBus);
    this._lfo(0.3, 0.0009, staticGain.gain);
    // Barely present flyback detail, far below the hum and static noise.
    if (c.sampleRate >= 44100) {
      const flyback = this._gain(0.00006);
      flyback.connect(this._tvFallbackBus);
      this._osc(15700, 'sine', flyback);
    }

    // The approach is a moving breath / low resonance beneath the television.
    this._threatPanner = this._node(this._panner(this._pan));
    this._threatPanner.connect(this._master);
    this._breathFilter = this._filter('bandpass', 380, 0.7);
    this._breathGain = this._gain(0);
    this._loop(this._white, this._breathFilter, 0.73);
    this._breathFilter.connect(this._breathGain);
    this._breathGain.connect(this._threatPanner);
    this._threatToneA = this._gain(0);
    this._threatToneB = this._gain(0);
    this._threatToneA.connect(this._threatPanner);
    this._threatToneB.connect(this._threatPanner);
    this._threatOscA = this._osc(72, 'sine', this._threatToneA);
    this._threatOscB = this._osc(75.4, 'sine', this._threatToneB);
    this._ready = true;
    this._applyThreat();
  }

  _beginNativeRoomLoop() {
    const buffer = this._assetBuffers.get('S_RoomLoop');
    if (!buffer || this._nativeRoomSource || !this.ctx || this._disposed) return;
    const source = this._node(this.ctx.createBufferSource());
    source.buffer = buffer;
    source.loop = true;
    const level = this._gain(0.30);
    source.connect(level);
    level.connect(this._master);
    // A distant room bed, beneath the television in front of the listener.
    this._ambientBus.gain.setValueAtTime(0, this.ctx.currentTime);
    this._sources.add(source);
    source.start();
    this._nativeRoomSource = source;
  }

  _beginTVLoop() {
    const buffer = this._assetBuffers.get('S_TVLoop');
    if (!buffer || this._tvSource || !this.ctx || this._disposed) return;
    const source = this._node(this.ctx.createBufferSource());
    source.buffer = buffer;
    source.loop = true;
    source.connect(this._tvGain);
    this._tvFallbackBus.gain.setValueAtTime(0, this.ctx.currentTime);
    this._sources.add(source);
    source.start();
    this._tvSource = source;
  }

  _duckTV(level, hold) {
    const param = this._tvDuckGain?.gain;
    if (!param || !this.ctx) return;
    const now = this.ctx.currentTime;
    this._smooth(param, level, 0.018);
    param.setTargetAtTime(1, now + hold, 0.13);
  }

  _nativeVoice(name, level = 1, pan = 0) {
    const buffer = this._assetBuffers.get(name);
    return this._bufferVoice(buffer, level, pan);
  }

  _bufferVoice(buffer, level = 1, pan = 0) {
    if (!buffer || !this._canSound()) return false;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = level;
    const panner = this._panner(pan);
    source.connect(gain);
    gain.connect(panner);
    panner.connect(this._master);
    this._trackVoice(source, [gain, panner]);
    source.start(this.ctx.currentTime + 0.004);
    return true;
  }

  _applyThreat() {
    const pressure = this._amount ** 1.55;
    this._smooth(this._breathGain?.gain, pressure * 0.067, 0.42);
    this._smooth(this._threatToneA?.gain, pressure * 0.021, 0.48);
    this._smooth(this._threatToneB?.gain, pressure * 0.013, 0.5);
    this._smooth(this._breathFilter?.frequency, 260 + pressure * 510, 0.58);
    this._smooth(this._threatOscA?.frequency, 72 - pressure * 9, 0.6);
    this._smooth(this._threatOscB?.frequency, 75.4 - pressure * 10.5, 0.6);
    this._smooth(this._threatPanner?.pan, this._pan, 0.3);
  }

  _applyMaster(seconds) {
    this._smooth(this._master?.gain, this.paused || this.muted || this._hidden ? 0 : this.volume, seconds);
  }

  _smooth(param, value, seconds = 0.1) {
    if (!param || !this.ctx || this._disposed) return;
    try {
      const now = this.ctx.currentTime;
      if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(now);
      else {
        const current = param.value;
        param.cancelScheduledValues(now);
        param.setValueAtTime(current, now);
      }
      param.setTargetAtTime(value, now, Math.max(0.01, seconds));
    } catch { /* Closing or interrupted contexts need no intervention. */ }
  }

  _noiseHit(time, duration, strength, lowpass, pan, filterType, highpass) {
    const c = this.ctx;
    const source = c.createBufferSource();
    source.buffer = this._white;
    const high = c.createBiquadFilter();
    high.type = filterType;
    high.frequency.value = highpass;
    high.Q.value = 0.55;
    const low = c.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = lowpass;
    low.Q.value = 0.65;
    const gain = c.createGain();
    this._envelope(gain.gain, time, duration, strength, 0.003);
    const panner = this._panner(pan);
    source.connect(high);
    high.connect(low);
    low.connect(gain);
    gain.connect(panner);
    panner.connect(this._master);
    this._trackVoice(source, [high, low, gain, panner]);
    source.start(time, Math.random() * (source.buffer.duration - duration - 0.01));
    source.stop(time + duration + 0.025);
  }

  _tone(time, duration, pitch, strength, pan, type = 'sine', endPitch = pitch) {
    const c = this.ctx;
    const source = c.createOscillator();
    source.type = type;
    source.frequency.setValueAtTime(pitch, time);
    source.frequency.exponentialRampToValueAtTime(Math.max(20, endPitch), time + duration);
    const gain = c.createGain();
    this._envelope(gain.gain, time, duration, strength, 0.006);
    const low = c.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 1100;
    low.Q.value = 0.5;
    const panner = this._panner(pan);
    source.connect(low);
    low.connect(gain);
    gain.connect(panner);
    panner.connect(this._master);
    this._trackVoice(source, [low, gain, panner]);
    source.start(time);
    source.stop(time + duration + 0.025);
  }

  _buttonVoice(time, negative) {
    const c = this.ctx;
    const source = c.createBufferSource();
    source.buffer = this._switchBuffers[negative ? 1 : 0];
    const high = c.createBiquadFilter();
    high.type = 'highpass';
    high.frequency.value = 65;
    high.Q.value = 0.55;
    const low = c.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 4600;
    low.Q.value = 0.5;
    const panner = this._panner(negative ? 0.3 : -0.3);
    const dry = c.createGain();
    dry.gain.value = 0.88;
    source.connect(high);
    high.connect(low);
    low.connect(panner);
    panner.connect(dry);
    dry.connect(this._master);
    const nodes = [high, low, panner, dry];
    // Short, damped wall reflections. No feedback or long artificial wash.
    for (const [seconds, level, cutoff] of [[0.036, 0.07, 1900], [0.071, 0.042, 1450], [0.109, 0.024, 1100]]) {
      const delay = c.createDelay(0.15);
      delay.delayTime.value = seconds;
      const damping = c.createBiquadFilter();
      damping.type = 'lowpass';
      damping.frequency.value = cutoff;
      const wet = c.createGain();
      wet.gain.value = level;
      panner.connect(delay);
      delay.connect(damping);
      damping.connect(wet);
      wet.connect(this._master);
      nodes.push(delay, damping, wet);
    }
    this._trackVoice(source, nodes);
    source.start(time);
  }

  _makeTVChange() {
    const rate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, Math.ceil(rate * 0.88), rate);
    const data = buffer.getChannelData(0);
    let bass = 0, low = 0, tune = 0, phase = 0, peak = 0;
    const highAlpha = 1 - Math.exp(-2 * Math.PI * 640 / rate);
    const lowAlpha = 1 - Math.exp(-2 * Math.PI * 5300 / rate);
    for (let i = 0; i < data.length; i += 1) {
      const t = i / rate;
      const noise = Math.random() * 2 - 1;
      bass += highAlpha * (noise - bass);
      low += lowAlpha * (noise - bass - low);
      const age = Math.max(0, t - 0.02);
      const lock = Math.max(0, Math.min(1, (0.77 - t) / 0.15));
      const snow = Math.min(1, age / 0.035) * Math.exp(-age * 3.5) * lock;
      const carrier = 1600 - Math.min(1, t / 0.7) * 980;
      const alpha = 1 - Math.exp(-2 * Math.PI * carrier / rate);
      tune += alpha * (low - tune);
      phase += 2 * Math.PI * (415 + 70 * Math.sin(t * 9)) / rate;
      let value = low * 0.43 * snow;
      value += tune * 0.21 * snow * Math.sin(2 * Math.PI * 31 * t);
      value += Math.sin(phase) * 0.012 * snow;
      for (const [onset, strength] of [[0.004, 0.13], [0.70, 0.065]]) {
        const tick = t - onset;
        if (tick >= 0 && tick < 0.055) {
          value += (noise - bass) * strength * Math.min(1, tick / 0.0007) * Math.exp(-tick * 185);
        }
      }
      value *= Math.min(1, t / 0.003) * Math.min(1, (0.88 - t) / 0.06);
      data[i] = value;
      peak = Math.max(peak, Math.abs(value));
    }
    const normalization = 0.22 / Math.max(peak, 0.01);
    for (let i = 0; i < data.length; i += 1) data[i] *= normalization;
    return buffer;
  }

  _makeSwitch(negative) {
    const c = this.ctx;
    // Zero padding preserves the reflection tail before onended disconnects it.
    const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * 0.43), c.sampleRate);
    const data = buffer.getChannelData(0);
    const body = negative ? 167 : 183;
    const returnTime = negative ? 0.125 : 0.116;
    let noiseLow = 0;
    let peak = 0;
    for (let i = 0; i < data.length; i += 1) {
      const t = i / c.sampleRate;
      const noise = Math.random() * 2 - 1;
      noiseLow += 0.3 * (noise - noiseLow);
      const contact = noise - noiseLow;
      // The rigid cap hits its stop, the electrical contact snaps, then a
      // heavier spring returns it. Damped modal tones describe the casing;
      // their pitch stays fixed, so this does not become a confirmation beep.
      const attack = Math.min(1, t / 0.0007);
      let value = attack * (
        noiseLow * 0.73 * Math.exp(-t * 120) +
        Math.sin(2 * Math.PI * body * t) * 0.29 * Math.exp(-t * 39) +
        Math.sin(2 * Math.PI * body * 1.71 * t + 0.5) * 0.065 * Math.exp(-t * 57) +
        Math.sin(2 * Math.PI * (negative ? 793 : 713) * t) * 0.031 * Math.exp(-t * 66)
      );
      const snap = t - 0.007;
      if (snap > 0 && snap < 0.04) value += contact * 0.5 * Math.exp(-snap * 245) * Math.min(1, snap / 0.0005);
      const rebound = t - returnTime;
      if (rebound > 0 && rebound < 0.12) {
        const onset = Math.min(1, rebound / 0.0009);
        value += onset * (
          noiseLow * 0.39 * Math.exp(-rebound * 139) +
          contact * 0.19 * Math.exp(-rebound * 195) +
          Math.sin(2 * Math.PI * (body * 1.12) * rebound) * 0.135 * Math.exp(-rebound * 58) +
          Math.sin(2 * Math.PI * 623 * rebound) * 0.022 * Math.exp(-rebound * 74)
        );
      }
      const settle = t - returnTime - 0.031;
      if (settle > 0 && settle < 0.028) value += noiseLow * 0.14 * Math.exp(-settle * 160);
      data[i] = value;
      peak = Math.max(peak, Math.abs(value));
    }
    // Consistent foreground level across sample rates and random noise seeds.
    const normalization = 0.68 / Math.max(peak, 0.01);
    for (let i = 0; i < data.length; i += 1) data[i] *= normalization;
    return buffer;
  }

  _envelope(param, time, duration, peak, attack) {
    param.setValueAtTime(0, time);
    param.linearRampToValueAtTime(peak, time + attack);
    param.exponentialRampToValueAtTime(0.00001, time + duration);
    param.setValueAtTime(0, time + duration + 0.01);
  }

  _trackVoice(source, nodes) {
    const voice = { source, nodes };
    this._voices.add(voice);
    source.onended = () => {
      for (const node of [source, ...nodes]) {
        try { node.disconnect(); } catch { /* Already disconnected. */ }
      }
      this._voices.delete(voice);
    };
  }

  _makeNoise(brown) {
    const size = Math.ceil(this.ctx.sampleRate * 5.3);
    const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    let mean = 0;
    for (let i = 0; i < size; i += 1) {
      const white = Math.random() * 2 - 1;
      last = brown ? (last + 0.018 * white) / 1.018 : white;
      data[i] = brown ? last * 3.2 : last;
      mean += data[i];
    }
    if (brown) {
      mean /= size;
      for (let i = 0; i < size; i += 1) data[i] -= mean;
      // Blend the low-frequency loop boundary; it must not become a click.
      const fade = Math.min(1024, Math.floor(size / 8));
      const seam = (data[0] + data[size - 1]) * 0.5;
      for (let i = 0; i < fade; i += 1) {
        const weight = i / fade;
        data[i] = seam * (1 - weight) + data[i] * weight;
        const end = size - 1 - i;
        data[end] = seam * (1 - weight) + data[end] * weight;
      }
    }
    return buffer;
  }

  _loop(buffer, destination, offset = 0) {
    const source = this._node(this.ctx.createBufferSource());
    source.buffer = buffer;
    source.loop = true;
    source.connect(destination);
    this._sources.add(source);
    source.start(0, offset % buffer.duration);
    return source;
  }

  _osc(frequency, type, destination) {
    const oscillator = this._node(this.ctx.createOscillator());
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    oscillator.connect(destination);
    this._sources.add(oscillator);
    oscillator.start();
    return oscillator;
  }

  _lfo(frequency, depth, target, type = 'sine') {
    const gain = this._gain(depth);
    gain.connect(target);
    this._osc(frequency, type, gain);
  }

  _gain(value) {
    const gain = this._node(this.ctx.createGain());
    gain.gain.value = value;
    return gain;
  }

  _filter(type, frequency, q) {
    const filter = this._node(this.ctx.createBiquadFilter());
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    return filter;
  }

  _panner(pan) {
    if (typeof this.ctx.createStereoPanner === 'function') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = pan;
      return panner;
    }
    // Older browsers can still play the sound, with a mono fallback.
    return this.ctx.createGain();
  }

  _node(node) {
    this._nodes.push(node);
    return node;
  }

  _canSound() {
    return this._ready && !this._disposed && !this.paused && !this.muted && !this._hidden && this.volume > 0 && this.ctx?.state === 'running';
  }

  _clamp(value, min = 0, max = 1) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min;
  }

  _teardown() {
    clearTimeout(this._suspendTimer);
    this._suspendTimer = null;
    for (const voice of this._voices) {
      try { voice.source.stop(); } catch { /* Already ended. */ }
      for (const node of [voice.source, ...voice.nodes]) {
        try { node.disconnect(); } catch { /* Already disconnected. */ }
      }
    }
    this._voices.clear();
    for (const source of this._sources) {
      try { source.stop(); } catch { /* Already stopped. */ }
    }
    this._sources.clear();
    for (const node of this._nodes) {
      try { node.disconnect(); } catch { /* Already disconnected. */ }
    }
    this._nodes = [];
    const context = this.ctx;
    this.ctx = null;
    this._ready = false;
    this._white = this._brown = this._master = this._switchBuffers = this._tvChangeFallback = null;
    this._ambientBus = this._nativeRoomSource = null;
    this._tvSource = this._tvPanner = this._tvGain = this._tvDuckGain = this._tvFallbackBus = null;
    this._assetDecoding = null;
    this._assetBuffers.clear();
    if (context && context.state !== 'closed') {
      try { Promise.resolve(context.close()).catch(() => {}); } catch { /* Optional. */ }
    }
  }
}

export default RoomAudio;
