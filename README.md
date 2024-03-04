# Stream RAR Archives

A module to stream the contents of RAR archives through a HTTP server.

This module is based on `rar-stream` by [@1313](https://github.com/1313), it currently supports only unpacking and cannot be used for decompression.


## Run the Server

```
npm install
npm start
```

HTTP server routes are explained in the [Router](#router) docs


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
- `/create` - POST - expects an array of URLs to RAR files, replies with `{"key":"fiql"}`
- `/stream` - GET - expects a `key=` (key from `/create`), it also supports `o=` for a JSON stringified list of [Options](#options)


### Streams

```javascript
const fs = require('fs')
const rarHttp = require('rar-http')

async function getRarStream() {
	const key = rarHttp.create([
		'http://test.com/file.r00',
		'http://test.com/file.r01',
		'http://test.com/file.r02',
	])

	const file = await rarHttp.file(key, {
		fileMustInclude: ['Lorem Ipsum'],
		maxFiles: 1
	})

	file.createReadStream({
		start: 0,
		end: file.length - 1
	}).pipe(
		fs.createWriteStream(`./${file.name}`)
	)
}

getRarStream()
```

- `rarHttp.create()` requires an array of strings with HTTP(s) URLs to RAR files, it return a `key` which is meant to be used with the `.file()` method

- `rarHttp.file(key, opts)` supports the same [Options](#options) as the `/stream` endpoint, `key` is required, but `opts` is optional, this method returns a promise that resolves to an [InnerFile](#InnerFile)


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


### InnerFile

#### Methods:

| Method                                         | Description                                                             |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| createReadStream({start: number, end: number}) | Returns a `Readable` stream. The start and end interval is inclusive.   |
| readToEnd                                      | Returns a Promise with a Buffer containing all the content of the file. |

#### Properties:

| Property | Description                                   |
| -------- | --------------------------------------------- |
| name     | The name of the file                          |
| length   | Returns the total number of bytes of the file |


_built with love and serious coding skills by the Stremio Team_

<img src="https://blog.stremio.com/wp-content/uploads/2023/08/stremio-code-footer.jpg" width="300" />