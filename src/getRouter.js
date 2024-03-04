const Router = require('router')
const bodyParser = require('body-parser')
const getRarStream = require('./getRarStream')
const getContentType = require('./getContentType')
const store = require('./store')

const router = Router();

router.use(bodyParser.json())

function getRouter() {

	router.post('/create', (req, res) => {
		if (!Array.isArray(req.body))
			res.status(500).send('Cannot parse JSON data')
		const key = store.set(req.body)
		const head = {
			'Content-Length': JSON.stringify({ key }).length+'',
			'Content-Type': 'application/json',
		}
		res.json({ key })
	})

	router.get('/stream', async (req, res) => {
		const rarInnerFile = await getRarStream(req)
		if (req.method === "HEAD") {
			res.statusCode = 200
			res.setHeader('Accept-Ranges', 'bytes')
			res.setHeader('Content-Length', rarInnerFile.length+'')
			res.setHeader('Content-Type', getContentType(rarInnerFile))
			res.end()
			return
		}
		const fileSize = rarInnerFile.length
		const range = req.headers.range

		let start = 0
		let end = fileSize-1

	    res.setHeader('Accept-Ranges', 'bytes')
	    res.setHeader('Content-Type', getContentType(rarInnerFile))

		if (Object.values(range || {}).length) {
			const parts = range.replace(/bytes=/, '').split('-');
		    start = parseInt(parts[0], 10) || 0;
		    end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
		    res.statusCode = 206
			res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`)
		    const chunksize = (end - start) + 1
			res.setHeader('Content-Length', chunksize+'')
		} else {
		    res.statusCode = 200
			res.setHeader('Content-Length', fileSize+'')
		}
		rarInnerFile
		.createReadStream({ start, end })
	    .pipe(res)
	})

	return router

}

module.exports = getRouter
