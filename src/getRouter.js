const express = require('express')
const bodyParser = require('body-parser')
const getRarStream = require('./getRarStream')
const getContentType = require('./getContentType')
const store = require('./store')

const app = express()

app.use(bodyParser.json())

function getRouter() {

	app.post('/create', (req, res) => {
		if (!Array.isArray(req.body))
			res.status(500).send('Cannot parse JSON data')
		const key = store.set(req.body)
		const head = {
			'Content-Length': JSON.stringify({ key }).length+'',
			'Content-Type': 'application/json',
		}
		res.json({ key })
	})

	app.head('/stream', async (req, res) => {
		const rarInnerFile = await getRarStream(req)
		const head = {
			'Accept-Ranges': 'bytes',
			'Content-Length': rarInnerFile.length+'',
			'Content-Type': getContentType(rarInnerFile),
		}
		res.writeHead(200, head)
		res.end()
	})

	app.get('/stream', async (req, res) => {
		const rarInnerFile = await getRarStream(req)
		const fileSize = rarInnerFile.length
		const range = req.headers.range

		let start = 0
		let end = fileSize-1

	    const head = {
	      'Accept-Ranges': 'bytes',
	      'Content-Type': getContentType(rarInnerFile),
	    }

		if (Object.values(range || {}).length) {
			const parts = range.replace(/bytes=/, '').split('-');
		    start = parseInt(parts[0], 10) || 0;
		    end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
			head['Content-Range'] = `bytes ${start}-${end}/${fileSize}`
		    const chunksize = (end - start) + 1
			head['Content-Length'] = chunksize+''
			res.writeHead(206, head)
		} else {
			head['Content-Length'] = fileSize+''
			res.writeHead(200, head)
		}
		rarInnerFile
		.createReadStream({ start, end })
	    .pipe(res)
	})

	return app

}

module.exports = getRouter
