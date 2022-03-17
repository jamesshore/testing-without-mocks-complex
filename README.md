James Shore Live
================

This example code is used in my [Tuesday Lunch & Learn](https://www.jamesshore.com/v2/projects/lunch-and-learn) series. See that link for for more information and an archive of past episodes, or [watch live on Twitch](https://www.twitch.tv/jamesshorelive).


This Week's Challenge (22 Sep 2020): Request Cancellation
---------------------

This repo contains a command-line client/server application. The command-line application calls a small microservice that encodes text using ROT-13 encoding. (You can find the details below, under "Running the Code" and "How the Microservice Works.")

The server-side code is programmed to randomly delay some requests by 30 seconds. The client-side command-line interface (CLI) times out after five seconds, but it doesn't cancel the request, so the CLI doesn't exit until the full 30 seconds has elapsed and the server responds.

Your challenge this week is to update the CLI to cancel the network request when it times out, so that the CLI exits after five seconds when the server is slow to respond. (The code will take five seconds to exit even if the server responds immediately; this is due to the way JavaScript timers work, and you don't have to solve that problem this week.)

The focus of this week's challenge is on the design of the cancellation mechanism. Cancelling a request in Node is fairly straightforward (see the hints below); the challenge is coming up with a clean design.

As always, make sure that your code is well tested.

Hints:

* Make sure you're on Node.js version 14 or higher. Previous versions fail the test suite due to insufficient locale support.

* The command-line application is implemented in `src/rot13-cli/rot13_cli.js` and `_rot13_cli_test.js`. It depends on `src/rot13-cli/infrastructure/rot13_client.js` to parse the microservice response, and that in turn depends on `src/rot13-cli/infrastructure/http_client.js` to perform the HTTP request.

* To cancel a Node.js request, call `request.destroy(new Error("my error message"));`. That line of code belongs in the `http_client.js` class.

* The assertion library used by the tests, `/src/node_modules/util/assert.js`, is a thin wrapper over [Chai](https://www.chaijs.com/api/assert/), a JavaScript assertion library. It has a few extra assertions that you might find useful, such as `assert.throwsAsync()`, which let you check if an async function throws an exception.


The Thinking Framework
----------------------

(Previous episodes may be helpful. You can find them [here](https://www.jamesshore.com/v2/projects/lunch-and-learn).)

This week's challenge is a design challenge. The implementation for cancellation is clear (use `request.destroy()` as described above), but it's not clear how to do that *cleanly.*

When faced with a thorny design problem, there are two approaches to use, and it's worth using both of them:

1. How have other people solved this problem? Research the problem on the web.

2. Ignoring implementation, what's a clean solution to this problem? Use Programming By Intention to prototype an API.

"Programming By Intention" means writing high-level code as if all the low-level code you need already exists. Just imagine what functions or methods would make your life easy, and write your code to use them. It's a good way to design an easy-to-use API.

It's a good idea to use both techniques because, although your research will generally help you understand the scope of the problem, the generic solutions available online are often more complicated than you need. You might be able to come up with a simpler design that fits the narrow parameters of the specific problem you're solving. In design, simpler is almost always better—assuming the simpler solution actually works!—because lower complexity means easier maintenance and fewer bugs.

In the case of this week's challenge, a web search will lead you to the idea of "cancellation tokens." In .NET, you use cancellation tokens by instantiating a `CancellationTokenSource` object. Then you pass in `CancellationTokenSource.Token` to the things that you want to cancel, and call `CancellationTokenSource.Cancel()` to cancel them.

The code currently looks like this:

```javascript
const response = await Promise.race([
	rot13Client.transformAsync(port, text),
	timeoutAsync(clock),
]);
commandLine.writeStdout(response + "\n");

async function timeoutAsync(clock) {
	await clock.waitAsync(TIMEOUT_IN_MS);
	throw new Error("Service timed out.");
}
```

With the cancellation token idea, the code would look like this:

```javascript
const cancellationSource = new CancellationTokenSource()
const response = await Promise.race([
	rot13Client.transformAsync(port, text, cancellationSource.token),
	timeoutAsync(clock, cancellationSource),
]);
commandLine.writeStdout(response + "\n");

async function timeoutAsync(clock, cancellationSource) {
	await clock.waitAsync(TIMEOUT_IN_MS);
	cancellationSource.cancel();
	throw new Error("Service timed out.");
}
```

Cancellation tokens are a well-known idea, and would solve the problem. But they require additional scaffolding (the `CancellationSource` class and everything to make it work) and they're indirect (the connection between the call to cancel() and the thing it cancels is implied, not explicit). Is there a simpler idea that's specific to our needs?

This is where Programming By Intention comes in. Cancellation tokens assume a strongly object-oriented system, but JavaScript is a multi-paradigm language. Could a more functional approach work better? What if `transformAsync` returned a function that could be used to cancel the request?

```javascript
const { transformPromise, cancelFn } = rot13Client.transform(port, text);
const response = await Promise.race([
	transformPromise,
	timeoutAsync(clock, cancelFn),
]);
commandLine.writeStdout(response + "\n");

async function timeoutAsync(clock, cancelFn) {
	await clock.waitAsync(TIMEOUT_IN_MS);
	cancelFn();
	throw new Error("Service timed out.");
}
```

At this point, weigh the pros and cons of each approach (and try to come up with something better than both), then choose one. In this case, neither option is clearly better than the other. The functional approach is more explicit, but has some downsides, too. The cancellation token is well-known and is less likely to have hidden flaws, but has more moving parts.

Tune in on September 22nd at noon Pacific to see how I apply these ideas, including my implementation of the functional cancellation approach. For details, go to the [Lunch & Learn home page](https://www.jamesshore.com/v2/projects/lunch-and-learn). Starting September 23rd, a video with my solution will be archived on that page.


Running the Code
----------------

To run the code in this repository, install [Node.js](http://nodejs.org). Make sure you have version 14 or higher. Then:

* Run `./serve.sh [port]` to run the ROT-13 service, then `./run.sh [port] [text]` to run the command-line application.

* Run `./build.sh` to lint and test the code once, or `./watch.sh` to do so every time a file changes.

* Use `./build.sh quick` or `./watch.sh quick` to perform an incremental build, and `./clean.sh` to reset the incremental build.

* On Windows, use the .cmd versions: `run` instead of `./run.sh`, `watch` instead of `./watch.sh`, etc. If you're using gitbash, the .sh versions will also work, and they display the output better.

All commands must be run from the repository root.


How the Microservice Works
--------------------------

Start the server using the run command described under "Running the Code." E.g., `./serve.sh 5000`.

The service transforms text using ROT-13 encoding. In other words, `hello` becomes `uryyb`. Some responses (randomly chosen) are delayed for 30 seconds.

It has one endpoint:

* **URL**: `/rot13/transform`
* Method: `POST`
* Headers:
	* `content-type: application/json`
* Body: JSON object containing one field:
  * `text` the text to transform
  * E.g., `{ "text": "hello" }`
* Success Response:
	* Status: 200 OK
	* Headers: `content-type: application/json`
	* Body: JSON object containing one field:
		* `transformed` the transformed text
		* E.g., `{ "transformed": "uryyb" }`
* Failure Response
	* Status: 4xx (depending on nature of error)
	* Headers: `content-type: application/json`
	* Body: JSON object containing one field:
		* `error` the error
		* E.g., `{ "error": "invalid content-type header" }`

Make requests against the server using your favorite HTTP client. For example, [httpie](https://httpie.org/):

```sh
~ % http post :5000/rot13/transform content-type:application/json text=hello -v
POST /rot13/transform HTTP/1.1
Accept: application/json, */*;q=0.5
Accept-Encoding: gzip, deflate
Connection: keep-alive
Content-Length: 17
Host: localhost:5000
User-Agent: HTTPie/2.1.0
content-type: application/json

{
    "text": "hello"
}

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 23
Content-Type: application/json
Date: Tue, 30 Jun 2020 01:14:15 GMT

{
    "transformed": "uryyb"
}
```


License
-------

MIT License. See `LICENSE.txt`.