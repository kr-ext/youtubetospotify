const ENVIRONMENTS = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};

const DOMAINS = {
  PRODUCTION: 'paradify.com',
  DEVELOPMENT: 'localhost:8080',
};

const WEB_SITE_URL = {
  PRODUCTION: `https://www.${DOMAINS.PRODUCTION}`,
  DEVELOPMENT: `http://${DOMAINS.DEVELOPMENT}`,
};

module.exports = { ENVIRONMENTS, DOMAINS, WEB_SITE_URL };
