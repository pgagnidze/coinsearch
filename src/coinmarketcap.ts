import routes from './data/routes.ts'
import { CmcCoinRemote, Coin } from './types/coins.ts'
import { glueSlugs } from './utils/utils.ts'

class CoinMarketCap {
  ventures: Array<{ name: string; slug: string }>
  key: string
  url: string
  constructor({
    key,
    url,
    ventures,
  }: {
    key: string
    url: string
    ventures: Array<{ name: string; slug: string }>
  }) {
    this.key = key
    this.url = url
    this.ventures = ventures
  }

  async getCoins({
    ventures = this.ventures,
  }: {
    ventures?: Array<{ name: string; slug: string }>
  }) {
    const allCategories = await this.get({ route: routes.categories })
    const filteredCategories = allCategories.filter(
      (category: { name: string }) =>
        ventures.map((venture) => venture.name).includes(category.name),
    )
    const allCoins: [][] = []
    for (const venture of filteredCategories) {
      const portfolio = await this.get({
        route: routes.category.replace(/:id/, venture.id),
      })
      allCoins.push(portfolio.coins)
    }
    const flattenedCoins = allCoins.flat()

    const coins = {} as { id: string; slug: string }
    flattenedCoins.forEach((coin: { id: string; slug: string }) => {
      if (!coins[coin.id]) {
        coins[coin.id] = coin.slug
      }
    })

    const slugParams = glueSlugs(coins)

    const info = await this.get({
      route: routes.info.replace(/:slug/, slugParams),
    })

    const cmcEntries: Coin[] = (
      Object.values(info) as unknown as CmcCoinRemote[]
    ).map((coin: CmcCoinRemote) => {
      return {
        tags: coin.tags
          .filter((tag) =>
            ventures.map((venture) => venture.slug).includes(tag),
          )
          .map((tag: string) => ({ name: tag })),
        name: coin.name,
        slug: coin.slug,
        symbol: coin.symbol,
        website: coin.urls.website[0] || 'NA',
        doc: coin.urls.technical_doc[0] || 'NA',
      }
    })

    return cmcEntries
  }

  private async get({ route }: { route: string }) {
    const response = await fetch(`${this.url}${route}`, {
      method: 'get',
      headers: {
        'X-CMC_PRO_API_KEY': this.key,
        Accepts: 'application/json',
      },
    })
    const { data } = await response.json()
    return data
  }
}

export default CoinMarketCap
