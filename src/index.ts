import CoinMarketCap from './coinmarketcap';
import Notion from './notion';
import access from './config/access';
import ventures from './data/ventures';
import { updatedDiff } from 'deep-object-diff';

const notion = new Notion({
  key: access.notion.key,
  db: access.notion.db,
});

const cmc = new CoinMarketCap({
  key: access.cmc.key,
  url: access.cmc.url,
  ventures,
});

(async () => {
  const { url } = await notion.retrieveDb();
  await notion.updateDb({
    tags: ventures.map((venture) => ({ name: venture.slug })),
  });

  const cmcEntries = await cmc.getCoins({});
  const notionEntries = await notion.getCoins();

  const itemsOnlyInCmCEntries = cmcEntries.filter((x) =>
    cmcEntries
      .map((entry) => entry.slug)
      .filter((y) => !notionEntries.map((entry) => entry.slug).includes(y))
      .includes(x.slug),
  );
  await notion.createEntries(itemsOnlyInCmCEntries);

  const itemsInBothEntries = cmcEntries.filter((x) =>
    cmcEntries
      .map((entry) => entry.slug)
      .filter((y) => notionEntries.map((entry) => entry.slug).includes(y))
      .includes(x.slug),
  );
  const updateEntries: unknown[] = [];
  for (const item of itemsInBothEntries) {
    const cmcEntry = cmcEntries.find((x) => x.slug === item.slug) as object;
    const notionEntry = notionEntries.find(
      (x) => x.slug === item.slug,
    ) as object;
    const notionDiff = updatedDiff(notionEntry, cmcEntry);
    if (Object.keys(notionDiff).length > 0) {
      if (notionDiff.hasOwnProperty('tags'))
        notionDiff['tags'] = cmcEntry['tags'];
      notionDiff['id'] = notionEntry ? notionEntry['id'] : '';
      updateEntries.push(notionDiff);
    }
  }

  await notion.updateEntries(updateEntries);

  console.log('Database URL: ', url);
})();
