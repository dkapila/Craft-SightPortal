const getHtmlFromUrl = async (item: string) => {
  const response = await craft.httpProxy.fetch({
    url: item,
    method: 'GET',
  });

  if (response.status === 'success' && response.data && response.data.body) {
    const html = await response.data.body.text();
    return html;
  }

  return null;
};

export default getHtmlFromUrl;
