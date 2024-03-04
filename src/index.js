const store = require('./store')
const getRouter = require('./getRouter')
const getRarStream = require('./getRarStream')

module.exports = {
	router: getRouter,
	create: rarUrls => {
		if (!rarUrls || !Array.isArray(rarUrls))
			throw Error('"rarUrls" is undefined or not an array')
		return store.set(rarUrls)
	},
	file: (key, opts) => {
		if (!key)
			throw Error('Missing "key"')
		return getRarStream({
			// we use the key for the url as this
			// is only used as an ID for the stream
			url: key,
			query: {
				o: JSON.stringify(opts || {}),
				key,
			}
		})
	}
}
