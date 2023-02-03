# Testing Without Mocks: Complex Example

This is an elaborate example of the ideas in James Shore's [Testing Without Mocks](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks) pattern language. It has several real-world features:

* *Microservice architecture.* User requests are processed by a web server and work is performed by a separate microservice (which is part of the same codebase).
* *Structured logs.* Logs are written as JSON with arbitrary properties.
* *Correlation IDs.* All logs related to a single user-side request have the same `correlationId` field, which is passed from the web server to the microservice.
* *Error handling.* Microservice failures are handled gracefully, with appropriate logging and error recovery.
* *Timeouts and request cancellation.* When the microservice doesn't respond quickly enough, the request is cancelled, and the failure is handled gracefully.

For educational purposes, the code is written "close to the metal" with minimal dependencies.


## About the Program

The program is a ROT-13 encoder. It consists of a web server, which provides the web-based user interface, and a ROT-13 microservice, which performs the ROT-13 encoding.

To start the servers, run:

* Mac/Linux: `./serve_dev.sh [web_server_port] [rot13_server_port]`
* Windows: `serve_dev [web_server_port] [rot13_server_port]`

Access the web interface through a browser. For example, if you started the server with `./serve_dev.sh 5010 5011`, you would visit `http://localhost:5010` in your browser.

You’ll need [Node.js](http://nodejs.org) installed to run the code.


## Running the Tests

To run the tests, install the version of [Node.js](http://nodejs.org) listed in [package.json](package.json) under `node`. (If you have a different version of Node, the tests will probably work, but you may experience some unexpected test failures.)

* To run the build and automated tests, run `./watch.sh quick` (Mac/Linux) or `.\watch.cmd quick` (Windows). The build will automatically re-run every time you change a file.

* The build only runs tests for files that have changed. Sometimes it can get confused. Restarting the script is usually enough. To make it start from scratch, run `./clean.sh` (Mac/Linux) or `.\clean.cmd` (Windows).

* To run the servers, run `./serve_dev 5010 5011` (Mac/Linux) or `.\serve_dev.cmd 5010 5011` (Windows). Then visit `http://localhost:5010` in a browser. The server will automatically restart every time you change a file.

*Note:* The `watch` script plays sounds when it runs. (One sound for success, another for lint failure, and a third for test failure.) If this bothers you, you can delete or rename the files in `build/sounds`.


## How the Servers Work

Start the servers using the serve command described above. E.g., `./serve_dev.sh 5010 5011`. This starts two servers: a WWW server on port 5010 and a ROT-13 service on port 5011.


### The WWW server

The WWW server serves HTML to the user. Access it from a web browser. For example, `http://localhost:5010`. The server will serve a form that allows you to encode text using ROT-13. Enter text into the text field and press the "Transform" button. Behind the scenes, the browser will send a "text" form field to the WWW server, which will send it to the ROT-13 service and serve the result back to the browser.


### The ROT-13 service

The ROT-13 service transforms text using ROT-13 encoding. In other words, `hello` becomes `uryyb`.

The service has one endpoint:

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

You can make requests to the service directly using your favorite HTTP client. For example, [httpie](https://httpie.org/):

```sh
~ % http post :5011/rot13/transform content-type:application/json text=hello -v
POST /rot13/transform HTTP/1.1
Accept: application/json, */*;q=0.5
Accept-Encoding: gzip, deflate
Connection: keep-alive
Content-Length: 17
Host: localhost:5011
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


## Finding Your Way Around

The source code is in the `src/` directory. Test files start with an underscore and are in the same directories as production code.

* **[src/](): **Source code**
  * [all_servers.js](src/all_servers.js): Parse command-line and start servers.
  * [serve.js](src/serve.js): Program entry point. Just launches [all_servers.js](src/all_servers.js).
  * **[node_modules/](src/node_modules): Code shared by both servers (*not* third-party code)**
    * **[http/](src/node_modules/http): HTTP infrastructure wrappers**
      * [generic_router.js](src/node_modules/http/generic_router.js) A utility for converting [HttpRequest](src/node_modules/http/http_request.js)s to method calls.
      * [http_client.js](src/node_modules/http/http_client.js) Makes HTTP requests.
      * [http_request.js](src/node_modules/http/http_request.js) Server-side HTTP request received from the client.
      * [http_response.js](src/node_modules/http/http_response.js) Server-side HTTP response to be sent to the client.
      * [http_server.js](src/node_modules/http/http_server.js) An HTTP server.
    * **[infrastructure/](src/node_modules/infrastructure): Other shared infrastructure wrappers**
      * [clock.js](src/node_modules/infrastructure/clock.js): Current time, timeouts, etc.
      * [command_line.js](src/node_modules/infrastructure/command_line.js): Command-line I/O.
      * [log.js](src/node_modules/infrastructure/log.js): Logger.
    * **[util/](src/node_modules/util): Miscellaneous libraries**
      * [assert.js](src/node_modules/util/assert.js): Assertion library used by tests.
      * [configurable_responses.js](src/node_modules/util/configurable_responses.js): Utility library for implementing [Configurable Responses](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#configurable-responses) pattern.
      * [ensure.js](src/node_modules/util/ensure.js): Runtime assertions for production code. Most notably used for runtime type checking of method signatures.
      * [output_tracker.js](src/node_modules/util/output_tracker.js): Utility library for implementing [Output Tracking](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#output-tracking) pattern.
      * [test_helper.js](src/node_modules/util/test_helper.js): Utility library for implementing integration tests.
      * [type.js](src/node_modules/util/type.js): Runtime type checker.
  * **[rot13_service/](src/rot13_service): ROT-13 microservice**
    * [rot13_controller.js](src/rot13_service/rot13_controller.js): Controller for `/rot13/transform` endpoint.
    * [rot13_logic.js](src/rot13_service/rot13_logic.js): ROT-13 encoder.
    * [rot13_router.js](src/rot13_service/rot13_router.js): Entry point into ROT-13 microservice.
    * [rot13_view.js](src/rot13_service/rot13_view.js): Renderer for ROT-13 microservice's responses.
  * **[www/](src/www): Front-end website**
    * [www_config.js](src/www/www_config.js): Configuration used by all front-end website routes
    * [www_router.js](src/www/www_router.js): Entry point into front-end website.
    * [www_view.js](src/www/www_view.js): Generic renderer for front-end website’s responses.
    * **[home_page/](src/www/home_page): '/' endpoint**
      * [home_page_controller.js](src/www/home_page/home_page_controller.js): Controller for `/` endpoint.
      * [home_page_view.js](src/www/home_page/home_page_view.js): Renderer for `/` responses.
    * **[infrastructure/](src/www/infrastructure): Front-end-specific infrastructure wrappers**
      * [rot13_client.js](src/www/infrastructure/rot13_client.js): Client for ROT-13 microservice.
      * [uuid_generator.js](src/www/infrastructure/uuid_generator.js): Create random unique identifiers (UUIDs).

Third-party modules are in the top-level `node_modules/` directory (not to be confused with `src/node_modules`). The following modules are used by the production code:

* `@sinonjs/fake-timers`: Used to make [Clock](src/node_modules/infrastructure/clock.js) Nullable.
* `uuid`: Wrapped by [UuidGenerator](src/www/infrastructure/uuid_generator.js), which is used to create correlation IDs.

The remaining modules are used by the automated build:

* `chai`: Assertion library used by tests.
* `eslint`: Static code analyzer (linter) used by build.
* `gaze`: File system watcher used by build to detect when files change.
* `glob`: File system analyzer used by build to convert globs (such as `src/**/_*_test.js`) to filenames.
* `minimist`: Command-line parser used to parse build's command-line.
* `mocha`: Test runner used by build and tests.
* `shelljs`: Unix command emulator used to simplify aspects of the build.
* `sound-play`: Sound player used by the `watch` script to play sounds when the build completes. 


All other files are related to the automated build.


## About the Patterns

The purpose of this repository is to demonstrate the [Testing Without Mocks patterns](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks). Here are each of the patterns in the article and how they're used in this code:


### Foundational Patterns

#### [Narrow Tests](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#narrow-tests)


#### [State-Based Tests](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#state-based-tests)

_all_servers_test.js, all_servers.js (wwwRouter, rot13Router)


#### [Overlapping Sociable Tests](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#sociable-tests)



#### [Smoke Tests](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#smoke-tests)



#### [Zero-Impact Instantiation](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#zero-impact)


#### [Parameterless Instantiation](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#instantiation)

WwwConfig.createTestInstance()

Every class can be instantiated without providing any parameters.

#### [Signature Shielding](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#sig-shielding)


#### [Collaborator-Based Isolation](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#isolation)

_all_servers_test.js
_www_router_test.js
_rot13_router_test.js




### Architectural Patterns

#### [A-Frame Architecture](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#a-frame-arch)


#### [Logic Sandwich](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#logic-sandwich)


#### [Traffic Cop](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#traffic-cop)


#### [Grow Evolutionary Seeds](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#grow-seeds)

The code was built evolutionarily. You can get a sense of how it evolved by looking at the commit history.


### Logic Patterns

#### [Easily-Visible Behavior](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#visible-behavior)

The `rot13` encoding function, `transform()`, is a pure function.

#### [Testable Libraries](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#testable-libraries)

This program doesn’t use any third-party logic libraries.


### Infrastructure Patterns

#### [Infrastructure Wrappers](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#infrastructure-wrappers)


#### [Narrow Integration Tests](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#narrow-integration-tests)


#### [Paranoic Telemetry](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#paranoic-telemetry)



### Nullability Patterns

#### [Nullables](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#nullables)


#### [Embedded Stub](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#embedded-stub)


#### [Thin Wrapper](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#thin-wrapper)

The code is written in JavaScript, so Thin Wrappers aren't needed.

#### [Configurable Responses](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#configurable-responses)


#### [Output Tracking](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#output-tracking)


#### [Behavior Simulation](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#behavior-simulation)

This code doesn’t respond to events from external systems, so Behavior Simulation isn't needed.

#### [Fake It Once You Make It](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#fake-it)


### Legacy Code Patterns

The code was a green-field project, so the legacy code patterns weren't needed.





License
-------

Copyright (c) 2020-2022 Titanium I.T. LLC

The code in this repository is licensed for use in James Shore's training
courses only. Participants in those courses may make copies for their own
personal use, but may not re-distribute the code or create their own training
course using this material.

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
