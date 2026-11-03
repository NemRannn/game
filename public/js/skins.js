/**
 * 8 Super Cute Skins configuration and styling rules.
 */
export const SKINS = [
  {
    id: 'cat',
    name: 'Mèo Kitty',
    emoji: '🐱',
    primaryColor: '#ff9ff3',
    secondaryColor: '#feca57',
    bodyColor: '#ffd3f8',
    bellyColor: '#ffffff',
    eyeColor: '#222f3e',
    blushColor: '#ff6b81',
    earType: 'cat', // pointed triangles with pink inner
    pattern: 'rings',
    description: 'Bé mèo hồng tai nhọn chớp mắt cực yêu!'
  },
  {
    id: 'panda',
    name: 'Gấu Panda',
    emoji: '🐼',
    primaryColor: '#2f3542',
    secondaryColor: '#f1f2f6',
    bodyColor: '#ffffff',
    bellyColor: '#2f3542',
    eyeColor: '#1e272e',
    blushColor: '#ff7f50',
    earType: 'panda', // rounded black ears
    pattern: 'spots',
    description: 'Gấu trúc tròn xoe thích gặm kẹo!'
  },
  {
    id: 'corgi',
    name: 'Cún Corgi',
    emoji: '🐶',
    primaryColor: '#e17055',
    secondaryColor: '#ffeaa7',
    bodyColor: '#fab1a0',
    bellyColor: '#ffffff',
    eyeColor: '#2d3436',
    blushColor: '#e17055',
    earType: 'corgi', // tall perky ears
    pattern: 'belly',
    description: 'Bé cún mông trái tim lăng xăng tinh nghịch!'
  },
  {
    id: 'dino',
    name: 'Khủng Long Bé',
    emoji: '🦖',
    primaryColor: '#00b894',
    secondaryColor: '#55efc4',
    bodyColor: '#81ecec',
    bellyColor: '#ffffff',
    eyeColor: '#2d3436',
    blushColor: '#fd79a8',
    earType: 'dino_plates', // soft triangular plates
    pattern: 'spikes',
    description: 'Bé rồng con màu xanh bạc hà dễ thương!'
  },
  {
    id: 'strawberry',
    name: 'Bé Dâu Tây',
    emoji: '🍓',
    primaryColor: '#ff4757',
    secondaryColor: '#2ed573',
    bodyColor: '#ff6b81',
    bellyColor: '#ffa502',
    eyeColor: '#2f3542',
    blushColor: '#ff4757',
    earType: 'strawberry_leaf', // green top leaves
    pattern: 'seeds',
    description: 'Ngọt ngào mọng nước với hạt dâu vàng óng!'
  },
  {
    id: 'boba',
    name: 'Trà Sữa Trân Châu',
    emoji: '🧋',
    primaryColor: '#d6a2e8',
    secondaryColor: '#82589f',
    bodyColor: '#e0c9a6',
    bellyColor: '#4b4b4b',
    eyeColor: '#2c2c54',
    blushColor: '#ff7675',
    earType: 'straw', // cute straw accessory
    pattern: 'boba_pearls',
    description: 'Thơm lừng caramel với những viên trân châu dẻo!'
  },
  {
    id: 'rainbow',
    name: 'Cầu Vồng Pastel',
    emoji: '🌈',
    primaryColor: '#a29bfe',
    secondaryColor: '#fd79a8',
    bodyColor: '#74b9ff',
    bellyColor: '#ffeaa7',
    eyeColor: '#2d3436',
    blushColor: '#fd79a8',
    earType: 'halo',
    pattern: 'rainbow_gradient',
    description: 'Dải màu cầu vồng phát sáng rực rỡ!'
  },
  {
    id: 'chick',
    name: 'Gà Con Chíp',
    emoji: '🐥',
    primaryColor: '#fed330',
    secondaryColor: '#fa8231',
    bodyColor: '#f7d794',
    bellyColor: '#ffffff',
    eyeColor: '#3867d6',
    blushColor: '#fc5c65',
    earType: 'chick_crest',
    pattern: 'stripes',
    description: 'Gà con lông vàng mỏ cam tinh nghịch!'
  }
];

export function getSkinById(id) {
  return SKINS.find(s => s.id === id) || SKINS[0];
}
