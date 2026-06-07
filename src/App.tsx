import { useState, useEffect } from 'react';
import { Song, Playlist } from './types';
import { DEFAULT_SONGS } from './utils/defaultSongs';
import SongList from './components/SongList';
import SongViewer from './components/SongViewer';
import SongEditor from './components/SongEditor';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  // 1. Initial State: Load songs from localStorage or use DEFAULT_SONGS
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('cifras-songs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Song[];
        if (parsed && parsed.length > 0) {
          return parsed.sort((a, b) => a.title.localeCompare(b.title));
        }
      } catch (e) {
        console.error('Error loading songs from localStorage:', e);
      }
    }
    // Deep copy default songs to avoid mutating imported objects
    return [...DEFAULT_SONGS].sort((a, b) => a.title.localeCompare(b.title));
  });

  // 2. Initial State: Load playlists from localStorage
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('cifras-playlists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Playlist[];
        if (parsed) {
          return parsed.sort((a, b) => b.createdAt - a.createdAt);
        }
      } catch (e) {
        console.error('Error loading playlists from localStorage:', e);
      }
    }
    return [];
  });

  const [view, setView] = useState<'list' | 'viewer' | 'editor'>('list');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  
  // Toast notifications for user actions
  const [toast, setToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Helper trigger for toast notification popups
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync state modifications directly with localStorage on change (automatic persistence)
  useEffect(() => {
    localStorage.setItem('cifras-songs', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('cifras-playlists', JSON.stringify(playlists));
  }, [playlists]);

  // Handle restoring imported backup data
  const handleImportBackup = (importedSongs: Song[], importedPlaylists: Playlist[]) => {
    setSongs(importedSongs);
    setPlaylists(importedPlaylists);
    showToast('Banco de dados local restaurado com sucesso!', 'success');
  };

  // Add or update a song in local state
  const handleSaveSong = (songData: Omit<Song, 'id' | 'createdAt'>) => {
    if (editingSong) {
      // Update existing song
      const updatedSongs = songs.map(s => {
        if (s.id === editingSong.id) {
          return {
            ...s,
            title: songData.title.trim(),
            artist: songData.artist.trim(),
            originalKey: songData.originalKey.trim(),
            rawCifra: songData.rawCifra,
            category: songData.category.trim(),
            bpm: songData.bpm,
          };
        }
        return s;
      });
      
      // Keep alphabetical order
      updatedSongs.sort((a, b) => a.title.localeCompare(b.title));
      setSongs(updatedSongs);
      
      // Update selected song ref if we are viewing it
      if (selectedSong?.id === editingSong.id) {
        setSelectedSong({
          ...selectedSong,
          title: songData.title.trim(),
          artist: songData.artist.trim(),
          originalKey: songData.originalKey.trim(),
          rawCifra: songData.rawCifra,
          category: songData.category.trim(),
          bpm: songData.bpm
        });
      }

      showToast('Cifra atualizada com sucesso!');
    } else {
      // Generate new song
      const newId = `song-${Math.random().toString(36).substring(2, 11)}`;
      const newSong: Song = {
        id: newId,
        title: songData.title.trim(),
        artist: songData.artist.trim(),
        originalKey: songData.originalKey.trim(),
        rawCifra: songData.rawCifra,
        category: songData.category.trim(),
        bpm: songData.bpm,
        createdAt: Date.now()
      };

      const updatedSongs = [...songs, newSong];
      updatedSongs.sort((a, b) => a.title.localeCompare(b.title));
      setSongs(updatedSongs);
      showToast('Nova cifra adicionada com sucesso!');
    }
    
    // Redirect to list
    setView('list');
    setEditingSong(null);
  };

  // Delete an existing song from local database
  const handleDeleteSong = (id: string) => {
    const songToDelete = songs.find(s => s.id === id);
    if (!songToDelete) return;

    if (window.confirm(`Tem certeza que deseja excluir a música "${songToDelete.title}"?`)) {
      // Remove from list
      setSongs(prev => prev.filter(s => s.id !== id));
      
      // Remove this song ID from all playlists too to maintain integrity
      setPlaylists(prev => prev.map(pl => {
        if (pl.songIds.includes(id)) {
          return {
            ...pl,
            songIds: pl.songIds.filter(sid => sid !== id)
          };
        }
        return pl;
      }));

      showToast('Cifra excluída da sua biblioteca.', 'info');
      
      if (selectedSong?.id === id) {
        setSelectedSong(null);
        setView('list');
      }
    }
  };

  // Restores standard backup catalog songs offline
  const handleResetToDefaults = () => {
    if (window.confirm('Deseja realmente restaurar as músicas demonstrativas originais? Isso substituirá todas as edições e removerá as adicionadas.')) {
      // Load standard defaults
      const restored = [...DEFAULT_SONGS].sort((a, b) => a.title.localeCompare(b.title));
      setSongs(restored);
      setPlaylists([]); // Clear playlists since references may point to custom deleted songs
      
      showToast('Biblioteca de demonstração restaurada.', 'info');
      setSelectedSong(null);
      setEditingSong(null);
      setView('list');
    }
  };

  // Add or update a Playlist
  const handleSavePlaylist = (playlistData: { id?: string; name: string; songIds: string[] }) => {
    if (playlistData.id) {
      // Update existing playlist
      setPlaylists(prev => {
        const next = prev.map(pl => {
          if (pl.id === playlistData.id) {
            return {
              ...pl,
              name: playlistData.name.trim(),
              songIds: playlistData.songIds
            };
          }
          return pl;
        });
        return next;
      });
      showToast('Playlist atualizada com sucesso!');
    } else {
      // Create new playlist
      const newId = `playlist-${Math.random().toString(36).substring(2, 11)}`;
      const newPlaylist: Playlist = {
        id: newId,
        name: playlistData.name.trim(),
        songIds: playlistData.songIds,
        createdAt: Date.now()
      };
      
      setPlaylists(prev => [newPlaylist, ...prev]);
      showToast('Playlist criada com sucesso!');
    }
  };

  // Delete an existing Playlist
  const handleDeletePlaylist = (id: string) => {
    const plToDelete = playlists.find(p => p.id === id);
    if (!plToDelete) return;

    if (window.confirm(`Tem certeza que deseja excluir a playlist "${plToDelete.name}"?`)) {
      setPlaylists(prev => prev.filter(p => p.id !== id));
      showToast('Playlist excluída.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-gray-800 antialiased font-sans flex flex-col">
      
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm max-w-sm w-full bg-stone-900 border-zinc-800 text-white"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span className="flex-1 font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Views with Motion Fade transitions */}
      <main className="flex-1 w-full relative flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'list' && (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SongList
                songs={songs}
                playlists={playlists}
                onSelectSong={(song) => {
                  setSelectedSong(song);
                  setView('viewer');
                }}
                onEditSong={(song) => {
                  setEditingSong(song);
                  setView('editor');
                }}
                onDeleteSong={handleDeleteSong}
                onAddSong={() => {
                  setEditingSong(null);
                  setView('editor');
                }}
                onResetToDefaults={handleResetToDefaults}
                onSavePlaylist={handleSavePlaylist}
                onDeletePlaylist={handleDeletePlaylist}
                onImportBackup={handleImportBackup}
              />
            </motion.div>
          )}

          {view === 'viewer' && selectedSong && (
            <motion.div
              key="viewer-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SongViewer
                song={selectedSong}
                onBack={() => {
                  setView('list');
                  setSelectedSong(null);
                }}
                onEdit={() => {
                  setEditingSong(selectedSong);
                  setView('editor');
                }}
              />
            </motion.div>
          )}

          {view === 'editor' && (
            <motion.div
              key="editor-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SongEditor
                song={editingSong}
                onSave={handleSaveSong}
                onCancel={() => {
                  setView(selectedSong ? 'viewer' : 'list');
                  setEditingSong(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Simple humbler branding credit line complying with architecture rules */}
      {view === 'list' && (
        <footer className="py-6 border-t border-gray-100 bg-white text-center text-xs text-gray-400 font-sans">
          <p>© 2026 Aplicativo de Cifras • Desenvolvido para músicos</p>
        </footer>
      )}
    </div>
  );
}
