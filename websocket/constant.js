/**
 * ------------------------------------------------------------------------
 * @description constant setup For websocket server
 * ------------------------------------------------------------------------
 */

/**
 * @param {Array} Origins stores all origins allowd to connect
 */
const Origins = [
  'http://192.168.1.104:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5001',
  'http://www.mofaqua.com',
  'https://www.mofaqua.com',
  'http://mofaqua.com',
  'https://mofaqua.com',
  'https://yingxitech.com:5000'
];

module.exports = {
  Origins
}