import React, { useState, useEffect } from 'react';
import { Song, Playlist } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, Music, Trash2, Edit3, BookOpen, AlertCircle, 
  RotateCcw, SlidersHorizontal, ChevronRight, FileCode,
  ListMusic, Check, X, ChevronDown, ChevronUp, FolderHeart,
  Settings, Download, Upload, Database, Sliders, Moon, Sun, Monitor,
  Sparkles
} from 'lucide-react';

interface SongListProps {
  songs: Song[];
  playlists: Playlist[];
  onSelectSong: (song: Song) => void;
  onEditSong: (song: Song) => void;
  onDeleteSong: (id: string) => void;
  onAddSong: () => void;
  onResetToDefaults: () => void;
  onSavePlaylist: (playlistData: { id?: string; name: string; songIds: string[] }) => void;
  onDeletePlaylist: (id: string) => void;
  onImportBackup: (importedSongs: Song[], importedPlaylists: Playlist[]) => void;
  showAppToast?: (message: string, type?: 'success' | 'info') => void;
  onAddAISong?: (song: Song, targetPlaylistIds: string[]) => void;
}

export default function SongList({
  songs,
  playlists,
  onSelectSong,
  onEditSong,
  onDeleteSong,
  onAddSong,
  onResetToDefaults,
  onSavePlaylist,
  onDeletePlaylist,
  onImportBackup,
  showAppToast,
  onAddAISong
}: SongListProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists' | 'settings'>('songs');

  // User global interface settings cached in localStorage
  const [globalTheme, setGlobalTheme] = useState<'light' | 'dark' | 'stage'>(() => {
    const saved = localStorage.getItem('cifras-theme');
    return (saved as 'light' | 'dark' | 'stage') || 'dark';
  });
  const [globalFontSize, setGlobalFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('cifras-fontSize');
    return saved ? Number(saved) : 15;
  });
  const [globalShowConfigPanel, setGlobalShowConfigPanel] = useState<boolean>(() => {
    const saved = localStorage.getItem('cifras-showConfigPanel');
    return saved !== null ? saved === 'true' : true;
  });

  const handleUpdateGlobalTheme = (theme: 'light' | 'dark' | 'stage') => {
    localStorage.setItem('cifras-theme', theme);
    setGlobalTheme(theme);
  };

  const handleUpdateGlobalFontSize = (size: number) => {
    localStorage.setItem('cifras-fontSize', String(size));
    setGlobalFontSize(size);
  };

  const handleUpdateGlobalConfigPanel = (show: boolean) => {
    localStorage.setItem('cifras-showConfigPanel', String(show));
    setGlobalShowConfigPanel(show);
  };

  // Stats calculation for the local database
  const songsSizeStr = JSON.stringify(songs);
  const playlistsSizeStr = JSON.stringify(playlists);
  const totalBytes = songsSizeStr.length + playlistsSizeStr.length;
  const storagePercentage = Math.min(100, Math.max(0.01, (totalBytes / (5 * 1024 * 1024)) * 100));
  const formattedSize = totalBytes > 1024 ? `${(totalBytes / 1024).toFixed(2)} KB` : `${totalBytes} Bytes`;

  // Backup handlers
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: Date.now(),
      songs,
      playlists,
      settings: {
        fontSize: localStorage.getItem('cifras-fontSize') || '15',
        theme: localStorage.getItem('cifras-theme') || 'dark',
        showConfigPanel: localStorage.getItem('cifras-showConfigPanel') || 'true'
      }
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `database_cifras_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackupClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json || typeof json !== 'object') {
          throw new Error('Conteúdo do arquivo inválido');
        }

        const importedSongs = json.songs;
        const importedPlaylists = json.playlists;

        if (!Array.isArray(importedSongs)) {
          if (showAppToast) {
            showAppToast('Erro: Arquivo com estrutura de músicas inválida no backup.', 'info');
          } else {
            alert('Estrutura de músicas inválida no arquivo de backup.');
          }
          return;
        }

        onImportBackup(importedSongs, Array.isArray(importedPlaylists) ? importedPlaylists : []);

        if (json.settings) {
          if (json.settings.fontSize) {
            localStorage.setItem('cifras-fontSize', String(json.settings.fontSize));
            setGlobalFontSize(Number(json.settings.fontSize));
          }
          if (json.settings.theme) {
            localStorage.setItem('cifras-theme', String(json.settings.theme));
            setGlobalTheme(json.settings.theme);
          }
          if (json.settings.showConfigPanel) {
            localStorage.setItem('cifras-showConfigPanel', String(json.settings.showConfigPanel));
            setGlobalShowConfigPanel(json.settings.showConfigPanel === 'true' || json.settings.showConfigPanel === true);
          }
        }

        if (showAppToast) {
          showAppToast('Backup importado com sucesso!');
        } else {
          alert('Backup importado com sucesso! Músicas, playlists e configurações foram atualizados instantaneamente.');
        }
      } catch (err) {
        if (showAppToast) {
          showAppToast('Erro ao ler ou processar arquivo de backup.', 'info');
        } else {
          alert('Erro ao ler ou processar arquivo de backup. Certifique-se de que é um JSON válido exportado anteriormente.');
        }
        console.error(err);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Search & Filter state for song listing
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Accordion state for active playlist views
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);

  // Playlist interactive modal states
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [playlistName, setPlaylistName] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [searchPlaylistSongTerm, setSearchPlaylistSongTerm] = useState('');

  // AI Search & Save states
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const [aiSearchTitle, setAiSearchTitle] = useState('');
  const [aiSearchArtist, setAiSearchArtist] = useState('');
  const [aiSearchSelectedKey, setAiSearchSelectedKey] = useState('G');
  const [aiSearchCategory, setAiSearchCategory] = useState('Pop/Rock');
  const [aiSearchPlaylistIds, setAiSearchPlaylistIds] = useState<string[]>(['playlist-repertorio1']);
  const [aiIsGenerating, setAiIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiProgressMessage, setAiProgressMessage] = useState('');

  // Reset check box selections if playlists list changes (ensure newly created playlists show up or align correctly)
  useEffect(() => {
    // Sync to default to REPERTÓRIO1 if it exists
    if (!aiSearchPlaylistIds.includes('playlist-repertorio1') && playlists.some(p => p.id === 'playlist-repertorio1')) {
      setAiSearchPlaylistIds(prev => Array.from(new Set([...prev, 'playlist-repertorio1'])));
    }
  }, [playlists]);

  const handleTogglePlaylistSelection = (playlistId: string) => {
    setAiSearchPlaylistIds(prev => 
      prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  const handleTriggerAISearchAndSave = async () => {
    if (!aiSearchTitle.trim()) {
      setAiError('Por favor, informe o nome ou palavra-chave da música.');
      return;
    }

    setAiIsGenerating(true);
    setAiError(null);
    setAiProgressMessage('Conectando ao banco de partituras...');

    const messages = [
      'Buscando a letra e alinhando cifras...',
      'Analisando tons e decolando harmonias...',
      'Formatando cabeçalhos e seções clássicas...',
      'Aprimorando o posicionamento dos acordes...',
      'Quase pronto: polindo os acordes finais...'
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      if (msgIndex < messages.length) {
        setAiProgressMessage(messages[msgIndex]);
        msgIndex++;
      }
    }, 2000);

    try {
      const response = await fetch('/api/generate-chords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: aiSearchTitle.trim(),
          artist: aiSearchArtist.trim() || 'Artista no Catálogo AI',
          originalKey: aiSearchSelectedKey
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Erro de comunicação com o servidor de IA.');
      }

      const data = await response.json();
      if (!data.cifra || !data.cifra.trim()) {
        throw new Error('Não foi possível gerar acordes para esta busca.');
      }

      // Format/Construct new Song Object
      const newSong: Song = {
        id: `song-${Math.random().toString(36).substring(2, 11)}`,
        title: aiSearchTitle.trim(),
        artist: aiSearchArtist.trim() || 'Artista no Catálogo AI',
        originalKey: aiSearchSelectedKey,
        rawCifra: data.cifra,
        category: aiSearchCategory || 'Geral',
        createdAt: Date.now()
      };

      if (onAddAISong) {
        onAddAISong(newSong, aiSearchPlaylistIds);
      }

      // Reset fields
      setAiSearchTitle('');
      setAiSearchArtist('');
      setIsAISearchOpen(false);
      
      if (showAppToast) {
        showAppToast('Música adicionada com sucesso por Inteligência Artificial! ✨');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Houve um erro desconhecido na busca online. Tente novamente.');
    } finally {
      clearInterval(interval);
      setAiIsGenerating(false);
    }
  };

  // Dynamically obtain available categories from song database + "Todas"
  const categories = ['Todas', ...Array.from(new Set(songs.map(s => s.category).filter(Boolean)))];

  // Search & Filter algorithm for the primary song library
  const filteredSongs = songs.filter(song => {
    const matchesSearch = 
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.rawCifra.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === 'Todas' || song.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Modal open handlers
  const handleOpenPlaylistModal = (playlist?: Playlist) => {
    if (playlist) {
      setEditingPlaylist(playlist);
      setPlaylistName(playlist.name);
      setSelectedSongIds([...playlist.songIds]);
    } else {
      setEditingPlaylist(null);
      setPlaylistName('');
      setSelectedSongIds([]);
    }
    setSearchPlaylistSongTerm('');
    setIsPlaylistModalOpen(true);
  };

  const handleToggleSongSelection = (songId: string) => {
    setSelectedSongIds(prev => 
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const handleSavePlaylistClick = () => {
    if (!playlistName.trim()) {
      if (showAppToast) {
        showAppToast('Por favor, informe o nome da playlist.', 'info');
      } else {
        alert('Por favor, informe o nome da playlist.');
      }
      return;
    }
    onSavePlaylist({
      id: editingPlaylist?.id,
      name: playlistName.trim(),
      songIds: selectedSongIds
    });
    setIsPlaylistModalOpen(false);
  };

  // Filter songs lists inside the modal
  const filteredModalSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchPlaylistSongTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchPlaylistSongTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Visual Identity Hero Card */}
      <div className="bg-gradient-to-r from-gray-900 via-stone-800 to-zinc-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden mb-6">
        <div className="relative z-10 space-y-2">
          <span className="text-2xs bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans">
            ⚡ Banco de Dados Local Instantâneo
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans">
            Biblioteca de Cifras
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl font-sans font-light">
            Suas cifras e playlists estão guardadas e seguras neste dispositivo! Crie repertórios personalizados, altere tons e edite acordes de forma super rápida e offline.
          </p>
        </div>
        
        {/* Subtle decorative vector circles back */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <Music className="w-40 h-40" />
        </div>
      </div>

      {/* Tabs bar selector */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('songs')}
          className={`flex items-center gap-2 py-3 px-4 sm:px-6 -mb-px text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'songs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          id="tab-btn-songs"
        >
          <Music className="w-4 h-4" />
          Músicas ({songs.length})
        </button>
        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center gap-2 py-3 px-4 sm:px-6 -mb-px text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'playlists'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          id="tab-btn-playlists"
        >
          <ListMusic className="w-4 h-4" />
          Playlists ({playlists.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 py-3 px-4 sm:px-6 -mb-px text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          id="tab-btn-settings"
        >
          <Settings className="w-4 h-4" />
          Configurações (Database)
        </button>
      </div>

      {/* Main library or playlists render */}
      {activeTab === 'songs' ? (
        <div>
          {/* Library Controls Module */}
          <div className="space-y-4 mb-6">
            
            {/* Row 1: Search and Adding button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:-outline-offset-1 focus:outline-gray-400 focus:border-gray-400 transition-all text-sm bg-white text-gray-900 placeholder:text-gray-400 font-sans"
                  placeholder="Buscar música, artista ou acordes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    setAiError(null);
                    setAiSearchTitle(searchTerm); // Prefill if they typed something in the lookup bar
                    setIsAISearchOpen(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-650 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
                  id="btn-ai-search"
                  title="Buscar ou gerar cifra online via Inteligência Artificial"
                >
                  <Sparkles className="w-4.5 h-4.5 text-indigo-150 animate-pulse" />
                  <span>Busca Online IA</span>
                </button>

                <button
                  onClick={onAddSong}
                  className="px-4 py-2.5 bg-gray-950 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  id="btn-add-song"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Música</span>
                </button>
              </div>
            </div>

            {/* Row 2: Category Filter Horizontal Scrollbar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-1 hidden sm:block" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-full shrink-0 font-medium border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Songs Registry Cards */}
          {filteredSongs.length > 0 ? (
            <div className="space-y-3">
              {filteredSongs.map((song) => (
                <div 
                  key={song.id}
                  className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 p-4 flex items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer text-left"
                  onClick={() => onSelectSong(song)}
                  id={`song-card-${song.id}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 bg-stone-50 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 text-gray-400 transition-colors shrink-0">
                      <Music className="w-5 h-5" />
                    </div>
                    
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate leading-tight group-hover:text-indigo-600 transition-colors text-sm sm:text-base">
                        {song.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        <span className="text-xs text-gray-500 truncate max-w-[125px] sm:max-w-none">
                          {song.artist}
                        </span>
                        <span className="text-2xs text-gray-300">•</span>
                        <span className="text-2xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                          {song.category}
                        </span>
                        <span className="text-2xs text-gray-300">•</span>
                        <span className="text-2xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">
                          Tom: {song.originalKey}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action columns (Delete) */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onDeleteSong(song.id)}
                      className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Excluir música"
                      id={`btn-delete-${song.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all ml-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-100 shadow-3xs">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Nenhuma música encontrada</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
                Tente buscar com outro termo ou crie sua própria cifra copiando e colando do seu site favorito!
              </p>
              <button
                onClick={onAddSong}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar primeira música
              </button>
            </div>
          )}

          {/* Database control footer utilities (such as resets) */}
          <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400 text-center sm:text-left flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-gray-300" />
              Total: {songs.length} músicas armazenadas de forma persistente.
            </div>
            <button
              onClick={onResetToDefaults}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
              title="Restaura as músicas iniciais de teste"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar clássicos de demonstração
            </button>
          </div>
        </div>
      ) : activeTab === 'playlists' ? (
        // Playlists active tab view
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-950 font-sans">
              Suas Playlists do Show
            </h2>
            <button
              onClick={() => handleOpenPlaylistModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              id="btn-create-playlist"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Playlist
            </button>
          </div>

          {playlists.length > 0 ? (
            <div className="space-y-4">
              {playlists.map((playlist) => {
                const isExpanded = expandedPlaylistId === playlist.id;
                // Gather playlist songs detail safely
                const playlistSongs = playlist.songIds
                  .map(id => songs.find(s => s.id === id))
                  .filter((s): s is Song => !!s);

                return (
                  <div 
                    key={playlist.id}
                    className="bg-white rounded-xl border border-gray-100 hover:border-gray-150 shadow-2xs overflow-hidden transition-all duration-200"
                  >
                    {/* Header line of the item */}
                    <div 
                      onClick={() => setExpandedPlaylistId(isExpanded ? null : playlist.id)}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none bg-stone-50/50 hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 text-indigo-600 rounded-lg shrink-0">
                          <FolderHeart className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                            {playlist.name}
                          </h4>
                          <span className="text-xs text-gray-500 font-medium font-sans">
                            {playlistSongs.length} {playlistSongs.length === 1 ? 'música' : 'músicas'}
                          </span>
                        </div>
                      </div>

                      {/* Header controls and toggle dropdown arrow */}
                      <div className="flex items-center gap-1.5 font-sans" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenPlaylistModal(playlist)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar Playlist"
                          id={`btn-edit-playlist-${playlist.id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePlaylist(playlist.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Playlist"
                          id={`btn-delete-playlist-${playlist.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {playlist.id === 'playlist-repertorio1' && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50/80 text-indigo-650 font-sans border border-indigo-100/60 shrink-0">
                            Automática
                          </span>
                        )}
                        <button
                          onClick={() => setExpandedPlaylistId(isExpanded ? null : playlist.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Playlist content block */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-2 bg-white divide-y divide-gray-50">
                        {playlistSongs.length > 0 ? (
                          playlistSongs.map((pSong, idx) => (
                            <div
                              key={`${playlist.id}-${pSong.id}-${idx}`}
                              onClick={() => onSelectSong(pSong)}
                              className="group flex items-center justify-between py-2.5 px-3 hover:bg-indigo-50/50 rounded-lg cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-2xs font-mono font-semibold text-gray-450 w-4 block text-center shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 group-hover:text-indigo-650 transition-colors text-sm truncate">
                                    {pSong.title}
                                  </p>
                                  <p className="text-2xs text-gray-500 truncate">
                                    {pSong.artist} • <span className="font-mono text-[10px] bg-gray-100 px-1 py-0.2 rounded">{pSong.originalKey}</span>
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs text-gray-500 px-4 italic">
                            Esta playlist não possui músicas. Clique em editar para adicionar!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-100 shadow-3xs">
              <ListMusic className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Nenhuma playlist criada</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
                Organize suas apresentações, cultos, ensaios ou repertórios por tema!
              </p>
              <button
                onClick={() => handleOpenPlaylistModal()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Criar minha primeira playlist
              </button>
            </div>
          )}
        </div>
      ) : (
        // Database & Settings active tab view
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-gray-150">
            <h2 className="text-base sm:text-lg font-bold text-gray-905 font-sans flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-655" />
              Painel de Controle & Configuração do Banco
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left font-sans">
            
            {/* Column 1: Configuração de Visualização Padrão */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 font-sans border-b border-gray-100 pb-2">
                <Sliders className="w-4 h-4 text-indigo-505 animate-pulse" />
                Preferências Padrão de Exibição
              </h3>
              <p className="text-3xs sm:text-2xs text-gray-400 leading-normal">
                Ajuste os valores padrões salvos. Ao abrir qualquer cifra de música, esses valores configurados no banco de dados serão aplicados automaticamente de forma global.
              </p>

              {/* Tema padrão */}
              <div className="space-y-2">
                <label className="text-2xs font-semibold text-gray-600 uppercase tracking-wider block">
                  Tema do Visualizador Padrão
                </label>
                <div className="flex gap-1.5">
                  {(['light', 'dark', 'stage'] as const).map((t) => (
                    <button
                      key={`global-theme-${t}`}
                      onClick={() => handleUpdateGlobalTheme(t)}
                      className={`flex-1 py-1.5 text-3xs sm:text-2xs font-medium rounded-xl border transition-all cursor-pointer ${
                        globalTheme === t 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-3xs font-bold' 
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50 bg-white'
                      }`}
                    >
                      {t === 'light' ? '☀️ Dia (Claro)' : t === 'dark' ? '🌙 Noite (Escuro)' : '⚡ Palco (Preto)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fonte padrão */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-2xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tamanho da Letra Padrão
                  </label>
                  <span className="text-2xs font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded text-gray-750">
                    {globalFontSize}px
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateGlobalFontSize(Math.max(10, globalFontSize - 1))}
                    className="w-8 h-8 flex items-center justify-center text-sm rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors font-bold select-none cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="10"
                    max="32"
                    step="1"
                    value={globalFontSize}
                    onChange={(e) => handleUpdateGlobalFontSize(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <button
                    onClick={() => handleUpdateGlobalFontSize(Math.min(32, globalFontSize + 1))}
                    className="w-8 h-8 flex items-center justify-center text-sm rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors font-bold select-none cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Exibir painel por padrão */}
              <div className="flex items-center justify-between p-3 bg-stone-50/55 rounded-xl border border-stone-100">
                <div>
                  <span className="text-2xs font-bold text-gray-805 block">Mostrar Painel Auxiliar</span>
                  <span className="text-3xs text-gray-400 block">Exibe botões de rolagem direto ao abrir a cifra</span>
                </div>
                <button
                  onClick={() => handleUpdateGlobalConfigPanel(!globalShowConfigPanel)}
                  className={`px-2.5 py-1 text-3xs font-bold rounded-lg border transition-all cursor-pointer ${
                    globalShowConfigPanel 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' 
                      : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  {globalShowConfigPanel ? 'Ativo' : 'Oculto'}
                </button>
              </div>

            </div>

            {/* Column 2: Status do Banco de Dados Local & Backup */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 font-sans border-b border-gray-100 pb-2">
                <Database className="w-4 h-4 text-indigo-500" />
                Status & Backup do Banco de Dados
              </h3>

              {/* Database stats info card */}
              <div className="p-4 bg-zinc-950 text-white rounded-xl space-y-3 relative overflow-hidden shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-3xs font-bold uppercase tracking-widest text-emerald-400 font-sans">Sincronizado • Offline</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-stone-100">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-sans">Músicas Salvas</span>
                    <span className="text-base sm:text-lg font-bold font-mono">{songs.length}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-sans font-medium">Playlists Ativas</span>
                    <span className="text-base sm:text-lg font-bold font-mono">{playlists.length}</span>
                  </div>
                </div>
                
                {/* Storage Quota bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[9px] text-zinc-500 font-sans">
                    <span>Espaço Ocupado no Navegador</span>
                    <span className="font-mono text-zinc-400">{formattedSize} / 5.00 MB</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-550 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${storagePercentage}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Backup & Import actions */}
              <div className="space-y-2.5 pt-1">
                <label className="text-[10px] sm:text-xs font-semibold text-gray-655 uppercase tracking-wider block font-sans">
                  Importação & Exportação Segura
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Export Backup button */}
                  <button
                    onClick={handleExportBackup}
                    className="px-3 py-2 bg-gray-950 hover:bg-gray-850 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                    title="Exportar todas as músicas e playlists em arquivo .json"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-300" />
                    Exportar Backup
                  </button>

                  {/* Import Backup button */}
                  <label className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-250 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs">
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Importar Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackupClick}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Safety Factory Reset */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/50 p-2.5 rounded-lg">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-red-650 uppercase tracking-widest block font-sans">Zerar Dados</span>
                  <span className="text-[10px] text-gray-400 font-sans block leading-none">Restaura cifras padrão do aplicativo.</span>
                </div>
                <button
                  onClick={onResetToDefaults}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-150 text-red-600 rounded-lg text-3xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Zerar e Reiniciar
                </button>
              </div>

            </div>

          </div>

          {/* Quick instructions block */}
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-left leading-relaxed space-y-1.5 text-indigo-950 font-sans shadow-3xs">
            <h4 className="text-xs font-bold flex items-center gap-1.5 text-indigo-900">
              💡 Qual a vantagem do Banco de Dados Local Offline?
            </h4>
            <p className="text-3xs sm:text-2xs text-indigo-850">
              Esta tecnologia grava todo o seu repertório de cifras de forma **blindada, instantânea e offline**. Você não depende de servidores instáveis, internet lenta de sinal 3G/4G/5G em ensaios ou palcos selados, ou de login de contas de terceiros. Seu fluxo é 100% privado e autônomo. Você pode exportar seu arquivo de backup e abrir as cifras instantaneamente em qualquer outro dispositivo de forma simples!
            </p>
          </div>
        </div>
      )}

      {/* RENDER INTERACTIVE PLAYLIST EDIT/CREATE MODAL */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-gray-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-gray-950 text-base flex items-center gap-1.5 font-sans">
                <ListMusic className="w-5 h-5 text-indigo-600 animate-pulse" />
                {editingPlaylist ? 'Editar Playlist' : 'Nova Playlist'}
              </h3>
              <button
                onClick={() => setIsPlaylistModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                  Nome da Playlist
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ensaios de Sábado, Repertório Casamento..."
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-gray-400 text-sm placeholder:text-gray-400 bg-white text-gray-950 font-sans"
                  autoFocus
                />
              </div>

              {/* Songs checklist selection */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                    Adicionar Músicas ({selectedSongIds.length} selecionadas)
                  </label>
                </div>

                {/* Subsearch inside modal */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filtrar músicas do acervo..."
                    value={searchPlaylistSongTerm}
                    onChange={(e) => setSearchPlaylistSongTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-950 placeholder:text-gray-400 font-sans"
                  />
                </div>

                {/* Songs scroll lists */}
                <div className="border border-gray-100 rounded-xl max-h-56 overflow-y-auto divide-y divide-gray-50 p-1 bg-stone-50/20">
                  {filteredModalSongs.length > 0 ? (
                    filteredModalSongs.map(song => {
                      const isSelected = selectedSongIds.includes(song.id);
                      return (
                        <div
                          key={`modal-song-${song.id}`}
                          onClick={() => handleToggleSongSelection(song.id)}
                          className="flex items-center justify-between p-2.5 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-gray-905 text-xs truncate">
                              {song.title}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {song.artist} • {song.category}
                            </p>
                          </div>

                          {/* Checkbox item */}
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            isSelected 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                              : 'border-gray-250 bg-white hover:border-gray-400'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-400 bg-white italic">
                      Nenhuma música na biblioteca para adicionar.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2 bg-stone-50">
              <button
                onClick={() => setIsPlaylistModalOpen(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 text-gray-600 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePlaylistClick}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Salvar Playlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER INTERACTIVE AI ONLINE SEARCH MODAL */}
      {isAISearchOpen && (
        <div className="fixed inset-0 bg-black/60 z-55 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-indigo-100">
            {/* Header with Sparkly Gradient banner */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-violet-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg text-white">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-950 text-base font-sans leading-tight">
                    Busca de Cifras Inteligente (AI)
                  </h3>
                  <p className="text-[10px] text-gray-500 leading-none font-sans">
                    Gerador automático de letras e acordes online
                  </p>
                </div>
              </div>
              <button
                onClick={() => !aiIsGenerating && setIsAISearchOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-30"
                disabled={aiIsGenerating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {aiIsGenerating ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="relative flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    <Sparkles className="w-5 h-5 text-violet-500 absolute animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-850 font-sans animate-pulse">
                      {aiProgressMessage || 'Buscando cifra...'}
                    </p>
                    <p className="text-3xs text-gray-405 font-sans max-w-xs px-4">
                      O robô inteligente da Gemini está mapeando as notas exatas e organizando a estrutura sob medida para você tocar.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  {/* Alert Error */}
                  {aiError && (
                    <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-650 flex gap-2 items-start font-sans leading-relaxed">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-650" />
                      <div>
                        <span className="font-bold">Opa! ocorrência de erro: </span>
                        {aiError}
                      </div>
                    </div>
                  )}

                  {/* Field 1: Song title name (Required) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-650 uppercase tracking-widest block font-sans">
                      Nome da Música <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Ainda Gosto Dela, Garota de Ipanema, Floods..."
                      value={aiSearchTitle}
                      onChange={(e) => {
                        setAiSearchTitle(e.target.value);
                        if (aiError) setAiError(null);
                      }}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:-outline-offset-1 focus:outline-gray-400 focus:border-gray-400 text-sm placeholder:text-gray-400 bg-white text-gray-950 font-sans"
                      autoFocus
                    />
                  </div>

                  {/* Field 2: Artist (Optional but highly recommended) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-650 uppercase tracking-widest block font-sans">
                      Artista ou Banda <span className="text-gray-450 text-[9px] font-normal font-sans">(Recomendado)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Skank, Tom Jobim, Pantera..."
                      value={aiSearchArtist}
                      onChange={(e) => setAiSearchArtist(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:-outline-offset-1 focus:outline-gray-400 focus:border-gray-400 text-sm placeholder:text-gray-400 bg-white text-gray-950 font-sans"
                    />
                  </div>

                  {/* Horizontal grid for Key / Category */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Key Dropdown selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-650 uppercase tracking-widest block font-sans">
                        Tom de Preferência
                      </label>
                      <select
                        value={aiSearchSelectedKey}
                        onChange={(e) => setAiSearchSelectedKey(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-955 focus:outline-gray-400 text-xs font-sans font-semibold cursor-pointer"
                      >
                        {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'Cm', 'Dm', 'Em', 'Am'].map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-650 uppercase tracking-widest block font-sans">
                        Gênero / Categoria
                      </label>
                      <select
                        value={aiSearchCategory}
                        onChange={(e) => setAiSearchCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-955 focus:outline-gray-400 text-xs font-sans font-semibold cursor-pointer"
                      >
                        {['Pop/Rock', 'Gospel', 'Sertanejo', 'Samba/Pagode', 'MPB', 'Bossa Nova', 'Reggae', 'Forró', 'Metal', 'Geral'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Target Playlists checklist scrollable */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-bold text-gray-650 uppercase tracking-widest block font-sans">
                      Adicionar Direto à(s) Playlist(s)
                    </label>
                    <p className="text-[9px] text-gray-450 leading-none font-sans">
                      A música será salva em sua biblioteca principal e vinculada a estes repertórios:
                    </p>
                    <div className="border border-gray-150 rounded-xl divide-y divide-gray-100 max-h-[140px] overflow-y-auto bg-stone-50/10 p-1">
                      {playlists.map(pl => {
                        const isSelected = aiSearchPlaylistIds.includes(pl.id);
                        return (
                          <div
                            key={`ai-target-pl-${pl.id}`}
                            onClick={() => handleTogglePlaylistSelection(pl.id)}
                            className="flex items-center justify-between p-2 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <span className="text-xs font-medium text-gray-800 font-sans">
                              {pl.name} {pl.id === 'playlist-repertorio1' && ' (Automática)'}
                            </span>
                            <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-3xs' 
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                      {playlists.length === 0 && (
                        <div className="text-center py-4 text-3xs text-gray-400 italic font-sans font-medium">
                          Nenhuma playlist cadastrada.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2 bg-stone-50">
              <button
                onClick={() => setIsAISearchOpen(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 text-gray-600 font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-35"
                disabled={aiIsGenerating}
              >
                Cancelar
              </button>
              <button
                onClick={handleTriggerAISearchAndSave}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
                disabled={aiIsGenerating || !aiSearchTitle.trim()}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pesquisar e Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
