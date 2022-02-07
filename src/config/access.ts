const access = {
  notion: {
    key: process.env.NOTION_ACCESS_TOKEN || '',
    db: process.env.NOTION_DATABASE_ID || '',
  },
  cmc: {
    key: process.env.CMC_PRO_API_KEY || '',
    url: process.env.CMC_PRO_API_URL || '',
  },
};

export default access;
