# Stream RAR Archives

A module to stream the contents of RAR archives through a HTTP server.

This module is based on `rar-stream` by [@1313](https://github.com/1313), it currently supports only unpacking and cannot be used for decompression.


## Run the Server

```
npm install
npm start
```

HTTP server routes are explained at the [Router]() docs


## Programatic Usage


### Router

```javascript
const rarHttp = require('rar-http')
const express = require('express')

const app = express()

app.use(rarHttp.router())

const port = process.env.PORT || 7879

app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}/stream`)
})
```

This adds the following routes:
- `/create` - POST - expects an array of URLs to RAR files, replies with `{"key":"fiql"}`, using this endpoint is important because if you use the `r=` get var with the `/stream` endpoint with many RAR URLs you may reach the max URL length
- `/stream` - GET - expects a `key` (key from `/create`) or `r=` with a URL to a RAR file, it also supports `o=` for a JSON stringified list of [Options]()


### Streams

```javascript
async function getRarStream() {
	const rarHttp = require('rar-http')

	const key = rarHttp.create([
		'http://test.com/file.r00',
		'http://test.com/file.r01'
	])

	const stream = rarHttp.stream(key, {
		fileMustInclude: ['Lorem Ipsum'],
		maxFiles: 1
	})

	return stream
}
```

`rarHttp.stream(key, opts)` supports the same [Options]() as the `/stream` endpoint, it is optional to set `opts`


### Options

Options:
```JSON
{
	"fileIdx": 1,
	"fileMustInclude": ["/dexter/i", "the hulk"]
}
```

- `fileIdx` - integer - selects the file that matches the index in the RAR archive
- `fileMustInclude` - array of strings (can also be RegExp string) - selects the first file that includes any of the matches

_built with love and serious coding skills by the Stremio Team_

<img src="https://blog.stremio.com/wp-content/uploads/2023/08/stremio-code-footer.jpg" width="300" />