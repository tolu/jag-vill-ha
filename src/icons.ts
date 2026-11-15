// The curated icons in public/icons/wish-icons.svg (Phosphor, light weight).
export const WISH_ICONS = [
  ['gift', 'Present'],
  ['book-open', 'Bok'],
  ['t-shirt', 'Kläder'],
  ['sneaker', 'Skor'],
  ['headphones', 'Hörlurar'],
  ['game-controller', 'Spel'],
  ['bicycle', 'Cykel'],
  ['cooking-pot', 'Kök'],
  ['wine', 'Vin'],
  ['coffee', 'Kaffe'],
  ['plant', 'Växt'],
  ['armchair', 'Möbel'],
  ['lamp', 'Lampa'],
  ['wrench', 'Verktyg'],
  ['camera', 'Kamera'],
  ['music-notes', 'Musik'],
  ['ticket', 'Biljett'],
  ['airplane', 'Resa'],
  ['tent', 'Friluftsliv'],
  ['watch', 'Klocka'],
  ['device-mobile', 'Teknik'],
  ['paint-brush', 'Skapande'],
  ['puzzle-piece', 'Pussel'],
  ['heart', 'Annat'],
] as const;

export const isWishIcon = (value: string) => WISH_ICONS.some(([id]) => id === value);
