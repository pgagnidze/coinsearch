import fetch from 'node-fetch';

class CmcRequest {
  private key: string;
  private url: string;
  constructor({ key, url }: { key: string; url: string }) {
    this.key = key;
    this.url = url;
  }

  async get({ route }: { route: string }) {
    const response = await fetch(`${this.url}${route}`, {
      method: 'get',
      headers: {
        'X-CMC_PRO_API_KEY': this.key,
        Accepts: 'application/json',
      },
    });
    const { data } = await response.json();
    return data;
  }
}

export default CmcRequest;
