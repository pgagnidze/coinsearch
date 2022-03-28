import { Client } from 'https://deno.land/x/notion_sdk@v1.0.3/src/mod.ts'
import { Coin, NotionCoinRemote } from './types/coins.ts'
import { chunk, capitalize } from './utils/utils.ts'

class Notion extends Client {
  private db: string
  constructor({ key, db }: { key: string; db: string }) {
    super({ auth: key })
    this.db = db
  }

  async createEntries(coins: Coin[]) {
    const pagesToCreateChunks = chunk(coins, 1)
    for (const pagesToCreateBatch of pagesToCreateChunks) {
      await Promise.all(
        pagesToCreateBatch.map((coin: Coin) =>
          this.pages.create({
            parent: { database_id: this.db },
            properties: this.getPropertiesFromCoin(coin),
          }),
        ),
      )
      console.log(`Created batch size: ${pagesToCreateBatch.length}`)
    }
  }

  async removeEntries(coins: Coin[]) {
    const pagesToUpdateChunks = chunk(coins, 10)
    for (const pagesToUpdateBatch of pagesToUpdateChunks) {
      await Promise.all(
        pagesToUpdateBatch.map((coin: Coin) =>
          this.pages.update({
            page_id: coin.id || '',
            archived: true,
          }),
        ),
      )
      console.log(`Removed batch size: ${pagesToUpdateBatch.length}`)
    }
  }

  async updateEntries(coins: unknown[]) {
    const pagesToUpdateChunks = chunk(coins, 1)
    for (const pagesToUpdateBatch of pagesToUpdateChunks) {
      await Promise.all(
        pagesToUpdateBatch.map(({ id, ...coin }: Coin) =>
          this.pages.update({
            page_id: id || '',
            properties: this.getPropertiesFromCoin(coin),
          }),
        ),
      )
      console.log(`Updated batch size: ${pagesToUpdateBatch.length}`)
    }
  }

  updateDb({ tags }: { tags: Array<{ name: string }> }) {
    return this.databases.update({
      database_id: this.db,
      icon: {
        type: 'emoji',
        emoji: '💎',
      },
      cover: {
        type: 'external',
        external: {
          url: 'https://www.artic.edu/iiif/2/b3974542-b9b4-7568-fc4b-966738f61d78/full/1686,/0/default.jpg',
        },
      },
      title: [
        {
          text: {
            content: 'Venture Coin Database ',
          },
          annotations: {
            bold: true,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: 'default',
          },
        },
        {
          mention: {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      ],
      properties: {
        Tags: {
          multi_select: {
            options: tags || [{ name: 'NA' }],
          },
        },
        Name: {
          title: {},
        },
        Symbol: {
          title: {},
        },
        Slug: {
          title: {},
        },
        Website: {
          url: {},
        },
        Doc: {
          url: {},
        },
      },
    })
  }

  async getCoins() {
    const notionEntries: Coin[] = []
    let cursor: string | undefined = undefined
    while (true) {
      const { results, next_cursor } = await this.databases.query({
        database_id: this.db,
        start_cursor: cursor,
      })
      const result = results
        ? (results as unknown as NotionCoinRemote[]).map(
          (page: NotionCoinRemote) => {
            return {
              id: page.id,
              tags:
                page.properties.Tags.multi_select.length > 0
                  ? page.properties.Tags.multi_select.map(
                    (tag: { name: string }) => ({
                      name: tag.name,
                    }),
                  )
                  : [],
              name: page.properties.Name.title[0]
                ? page.properties.Name.title[0].text.content
                : 'NA',
              slug: page.properties.Slug.title[0]
                ? page.properties.Slug.title[0].text.content
                : 'NA',
              symbol: page.properties.Symbol.title[0]
                ? page.properties.Symbol.title[0].text.content
                : 'NA',
              website: page.properties.Website.url,
              doc: page.properties.Doc.url,
            }
          },
        )
        : []
      notionEntries.push(...result)
      if (!next_cursor) {
        break
      }
      cursor = next_cursor
    }

    console.log(`${notionEntries.length} pages successfully fetched.`)

    return notionEntries
  }

  retrieveDb() {
    return this.databases.retrieve({
      database_id: this.db,
    })
  }

  private getPropertiesFromCoin(coin: Coin) {
    const propertyValues = {}
    for (const [key, value] of Object.entries(coin)) {
      if (key === 'tags') {
        propertyValues[capitalize(key)] = {
          multi_select: value || [{ name: 'NA' }],
        }
      } else if (key === 'website' || key === 'doc') {
        propertyValues[capitalize(key)] = {
          url: value || 'NA',
        }
      } else {
        propertyValues[capitalize(key)] = {
          title: [
            {
              text: {
                content: value,
              },
            },
          ],
        }
      }
    }

    return propertyValues
  }
}

export default Notion
