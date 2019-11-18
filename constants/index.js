const localClientDomain = `http://localhost:3000`;
const cloudClientDomain = 'https://chillax.imho.space';

const localServerDomain = `http://localhost:4000`;
const cloudServerDomain = 'https://chillax.imho.space';

const SERVER_URL =
  process.env.NODE_ENV === 'development'
    ? localServerDomain
    : cloudServerDomain;

const CLIENT_URL =
  process.env.NODE_ENV === 'development'
    ? localClientDomain
    : cloudClientDomain;

const randomStringGenerator = () => {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  );
};

module.exports = { CLIENT_URL, SERVER_URL, randomStringGenerator };
