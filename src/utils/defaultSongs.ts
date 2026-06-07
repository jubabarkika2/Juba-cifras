import { Song } from '../types';

export const DEFAULT_SONGS: Song[] = [
  {
    id: 'anunciacao',
    title: 'Anunciação',
    artist: 'Alceu Valença',
    originalKey: 'G',
    bpm: 120,
    category: 'MPB / Nordestina',
    rawCifra: `[Intro]
G  Am  C  G
G  Am  C  G

[Verso 1]
     G                   Am
Na bruma leve das paixões que vem de dentro
      C                       G
Tu vens chegando pra brincar no meu quintal
     G                   Am
No teu cavalo peito nu, cabelo ao vento
       C                    G
Sol brilhando no seu arreio de prata

[Refrão]
    G         Am
Tu vens, tu vens
     C           G
Eu já escuto os teus sinais
    G         Am
Tu vens, tu vens
     C           G
Eu já escuto os teus sinais

[Verso 2]
     G                   Am
A voz do anjo sussurrou no meu ouvido
    C                     G
E eu não duvido já escuto os teus sinais
     G                       Am
Que tu virias numa manhã de domingo
       C                  G
Anunciar que o dia do meu amor chegou

[Refrão]
    G         Am
Tu vens, tu vens
     C           G
Eu já escuto os teus sinais
    G         Am
Tu vens, tu vens
     C           G
Eu já escuto os teus sinais`
  },
  {
    id: 'como-e-grande-o-meu-amor',
    title: 'Como É Grande o Meu Amor por Você',
    artist: 'Roberto Carlos',
    originalKey: 'D',
    bpm: 76,
    category: 'Jovem Guarda / Romântica',
    rawCifra: `[Intro]
D  F#m  G  A7

[Verso 1]
     D               Em               F#m
Eu tenho tanto pra lhe falar, mas com palavras
          Bm           Em               A7
Não sei dizer, como é grande o meu amor
         D    A7
Por você

     D               Em               F#m
E não há nada pra comparar, para poder
          Bm           Em               A7
Lhe explicar, como é grande o meu amor
         D    D7
Por você

[Verso 2]
     G               A7             D
Nem mesmo o céu, nem as estrelas, nem mesmo o mar
 Bm               E7
E o infinito, não conseguem ser maiores
      G6            A7
Que o meu amor, nem mais bonito

[Verso 3]
     D                 Em                F#m
Me desespero a procurar, alguma forma de lhe falar
     Bm               Em               A7
Como é grande o meu amor por você
                 D   Bm
Nunca se esqueça, nem um segundo
      Em                      A7             D
Que eu tenho o maior amor do mundo por você`
  },
  {
    id: 'garota-de-ipanema',
    title: 'Garota de Ipanema',
    artist: 'Tom Jobim & Vinicius de Moraes',
    originalKey: 'F',
    bpm: 115,
    category: 'Bossa Nova / MPB',
    rawCifra: `[Intro]
Fmaj7  G7  Gm7  Gb7

[Verso 1]
Fmaj7
Olha que coisa mais linda
               G7
Mais cheia de graça
                              Gm7
É ela, menina, que vem e que passa
            Gb7              Fmaj7   Gm7  Gb7
Num doce balanço a caminho do mar

Fmaj7
Moça do corpo dourado
               G7
Do sol de Ipanema
                                Gm7
O seu balançado é mais que um poema
              Gb7                     Fmaj7
É a coisa mais linda que eu já vi passar

[Ponte]
F#maj7              B7
Ah, por que estou tão sozinho?
Gmaj7               C7
Ah, por que tudo é tão triste?
Amaj7               D7
Ah, a beleza que existe
    A#m7              D#7
A beleza que não é só minha
    Am7               D7
Que também passa sozinha

[Verso 2]
Fmaj7
Cheia de graça, mais linda
               G7
Mais cheia de graça
                              Gm7
É ela, menina, que vem e que passa
            Gb7              Fmaj7
Num doce balanço a caminho do mar`
  },
  {
    id: 'o-sol',
    title: 'O Sol',
    artist: 'Vitor Kley',
    originalKey: 'A',
    bpm: 124,
    category: 'Pop / Surf Rock',
    rawCifra: `[Intro]
A  E  F#m  D
A  E  F#m  D

[Verso 1]
     A
Ei, Sol
                E
Vê se não esquece e me ilumina
            F#m              D
Preciso de você aqui, ouooo
     A
Ei, Sol
               E
Vê se não me esquece e me ilumina
            F#m              D
Preciso de você aqui, ouooo

[Refrão]
             E             D
Sei que hoje o dia tá pra peixe
         A             E
E a ressaca tá pra gente
              E          D              A
E que o vento leve tudo de ruim que passou
            E                      D              A
E as suas ondas curem todo o meu cansaço, o meu cansaço
              E                    D
E agradeço ao dia por essa calmaria
           A       E
Com toda a paz amor`
  },
  // 191 imported catalog entries
  { id: 'a-dama-de-vermelho', title: 'A Dama de Vermelho', artist: 'Bruno e Marrone', originalKey: 'A', bpm: 82, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'a-ferro-e-fogo', title: 'A Ferro e Fogo', artist: 'Zezé Di Camargo & Luciano', originalKey: 'G', bpm: 124, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'a-fuego-lento', title: 'A Fuego Lento', artist: 'Rosana Arbelo', originalKey: 'Bb', bpm: 95, category: 'MPB', rawCifra: 'gerar' },
  { id: 'adoro-amar-voce', title: 'Adoro Amar Você', artist: 'Daniel', originalKey: 'D', bpm: 110, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'ainda-ontem-chorei-de-saudade', title: 'Ainda Ontem Chorei de Saudade', artist: 'João Mineiro e Marciano', originalKey: 'C', bpm: 80, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'all-star', title: 'All Star', artist: 'Nando Reis', originalKey: 'G', bpm: 112, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'alma-gemea', title: 'Alma Gêmea', artist: 'Fábio Jr.', originalKey: 'G', bpm: 72, category: 'Romântica', rawCifra: 'gerar' },
  { id: 'amaremos', title: 'Amaremos', artist: 'Barrerito', originalKey: 'Gm', bpm: 104, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'amigo-apaixonado', title: 'Amigo Apaixonado', artist: 'Victor e Leo', originalKey: 'G', bpm: 122, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'apelido-carinhoso', title: 'Apelido Carinhoso', artist: 'Gusttavo Lima', originalKey: 'C', bpm: 116, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'asas', title: 'Asas', artist: 'Maskavo', originalKey: 'A', bpm: 76, category: 'Reggae', rawCifra: 'gerar' },
  { id: 'ausencia', title: 'Ausência', artist: 'Chrystian & Ralf', originalKey: 'Eb', bpm: 78, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'beijo-de-varanda', title: 'Beijo de Varanda', artist: 'Bruno e Marrone', originalKey: 'D', bpm: 115, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'bijuteria', title: 'Bijuteria', artist: 'Bruno e Marrone', originalKey: 'Am', bpm: 84, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'boate-azul-milionario', title: 'Boate Azul', artist: 'Milionário & José Rico', originalKey: 'C', bpm: 100, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'boate-azul-bruno', title: 'Boate Azul', artist: 'Bruno e Marrone', originalKey: 'Am', bpm: 100, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'boate-azul-potpourri', title: 'Boate Azul / Sublime Renúncia', artist: 'Bruno e Marrone', originalKey: 'G', bpm: 100, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'borboletas', title: 'Borboletas', artist: 'Victor & Leo', originalKey: 'Bm', bpm: 120, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'borbulhas-de-amor', title: 'Borbulhas de Amor', artist: 'Fagner', originalKey: 'C', bpm: 125, category: 'MPB', rawCifra: 'gerar' },
  { id: 'born-to-be-wild', title: 'Born To Be Wild', artist: 'Steppenwolf', originalKey: 'Em', bpm: 146, category: 'Rock', rawCifra: 'gerar' },
  { id: 'brincar-de-ser-feliz', title: 'Brincar de Ser Feliz', artist: 'Chitãozinho & Xororó', originalKey: 'G', bpm: 114, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'caca-e-cacador', title: 'Caça e Caçador', artist: 'Fábio Jr.', originalKey: 'G', bpm: 80, category: 'Pop', rawCifra: 'gerar' },
  { id: 'cachimbo-da-paz', title: 'Cachimbo da Paz', artist: 'Gabriel O Pensador', originalKey: 'C', bpm: 92, category: 'Rap/Pop', rawCifra: 'gerar' },
  { id: 'californication', title: 'Californication', artist: 'Red Hot Chili Peppers', originalKey: 'C', bpm: 96, category: 'Rock', rawCifra: 'gerar' },
  { id: 'camila-camila', title: 'Camila, Camila', artist: 'Nenhum de Nós', originalKey: 'G', bpm: 120, category: 'Rock Nacional', rawCifra: 'gerar' },
  { id: 'canudinho', title: 'Canudinho', artist: 'Henrique & Diego', originalKey: 'C', bpm: 132, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'ce-que-sabe', title: 'Cê Que Sabe', artist: 'Cristiano Araújo', originalKey: 'C', bpm: 115, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'chao-de-giz', title: 'Chão de Giz', artist: 'Zé Ramalho', originalKey: 'G', bpm: 84, category: 'MPB', rawCifra: 'gerar' },
  { id: 'churrasco-e-chimarrao', title: 'Churrasco e Bom Chimarrão', artist: 'Gaúcho da Fronteira', originalKey: 'D', bpm: 135, category: 'Gaúcha', rawCifra: 'gerar' },
  { id: 'chuva-de-prata', title: 'Chuva de Prata', artist: 'Roupa Nova', originalKey: 'E', bpm: 88, category: 'Pop', rawCifra: 'gerar' },
  { id: 'cigana', title: 'Cigana', artist: 'Raça Negra', originalKey: 'F', bpm: 112, category: 'Pagode', rawCifra: 'gerar' },
  { id: 'ciumenta', title: 'Ciumenta', artist: 'César Menotti & Fabiano', originalKey: 'Dm', bpm: 138, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'como-eu-quero', title: 'Como Eu Quero', artist: 'Kid Abelha', originalKey: 'C', bpm: 116, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'como-um-anjo', title: 'Como Um Anjo', artist: 'César Menotti & Fabiano', originalKey: 'G', bpm: 110, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'convite-de-casamento', title: 'Convite de Casamento', artist: 'Gian e Giovani', originalKey: 'C', bpm: 92, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'coracao-rapazolla', title: 'Coração', artist: 'Rapazolla', originalKey: 'C', bpm: 128, category: 'Axé', rawCifra: 'gerar' },
  { id: 'coracao-pirata', title: 'Coração Pirata', artist: 'Roupa Nova', originalKey: 'C', bpm: 76, category: 'Pop/Romântica', rawCifra: 'gerar' },
  { id: 'cowboy-fora-da-lei', title: 'Cowboy Fora da Lei', artist: 'Raul Seixas', originalKey: 'G', bpm: 125, category: 'Rock Nacional', rawCifra: 'gerar' },
  { id: 'desde-o-primeiro-momento', title: 'Desde o Primeiro Momento', artist: 'Pamela', originalKey: 'G', bpm: 70, category: 'Gospel', rawCifra: 'gerar' },
  { id: 'desejo-de-amar', title: 'Desejo de Amar', artist: 'Eliana De Lima', originalKey: 'E', bpm: 94, category: 'Pagode', rawCifra: 'gerar' },
  { id: 'deus-e-eu-no-sertao', title: 'Deus e Eu No Sertão', artist: 'Victor e Leo', originalKey: 'C', bpm: 88, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'diana', title: 'Diana', artist: 'Carlos Gonzaga', originalKey: 'E', bpm: 120, category: 'Jovem Guarda', rawCifra: 'gerar' },
  { id: 'dois-coracoes-e-uma-historia', title: 'Dois Corações e Uma História', artist: 'Zezé Di Camargo & Luciano', originalKey: 'A', bpm: 82, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'donna', title: 'Donna', artist: 'Ritchie Valens', originalKey: 'C', bpm: 74, category: 'Rock', rawCifra: 'gerar' },
  { id: 'dormi-na-praca', title: 'Dormi Na Praça', artist: 'Bruno e Marrone', originalKey: 'E', bpm: 90, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'e-o-amor', title: 'É o Amor', artist: 'Zezé Di Camargo & Luciano', originalKey: 'D', bpm: 84, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'ela-e-demais', title: 'Ela é Demais', artist: 'Rick e Renner', originalKey: 'A', bpm: 110, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'entre-a-serpente-e-a-estrela', title: 'Entre Serpente e a Estrela', artist: 'Zé Ramalho', originalKey: 'D', bpm: 74, category: 'MPB', rawCifra: 'gerar' },
  { id: 'entre-tapas-e-beijos', title: 'Entre Tapas e Beijos', artist: 'Leandro & Leonardo', originalKey: 'A', bpm: 120, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'esqueci', title: 'Esqueci', artist: 'Bruno e Marrone', originalKey: 'Am', bpm: 92, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'estou-apaixonado', title: 'Estou Apaixonado', artist: 'Daniel', originalKey: 'B', bpm: 80, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'estou-mal', title: 'Estou Mal', artist: 'Raça Negra', originalKey: 'E', bpm: 104, category: 'Pagode', rawCifra: 'gerar' },
  { id: 'estrada-da-vida', title: 'Estrada da Vida', artist: 'Milionário e José Rico', originalKey: 'G', bpm: 88, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'eu-quero-sempre-mais', title: 'Eu Quero Sempre Mais', artist: 'Ira!', originalKey: 'C', bpm: 115, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'eu-sei', title: 'Eu Sei', artist: 'Papas da Língua', originalKey: 'G', bpm: 90, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'eu-sem-voce', title: 'Eu Sem Você', artist: 'Paula Fernandes', originalKey: 'C', bpm: 110, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'every-breath-you-take', title: 'Every Breath You Take', artist: 'The Police', originalKey: 'Dm', bpm: 117, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'evidencias', title: 'Evidências', artist: 'Chitãozinho & Xororó', originalKey: 'E', bpm: 124, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'facas', title: 'Facas (part. Bruno e Marrone)', artist: 'Diego e Victor Hugo', originalKey: 'G', bpm: 120, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'face-oculta', title: 'Face oculta', artist: 'Ara Ketu', originalKey: 'F', bpm: 95, category: 'Axé', rawCifra: 'gerar' },
  { id: 'feriado-nacional', title: 'Feriado Nacional', artist: 'Bruno e Marrone', originalKey: 'G', bpm: 128, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'flor', title: 'Flor', artist: 'Jorge & Mateus', originalKey: 'B', bpm: 126, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'flor-e-o-beija-flor', title: 'Flor e o Beija-flor', artist: 'Henrique e Juliano', originalKey: 'C', bpm: 94, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'fogao-de-lenha', title: 'Fogão de Lenha', artist: 'Chitãozinho & Xororó', originalKey: 'C#m', bpm: 72, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'fogo-e-paixao', title: 'Fogo e Paixão', artist: 'Wando', originalKey: 'C', bpm: 110, category: 'Brega', rawCifra: 'gerar' },
  { id: 'fui-fiel', title: 'Fui Fiel', artist: 'Gusttavo Lima', originalKey: 'E', bpm: 124, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'hoje-a-noite-nao-tem-luar', title: 'Hoje a Noite Não Tem Luar', artist: 'Legião Urbana', originalKey: 'G', bpm: 112, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'humilde-residencia', title: 'Humilde Residência', artist: 'Michel Teló', originalKey: 'A', bpm: 130, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'idas-e-voltas', title: 'Idas e Voltas', artist: 'Matogrosso & Mathias', originalKey: 'F', bpm: 98, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'inesquecivel', title: 'Inesquecível', artist: 'Sandy & Junior', originalKey: 'G', bpm: 76, category: 'Pop', rawCifra: 'gerar' },
  { id: 'inevitavel', title: 'Inevitável', artist: 'Bruno e Marrone', originalKey: 'E', bpm: 118, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'instinto-animal', title: 'Instinto Animal', artist: 'Zé Henrique e Gabriel', originalKey: 'D', bpm: 112, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'its-a-heartache', title: 'It\'s a Heartache', artist: 'Bonnie Tyler', originalKey: 'C', bpm: 115, category: 'Pop', rawCifra: 'gerar' },
  { id: 'jeito-de-mato', title: 'Jeito de Mato', artist: 'Paula Fernandes', originalKey: 'A', bpm: 80, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'jesus-cristo', title: 'Jesus Cristo', artist: 'Roberto Carlos', originalKey: 'C', bpm: 116, category: 'Jovem Guarda', rawCifra: 'gerar' },
  { id: 'karma-chameleon', title: 'Karma Chameleon', artist: 'Culture Club', originalKey: 'Ab', bpm: 119, category: 'Pop', rawCifra: 'gerar' },
  { id: 'la-bamba', title: 'La Bamba', artist: 'Ritchie Valens', originalKey: 'C', bpm: 150, category: 'Rock', rawCifra: 'gerar' },
  { id: 'leilao', title: 'Leilão', artist: 'César Menotti & Fabiano', originalKey: 'C', bpm: 134, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'ligacao-urbana', title: 'Ligação Urbana', artist: 'Bruno e Marrone', originalKey: 'G', bpm: 124, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'linda-demais', title: 'Linda Demais', artist: 'Roupa Nova', originalKey: 'C', bpm: 82, category: 'Pop', rawCifra: 'gerar' },
  { id: 'livin-on-a-prayer', title: 'Livin\' On A Prayer', artist: 'Bon Jovi', originalKey: 'Em', bpm: 122, category: 'Rock', rawCifra: 'gerar' },
  { id: 'mal-acostumado', title: 'Mal Acostumado', artist: 'Ara Ketu', originalKey: 'Am', bpm: 96, category: 'Axé/Pagode', rawCifra: 'gerar' },
  { id: 'maluco-beleza', title: 'Maluco Beleza', artist: 'Raul Seixas', originalKey: 'C', bpm: 80, category: 'Rock Nacional', rawCifra: 'gerar' },
  { id: 'marianne', title: 'Marianne', artist: 'Bruno e Marrone', originalKey: 'C', bpm: 120, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'marrom-bombom', title: 'Marrom BomBom', artist: 'Os Morenos', originalKey: 'G', bpm: 104, category: 'Pagode', rawCifra: 'gerar' },
  { id: 'maus-bocados', title: 'Maus Bocados', artist: 'Cristiano Araújo', originalKey: 'C', bpm: 125, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'medo-bobo', title: 'Medo Bobo', artist: 'Maiara e Maraisa', originalKey: 'A', bpm: 114, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'menina-veneno', title: 'Menina Veneno', artist: 'Ritchie', originalKey: 'G#m', bpm: 116, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'menino-da-porteira', title: 'Menino da Porteira', artist: 'Sérgio Reis', originalKey: 'A', bpm: 112, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'mentes-tao-bem-zeze', title: 'Mentes Tão Bem', artist: 'Zezé Di Camargo & Luciano', originalKey: 'G', bpm: 80, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'mentes-tao-bem-eduardo', title: 'Mentes Tão Bem', artist: 'Eduardo Costa', originalKey: 'G', bpm: 80, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'meu-disfarce', title: 'Meu Disfarce', artist: 'Bruno e Marrone', originalKey: 'A', bpm: 92, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'meu-ebano', title: 'Meu Ébano', artist: 'Alcione', originalKey: 'C', bpm: 108, category: 'Samba', rawCifra: 'gerar' },
  { id: 'meu-eu-em-voce', title: 'Meu Eu Em Você', artist: 'Victor e Leo', originalKey: 'G', bpm: 94, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'meu-ex-amor', title: 'Meu Ex-Amor', artist: 'Amado Batista', originalKey: 'E', category: 'Reggae/Brega', bpm: 86, rawCifra: 'gerar' },
  { id: 'meu-mel', title: 'Meu Mel', artist: 'Zé Vaqueiro', originalKey: 'G', bpm: 122, category: 'Forró', rawCifra: 'gerar' },
  { id: 'meu-primeiro-amor', title: 'Meu Primeiro Amor', artist: 'Renato e Seus Blue Caps', originalKey: 'G', bpm: 108, category: 'Jovem Guarda', rawCifra: 'gerar' },
  { id: 'milla', title: 'Milla', artist: 'Netinho', originalKey: 'C', bpm: 125, category: 'Axé', rawCifra: 'gerar' },
  { id: 'misterios-da-meia-noite', title: 'Mistérios da Meia-Noite', artist: 'Zé Ramalho', originalKey: 'D', bpm: 116, category: 'MPB', rawCifra: 'gerar' },
  { id: 'morango-do-nordeste', title: 'Morango Do Nordeste', artist: 'Lairton', originalKey: 'G', bpm: 98, category: 'Brega', rawCifra: 'gerar' },
  { id: 'muito-estranho', title: 'Muito Estranho', artist: 'KLB', originalKey: 'C', bpm: 85, category: 'Pop', rawCifra: 'gerar' },
  { id: 'muito-prazer', title: 'Muito Prazer', artist: 'Zé Henrique e Gabriel', originalKey: 'F#', bpm: 112, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'mulher-de-40', title: 'Mulher de 40', artist: 'Roberto Carlos', originalKey: 'D', bpm: 72, category: 'Romântica', rawCifra: 'gerar' },
  { id: 'mulheres', title: 'Mulheres', artist: 'Martinho da Vila', originalKey: 'Bm', bpm: 92, category: 'Samba', rawCifra: 'gerar' },
  { id: 'na-hora-de-amar', title: 'Na Hora de Amar', artist: 'Gusttavo Lima', originalKey: 'Em', bpm: 128, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'na-pontinha-do-pe', title: 'Na pontinha do Pé', artist: 'Rick e Renner', originalKey: 'G', bpm: 130, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'nada-normal', title: 'Nada Normal', artist: 'Victor e Leo', originalKey: 'A', bpm: 120, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'nao-aprendi-dizer-adeus', title: 'Não Aprendi Dizer Adeus', artist: 'Leandro & Leonardo', originalKey: 'G', bpm: 82, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'nao-precisa', title: 'Não Precisa', artist: 'Victor e Leo', originalKey: 'G', bpm: 115, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'nao-precisa-paula', title: 'Não Precisa (part. Victor e Léo)', artist: 'Paula Fernandes', originalKey: 'A', bpm: 115, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'nao-precisa-mudar', title: 'Não Precisa Mudar', artist: 'Saulo Fernandes', originalKey: 'C', bpm: 118, category: 'Axé', rawCifra: 'gerar' },
  { id: 'nao-quero-dinheiro', title: 'Não Quero Dinheiro', artist: 'Tim Maia', originalKey: 'F#m', bpm: 125, category: 'Soul/Pop', rawCifra: 'gerar' },
  { id: 'nao-quero-mais-andar-na-contra', title: 'Não Quero Mais Andar Na Contra', artist: 'Raul Seixas', originalKey: 'C', bpm: 115, category: 'Rock Nacional', rawCifra: 'gerar' },
  { id: 'nao-to-valendo-nada', title: 'Não Tô Valendo Nada...', artist: 'Henrique e Juliano', originalKey: 'F', bpm: 130, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'nao-va', title: 'Não Vá', artist: 'Sandra de Sá', originalKey: 'Eb', bpm: 92, category: 'Soul', rawCifra: 'gerar' },
  { id: 'naquela-mesa', title: 'Naquela Mesa', artist: 'Nelson Gonçalves', originalKey: 'A', bpm: 80, category: 'Choro', rawCifra: 'gerar' },
  { id: 'no-rancho-fundo', title: 'No Rancho Fundo', artist: 'Chitãozinho & Xororó', originalKey: 'Gm', bpm: 76, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'noite-de-devaneio', title: 'Noite de Devaneio', artist: 'Matogrosso & Mathias', originalKey: 'C', bpm: 104, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'noites-traicoeras', title: 'Noites Traiçoeiras', artist: 'Padre Marcelo Rossi', originalKey: 'G', bpm: 90, category: 'Religiosa', rawCifra: 'gerar' },
  { id: 'notificacao-preferida', title: 'Notificação Preferida', artist: 'Zé Neto e Cristiano', originalKey: 'Em', bpm: 126, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'nuvens-de-lagrima', title: 'Nuvens de Lágrima / Mercedita / ...', artist: 'João Neto e Frederico', originalKey: 'Bb', bpm: 115, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'o-astronauta-de-marmore', title: 'O Astronauta de Mármore', artist: 'Nenhum de Nós', originalKey: 'F', bpm: 120, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'o-calhambeque', title: 'O Calhambeque', artist: 'Roberto Carlos', originalKey: 'E', bpm: 136, category: 'Jovem Guarda', rawCifra: 'gerar' },
  { id: 'o-gas-acabou', title: 'O Gás Acabou', artist: 'Luiz Americo', originalKey: 'C', bpm: 120, category: 'Samba', rawCifra: 'gerar' },
  { id: 'o-pinto', title: 'O Pinto', artist: 'Raça Negra', originalKey: 'C', bpm: 118, category: 'Pagode', rawCifra: 'gerar' },
  { id: 'olhar-43', title: 'Olhar 43', artist: 'RPM', originalKey: 'Eb', bpm: 128, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'parei-na-contramao', title: 'Parei Na Contramão', artist: 'Roberto Carlos', originalKey: 'B', bpm: 132, category: 'Jovem Guarda', rawCifra: 'gerar' },
  { id: 'passaro-de-fogo', title: 'Pássaro de Fogo', artist: 'Paula Fernandes', originalKey: 'G', bpm: 92, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'passou-da-conta', title: 'Passou da Conta', artist: 'Bruno e Marrone', originalKey: 'C', bpm: 84, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'por-causa-de-voce', title: 'Por Causa de Você', artist: 'The Fevers', originalKey: 'D', bpm: 110, category: 'Jovem Guarda', rawCifra: 'gerar' },
  { id: 'por-onde-andei', title: 'Por Onde Andei', artist: 'Nando Reis', originalKey: 'C', bpm: 112, category: 'Pop', rawCifra: 'gerar' },
  { id: 'por-te-amar-assim', title: 'Por Te Amar Assim', artist: 'Marlon & Maicon', originalKey: 'C', bpm: 78, category: 'Sertanejo/Romântica', rawCifra: 'gerar' },
  { id: 'por-um-minuto', title: 'Por Um Minuto', artist: 'Bruno e Marrone', originalKey: 'G', bpm: 82, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'pra-voce', title: 'Pra Você', artist: 'Paula Fernandes', originalKey: 'C', bpm: 90, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'pra-voce-guardei-o-amor', title: 'Pra Você Guardei o Amor', artist: 'Nando Reis', originalKey: 'D', bpm: 96, category: 'Pop', rawCifra: 'gerar' },
  { id: 'programa-de-fim-de-semana', title: 'Programa de Fim de Semana', artist: 'Bruno e Marrone', originalKey: 'G', bpm: 112, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'propaganda', title: 'Propaganda', artist: 'Jorge & Mateus', originalKey: 'D', bpm: 122, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'quando-te-encontrei', title: 'Quando Te Encontrei', artist: 'Raça Negra', originalKey: 'C', bpm: 112, category: 'Pagode', rawCifra: 'gerar' },
  { id: 'quando-um-grande-amor-se-faz', title: 'Quando Um Grande Amor Se Faz', artist: 'Eduardo Costa', originalKey: 'C', bpm: 86, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'quando-voce-passa-g', title: 'Quando voce passa', artist: 'Sandy & Junior', originalKey: 'G', bpm: 104, category: 'Pop', rawCifra: 'gerar' },
  { id: 'quando-voce-passa-turu-turu', title: 'Quando Você Passa (Turu Turu)', artist: 'Sandy & Junior', originalKey: 'C', bpm: 104, category: 'Pop', rawCifra: 'gerar' },
  { id: 'que-pescar-que-nada', title: 'Que Pescar Que Nada', artist: 'Bruno e Marrone', originalKey: 'C', bpm: 135, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'quem-de-nos-dois', title: 'Quem de Nós Dois', artist: 'Victor & Leo', originalKey: 'Gm', bpm: 84, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'quer-casar-comigo', title: 'Quer Casar Comigo', artist: 'Bruno e Marrone', originalKey: 'D', bpm: 120, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'recado-a-minha-amada', title: 'Recado à minha amada', artist: 'Katinguelê', originalKey: 'F', bpm: 108, category: 'Pagode', rawCifra: 'gerar' },
  { id: 'retrovisor', title: 'Retrovisor', artist: 'Fagner', originalKey: 'G', bpm: 80, category: 'MPB', rawCifra: 'gerar' },
  { id: 'rindo-a-toa', title: 'Rindo À Toa', artist: 'Falamansa', originalKey: 'G', bpm: 115, category: 'Forró/Xote', rawCifra: 'gerar' },
  { id: 'robocop-gay', title: 'Robocop Gay', artist: 'Mamonas Assassinas', originalKey: 'Dm', bpm: 132, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'romance-rosa', title: 'Romance Rosa', artist: 'Juan Luis Guerra 4.40', originalKey: 'A', bpm: 85, category: 'Bolero', rawCifra: 'gerar' },
  { id: 'romaria', title: 'Romaria', artist: 'Renato Teixeira', originalKey: 'D', bpm: 70, category: 'MPB/Sertanejo', rawCifra: 'gerar' },
  { id: 'seio-de-minas', title: 'Seio de Minas', artist: 'Paula Fernandes', originalKey: 'G', bpm: 84, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'sem-radar', title: 'Sem Radar', artist: 'LS Jack', originalKey: 'G', bpm: 106, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'seresteiro-das-noites', title: 'Seresteiro Das Noites', artist: 'Amado Batista', originalKey: 'Db', bpm: 90, category: 'Brega', rawCifra: 'gerar' },
  { id: 'seu-amor-ainda-e-tudo', title: 'Seu Amor Ainda É Tudo', artist: 'Bruno e Marrone', originalKey: 'Dm', bpm: 86, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'seu-policia', title: 'Seu Polícia', artist: 'Zé Neto e Cristiano', originalKey: 'F', bpm: 125, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'sinonimos', title: 'Sinônimos', artist: 'Zé Ramalho', originalKey: 'D', bpm: 92, category: 'MPB', rawCifra: 'gerar' },
  { id: 'sinonimos-chitaozinho', title: 'Sinônimos (part. Zé Ramalho)', artist: 'Chitãozinho & Xororó', originalKey: 'G', bpm: 92, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'so-pensando-em-voce', title: 'Só Pensando Em Você?', artist: 'Rick & Renner', originalKey: 'Gm', bpm: 104, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'so-voce', title: 'Só Você', artist: 'Fábio Jr.', originalKey: 'C', bpm: 88, category: 'Pop', rawCifra: 'gerar' },
  { id: 'sonifera-ilha', title: 'Sonífera Ilha', artist: 'Titãs', originalKey: 'C', bpm: 132, category: 'Rock Nacional', rawCifra: 'gerar' },
  { id: 'sons-baladas-e-blues', title: 'Sons Baladas e Blues', artist: 'Ave De Rapina', originalKey: 'G', bpm: 92, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'sou-eu', title: 'Sou Eu', artist: 'Bruno e Marrone', originalKey: 'E', bpm: 104, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'sozinho', title: 'Sozinho', artist: 'Raça Negra', originalKey: 'G', bpm: 92, category: 'Pagode', rawCifra: 'gerar' },
  { id: 'splish-splash-roberto', title: 'Splish Splash', artist: 'Roberto Carlos', originalKey: 'A', bpm: 144, category: 'Jovem Guarda', rawCifra: 'gerar' },
  { id: 'splish-splash-sandy', title: 'Splish Splash', artist: 'Sandy & Junior', originalKey: 'A', bpm: 144, category: 'Pop', rawCifra: 'gerar' },
  { id: 'sugar', title: 'Sugar', artist: 'Maroon 5', originalKey: 'D', bpm: 120, category: 'Pop', rawCifra: 'gerar' },
  { id: 'temporal-de-amor', title: 'Temporal de Amor', artist: 'Leandro & Leonardo', originalKey: 'E', bpm: 88, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'tenho-ciume-de-tudo', title: 'Tenho Ciúme de Tudo', artist: 'Bruno e Marrone', originalKey: 'F', bpm: 90, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'tenho-ciume-de-tudo-potpourri', title: 'Tenho Ciúme de Tudo / A Dama...', artist: 'Bruno e Marrone', originalKey: 'F', bpm: 90, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'three-little-birds', title: 'Three Little Birds', artist: 'Gilberto Gil', originalKey: 'E', bpm: 74, category: 'Reggae', rawCifra: 'gerar' },
  { id: 'time-after-time', title: 'Time After Time', artist: 'Cyndi Lauper', originalKey: 'C', bpm: 110, category: 'Pop', rawCifra: 'gerar' },
  { id: 'tire-seus-olhos-dos-meus', title: 'Tire Seus Olhos Dos Meus', artist: 'Francisco e Alexandre', originalKey: 'C', bpm: 82, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'to-fazendo-falta', title: 'Tô Fazendo Falta', artist: 'Joanna', originalKey: 'C', bpm: 86, category: 'MPB', rawCifra: 'gerar' },
  { id: 'toca-um-samba-ai', title: 'Toca Um Samba Ai', artist: 'Inimigos da HP', originalKey: 'A', bpm: 120, category: 'Pagode', rawCifra: 'gerar' },
  { id: 'toca-uma-regguera-ai', title: 'Toca Uma Regguera Aí', artist: 'Armandinho', originalKey: 'D', bpm: 98, category: 'Reggae', rawCifra: 'gerar' },
  { id: 'tocando-em-frente', title: 'Tocando Em Frente', artist: 'Almir Sater', originalKey: 'C', bpm: 72, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'toda-forma-de-amor', title: 'Toda Forma de Amor', artist: 'Lulu Santos', originalKey: 'Em', bpm: 122, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'trem-bala', title: 'Trem-Bala', artist: 'Ana Vilela', originalKey: 'A', bpm: 95, category: 'Folk', rawCifra: 'gerar' },
  { id: 'tropicana', title: 'Tropicana (Morena Tropicana)', artist: 'Alceu Valença', originalKey: 'Bm', bpm: 128, category: 'MPB/Nordestina', rawCifra: 'gerar' },
  { id: 'um-anjo-do-ceu', title: 'Um Anjo do Céu', artist: 'Maskavo', originalKey: 'G', bpm: 84, category: 'Reggae', rawCifra: 'gerar' },
  { id: 'um-sonhador', title: 'Um Sonhador', artist: 'Leandro & Leonardo', originalKey: 'F', bpm: 84, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'uma-brasileira', title: 'Uma Brasileira', artist: 'Os Paralamas do Sucesso', originalKey: 'F#m', bpm: 116, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'uma-carta', title: 'Uma Carta', artist: 'LS Jack', originalKey: 'C', bpm: 104, category: 'Pop Rock', rawCifra: 'gerar' },
  { id: 'vai-dar-namoro', title: 'Vai Dar Namoro', artist: 'Bruno e Marrone', originalKey: 'G', bpm: 124, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'vamo-pula-1', title: 'Vâmo Pulá', artist: 'Sandy & Junior', originalKey: 'G', bpm: 130, category: 'Pop', rawCifra: 'gerar' },
  { id: 'vamo-pula-2', title: 'Vâmo Pulá (Versão Alternativa)', artist: 'Sandy & Junior', originalKey: 'G', bpm: 130, category: 'Pop', rawCifra: 'gerar' },
  { id: 'vida-cigana', title: 'Vida Cigana', artist: 'Raça Negra', originalKey: 'G', bpm: 114, category: 'Pagode', rawCifra: 'gerar' },
  { id: 'vida-vazia', title: 'Vida Vazia', artist: 'Bruno e Marrone', originalKey: 'G', bpm: 88, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'vidinha-de-balada', title: 'Vidinha de Balada', artist: 'Henrique e Juliano', originalKey: 'D', bpm: 128, category: 'Sertanejo', rawCifra: 'gerar' },
  { id: 'voce-vai-ver', title: 'Você Vai Ver', artist: 'Zezé Di Camargo & Luciano', originalKey: 'F', bpm: 80, category: 'Sertanejo', rawCifra: 'gerar' }
];
