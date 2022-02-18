import CoinMarketCap from './coinmarketcap.ts'
import Notion from './notion.ts'
import access from './config/access.ts'
import ventures from './data/ventures.ts'
import { orderedDiff } from './utils/utils.ts'
import { Coin } from './types/coins.ts'

const notion = new Notion({
  key: access.notion.key,
  db: access.notion.db,
})

const cmc = new CoinMarketCap({
  key: access.cmc.key,
  url: access.cmc.url,
  ventures,
})

await notion.updateDb({
  tags: ventures.map((venture) => ({ name: venture.slug })),
})

const cmcEntries = await cmc.getCoins({})
const notionEntries = await notion.getCoins()

const itemsOnlyInCmCEntries = cmcEntries.filter((x) =>
  cmcEntries
    .map((entry) => entry.slug)
    .filter((y) => !notionEntries.map((entry) => entry.slug).includes(y))
    .includes(x.slug),
)
await notion.createEntries(itemsOnlyInCmCEntries)

const itemsInBothEntries = cmcEntries.filter((x) =>
  cmcEntries
    .map((entry) => entry.slug)
    .filter((y) => notionEntries.map((entry) => entry.slug).includes(y))
    .includes(x.slug),
)
const updateEntries: unknown[] = []
for (const item of itemsInBothEntries) {
  const cmcEntry = cmcEntries.find((x) => x.slug === item.slug) as Coin
  const notionEntry = notionEntries.find((x) => x.slug === item.slug) as Coin
  const notionDiff = orderedDiff(notionEntry, cmcEntry)
  if (Object.keys(notionDiff).length > 0) {
    notionDiff['id'] = notionEntry ? notionEntry['id'] : ''
    updateEntries.push(notionDiff)
  }
}

await notion.updateEntries(updateEntries)
