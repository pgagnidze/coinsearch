const access = {
  notion: {
    key: Deno.env.get('NOTION_ACCESS_TOKEN') || '',
    db: Deno.env.get('NOTION_DATABASE_ID') || '',
  },
  cmc: {
    key: Deno.env.get('CMC_PRO_API_KEY') || '',
    url: Deno.env.get('CMC_PRO_API_URL') || '',
  },
}

export default access
