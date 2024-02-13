# Stream RAR Archives

A module to stream the contents of RAR archives through a HTTP server.

This module is based on `rar-stream` by [@1313](https://github.com/1313), it currently supports only unpacking and cannot be used for decompression.

Usage:
```javascript
const rarHttp = require('rar-http')
const express = require('express')

const app = express()

app.use(getRouter())

const port = process.env.PORT || 7879

app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}/rar`)
})
```

This adds the following routes:
`/create-rar` - POST - expects an array of URLs to RAR files, replies with `{"key":"fiql"}`
`/rar` - GET - expects a `key` (key from `/create-rar`) or `r=` with a URL to a RAR file, it also supports `o=` for a JSON stringified list of Options

Options:
```JSON
{
	"fileIdx": 1, // index of a file in the RAR archive
	"fileMustInclude": ["/dexter/i", "the hulk"] // array of strings (can also be RegExp string), selects the first file that includes any of the matches
}
```

_built with love and serious coding skills by the Stremio Team_

<img src="https://blog.stremio.com/wp-content/uploads/2023/08/stremio-code-footer.jpg" width="300" />