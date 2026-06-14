export class SpaceAmbientEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  oscillators: (OscillatorNode | null)[] = [];
  isPlaying = false;
  
  currentSign: string | null = null;
  currentVolume = 0.5;

  async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);
    
    // Add a convolver for reverb effect if we wanted true space, but multiple delays work too
    // For simplicity, we use multiple oscillators to create a dense sound
  }

  async start() {
    if (!this.ctx) await this.init();
    if (this.ctx!.state === 'suspended') {
      await this.ctx!.resume();
    }
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Fade in
    this.masterGain!.gain.setTargetAtTime(this.currentVolume, this.ctx!.currentTime, 2);

    this.playDrone();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    
    // Fade out
    if (this.ctx && this.masterGain) {
       this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 2);
    }
    
    setTimeout(() => {
       this.oscillators.forEach(osc => {
         try { if (osc) { osc.stop(); osc.disconnect(); } } catch (e) {}
       });
       this.oscillators = [];
    }, 2500);
  }

  setVolume(vol: number) {
    this.currentVolume = vol;
    if (this.masterGain && this.ctx) {
      if (this.isPlaying) {
         this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.5);
      }
    }
  }

  setSign(sign: string | null) {
    this.currentSign = sign;
    this.updateDroneNotes();
  }

  private playDrone() {
     const baseFreqs = this.getFrequenciesForSign(this.currentSign);
     
     // create some slow oscillators
     baseFreqs.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        
        // subtle LFO for evolving sound pitch
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.05 + Math.random() * 0.1;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 2; // subtle detune
        lfo.connect(lfoGain);
        lfoGain.connect(osc.detune);
        lfo.start();
        
        // Volume LFO (Tremolo) to make it breathe
        const volLfo = this.ctx.createOscillator();
        volLfo.type = 'sine';
        volLfo.frequency.value = 0.02 + Math.random() * 0.05; // very slow
        const volLfoGain = this.ctx.createGain();
        volLfoGain.gain.value = 0.15; // amount of volume variation
        volLfo.connect(volLfoGain);
        
        // Base gain for this voice is lower to prevent clipping
        gain.gain.value = 0.15; 
        volLfoGain.connect(gain.gain);
        volLfo.start();

        // simple lowpass filter to muddy it up and make it ambient
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = freq * 3.5;
        filter.Q.value = 1.0;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        this.oscillators.push(osc);
        this.oscillators.push(lfo);
        this.oscillators.push(volLfo);
     });
     
     // Add some gentle white-ish noise (filtered heavily) for cosmic background
     this.addCosmicDust();
  }
  
  private addCosmicDust() {
      if (!this.ctx || !this.masterGain) return;
      const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 400; // Low rumble
      filter.Q.value = 0.5;
      
      const gain = this.ctx.createGain();
      gain.gain.value = 0.02; // Very quiet
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      noise.start();
      
      // Store in oscillators array so it gets cleaned up. It's technically an AudioBufferSourceNode.
      // @ts-ignore
      this.oscillators.push(noise);
  }

  private updateDroneNotes() {
    if (!this.isPlaying || !this.ctx) return;
    const newFreqs = this.getFrequenciesForSign(this.currentSign);
    
    // Smoothly transition frequencies of active voice oscillators
    let oscIndex = 0;
    this.oscillators.forEach(node => {
      // Audio oscillators have frequencies generally set above 20 in our droning setup
      // (LFOs are set < 1Hz normally in this code)
      if (node && node.frequency && typeof node.frequency.setTargetAtTime === 'function') {
         if (node.frequency.value > 20 && oscIndex < newFreqs.length) {
            node.frequency.setTargetAtTime(newFreqs[oscIndex], this.ctx.currentTime, 5); // very slow 5s glide
            oscIndex++;
         }
      }
    });
  }

  private getFrequenciesForSign(sign: string | null): number[] {
    // Frequencies form a deep, evolving chord.
    // 5 voices
    let freqs = [65.41, 98.00, 130.81, 164.81, 196.00]; // Default C Maj 7 feeling

    if (["Bạch Dương", "Sư Tử", "Nhân Mã"].includes(sign || '')) {
       // Fire signs: Energetic, D Mixolydian vibes
       freqs = [73.42, 110.00, 146.83, 164.81, 233.08]; 
    } 
    else if (["Kim Ngưu", "Xử Nữ", "Ma Kết"].includes(sign || '')) {
       // Earth signs: Deep, grounded, perfect fifths - C stable
       freqs = [65.41, 98.00, 130.81, 196.00, 261.63]; 
    }
    else if (["Song Tử", "Thiên Bình", "Bảo Bình"].includes(sign || '')) {
       // Air signs: Ethereal, suspended, higher register - F Lydian
       freqs = [87.31, 130.81, 174.61, 261.63, 293.66]; 
    }
    else if (["Cự Giải", "Bọ Cạp", "Song Ngư"].includes(sign || '')) {
       // Water signs: Melancholic, deep, fluid - E minor add9
       freqs = [82.41, 123.47, 164.81, 220.00, 246.94]; 
    }
    return freqs;
  }
}

export const audioEngine = new SpaceAmbientEngine();
