/**
 * Utility for parsing and transposing chords in chord sheets (cifras).
 * Supports standard Brazilian/Portuguese musical notation (e.g., C, D, Eb, F#, F#m, C/E, G/B, etc.).
 */

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Map of equivalent notes for normalization
const NOTE_MAP: { [key: string]: number } = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
  'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// Check if a single string token is a chord
export function isChord(token: string): boolean {
  if (!token) return false;
  
  // Strip common wrapping chars like brackets or parentheses
  const clean = token.replace(/[()\[\]]/g, '').trim();
  if (clean.length === 0) return false;

  // Regex for chord notation
  // Starts with A-G note, optionally # or b, 
  // followed by common suffixes (m, M, maj, min, dim, aug, sus, add, numbers, etc.)
  // optionally followed by a slash / and index note
  const chordRegex = /^[A-G](?:#|b)?(?:m|M|maj|maj7|min|dim|aug|sus|add|[\d\+\-ºø°])*(?:\/[A-G](?:#|b)?)?$/;
  return chordRegex.test(clean);
}

// Check if a line is likely to be a chords line
export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) return false;

  // Header sections like [Intro], [Refrão], [solo] are not chord lines
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return false;
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) return false;

  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 0) return false;

  let chordCount = 0;
  let wordCount = 0;

  for (const token of tokens) {
    if (isChord(token)) {
      chordCount++;
    } else {
      // Ignore very short tokens like "e" or "a" if they occur in lyric line context,
      // but if the token is definitely a non-chord word, count it.
      if (token.length > 1) {
        wordCount++;
      }
    }
  }

  // If there are many spaces and at least some chords, it could be a chord line.
  // Or if 70% or more of the words are chords.
  const hasMultipleSpaces = line.includes('   ');
  const ratio = chordCount / (chordCount + wordCount || 1);

  if (ratio >= 0.7) {
    return true;
  }

  if (chordCount > 0 && hasMultipleSpaces && ratio >= 0.4) {
    return true;
  }

  return false;
}

// Transpose a single note name by a number of semitones
export function transposeNote(note: string, semitones: number, preferFlats: boolean = false): string {
  const cleanNote = note.trim();
  if (cleanNote === '') return '';

  const semitoneValue = NOTE_MAP[cleanNote];
  if (semitoneValue === undefined) return cleanNote; // Unrecognized note, return unchanged

  let newValue = (semitoneValue + semitones) % 12;
  while (newValue < 0) {
    newValue += 12;
  }

  const scale = preferFlats ? FLATS : SHARPS;
  return scale[newValue];
}

// Transpose a full chord (e.g., C#m7/E -> Dm7/F with +1)
export function transposeChord(chord: string, semitones: number, preferFlats: boolean = false): string {
  // Strip brackets if any
  const hasBrackets = chord.startsWith('[') && chord.endsWith(']');
  const clean = hasBrackets ? chord.slice(1, -1) : chord;

  // Split on slash for bass notes
  const parts = clean.split('/');
  const mainChord = parts[0];
  const bassNote = parts[1];

  // RegEx to isolate the root note (e.g., C, C#, Db) from the suffix (e.g., m7, sus4)
  const rootMatch = mainChord.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!rootMatch) return chord; // Not recognized, return as is

  const rootNote = rootMatch[1];
  const suffix = rootMatch[2];

  const transposedRoot = transposeNote(rootNote, semitones, preferFlats);
  let transposedBass = '';
  if (bassNote) {
    transposedBass = '/' + transposeNote(bassNote, semitones, preferFlats);
  }

  const result = `${transposedRoot}${suffix}${transposedBass}`;
  return hasBrackets ? `[${result}]` : result;
}

// Represents a line of a song
export interface ParsedLine {
  type: 'chords' | 'lyrics' | 'pair' | 'header' | 'empty';
  chordsContent?: string;
  lyricsContent?: string;
  originalChordsContent?: string; // Stored to prevent drift when transposing repeatedly
  rawContent?: string;
}

// Transpose a chords line while maintaining visual alignment with lyrics line
export function transposeChordsLine(
  chordsLine: string,
  semitones: number,
  preferFlats: boolean = false
): string {
  // We locate each chord in the line, transpose it, and adjust spaces
  // to keep later chords aligned at their original relative positions or as close as possible.
  
  // Find all chord tokens and their indexes
  const chords: { chord: string; index: number }[] = [];
  const regex = /[^\s]+/g;
  let match;
  
  while ((match = regex.exec(chordsLine)) !== null) {
    chords.push({
      chord: match[0],
      index: match.index
    });
  }

  if (chords.length === 0) return chordsLine;

  let result = '';
  let lastIndex = 0;
  let offset = 0; // Tracks alignment shifts

  for (let i = 0; i < chords.length; i++) {
    const item = chords[i];
    const transposed = transposeChord(item.chord, semitones, preferFlats);
    const originalLength = item.chord.length;
    const newLength = transposed.length;

    // Calculate spaces needed from preceding text
    const desiredIndex = item.index + offset;
    const currentLength = result.length;

    if (desiredIndex > currentLength) {
      result += ' '.repeat(desiredIndex - currentLength);
    } else if (currentLength > desiredIndex && i > 0) {
      // If we overshot because a previous chords became longer,
      // add at least one space to separate cords
      result += ' ';
    }

    result += transposed;
    
    // Accumulate the length shift
    offset += (newLength - originalLength);
  }

  return result;
}

// Parse a song sheet block of text into structured displayable lines
export function parseSongSheet(text: string): ParsedLine[] {
  const lines = text.split(/\r?\n/);
  const parsed: ParsedLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      parsed.push({ type: 'empty', rawContent: '' });
      continue;
    }

    // Header classification e.g., [Intro], [Solo], [Refrão]
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || 
        (trimmed.startsWith('(') && trimmed.endsWith(')')) ||
        trimmed.toLowerCase().endsWith(':') && trimmed.length < 20) {
      parsed.push({ type: 'header', rawContent: line });
      continue;
    }

    // Bracketed Inline Chord Inline Parser: Check if line has active brackets with chords e.g., "No meu [C] peito [G] canta"
    if (line.includes('[') && line.includes(']')) {
      // These are inline chord lines. We can render them directly with styles, or split into pair.
      // For ease of use and custom rendering, let's keep it as is and parse/transpose in-line,
      // or we can convert them to a chord-lyrics pair! Let's convert them to a pair so they render identically.
      const pair = convertBracketLineToPair(line);
      parsed.push({
        type: 'pair',
        chordsContent: pair.chords,
        originalChordsContent: pair.chords,
        lyricsContent: pair.lyrics
      });
      continue;
    }

    // Traditional check: is this a chord line?
    if (isChordLine(line)) {
      // Check if next line exists and is a lyrics line
      const nextLine = lines[i + 1];
      if (nextLine !== undefined && !isChordLine(nextLine) && nextLine.trim().length > 0 && !nextLine.trim().startsWith('[')) {
        parsed.push({
          type: 'pair',
          chordsContent: line,
          originalChordsContent: line,
          lyricsContent: nextLine
        });
        i++; // Skip the next line as it is paired
      } else {
        // Lone chord line
        parsed.push({
          type: 'chords',
          chordsContent: line,
          originalChordsContent: line
        });
      }
    } else {
      // Lone lyric/other line
      parsed.push({
        type: 'lyrics',
        lyricsContent: line
      });
    }
  }

  return parsed;
}

// Convert a bracketed line like "No meu [C] peito [G7] canta" to a pair of chord/lyric lines
function convertBracketLineToPair(line: string): { chords: string; lyrics: string } {
  let chordsLine = '';
  let lyricsLine = '';
  
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    const chord = match[1];
    const matchIndex = match.index;

    // Append lyrics up to this bracket
    const segment = line.substring(lastIndex, matchIndex);
    lyricsLine += segment;
    
    // Position chord at the corresponding position in chordsLine
    const targetChordPos = lyricsLine.length - segment.length;
    if (chordsLine.length < targetChordPos) {
      chordsLine += ' '.repeat(targetChordPos - chordsLine.length);
    }
    chordsLine += chord;

    lastIndex = regex.lastIndex;
  }

  // Append remaining lyrics
  if (lastIndex < line.length) {
    lyricsLine += line.substring(lastIndex);
  }

  return { chords: chordsLine, lyrics: lyricsLine };
}

// Transposes a fully parsed song structure or list of parsed lines
export function transposeParsedLines(
  lines: ParsedLine[],
  semitones: number,
  preferFlats: boolean = false
): ParsedLine[] {
  return lines.map(line => {
    if (line.type === 'chords') {
      const orig = line.originalChordsContent || line.chordsContent || '';
      return {
        ...line,
        chordsContent: transposeChordsLine(orig, semitones, preferFlats)
      };
    } else if (line.type === 'pair') {
      const orig = line.originalChordsContent || line.chordsContent || '';
      return {
        ...line,
        chordsContent: transposeChordsLine(orig, semitones, preferFlats)
      };
    }
    return line;
  });
}
