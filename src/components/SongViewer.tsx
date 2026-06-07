import { useState, useEffect, useRef } from 'react';
import { Song, ViewerPreferences } from '../types';
import { parseSongSheet, transposeParsedLines, ParsedLine } from '../utils/chordTransposer';
import { 
  ArrowLeft, Minus, Plus, RefreshCw, ZoomIn, ZoomOut, Play, Pause, 
  HelpCircle, Smartphone, Eye, Sparkles, ChevronUp, ChevronDown, Sliders
} from 'lucide-react';

interface SongViewerProps {
  song: Song;
  onBack: () => void;
  onUpdateSong?: (updatedSong: Song) => void;
}

export default function SongViewer({ song, onBack, onUpdateSong }: SongViewerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);



  // Handle dynamic AI chord sheet generation
  useEffect(() => {
    if (song.rawCifra === 'gerar' && !isGenerating) {
      setIsGenerating(true);
      setGenerationError(null);

      fetch('/api/generate-chords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: song.title,
          artist: song.artist,
          originalKey: song.originalKey
        })
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Falha na resposta do servidor.');
          }
          return res.json();
        })
        .then(data => {
          if (data && data.cifra) {
            if (onUpdateSong) {
              onUpdateSong({
                ...song,
                rawCifra: data.cifra
              });
            }
          } else {
            throw new Error('Cifra vazia recebida do servidor.');
          }
          setIsGenerating(false);
        })
        .catch(err => {
          console.error('Error generating cifra:', err);
          setGenerationError('Erro ao gerar cifra por IA. Por favor, tente novamente.');
          setIsGenerating(false);
        });
    }
  }, [song.id, song.rawCifra]);

  // Load preferences from localStorage or use defaults
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('cifras-fontSize');
    return saved ? Number(saved) : 15;
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'stage'>(() => {
    const saved = localStorage.getItem('cifras-theme');
    return (saved as 'light' | 'dark' | 'stage') || 'dark';
  });
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);

  const [transposeOffset, setTransposeOffset] = useState(0);
  const [preferFlats, setPreferFlats] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('cifras-autoScrollSpeed');
    return saved ? Number(saved) : 3;
  });
  const [isScrolling, setIsScrolling] = useState(false);
  const [showBluetoothHelp, setShowBluetoothHelp] = useState(false);
  const [scrolledToTop, setScrolledToTop] = useState(true);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Auto-start scroll preference
  const [autoStartScroll, setAutoStartScroll] = useState<boolean>(() => {
    const saved = localStorage.getItem('cifras-autoStartScroll');
    return saved !== null ? saved === 'true' : true; // default to true
  });
  const [isWarmupActive, setIsWarmupActive] = useState(false);

  // Synchronized BPM states
  const [bpm, setBpm] = useState<number>(() => {
    const savedBpm = localStorage.getItem(`cifras-bpm-${song.id}`);
    return savedBpm ? Number(savedBpm) : (song.bpm || 120);
  });
  const [scrollMode, setScrollMode] = useState<'manual' | 'bpm'>(() => {
    const savedBpm = localStorage.getItem(`cifras-bpm-${song.id}`);
    return (song.bpm || savedBpm) ? 'bpm' : 'manual';
  });
  const [bpmScrollFactor, setBpmScrollFactor] = useState<number>(() => {
    const saved = localStorage.getItem('cifras-bpmScrollFactor');
    return saved ? Number(saved) : 5;
  });
  const [enableMetronomeVisual, setEnableMetronomeVisual] = useState<boolean>(false);
  const [metronomeState, setMetronomeState] = useState<boolean>(false);
  const lastTapRef = useRef<number[]>([]);

  // Synchronize BPM changes back to the main app database
  useEffect(() => {
    if (onUpdateSong && song.bpm !== bpm) {
      onUpdateSong({
        ...song,
        bpm: bpm
      });
    }
  }, [bpm, song.id]);

  // Initialize song states, reset viewport and handle auto-start with stage preparation countdown delay
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setShowConfigPanel(false);
    const savedBpm = localStorage.getItem(`cifras-bpm-${song.id}`);
    const currentBpm = savedBpm ? Number(savedBpm) : (song.bpm || 120);
    setBpm(currentBpm);
    const hasBpm = !!(song.bpm || savedBpm);
    setScrollMode(hasBpm ? 'bpm' : 'manual');

    if (autoStartScroll) {
      setIsScrolling(false);
      setIsWarmupActive(true);
      // Give the musician 1.5s to prepare their hands before starting to scroll down
      const countdown = setTimeout(() => {
        setIsScrolling(true);
        setIsWarmupActive(false);
      }, 1500);
      return () => {
        clearTimeout(countdown);
        setIsWarmupActive(false);
      };
    } else {
      setIsScrolling(false);
      setIsWarmupActive(false);
    }
  }, [song.id, song.bpm, autoStartScroll]);

  // Metronome Pulse Visual Effect
  useEffect(() => {
    if (!enableMetronomeVisual || bpm <= 0) return;

    const intervalTime = 60000 / bpm; // ms per beat

    const pulseInterval = setInterval(() => {
      setMetronomeState(true);
      const timeout = setTimeout(() => {
        setMetronomeState(false);
      }, 120); // flash for 120ms
      return () => clearTimeout(timeout);
    }, intervalTime);

    return () => clearInterval(pulseInterval);
  }, [enableMetronomeVisual, bpm]);

  const handleTapTempo = () => {
    const now = Date.now();
    lastTapRef.current = [...lastTapRef.current.slice(-4), now];
    if (lastTapRef.current.length > 1) {
      const intervals = [];
      for (let i = 1; i < lastTapRef.current.length; i++) {
        intervals.push(lastTapRef.current[i] - lastTapRef.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const computedBpm = Math.round(60000 / avgInterval);
      if (computedBpm >= 30 && computedBpm <= 300) {
        setBpm(computedBpm);
      }
    }
  };

  // Synchronize dynamic song transposition overrides on active target change
  useEffect(() => {
    const savedOffset = localStorage.getItem(`cifras-transpose-${song.id}`);
    const savedPreferFlats = localStorage.getItem(`cifras-preferFlats-${song.id}`);
    setTransposeOffset(savedOffset ? parseInt(savedOffset, 10) : 0);
    setPreferFlats(savedPreferFlats === 'true');
  }, [song.id]);

  // Persist general config preferences when modified
  useEffect(() => {
    localStorage.setItem('cifras-fontSize', String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('cifras-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('cifras-showConfigPanel', String(showConfigPanel));
  }, [showConfigPanel]);

  useEffect(() => {
    localStorage.setItem('cifras-autoScrollSpeed', String(autoScrollSpeed));
  }, [autoScrollSpeed]);

  useEffect(() => {
    localStorage.setItem('cifras-autoStartScroll', String(autoStartScroll));
  }, [autoStartScroll]);

  // Persist custom transpose modifications per single song
  useEffect(() => {
    localStorage.setItem(`cifras-transpose-${song.id}`, String(transposeOffset));
  }, [transposeOffset, song.id]);

  useEffect(() => {
    localStorage.setItem(`cifras-preferFlats-${song.id}`, String(preferFlats));
  }, [preferFlats, song.id]);

  useEffect(() => {
    localStorage.setItem(`cifras-bpm-${song.id}`, String(bpm));
  }, [bpm, song.id]);

  useEffect(() => {
    localStorage.setItem('cifras-bpmScrollFactor', String(bpmScrollFactor));
  }, [bpmScrollFactor]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Parse and transpose lines based on current offset
  const parsedLines = parseSongSheet(song.rawCifra);
  const currentLines = transposeParsedLines(parsedLines, transposeOffset, preferFlats);

  // Monitor scroll for clean full-screen indicator
  useEffect(() => {
    const handleScroll = () => {
      setScrolledToTop(window.scrollY < 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for Bluetooth Pedal Key Triggers (Simulating Page Down/Up, arrows, space, etc.)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pageHeight = window.innerHeight * 0.75;
      
      switch (event.key) {
        case 'PageDown':
        case 'ArrowDown':
        case ' ': // Space bar
          if (event.target === document.body || event.target === containerRef.current || (event.target as HTMLElement).tagName === 'DIV') {
            event.preventDefault();
            window.scrollBy({ top: pageHeight, behavior: 'smooth' });
          }
          break;
        case 'PageUp':
        case 'ArrowUp':
          if (event.target === document.body || event.target === containerRef.current || (event.target as HTMLElement).tagName === 'DIV') {
            event.preventDefault();
            window.scrollBy({ top: -pageHeight, behavior: 'smooth' });
          }
          break;
        case 'ArrowRight':
          // Optional speed up
          if (autoScrollSpeed < 10) {
            setAutoScrollSpeed(prev => Math.min(prev + 1, 10));
            setIsScrolling(true);
          }
          break;
        case 'ArrowLeft':
          // Optional slow down or pause
          setAutoScrollSpeed(prev => {
            const next = Math.max(prev - 1, 0);
            if (next === 0) {
              setIsScrolling(false);
            }
            return next;
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [autoScrollSpeed]);

  // Smooth Auto-Scrolling Engine
  useEffect(() => {
    if (!isScrolling) return;

    const intervalTime = 60; // ms per check
    let step = 0;

    if (scrollMode === 'manual') {
      if (autoScrollSpeed === 0) return;
      step = 0.5 + (autoScrollSpeed * 0.25); // velocity index
    } else { // BPM mode
      // Calculation where default factor is 5 (middle) matching standard song speed
      const multiplier = 0.05 * bpmScrollFactor;
      step = (bpm / 60) * multiplier;
    }

    const timer = setInterval(() => {
      window.scrollBy(0, step);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isScrolling, autoScrollSpeed, scrollMode, bpm, bpmScrollFactor]);

  // Handle Transposition Shift resets
  const handleResetTranspose = () => setTransposeOffset(0);
  const handleIncreaseTranspose = () => setTransposeOffset(prev => prev === 11 ? -11 : prev + 1);
  const handleDecreaseTranspose = () => setTransposeOffset(prev => prev === -11 ? 11 : prev - 1);

  const ALL_POSSIBLE_KEYS = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 
    'E', 'F', 'F#', 'Gb', 'G', 'G#', 
    'Ab', 'A', 'A#', 'Bb', 'B'
  ];

  const handleSelectKey = (selectedKey: string) => {
    const NOTE_INDEX: { [k: string]: number } = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
      'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    
    const origVal = NOTE_INDEX[song.originalKey];
    const targetVal = NOTE_INDEX[selectedKey];
    
    if (origVal !== undefined && targetVal !== undefined) {
      let diff = targetVal - origVal;
      // Bring difference to nearest interval within [-5, 6] for natural chord transitions
      while (diff > 6) diff -= 12;
      while (diff <= -6) diff += 12;
      
      setTransposeOffset(diff);
      
      // Auto-set sharps vs flats preference based on chosen target key
      if (['Db', 'Eb', 'Gb', 'Ab', 'Bb'].includes(selectedKey)) {
        setPreferFlats(true);
      } else {
        setPreferFlats(false);
      }
    }
  };

  // Calculate current key name based on original key
  const getCurrentKeyName = () => {
    if (transposeOffset === 0) return song.originalKey;
    
    // Quick transposition helper for the banner
    const scale = preferFlats 
      ? ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
      : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    const NOTE_INDEX: { [k: string]: number } = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
      'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };

    const origVal = NOTE_INDEX[song.originalKey];
    if (origVal === undefined) return `${song.originalKey} (${transposeOffset > 0 ? '+' : ''}${transposeOffset})`;

    let newVal = (origVal + transposeOffset) % 12;
    while (newVal < 0) newVal += 12;

    return scale[newVal];
  };

  // Color theme classes mapping
  const themeClassesMap = {
    light: {
      bg: 'bg-stone-50',
      text: 'text-stone-850',
      cifra: 'text-blue-600 font-semibold',
      line: 'border-b border-stone-200/50',
      header: 'text-stone-900 bg-stone-200/60 font-semibold',
      lyrics: 'text-stone-850',
      controlBg: 'bg-white/95 border-stone-200 text-stone-800 shadow-lg',
      panelBg: 'bg-stone-100 border-stone-200',
      activeBtn: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    },
    dark: {
      bg: 'bg-zinc-950',
      text: 'text-white',
      cifra: 'text-sky-400',
      line: 'border-b border-zinc-900/40',
      header: 'text-zinc-100 bg-zinc-900/80 font-semibold',
      lyrics: 'text-white font-medium',
      controlBg: 'bg-zinc-900/95 border-zinc-800 text-zinc-200 shadow-xl',
      panelBg: 'bg-zinc-900 border-zinc-800',
      activeBtn: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    },
    stage: { // High contrast on pitch black - industry standard for gig sheets
      bg: 'bg-black',
      text: 'text-white',
      cifra: 'text-blue-400 font-bold',
      line: 'border-b border-neutral-900/30',
      header: 'text-zinc-305 bg-blue-500/10 border border-blue-500/20 font-bold',
      lyrics: 'text-white font-medium',
      controlBg: 'bg-zinc-950 border-zinc-900 shadow-2xl text-zinc-100',
      panelBg: 'bg-zinc-950/80 border-blue-500/20',
      activeBtn: 'bg-blue-400/10 border-blue-400/30 text-blue-400',
    }
  };

  const currentTheme = themeClassesMap[theme];

  if (isGenerating) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${theme === 'light' ? 'bg-stone-50 text-stone-900' : 'bg-zinc-950 text-white'}`}>
        <div className="space-y-6 max-w-sm">
          <div className="relative flex items-center justify-center mx-auto">
            {/* Spinning outward rings */}
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            <Sparkles className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight font-sans">IA Afinador Inteligente</h2>
            <p className="text-sm font-semibold text-amber-500">{song.title}</p>
            <p className="text-xs text-stone-400 font-sans">Artista: {song.artist}</p>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed font-sans font-light">
            Nossa Inteligência Artificial está gerando os acordes perfeitos e a letra para o tom de <span className="text-amber-500 font-bold font-mono">{song.originalKey}</span>...
          </p>
          <div className="pt-2">
            <span className="text-3xs tracking-widest uppercase text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full font-sans">
              Sintonizando cifras reais...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (generationError) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${theme === 'light' ? 'bg-stone-50 text-stone-900' : 'bg-zinc-950 text-white'}`}>
        <div className="space-y-6 max-w-sm bg-red-500/5 border border-red-500/15 p-6 rounded-2xl">
          <HelpCircle className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
          <div className="space-y-2">
            <h2 className="text-lg font-bold font-sans">Ops! Algo deu errado</h2>
            <p className="text-xs text-stone-400 leading-relaxed font-sans">
              Ocorreu um erro ao conectar ao servidor para gerar a cifra de <span className="font-semibold text-stone-200">{song.title}</span>.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-zinc-700 hover:bg-zinc-800 transition-all text-gray-300 cursor-pointer text-center"
            >
              Voltar à Lista
            </button>
            <button
              onClick={() => {
                setGenerationError(null);
                setIsGenerating(false);
              }}
              className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer text-center"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen transition-colors duration-250 pb-40 ${currentTheme.bg}`}
      id="song-viewer-container"
    >
      {/* Sticky Top Header Panel */}
      <div className={`sticky top-0 z-30 transition-all ${scrolledToTop ? 'bg-opacity-100' : 'bg-opacity-95 shadow-md'} ${currentTheme.bg} border-b border-neutral-200/10 px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-2 rounded-full transition-colors hover:bg-white/10`}
            title="Voltar para lista"
            id="viewer-back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
          <div className="flex flex-wrap items-center gap-4">
            {/* Scroll Speed Controls - Slider or BPM */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs select-none ${
                theme === 'light'
                  ? 'bg-stone-100 border-stone-200 text-stone-750'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsScrolling(!isScrolling)}
                className="flex items-center gap-1 mr-0.5 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors cursor-pointer active:scale-90"
                title={isScrolling ? 'Pausar Rolagem' : 'Iniciar Rolagem'}
              >
                {isScrolling ? (
                  <Pause className="w-3.5 h-3.5 fill-amber-500/10" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-amber-500/10" />
                )}
              </button>

              {scrollMode === 'manual' ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-3xs font-mono font-semibold tracking-wider leading-none w-3 text-center">{autoScrollSpeed}</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={autoScrollSpeed}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAutoScrollSpeed(val);
                      if (val > 0) {
                        setIsScrolling(true);
                      } else {
                        setIsScrolling(false);
                      }
                    }}
                    className="w-16 sm:w-24 h-1 bg-gray-300 dark:bg-zinc-650 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-600 transition-all"
                    title="Deslize para alterar a velocidade"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setBpm(prev => Math.max(30, prev - 2))}
                    className="p-0.5 text-gray-400 hover:text-amber-400 cursor-pointer"
                    title="-2 BPM"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-3xs sm:text-2xs font-mono font-bold text-amber-400 min-w-[54px] text-center flex items-center justify-center gap-1">
                    {enableMetronomeVisual && (
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors ${metronomeState ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-gray-600'}`}></span>
                    )}
                    {bpm} <span className="text-[9px] text-gray-500 font-normal">BPM</span>
                  </span>
                  <button
                    onClick={() => setBpm(prev => Math.min(300, prev + 2))}
                    className="p-0.5 text-gray-400 hover:text-amber-400 cursor-pointer"
                    title="+2 BPM"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <span className="text-2xs text-gray-600 hidden xs:inline">•</span>

            {/* Ultra-compact inline key transposer */}
            <div className="flex items-center gap-1 bg-stone-500/10 px-1.5 py-0.5 rounded text-xs select-none">
              <button
                onClick={handleDecreaseTranspose}
                className="p-0.5 text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
                title="-1 Semitom"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className="font-bold text-amber-400 px-1.5 py-0.5 rounded hover:bg-amber-500/20 active:scale-95 transition-all font-mono cursor-pointer border border-amber-500/25 flex items-center gap-0.5"
                title="Clique para escolher outro tom"
              >
                {getCurrentKeyName()}
              </button>
              <button
                onClick={handleIncreaseTranspose}
                className="p-0.5 text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
                title="+1 Semitom"
              >
                <Plus className="w-3 h-3" />
              </button>
              {transposeOffset !== 0 && (
                <button
                  onClick={handleResetTranspose}
                  className="p-0.5 text-gray-400 hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                  title="Resetar Tom"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowConfigPanel(prev => !prev)}
            className={`px-2.5 py-1 text-xs rounded transition-all border ${showConfigPanel ? currentTheme.activeBtn : 'border-gray-500/20 text-gray-400'}`}
          >
            {showConfigPanel ? 'Ocultar Controles' : 'Mostrar Controles'}
          </button>
        </div>
      </div>

      {/* Flexible sticky responsive floating layout controls */}
      {showConfigPanel && (
        <div className="max-w-4xl mx-auto px-4 mt-3 animate-fade-in">
          <div className={`p-4 rounded-xl border ${currentTheme.panelBg} space-y-4 shadow-sm text-sm`}>

            {/* Row 2: Zoom, theme options, Auto-scrolling, Bluetooth indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Text Zoom sizing */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Fonte (Tamanho Celular)</span>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
                    className="p-1.5 rounded bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 transition-colors"
                    title="Diminuir"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-semibold px-2">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize(prev => Math.min(32, prev + 1))}
                    className="p-1.5 rounded bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 transition-colors"
                    title="Aumentar"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Theme togglers */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tema Visual</span>
                <div className="flex gap-1 mt-1">
                  {(['light', 'dark', 'stage'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex-1 py-1 text-2xs uppercase tracking-tight rounded border transition-all ${theme === t ? currentTheme.activeBtn : 'border-gray-500/10 text-gray-400 bg-gray-500/5'}`}
                    >
                      {t === 'light' ? 'Dia' : t === 'dark' ? 'Noite' : '⚡ Palco'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smooth auto-scroll setting */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Rolagem Automática</span>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => {
                      if (isScrolling) {
                        setIsScrolling(false);
                      } else {
                        setIsScrolling(true);
                        if (scrollMode === 'manual') setAutoScrollSpeed(3);
                      }
                    }}
                    className={`p-1.5 rounded transition-colors ${isScrolling ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/10 text-gray-300'}`}
                    title={isScrolling ? 'Pausar' : 'Iniciar'}
                  >
                    {isScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  
                  {isScrolling && scrollMode === 'manual' && (
                    <div className="flex items-center gap-1 bg-gray-500/5 px-2 py-0.5 rounded border border-gray-500/10">
                      <button 
                        onClick={() => {
                          setAutoScrollSpeed(prev => {
                            const next = Math.max(0, prev - 1);
                            if (next === 0) {
                              setIsScrolling(false);
                            }
                            return next;
                          });
                        }}
                        className="text-gray-400 hover:text-white px-1 text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="text-2xs text-gray-300 font-mono">Vel: {autoScrollSpeed}</span>
                      <button 
                        onClick={() => {
                          setAutoScrollSpeed(prev => Math.min(10, prev + 1));
                          setIsScrolling(true);
                        }}
                        className="text-gray-400 hover:text-white px-1 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  )}
                  {isScrolling && scrollMode === 'bpm' && (
                    <span className="text-2xs text-amber-400 font-mono">
                      Sinc. BPM: {bpm}
                    </span>
                  )}
                  {!isScrolling && <span className="text-2xs text-gray-400 italic">Parado</span>}
                </div>
                <div className="pt-1.5 pl-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-zinc-400 hover:text-zinc-200 select-none">
                    <input
                      type="checkbox"
                      checked={autoStartScroll}
                      onChange={(e) => setAutoStartScroll(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                    />
                    <span>Começar rolando automaticamente ao abrir</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Custom high-craftsmanship BPM synchronizer and metronome panel section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-500/10 text-left">
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Sincronização & Modo de Rolagem
                </span>
                <div className="flex bg-gray-500/10 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setScrollMode('manual')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      scrollMode === 'manual' 
                        ? 'bg-amber-500 text-white shadow-3xs' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Velocidade Manual (1-10)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScrollMode('bpm')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      scrollMode === 'bpm' 
                        ? 'bg-indigo-600 text-white shadow-3xs' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Sincronizado BPM ({bpm} bpm)
                  </button>
                </div>

                {scrollMode === 'bpm' && (
                  <div className="space-y-3 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 animate-fade-in text-left">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-2xs font-semibold text-indigo-300 uppercase tracking-wider">Ajustar Tempo da Música</span>
                      <button
                        type="button"
                        onClick={handleTapTempo}
                        className="px-2 py-1 text-3xs font-bold uppercase rounded bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-95 transition-all"
                        title="Dê batidas sucessivas no botão para calcular o BPM"
                      >
                        ⚡ Tap Tempo (Batidas)
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBpm(prev => Math.max(30, prev - 5))}
                        className="p-1 px-2.5 font-bold rounded bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 w-10 text-center select-none cursor-pointer"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => setBpm(prev => Math.max(30, prev - 1))}
                        className="p-1 px-2 font-bold rounded bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 w-8 text-center select-none cursor-pointer"
                      >
                        -1
                      </button>
                      
                      <div className="flex-1 text-center font-mono font-bold text-base text-amber-400 flex items-center justify-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${metronomeState ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,1)]' : 'bg-gray-650'} transition-all duration-75 inline-block`}></span>
                        <span>{bpm}</span>
                        <span className="text-3xs text-gray-500 uppercase">BPM</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setBpm(prev => Math.min(300, prev + 1))}
                        className="p-1 px-2 font-bold rounded bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 w-8 text-center select-none cursor-pointer"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => setBpm(prev => Math.min(300, prev + 5))}
                        className="p-1 px-2.5 font-bold rounded bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 w-10 text-center select-none cursor-pointer"
                      >
                        +5
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-3xs text-gray-400">
                        <span>Ajuste de Relação / Fator de Velocidade</span>
                        <span className="font-mono text-indigo-300 font-bold">{bpmScrollFactor} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={bpmScrollFactor}
                        onChange={(e) => setBpmScrollFactor(Number(e.target.value))}
                        className="w-full h-1 bg-gray-300 dark:bg-zinc-650 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <span className="text-[10px] text-gray-400 leading-tight block">
                        Arraste para calibrar e regular a rolagem ideal da sua cifra sincronizada. O valor padrão é 5.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
                  Metrônomo do Palco
                </span>
                <div className="bg-gray-500/5 p-3 rounded-xl border border-gray-500/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-xs font-semibold block text-gray-350">Pisca Guia Visual</span>
                      <span className="text-[10px] text-gray-500">Acompanhe a batida com um LED no palco</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnableMetronomeVisual(!enableMetronomeVisual)}
                      className={`px-3 py-1.5 text-2xs font-bold rounded-lg border transition-all cursor-pointer ${
                        enableMetronomeVisual 
                          ? 'bg-green-500/20 border-green-500/30 text-green-400 font-bold' 
                          : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                      }`}
                    >
                      {enableMetronomeVisual ? 'LED Ativo' : 'Ativar LED'}
                    </button>
                  </div>

                  {enableMetronomeVisual && (
                    <div className="flex items-center justify-center gap-1.5 py-2.5 bg-black/40 rounded-lg border border-gray-500/10 relative overflow-hidden">
                      <div className="flex gap-4">
                        {[1, 2, 3, 4].map((beatNum) => (
                          <div 
                            key={beatNum} 
                            className={`w-3.5 h-3.5 rounded-full transition-all duration-100 ${
                              metronomeState 
                                ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] scale-110' 
                                : 'bg-zinc-800'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-gray-400 leading-normal text-left">
                    💡 **Como funciona**: Ao invés de velocidade fictícia de zero a dez, o sistema converte o **BPM Real** da faixa diretamente em deslocamento do scroll. Sua apresentação fica fluida de ponta a ponta!
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Bluetooth page turner status instructions */}
            <div className="pt-2 border-t border-gray-500/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowBluetoothHelp(prev => !prev)}
                className="text-xs text-indigo-400 hover:text-indigo-350 flex items-center gap-1 font-medium transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Como conectar o pedal Bluetooth
              </button>
              <div className="hidden sm:flex items-center gap-1.5 text-2xs text-gray-500">
                <Smartphone className="w-3.5 h-3.5" />
                Dica: Use no tablet/celular na horizontal
              </div>
            </div>

            {showBluetoothHelp && (
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-lg text-xs leading-relaxed space-y-1.5 text-gray-300 animate-fade-in font-sans">
                <p className="font-semibold text-indigo-200">🎛️ Conexão de Pedal Bluetooth / Passador de Páginas:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-300 pr-2">
                  <li>Ligue seu aparelho passador de páginas em modo teclado / simulador de teclas standard.</li>
                  <li>Conecte o aparelho via bluetooth nas configurações do seu celular ou tablet.</li>
                  <li>Foque nesta tela de cifra. Ao pressionar o pedal, ele disparará cliques que simulam teclas.</li>
                  <li>O aplicativo rolará a tela suavemente para baixo com as teclas <strong className="text-emerald-400">Page Down</strong>, <strong className="text-emerald-400">Seta para Baixo</strong> ou <strong className="text-emerald-400">Espaço</strong>.</li>
                  <li>Dará scroll para cima com <strong className="text-emerald-400">Page Up</strong> ou <strong className="text-emerald-400">Seta para Cima</strong>.</li>
                  <li>Controle a velocidade de rolagem automática direta com <strong className="text-emerald-400">Esquerda</strong> / <strong className="text-emerald-400">Direita</strong> no teclado!</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chord Render Space */}
      <div className="max-w-4xl mx-auto px-4 mt-6 relative">
        {isWarmupActive && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse flex items-center gap-2 pointer-events-none border border-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
            <span>Prepare-se! Rolagem começa em instantes...</span>
          </div>
        )}
        <div 
          className="p-6 sm:p-8 rounded-xl relative shadow-sm border border-neutral-200/10 overflow-x-auto"
          style={{ backgroundColor: theme === 'stage' ? '#000000' : undefined }}
        >
          {/* Virtual on-screen page turner buttons for users testing without a physical pedal pedal */}
          <div className="fixed right-4 bottom-24 z-20 flex flex-col gap-2">
            <button
              onClick={() => window.scrollBy({ top: -window.innerHeight * 0.7, behavior: 'smooth' })}
              className={`p-3 rounded-full shadow-lg border border-neutral-700/50 bg-black/80 hover:bg-black text-white hover:scale-105 transition-all`}
              title="Rolar Página Para Cima (PgUp)"
            >
              <ChevronUp className="w-5 h-5 text-amber-400" />
            </button>
            <button
              onClick={() => window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' })}
              className={`p-3 rounded-full shadow-lg border border-neutral-700/50 bg-black/80 hover:bg-black text-white hover:scale-105 transition-all`}
              title="Rolar Página Para Baixo (PgDn)"
            >
              <ChevronDown className="w-5 h-5 text-amber-400" />
            </button>
          </div>

          <pre 
            className="font-mono text-left leading-normal whitespace-pre tracking-normal"
            style={{ fontSize: `${fontSize}px` }}
          >
            <div className="mb-4 select-none font-sans whitespace-normal">
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme === 'light' ? 'text-stone-900' : 'text-white'}`}>
                {song.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {song.artist} • {song.category}
              </p>
            </div>

            <div className={`mb-3 pb-2 border-b ${theme === 'stage' ? 'border-zinc-900' : 'border-neutral-500/10'} select-none flex items-center gap-2`}>
              <span className="text-gray-400 font-sans text-xs font-semibold uppercase tracking-wider">TOM:</span>
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className={`${currentTheme.cifra} font-bold hover:scale-105 active:scale-95 transition-all bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-500/30 flex items-center gap-1 cursor-pointer font-sans`}
                title="Clique para escolher outro tom"
              >
                {getCurrentKeyName()}
                <span className="text-[10px] font-normal text-gray-500 font-sans ml-1">(mudar)</span>
              </button>
            </div>

            {currentLines.map((line, idx) => {
              if (line.type === 'pair') {
                return (
                  <div key={idx} className={`py-1 ${currentTheme.line}`}>
                    {/* The chords have robust highlighting */}
                    <div className={`${currentTheme.cifra} leading-none tracking-normal font-semibold [word-spacing:0.18em]`}>
                      {line.chordsContent}
                    </div>
                    {/* Lyrics underneath with standard readability */}
                    <div className={`${currentTheme.lyrics} mt-1 leading-normal`}>
                      {line.lyricsContent}
                    </div>
                  </div>
                );
              } else if (line.type === 'chords') {
                return (
                  <div key={idx} className={`py-1 ${currentTheme.cifra} leading-none font-semibold ${currentTheme.line}`}>
                    {line.chordsContent}
                  </div>
                );
              } else if (line.type === 'header') {
                return (
                  <div 
                    key={idx} 
                    className={`mt-4 px-2.5 py-1 ${currentTheme.header} rounded text-2xs uppercase tracking-wider inline-block select-none my-1`}
                  >
                    {line.rawContent}
                  </div>
                );
              } else if (line.type === 'empty') {
                return <div key={idx} className="h-4"></div>;
              } else {
                return (
                  <div key={idx} className={`py-0.5 ${currentTheme.lyrics} leading-relaxed`}>
                    {line.lyricsContent}
                  </div>
                );
              }
            })}
          </pre>
        </div>
      </div>

      {/* Key Selector Modal Popover */}
      {isKeyModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-start p-4 pt-16 sm:p-6 sm:pt-20 bg-black/15 animate-fade-in"
          onClick={() => setIsKeyModalOpen(false)}
        >
          <div 
            className={`w-full max-w-[290px] sm:max-w-xs rounded-xl p-4 border text-center transition-all shadow-2xl ${
              theme === 'light' 
                ? 'bg-stone-50 border-stone-200 text-stone-900 shadow-stone-400/30' 
                : 'bg-zinc-900/95 border-zinc-800 text-white shadow-black/80'
            }`}
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
          >
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 font-sans">
              Alterar Tom Geral
            </h3>
            
            <p className="text-2xs text-gray-500 mb-3.5 font-sans leading-relaxed">
              O tom atual é <span className="font-bold text-amber-500 font-mono">{getCurrentKeyName()}</span>.
            </p>

            {/* Grid of keys */}
            <div className="grid grid-cols-4 gap-1 justify-center">
              {ALL_POSSIBLE_KEYS.map((keyName) => {
                const isCurrent = getCurrentKeyName() === keyName;
                return (
                  <button
                    key={keyName}
                    onClick={() => handleSelectKey(keyName)}
                    className={`py-1.5 text-xs font-mono font-bold rounded-md transition-all border cursor-pointer active:scale-95 ${
                      isCurrent
                        ? 'bg-blue-600 border-blue-700 text-white shadow-sm font-extrabold scale-102'
                        : theme === 'light'
                          ? 'bg-white hover:bg-stone-100 border-stone-200 text-stone-850'
                          : 'bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-gray-200'
                    }`}
                  >
                    {keyName}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-500/10 flex flex-col gap-1.5">
              <button
                onClick={handleResetTranspose}
                disabled={transposeOffset === 0}
                className={`w-full py-1.5 text-2xs font-semibold rounded-md transition-colors ${
                  transposeOffset === 0
                    ? 'opacity-40 cursor-not-allowed bg-transparent text-gray-500'
                    : theme === 'light'
                      ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                      : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15'
                }`}
              >
                Voltar ao Tom Original
              </button>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className={`w-full py-1.5 text-2xs font-semibold rounded-md transition-colors ${
                  theme === 'light'
                    ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
