import { useState, useEffect } from 'react';
import { Song, Playlist } from './types';
import { DEFAULT_SONGS } from './utils/defaultSongs';
import SongList from './components/SongList';
import SongViewer from './components/SongViewer';
import SongEditor from './components/SongEditor';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Trash2, RotateCcw } from 'lucide-react';

export default function App() {
  // 1. Initial State: Load songs from localStorage or use DEFAULT_SONGS
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('cifras-songs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Song[];
        if (parsed && parsed.length > 0) {
          // Merge local storage songs with DEFAULT_SONGS catalog so new entries are loaded automatically
          const merged = [...parsed];
          DEFAULT_SONGS.forEach(defSong => {
            if (!merged.some(s => s.id === defSong.id)) {
              merged.push(defSong);
            }
          });
          return merged.sort((a, b) => a.title.localeCompare(b.title));
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
          // Robustly clean up any duplicates of "REPERTÓRIO1" that might have been created
          const seenNames = new Set<string>();
          const cleaned = parsed.filter(pl => {
            if (pl.name === 'REPERTÓRIO1') {
              if (seenNames.has('REPERTÓRIO1')) {
                return false; // drop duplicate REPERTÓRIO1
              }
              seenNames.add('REPERTÓRIO1');
            }
            return true;
          });
          return cleaned.sort((a, b) => b.createdAt - a.createdAt);
        }
      } catch (e) {
        console.error('Error loading playlists from localStorage:', e);
      }
    }
    return [];
  });

  // 3. Keep REPERTÓRIO1 playlist synchronized with all song IDs (unless explicitly deleted by user)
  useEffect(() => {
    const isRepertorioDeleted = localStorage.getItem('cifras-repertorio1-deleted') === 'true';
    if (isRepertorioDeleted) {
      return;
    }

    if (songs.length > 0) {
      const repertorioName = 'REPERTÓRIO1';
      const allSongIds = songs.map(s => s.id);

      setPlaylists(prev => {
        // Filter out any duplicates to heal the state robustly
        const seenNames = new Set<string>();
        const existing = prev.filter(pl => {
          if (pl.name === repertorioName) {
            if (seenNames.has(repertorioName)) {
              return false; // remove duplicate
            }
            seenNames.add(repertorioName);
          }
          return true;
        });

        const repertorioPlaylist = existing.find(p => p.name === repertorioName || p.id === 'playlist-repertorio1');

        if (!repertorioPlaylist) {
          const newPlaylist: Playlist = {
            id: 'playlist-repertorio1',
            name: repertorioName,
            songIds: allSongIds,
            createdAt: Date.now()
          };
          return [newPlaylist, ...existing];
        } else {
          // Check if we need to update IDs
          const missingIds = allSongIds.filter(id => !repertorioPlaylist.songIds.includes(id));
          const obsoleteIds = repertorioPlaylist.songIds.filter(id => !allSongIds.includes(id));
          
          if (missingIds.length > 0 || obsoleteIds.length > 0) {
            return existing.map(pl => {
              if (pl.id === repertorioPlaylist.id) {
                // Ensure unique IDs, adding missing and removing deleted ones
                const updatedSongIds = Array.from(new Set([
                  ...pl.songIds.filter(id => allSongIds.includes(id)),
                  ...missingIds
                ]));

                // Sort alphabetically by title
                const songsOrderMap = new Map<string, number>(songs.map((s, index) => [s.id, index]));
                const sortedSongIds = [...updatedSongIds].sort((idA, idB) => {
                  const idxA = songsOrderMap.get(idA) ?? 999999;
                  const idxB = songsOrderMap.get(idB) ?? 999999;
                  return idxA - idxB;
                });

                return {
                  ...pl,
                  songIds: sortedSongIds
                };
              }
              return pl;
            });
          }
        }
        return existing; // return cleaned-up list if no song IDs changed
      });
    }
  }, [songs]);

  const [view, setView] = useState<'list' | 'viewer' | 'editor'>('list');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    type?: 'danger' | 'warning';
    onConfirm: () => void;
  } | null>(null);
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

  // Add an online generated AI song with direct playlists auto-save linkage
  const handleAddAISong = (newSong: Song, targetPlaylistIds: string[]) => {
    // Add to songs list and keep sorted alphabetically
    const updatedSongs = [...songs, newSong].sort((a, b) => a.title.localeCompare(b.title));
    setSongs(updatedSongs);

    // Automatically link/add the new song ID to selected playlists and sort alphabetically
    if (targetPlaylistIds && targetPlaylistIds.length > 0) {
      setPlaylists(prev => prev.map(pl => {
        if (targetPlaylistIds.includes(pl.id)) {
          const isNew = !pl.songIds.includes(newSong.id);
          const baseSongIds = isNew ? [...pl.songIds, newSong.id] : pl.songIds;

          // Resolve full songs collection to lookup titles for alphabetical sorting inside target playlists
          const songMap = new Map<string, string>(updatedSongs.map(s => [s.id, s.title.toLowerCase()]));

          const sortedSongIds = [...baseSongIds].sort((idA, idB) => {
            const titleA = songMap.get(idA) || '';
            const titleB = songMap.get(idB) || '';
            return titleA.localeCompare(titleB);
          });

          return {
            ...pl,
            songIds: sortedSongIds
          };
        }
        return pl;
      }));
    }
  };

  // Callback to update a single song field (e.g. dynamic chords or BPM) inside SongViewer
  const handleUpdateSong = (updatedSong: Song) => {
    setSongs(prev => {
      const next = prev.map(s => s.id === updatedSong.id ? updatedSong : s);
      return next.sort((a, b) => a.title.localeCompare(b.title));
    });
    if (selectedSong?.id === updatedSong.id) {
      setSelectedSong(updatedSong);
    }
  };

  // Delete an existing song from local database
  const handleDeleteSong = (id: string) => {
    const songToDelete = songs.find(s => s.id === id);
    if (!songToDelete) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Música',
      message: `Tem certeza que deseja excluir permanentemente a música "${songToDelete.title}"?`,
      confirmLabel: 'Excluir',
      type: 'danger',
      onConfirm: () => {
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
    });
  };

  // Restores standard backup catalog songs offline
  const handleResetToDefaults = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restaurar Dados Originais',
      message: 'Deseja realmente restaurar as músicas clássicas demonstrativas originais? Isso substituirá todas as suas alterações e removerá as cifras adicionadas.',
      confirmLabel: 'Restaurar',
      type: 'warning',
      onConfirm: () => {
        // Load standard defaults
        const restored = [...DEFAULT_SONGS].sort((a, b) => a.title.localeCompare(b.title));
        localStorage.removeItem('cifras-repertorio1-deleted');
        setSongs(restored);
        setPlaylists([]); // Clear playlists since references may point to custom deleted songs
        
        showToast('Biblioteca de demonstração restaurada.', 'info');
        setSelectedSong(null);
        setEditingSong(null);
        setView('list');
      }
    });
  };

  // Add or update a Playlist
  const handleSavePlaylist = (playlistData: { id?: string; name: string; songIds: string[] }) => {
    // Sort selected track IDs alphabetically by title
    const songMap = new Map<string, string>(songs.map(s => [s.id, s.title.toLowerCase()]));
    const sortedSongIds = [...playlistData.songIds].sort((idA, idB) => {
      const titleA = songMap.get(idA) || '';
      const titleB = songMap.get(idB) || '';
      return titleA.localeCompare(titleB);
    });

    if (playlistData.id) {
      // Update existing playlist
      setPlaylists(prev => {
        const next = prev.map(pl => {
          if (pl.id === playlistData.id) {
            return {
              ...pl,
              name: playlistData.name.trim(),
              songIds: sortedSongIds
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
        songIds: sortedSongIds,
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

    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Playlist',
      message: `Tem certeza que deseja excluir permanentemente a playlist "${plToDelete.name}"?`,
      confirmLabel: 'Excluir',
      type: 'danger',
      onConfirm: () => {
        if (id === 'playlist-repertorio1' || plToDelete.name === 'REPERTÓRIO1') {
          localStorage.setItem('cifras-repertorio1-deleted', 'true');
        }
        setPlaylists(prev => prev.filter(p => p.id !== id));
        showToast('Playlist excluída.', 'info');
      }
    });
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
            className="fixed top-4 left-1/2 -translate-x-1/2 z-55 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm max-w-sm w-full bg-stone-900 border-zinc-800 text-white"
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

      {/* Elegant Custom Confirmation Modal (fixing web sandbox iframe alert block issues) */}
      <AnimatePresence>
        {confirmDialog && confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark fuzzy backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDialog(null)}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
            />
            
            {/* Modal Dialog Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className="bg-white rounded-2xl border border-gray-150 shadow-xl max-w-sm w-full overflow-hidden relative z-10 p-5 space-y-5 text-left"
            >
              <div className="flex gap-4">
                <div className={`p-3 rounded-2xl h-fit shrink-0 ${confirmDialog.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-650'}`}>
                  {confirmDialog.type === 'warning' ? (
                    <RotateCcw className="w-5 h-5" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </div>
                <div className="space-y-1 block max-w-xs overflow-hidden">
                  <h3 className="text-base font-bold text-gray-955 font-sans leading-tight">
                    {confirmDialog.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-sans leading-relaxed">
                    {confirmDialog.message}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-205 bg-white hover:bg-gray-50 text-gray-650 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl text-white transition-colors cursor-pointer ${
                    confirmDialog.type === 'danger'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {confirmDialog.confirmLabel || 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
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
                showAppToast={showToast}
                onAddAISong={handleAddAISong}
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
                onUpdateSong={handleUpdateSong}
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
