export type Coin = {
  id?: string
  name: string
  tags: Array<{ name: string }>
  slug: string
  symbol: string
  website: string
  doc: string
}

export type CmcCoinRemote = {
  tags: Array<string>
  name: string
  slug: string
  symbol: string
  urls: { website: Array<string>; technical_doc: Array<string> }
}

export type NotionCoinRemote = {
  id: string
  properties: {
    Tags: {
      multi_select: {
        name: string
        id: string
        color: string
      }[]
    }
    Name: {
      title: {
        text: { content: string }
      }[]
    }
    Slug: {
      title: {
        text: { content: string }
      }[]
    }
    Symbol: {
      title: {
        text: { content: string }
      }[]
    }
    Website: {
      url: string
    }
    Doc: {
      url: string
    }
  }
}
