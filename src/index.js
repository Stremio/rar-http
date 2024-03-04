const store = require('./store')
const getRouter = require('./getRouter')
const getRarStream = require('./getRarStream')

module.exports = {
	router: getRouter,
	create: rarUrls => {
		return store.set(rarUrls)
	},
	stream: (key, opts) => {
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
