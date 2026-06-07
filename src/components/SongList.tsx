import { useState } from 'react';
import { Song } from '../types';
import { 
  Search, Plus, Music, Trash2, Edit3, BookOpen, AlertCircle, 
  RotateCcw, SlidersHorizontal, ChevronRight, FileCode 
} from 'lucide-react';

interface SongListProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onEditSong: (song: Song) => void;
  onDeleteSong: (id: string) => void;
  onAddSong: () => void;
  onResetToDefaults: () => void;
}

export default function SongList({
  songs,
  onSelectSong,
  onEditSong,
  onDeleteSong,
  onAddSong,
  onResetToDefaults
}: SongListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Dynamically obtain available categories from song database + "Todas"
  const categories = ['Todas', ...Array.from(new Set(songs.map(s => s.category).filter(Boolean)))];

  // Search & Filter algorithm
  const filteredSongs = songs.filter(song => {
    const matchesSearch = 
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.rawCifra.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === 'Todas' || song.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Visual Identity Hero Card */}
      <div className="bg-gradient-to-r from-gray-900 via-stone-800 to-zinc-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden mb-8">
        <div className="relative z-10 space-y-2">
          <span className="text-2xs bg-amber-400 text-amber-950 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans">
            📱 Cifras Off-line
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans">
            Biblioteca de Cifras
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl font-sans font-light">
            Guarde suas músicas favoritas, altere o tom instantaneamente, use seu pedal Bluetooth 
            e leia confortavelmente em qualquer tamanho de tela!
          </p>
        </div>
        
        {/* Subtle decorative vector circles back */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <Music className="w-40 h-40" />
        </div>
      </div>

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
          
          <button
            onClick={onAddSong}
            className="px-5 py-2.5 bg-gray-950 hover:bg-gray-805 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            id="btn-add-song"
          >
            <Plus className="w-4 h-4" />
            Nova Música
          </button>
        </div>

        {/* Row 2: Category Filter Horizontal Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-1 hidden sm:block" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-full shrink-0 font-medium border transition-all ${
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
                    <span className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
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

              {/* Action columns (Edit & Delete) */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEditSong(song)}
                  className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Editar música"
                  id={`btn-edit-${song.id}`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteSong(song.id)}
                  className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
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
          Total: {songs.length} músicas carregadas localmente no seu navegador.
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
  );
}
