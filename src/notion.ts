import { Client } from '@notionhq/client';
import { Coin, NotionCoinRemote } from './types/coins';

class Notion extends Client {
  private db: string;
  constructor({ key, db }: { key: string; db: string }) {
    super({ auth: key });
    this.db = db;
  }

  async createEntries(coins: Coin[]) {
    const pagesToCreateChunks = this.chunk(coins, 1);
    for (const pagesToCreateBatch of pagesToCreateChunks) {
      await Promise.all(
        pagesToCreateBatch.map(async (coin: Coin) =>
          this.pages.create({
            parent: { database_id: this.db },
            properties: this.getPropertiesFromCoin(coin),
          }),
        ),
      );
      console.log(`Created batch size: ${pagesToCreateBatch.length}`);
    }
  }

  async removeEntries(coins: Coin[]) {
    const pagesToUpdateChunks = this.chunk(coins, 10);
    for (const pagesToUpdateBatch of pagesToUpdateChunks) {
      await Promise.all(
        pagesToUpdateBatch.map((coin: Coin) =>
          this.pages.update({
            page_id: coin.id || '',
            archived: true,
          }),
        ),
      );
      console.log(`Removed batch size: ${pagesToUpdateBatch.length}`);
    }
  }

  async updateEntries(coins: unknown[]) {
    const pagesToUpdateChunks = this.chunk(coins, 1);
    for (const pagesToUpdateBatch of pagesToUpdateChunks) {
      await Promise.all(
        pagesToUpdateBatch.map(({ id, ...coin }: Coin) =>
          this.pages.update({
            page_id: id || '',
            properties: this.getPropertiesFromCoin(coin),
          }),
        ),
      );
      console.log(`Updated batch size: ${pagesToUpdateBatch.length}`);
    }
  }

  async updateDb({ tags }: { tags: Array<{ name: string }> }) {
    const response = await this.databases
      .update({
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
      .catch((err) => {
        throw err;
      });
    return response;
  }

  async getCoins() {
    const notionEntries: Coin[] = [];
    let cursor: string | undefined = undefined;
    while (true) {
      const { results, next_cursor } = await this.databases.query({
        database_id: this.db,
        start_cursor: cursor,
      });
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
              };
            },
          )
        : [];
      notionEntries.push(...result);
      if (!next_cursor) {
        break;
      }
      cursor = next_cursor;
    }

    console.log(`${notionEntries.length} pages successfully fetched.`);

    return notionEntries;
  }

  async retrieveDb() {
    const { properties, last_edited_time, url } = (await this.databases
      .retrieve({
        database_id: this.db,
      })
      .catch((err) => {
        throw err;
      })) as { properties: object; last_edited_time: string; url: string };
    return {
      properties,
      last_edited_time,
      url,
    };
  }

  private getPropertiesFromCoin(coin: Coin) {
    const propertyValues = {};
    for (const [key, value] of Object.entries(coin)) {
      if (key === 'tags') {
        propertyValues[this.capitalize(key)] = {
          multi_select: value || [{ name: 'NA' }],
        };
      } else if (key === 'website' || key === 'doc') {
        propertyValues[this.capitalize(key)] = {
          url: value || 'NA',
        };
      } else {
        propertyValues[this.capitalize(key)] = {
          title: [
            {
              text: {
                content: value,
              },
            },
          ],
        };
      }
    }

    return propertyValues;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private chunk(input: any[], size: number) {
    return input.reduce((arr, item, idx: number) => {
      return idx % size === 0
        ? [...arr, [item]]
        : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
    }, []);
  }

  private capitalize(str: string) {
    return str.trim().replace(/^\w/, (c) => c.toUpperCase());
  }
}

export default Notion;
