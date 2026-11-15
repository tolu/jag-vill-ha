import { defineSeed } from 'void/seed';

// The sample list from the design prototype, at /tobias.
export default defineSeed<typeof import('./schema')>(async ({ db, schema }) => {
  const [list] = await db
    .insert(schema.lists)
    .values({
      username: 'tobias',
      displayName: 'Tobias',
      intro: 'Paxa det du tänker köpa, så slipper jag få tre likadana. Jag kan inte se vad som är paxat.',
    })
    .returning();

  const rows = await db
    .insert(schema.wishes)
    .values([
      { listId: list.id, position: 1, title: 'Non-stick pajform', note: 'Lékué 28 cm', price: 349, icon: 'cooking-pot', mostWanted: true, url: 'https://example.com/pajform' },
      { listId: list.id, position: 2, title: 'Gore-Tex-skor', note: 'Storlek 44', price: 1899, icon: 'sneaker' },
      { listId: list.id, position: 3, title: 'Kokbok, gärna vegetarisk', note: 'Valfri', price: 300, icon: 'book-open' },
      { listId: list.id, position: 4, title: 'Vinglas', price: 129, quantity: 4, icon: 'wine', url: 'https://example.com/vinglas' },
      { listId: list.id, position: 5, title: 'Stickade sockor', note: 'Ull', price: 199 },
    ])
    .returning();

  const byTitle = (title: string) => rows.find((row) => row.title === title)!.id;

  await db.insert(schema.reservations).values([
    { wishId: byTitle('Gore-Tex-skor'), name: 'Erik', tokenHash: 'seed' },
    { wishId: byTitle('Vinglas'), name: 'Maja', quantity: 2, tokenHash: 'seed' },
    { wishId: byTitle('Stickade sockor'), name: 'Anna', tokenHash: 'seed' },
  ]);
});
