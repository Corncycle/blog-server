# blog-server

A simple Express-based CRUD API for use at my blog, https://blog.calebstromberg.com

The API itself is hosted on fly.io and can be accessed through the browser or a tool like Postman at https://api.calebstromberg.com

# Responses

All responses are sent as JSON

Requests that result in an internal error will receive a response consisting of an object with a single field `error` with an error message.

Requests that result in a successful create/update/delete will receive a response consisting of an object with a single field `message` with a message indicating success.

Successful read requests will receive the requested resource in JSON format.

Resource paths can be obtained by peeking at the source code for the blog client or by monitoring network requests made by the blog client. I don't care to make them any more public than that, because this API is only intended to serve my blog.
