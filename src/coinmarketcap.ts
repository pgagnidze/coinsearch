import CmcRequest from './cmcrequest';
import routes from './data/routes';
import { CmcCoinRemote, Coin } from './types/coins';

class CoinMarketCap extends CmcRequest {
  ventures: Array<{ name: string; slug: string }>;
  constructor({
    key,
    url,
    ventures,
  }: {
    key: string;
    url: string;
    ventures: Array<{ name: string; slug: string }>;
  }) {
    super({ key, url });
    this.ventures = ventures;
  }

  async getCoins({
    ventures = this.ventures,
  }: {
    ventures?: Array<{ name: string; slug: string }>;
  }) {
    const allCategories = await this.get({ route: routes.categories });
    const filteredCategories = allCategories.filter(
      (category: { name: string }) =>
        ventures.map((venture) => venture.name).includes(category.name),
    );
    const allCoins: [][] = [];
    for (const venture of filteredCategories) {
      const portfolio = await this.get({
        route: routes.category.replace(/:id/, venture.id),
      });
      allCoins.push(portfolio.coins);
    }
    const flattenedCoins = allCoins.flat();

    const coins = {} as { id: string; slug: string }[];
    flattenedCoins.forEach((coin: { id: string; slug: string }) => {
      if (!coins[coin.id]) {
        coins[coin.id] = coin.slug;
      }
    });

    const slugParams = this.glueSlugs(coins);

    const info = await this.get({
      route: routes.info.replace(/:slug/, slugParams),
    });

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
      };
    });

    return cmcEntries;
  }

  private glueSlugs(coins: { id: string; slug: string }[]) {
    let slugParams = '';
    for (const slug of Object.values(coins)) {
      slugParams += `${slug},`;
    }
    slugParams = slugParams.slice(0, -1);
    return slugParams;
  }
}

export default CoinMarketCap;
