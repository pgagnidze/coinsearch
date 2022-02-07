
# Coinsearch

This Notion integration syncs coins from CoinMarketCap for a specific portfolio to a Notion Database. This integration was built on Notion and Coinmarketcap APIs.


## Environment Variables

To run this project, you will need to add the following environment variables

`NOTION_ACCESS_TOKEN`
`CMC_PRO_API_KEY`
`CMC_PRO_API_URL`
`NOTION_DATABASE_ID`

You can create your Notion API key [here](https://www.notion.com/my-integrations)

You can create your CoinMarketCap API key [here](https://coinmarketcap.com/api/)

To create a Notion database that will work with this integration, duplicate [this](https://www.notion.so/4f4b8a047e9b4c988dd5bd02c3d4ef92) database template.
## Run Locally

Clone the project

```bash
  git clone https://github.com/pgagnidze/coinsearch
```

Go to the project directory

```bash
  cd coinsearch
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```


## Features

- Adds new entries automatically
- Updates only the modified fields
- Configures portfolios from the data files
