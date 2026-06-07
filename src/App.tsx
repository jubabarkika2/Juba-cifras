import { useState, useEffect } from 'react';
import { Song } from './types';
import { DEFAULT_SONGS } from './utils/defaultSongs';
import SongList from './components/SongList';
import SongViewer from './components/SongViewer';
import SongEditor from './components/SongEditor';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [view, setView] = useState<'list' | 'viewer' | 'editor'>('list');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  
  // Toast notifications for user actions
  const [toast, setToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Load songs from localStorage or load default backup database
  useEffect(() => {
    const stored = localStorage.getItem('cifras_songs');
    if (stored) {
      try {
        setSongs(JSON.parse(stored));
      } catch (e) {
        console.error('Falha ao ler cifras locais do localStorage:', e);
        // Fallback
        const defaultWithDate = DEFAULT_SONGS.map(s => ({ ...s, createdAt: Date.now() }));
        setSongs(defaultWithDate);
        localStorage.setItem('cifras_songs', JSON.stringify(defaultWithDate));
      }
    } else {
      const defaultWithDate = DEFAULT_SONGS.map(s => ({ ...s, createdAt: Date.now() }));
      setSongs(defaultWithDate);
      localStorage.setItem('cifras_songs', JSON.stringify(defaultWithDate));
    }
  }, []);

  // Helper trigger for toast notification popups
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Add or update a song
  const handleSaveSong = (songData: Omit<Song, 'id' | 'createdAt'>) => {
    let updatedSongs: Song[] = [];

    if (editingSong) {
      // Update existing song
      updatedSongs = songs.map(s => {
        if (s.id === editingSong.id) {
          return {
            ...s,
            ...songData,
            // Keep original ID and creation stamp
          };
        }
        return s;
      });
      showToast('Cifra atualizada com sucesso!');
    } else {
      // Generate new song
      const newSong: Song = {
        ...songData,
        id: `song-${Math.random().toString(36).substring(2, 11)}`,
        createdAt: Date.now()
      };
      updatedSongs = [newSong, ...songs];
      showToast('Nova cifra adicionada com sucesso!');
    }

    setSongs(updatedSongs);
    localStorage.setItem('cifras_songs', JSON.stringify(updatedSongs));
    
    // Redirect to list
    setView('list');
    setSelectedSong(null);
    setEditingSong(null);
  };

  // Delete an existing song
  const handleDeleteSong = (id: string) => {
    const songToDelete = songs.find(s => s.id === id);
    if (!songToDelete) return;

    if (window.confirm(`Tem certeza que deseja excluir a música "${songToDelete.title}"?`)) {
      const updated = songs.filter(s => s.id !== id);
      setSongs(updated);
      localStorage.setItem('cifras_songs', JSON.stringify(updated));
      showToast('Cifra excluída da sua biblioteca.', 'info');
      
      if (selectedSong?.id === id) {
        setSelectedSong(null);
        setView('list');
      }
    }
  };

  // Restores standard backup catalog songs
  const handleResetToDefaults = () => {
    if (window.confirm('Deseja realmente restaurar as músicas demonstrativas originais? Isso substituirá as edições feitas nelas.')) {
      const defaultWithDate = DEFAULT_SONGS.map(s => ({ ...s, createdAt: Date.now() }));
      setSongs(defaultWithDate);
      localStorage.setItem('cifras_songs', JSON.stringify(defaultWithDate));
      showToast('Biblioteca resetada para as cifras de demonstração.', 'info');
      setSelectedSong(null);
      setEditingSong(null);
      setView('list');
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
      <main className="flex-1 w-full relative">
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
