import { useState, useEffect, useRef } from 'react';
import { Song, ViewerPreferences } from '../types';
import { parseSongSheet, transposeParsedLines, ParsedLine } from '../utils/chordTransposer';
import { 
  ArrowLeft, Minus, Plus, RefreshCw, ZoomIn, ZoomOut, Play, Pause, 
  HelpCircle, Smartphone, Eye, Sparkles, ChevronUp, ChevronDown 
} from 'lucide-react';

interface SongViewerProps {
  song: Song;
  onBack: () => void;
  onEdit: () => void;
}

export default function SongViewer({ song, onBack, onEdit }: SongViewerProps) {
  const [transposeOffset, setTransposeOffset] = useState(0);
  const [preferFlats, setPreferFlats] = useState(false);
  const [fontSize, setFontSize] = useState(15); // Default monospace font size in pixels
  const [theme, setTheme] = useState<'light' | 'dark' | 'stage'>('dark');
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(0); // 0 = stopped, 1 to 10
  const [showBluetoothHelp, setShowBluetoothHelp] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(true);
  const [scrolledToTop, setScrolledToTop] = useState(true);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

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
          }
          break;
        case 'ArrowLeft':
          // Optional slow down or pause
          setAutoScrollSpeed(prev => Math.max(prev - 1, 0));
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
    if (autoScrollSpeed === 0) return;

    // Map speed level 1-10 to a polling timer
    // Higher speed = smaller interval / larger pixel jump
    const intervalTime = 60; // ms per check
    const step = 0.5 + (autoScrollSpeed * 0.25); // velocity index

    const timer = setInterval(() => {
      window.scrollBy(0, step);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoScrollSpeed]);

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
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight leading-tight flex items-center gap-2">
              <span className={theme === 'light' ? 'text-stone-900' : 'text-white'}>{song.title}</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{song.artist} • {song.category}</span>
              <span className="text-2xs text-gray-400">•</span>
              
              {/* Ultra-compact inline key transposer in the header */}
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
                  className="font-bold text-amber-400 px-1.5 py-0.5 rounded-md hover:bg-amber-500/20 active:scale-95 transition-all font-mono cursor-pointer border border-amber-500/25 flex items-center gap-0.5"
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
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowConfigPanel(prev => !prev)}
            className={`px-2.5 py-1 text-xs rounded transition-all border ${showConfigPanel ? currentTheme.activeBtn : 'border-gray-500/20 text-gray-400'}`}
          >
            {showConfigPanel ? 'Ocultar Controles' : 'Mostrar Controles'}
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-1 text-xs font-medium rounded border border-gray-500/20 text-gray-400 hover:text-white hover:border-gray-500/40 transition-colors"
          >
            Editar
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
                    onClick={() => setAutoScrollSpeed(prev => prev > 0 ? 0 : 3)}
                    className={`p-1.5 rounded transition-colors ${autoScrollSpeed > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/10 text-gray-300'}`}
                    title={autoScrollSpeed > 0 ? 'Pausar' : 'Iniciar'}
                  >
                    {autoScrollSpeed > 0 ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  
                  {autoScrollSpeed > 0 && (
                    <div className="flex items-center gap-1 bg-gray-500/5 px-2 py-0.5 rounded border border-gray-500/10">
                      <button 
                        onClick={() => setAutoScrollSpeed(prev => Math.max(1, prev - 1))}
                        className="text-gray-400 hover:text-white px-1 text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="text-2xs text-gray-300 font-mono">Vel: {autoScrollSpeed}</span>
                      <button 
                        onClick={() => setAutoScrollSpeed(prev => Math.min(10, prev + 1))}
                        className="text-gray-400 hover:text-white px-1 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  )}
                  {autoScrollSpeed === 0 && <span className="text-2xs text-gray-400 italic">Parado</span>}
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
      <div className="max-w-4xl mx-auto px-4 mt-6">
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
