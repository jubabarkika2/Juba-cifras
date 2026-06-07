import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { parseSongSheet } from '../utils/chordTransposer';
import { Music, AlertCircle, Save, ArrowLeft, HelpCircle } from 'lucide-react';

interface SongEditorProps {
  song?: Song | null;
  onSave: (songData: Omit<Song, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function SongEditor({ song, onSave, onCancel }: SongEditorProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [originalKey, setOriginalKey] = useState('C');
  const [category, setCategory] = useState('Pop');
  const [rawCifra, setRawCifra] = useState('');
  const [error, setError] = useState('');
  const [parsedPreviewLines, setParsedPreviewLines] = useState<any[]>([]);

  // Initialize form if editing existing song
  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setOriginalKey(song.originalKey || 'C');
      setCategory(song.category || 'Outros');
      setRawCifra(song.rawCifra);
    } else {
      setTitle('');
      setArtist('');
      setOriginalKey('C');
      setCategory('MPB');
      setRawCifra('');
    }
  }, [song]);

  // Update live preview when rawCifra changes
  useEffect(() => {
    if (rawCifra.trim() === '') {
      setParsedPreviewLines([]);
      return;
    }
    const lines = parseSongSheet(rawCifra);
    setParsedPreviewLines(lines.slice(0, 15)); // Show first 15 lines in preview
  }, [rawCifra]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('O título da música é obrigatório.');
      return;
    }
    if (!rawCifra.trim()) {
      setError('Insira ou cole a cifra da música.');
      return;
    }

    setError('');
    onSave({
      title: title.trim(),
      artist: artist.trim() || 'Artista Desconhecido',
      originalKey,
      category: category.trim() || 'Geral',
      rawCifra: rawCifra
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            title="Voltar"
            id="btn-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
            {song ? 'Editar Música' : 'Adicionar Nova Música'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="song-title">
              Título da Música *
            </label>
            <div className="relative">
              <input
                id="song-title"
                type="text"
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:-outline-offset-1 focus:outline-gray-400 focus:border-gray-400 transition-colors bg-white text-gray-900 placeholder:text-gray-400"
                placeholder="Ex: Anunciação"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="song-artist">
              Artista / Banda
            </label>
            <input
              id="song-artist"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:-outline-offset-1 focus:outline-gray-400 focus:border-gray-400 transition-colors bg-white text-gray-900 placeholder:text-gray-400"
              placeholder="Ex: Alceu Valença"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="song-key">
              Tom Original
            </label>
            <select
              id="song-key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:-outline-offset-1 focus:outline-gray-400 focus:border-gray-400 transition-colors bg-white text-gray-900"
              value={originalKey}
              onChange={(e) => setOriginalKey(e.target.value)}
            >
              {['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="song-category">
              Gênero / Categoria
            </label>
            <input
              id="song-category"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:-outline-offset-1 focus:outline-gray-400 focus:border-gray-400 transition-colors bg-white text-gray-900 placeholder:text-gray-400"
              placeholder="Ex: MPB, Pop, Rock, Sertanejo"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
            <label className="block text-sm font-medium text-gray-700 font-sans" htmlFor="song-cifra">
              Cole a cifra com as notas musicais *
            </label>
            <span className="text-xs text-gray-500 font-sans flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              O app separa as notas e letras automaticamente!
            </span>
          </div>
          <textarea
            id="song-cifra"
            rows={14}
            className="w-full p-4 border border-gray-300 rounded-lg focus:-outline-offset-1 focus:outline-gray-400 focus:border-gray-400 transition-colors font-mono text-sm bg-gray-50 text-gray-800 placeholder:text-gray-400 leading-relaxed"
            placeholder={`Exemplo de formato tradicional (nota em cima, letra embaixo):

C                    G
Na bruma leve das paixões que vem de dentro
Am                   F
Tu vens chegando pra brincar no meu quintal

Ou formato em colchete (inline):
Na bruma leve [C] das paixões que vem de [G] dentro...`}
            value={rawCifra}
            onChange={(e) => setRawCifra(e.target.value)}
          />
        </div>

        {/* Live dynamic preview module */}
        {parsedPreviewLines.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5 font-sans">
              <Music className="w-4 h-4 text-emerald-600" />
              Prévia do Ajuste Automático e Reconhecimento
            </h3>
            <p className="text-xs text-gray-500 mb-3 font-sans">
              As notas identificadas serão destacadas em verde. Redimensione o celular para ver o auto-ajuste de linha.
            </p>
            <div className="p-3 bg-white rounded-md border border-gray-100 overflow-x-auto">
              <pre className="font-mono text-xs text-left leading-normal space-y-1.5 whitespace-pre">
                {parsedPreviewLines.map((line, idx) => {
                  if (line.type === 'pair') {
                    return (
                      <div key={idx} className="py-0.5">
                        <div className="text-emerald-700 font-semibold">{line.chordsContent}</div>
                        <div className="text-gray-700">{line.lyricsContent}</div>
                      </div>
                    );
                  } else if (line.type === 'chords') {
                    return (
                      <div key={idx} className="text-emerald-700 font-semibold py-0.5">
                        {line.chordsContent}
                      </div>
                    );
                  } else if (line.type === 'header') {
                    return (
                      <div key={idx} className="text-gray-800 font-bold tracking-wide mt-2 text-[11px] uppercase border-b border-gray-100 pb-0.5 mb-1 bg-gray-50 py-0.5 px-1 rounded inline-block">
                        {line.rawContent}
                      </div>
                    );
                  } else if (line.type === 'empty') {
                    return <div key={idx} className="h-2"></div>;
                  } else {
                    return <div key={idx} className="text-gray-600 py-0.5">{line.lyricsContent}</div>;
                  }
                })}
              </pre>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            id="btn-cancel"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
            id="btn-save"
          >
            <Save className="w-4 h-4" />
            Salvar Música
          </button>
        </div>
      </form>
    </div>
  );
}
