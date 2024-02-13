const { RarFilesPackage } = require('rar-stream')
const urlToFileMedia = require('./urlToFileMedia')
const store = require('./store')

const rarStreams = {}

const isRegex = /^\/(.*)\/(.*)$/

function parseQuery(req) {
	let opts = {}
	try {
		opts = JSON.parse(req.query.o)
	} catch(e) {}
	if ((opts.fileMustInclude || []).length)
		opts.fileMustInclude = opts.fileMustInclude.map(el => {
			if (isRegex.test(el)) {
				const parts = isRegex.exec(el)
				try {
					return new RegExp(parts[1],parts[2])
				} catch(e) {}
			}
			return el
		})
	let rarUrls = []
	let key = req.query.key
	if (key && store.get(key)) {
		rarUrls = store.get(key)
	} else {
		// there is an issue here, as there is such a thing as an url that is too long
		// it would be cropped in this case and some rar parts could be missing..
		// using /create-rar to get a token prior to using the /rar endpoint solves this
		rarUrls = req.query.r || []
		if (typeof rarUrls === 'string')
			rarUrls = [rarUrls]
	}
	return { opts, rarUrls }
}

const streamRar = async (urls, opts = {}) => {
  const rarFiles = []
  for (let url of urls)
		rarFiles.push(urlToFileMedia(url))

  const rarStreamPackage = new RarFilesPackage(await Promise.all(rarFiles))

  if (!(opts.fileMustInclude || []).length && !opts.hasOwnProperty('fileIdx'))
  	opts = { fileMustInclude: [/.mkv$|.mp4$|.avi$/i] }

  const innerFiles = await rarStreamPackage.parse(opts)

  if (!innerFiles[0])
  	throw Error('no file matching ' + JSON.stringify(opts))

  return innerFiles[0]

}

async function getRarStream(req) {
	const query = parseQuery(req)
	rarStreams[req.url] = rarStreams[req.url] || await streamRar(query.rarUrls, query.opts)
	return rarStreams[req.url]
}

module.exports = getRarStream
