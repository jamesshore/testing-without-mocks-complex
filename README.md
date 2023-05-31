# Testing Without Mocks: Complex Example

This is an elaborate example of the ideas in James Shore's [Testing Without Mocks](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks) pattern language. It has several real-world features:

* *Microservice architecture.* User requests are processed by a web server and work is performed by a separate microservice (which is part of the same codebase).
* *Structured logs.* Logs are written as JSON with arbitrary properties.
* *Correlation IDs.* All logs related to a single user-side request have the same `correlationId` field, which is passed from the web server to the microservice.
* *Error handling.* Microservice failures are handled gracefully, with appropriate logging and error recovery.
* *Timeouts and request cancellation.* When the microservice doesn't respond quickly enough, the request is cancelled, and the failure is handled gracefully.

For educational purposes, the code is written "close to the metal" with minimal dependencies.

**For JavaScript code, see the 'javascript' branch; for TypeScript code, see the 'typescript' branch.**


## About the Program

The program is a ROT-13 encoder. It consists of a web server, which provides the web-based user interface, and a ROT-13 microservice, which performs the ROT-13 encoding.

To start the servers, run:

* Mac/Linux: `./serve_dev.sh [web_server_port] [rot13_server_port]`
* Windows: `.\serve_dev.cmd [web_server_port] [rot13_server_port]`

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
  * `x-correlation-id` the correlation ID to use in logs
* Body: JSON object containing one field:
  * `text` the text to transform
  * E.g., `{ "text": "hello" }`
* Success Response:
  * Status: 200 OK
  * Headers: 
    * `content-type: application/json`
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
~ % http post :5011/rot13/transform content-type:application/json x-correlation-id:my-id text=hello -v
POST /rot13/transform HTTP/1.1
Accept: application/json, */*;q=0.5
Accept-Encoding: gzip, deflate
Connection: keep-alive
Content-Length: 17
Host: localhost:5011
User-Agent: HTTPie/3.2.1
content-type: application/json
x-correlation-id: my-id

{
    "text": "hello"
}


HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 23
Date: Sat, 04 Feb 2023 08:33:00 GMT
Keep-Alive: timeout=5
content-type: application/json

{
    "transformed": "uryyb"
}
```


## Source Code Overview

The source code is in the `src/` directory. Test files start with an underscore and are in the same directories as production code.

* **[src/](src/): Source code**
  * [all_servers.ts](src/all_servers.ts) [(tests)](src/_all_servers_test.ts): Parse command-line and start servers.
  * [serve.ts](src/serve.ts): Program entry point. Just launches [all_servers.ts](src/all_servers.ts).
  * [_smoke_test.ts](src/_smoke_test.ts): End-to-end smoke test for both servers.
  * **[node_modules/](src/node_modules): Code shared by both servers (*not* third-party code)**
    * **[http/](src/node_modules/http): HTTP infrastructure wrappers**
      * [generic_router.ts](src/node_modules/http/generic_router.ts) [(tests)](src/node_modules/http/_generic_router_test.ts) A utility for converting [HttpServerRequest](src/node_modules/http/http_server_request.ts)s to method calls.
      * [http_client.ts](src/node_modules/http/http_client.ts) [(tests)](src/node_modules/http/_http_client_test.ts): Makes HTTP requests.
      * [http_request.ts](src/node_modules/http/http_server_request.ts) [(tests)](src/node_modules/http/_http_request_test.ts): Server-side HTTP request received from the client.
      * [http_server_response.ts](src/node_modules/http/http_server_response.ts) [(tests)](src/node_modules/http/_http_server_response_test.ts): Server-side HTTP response to be sent to the client.
      * [http_server.ts](src/node_modules/http/http_server.ts) [(tests)](src/node_modules/http/_http_server_test.ts): An HTTP server.
    * **[infrastructure/](src/node_modules/infrastructure): Other shared infrastructure wrappers**
      * [clock.ts](src/node_modules/infrastructure/clock.ts) [(tests)](src/node_modules/infrastructure/_clock_test.ts): Current time, timeouts, etc.
      * [command_line.ts](src/node_modules/infrastructure/command_line.ts) [(tests)](src/node_modules/infrastructure/_command_line_test.ts): Command-line I/O.
      * [log.ts](src/node_modules/infrastructure/log.ts) [(tests)](src/node_modules/infrastructure/_log_test.ts): Logger.
    * **[util/](src/node_modules/util): Miscellaneous libraries**
      * [assert.ts](src/node_modules/util/assert.ts) [(tests)](/src/node_modules/util/_assert_test.ts): Assertion library used by tests.
      * [configurable_responses.ts](src/node_modules/util/configurable_responses.ts) [(tests)](/src/node_modules/util/_configurable_responses_test.ts): Utility library for implementing [Configurable Responses](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#configurable-responses) pattern.
      * [ensure.ts](src/node_modules/util/ensure.ts) [(tests)](src/node_modules/util/_ensure_test.ts): Runtime assertions for production code. Most notably used for runtime type checking of method signatures.
      * [output_listener.ts](src/node_modules/util/output_listener.ts) [(tests)](/src/node_modules/util/_output_listener_test.ts): Utility library for implementing [Output Tracking](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#output-tracking) pattern.
      * [test_helper.ts](src/node_modules/util/test_helper.ts): Utility library for implementing integration tests.
      * [type.ts](src/node_modules/util/type.ts) [(tests)](/src/node_modules/util/_type_test.ts): Runtime type checker.
  * **[rot13_service/](src/rot13_service): ROT-13 microservice**
    * [rot13_controller.ts](src/rot13_service/rot13_controller.ts) [(tests)](/src/rot13_service/_rot13_controller_test.ts): Controller for `/rot13/transform` endpoint.
    * [rot13_logic.ts](src/rot13_service/rot13_logic.ts) [(tests)](src/rot13_service/_rot13_logic_test.ts): ROT-13 encoder.
    * [rot13_router.ts](src/rot13_service/rot13_router.ts) [(tests)](src/rot13_service/_rot13_router_test.ts): Entry point into ROT-13 microservice.
    * [rot13_view.ts](src/rot13_service/rot13_view.ts) [(tests)](src/rot13_service/_rot13_view_test.ts): Renderer for ROT-13 microservice's responses.
  * **[www/](src/www): Front-end website**
    * [www_config.ts](src/www/www_config.ts): Configuration used by all front-end website routes.
    * [www_router.ts](src/www/www_router.ts) [(tests)](src/www/_www_router_test.ts): Entry point into front-end website.
    * [www_view.ts](src/www/www_view.ts) [(tests)](src/www/_www_view_test.ts): Generic renderer for front-end website’s responses.
    * **[home_page/](src/www/home_page): Front-end '/' endpoint**
      * [home_page_controller.ts](src/www/home_page/home_page_controller.ts) [(tests)](src/www/home_page/_home_page_controller_test.ts): Controller for `/` endpoint.
      * [home_page_view.ts](src/www/home_page/home_page_view.ts) [(tests)](src/www/home_page/_home_page_view_test.ts): Renderer for `/` responses.
    * **[infrastructure/](src/www/infrastructure): Front-end-specific infrastructure wrappers**
      * [rot13_client.ts](src/www/infrastructure/rot13_client.ts) [(tests)](src/www/infrastructure/_rot13_client_test.ts): Client for ROT-13 microservice.
      * [uuid_generator.ts](src/www/infrastructure/uuid_generator.ts) [(tests)](src/www/infrastructure/_uuid_generator_test.ts): Create random unique identifiers (UUIDs).

Third-party modules are in the top-level `node_modules/` directory (not to be confused with `src/node_modules`). The following modules are used by the production code:

* `@sinonjs/fake-timers`: Used to make [Clock](src/node_modules/infrastructure/clock.ts) Nullable.
* `uuid`: Wrapped by [UuidGenerator](src/www/infrastructure/uuid_generator.ts), which is used to create correlation IDs.

The remaining modules are used by the build and tests:

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

All tests except [_smoke_test.ts](src/_smoke_test.ts) are “narrow tests,” which means they’re focused on a specific class, module, or concept. Most of them are narrow unit tests, but the infrastructure wrappers have narrow integration tests.

#### [State-Based Tests](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#state-based-tests)

All tests are “state-based tests,” which means they make assertions about the return values or state of the unit under test, rather than making assertions about which methods it calls.

#### [Overlapping Sociable Tests](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#sociable-tests)

All tests are “sociable tests,” which means the code under test isn’t isolated from the rest of the application.

#### [Smoke Tests](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#smoke-tests)

There is one smoke test: the aptly-named [_smoke_test.ts](src/_smoke_test.ts). It’s a broad integration test that tests the code from end to end. It starts both servers and simulates an HTTP request, then checks the HTML that’s returned.

#### [Zero-Impact Instantiation](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#zero-impact)

None of the classes do any significant work in their constructors. The servers have a separate `startAsync()` method that is used to start the server after it’s been instantiated.

#### [Parameterless Instantiation](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#instantiation)

Every class can be instantiated without providing any parameters. It doesn't make sense for [WwwConfig](src/www/www_config.ts) to be instantiated without parameters, so it provides a `createTestInstance()` method for use by tests. It has optional defaults.

#### [Signature Shielding](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#sig-shielding)

Almost every test has helper methods that are used to simplify the tests and shield them from changes.

#### [Collaborator-Based Isolation](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#isolation)

The following tests use Collaborator-Based Isolation to prevent changes in dependencies’ behavior from breaking the tests:

* [_all_servers_test.ts](src/_all_servers_test.ts)
* [_www_router_test.ts](src/www/_www_router_test.ts)
* [_rot13_router_test.ts](src/rot13_service/_rot13_router_test.ts)


### Architectural Patterns

#### [A-Frame Architecture](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#a-frame-arch)

The code is infrastructure-heavy, with almost no logic, so the A-Frame Architecture pattern doesn’t apply to most of the code. However, the ROT-13 service has a small A-Frame Architecture:

* The *Application/UI* layer is represented by [Rot13Router](src/rot13_service/rot13_router.ts) and [Rot13Controller](src/rot13_service/rot13_controller.ts).
* The *Logic* layer is represented by [Rot13Logic](src/rot13_service/rot13_logic.ts) and [Rot13View](src/rot13_service/rot13_view.ts).
* The *Infrastructure* layer is represented by [HttpServer](src/node_modules/http/http_server.ts), [HttpServerRequest](src/node_modules/http/http_server_request.ts), and [HttpServerResponse](src/node_modules/http/http_server_response.ts).
* There is no *Values* layer.

#### [Logic Sandwich](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#logic-sandwich)

[Rot13Controller.postAsync()](src/rot13_service/rot13_controller.ts) is a Logic Sandwich. It reads data from the [HttpServerRequest](src/node_modules/http/http_server_request.ts), calls [Rot13Logic](src/rot13_service/rot13_logic.ts), renders it with [Rot13View](src/rot13_service/rot13_view.ts), and then writes data by returning a [HttpServerResponse](src/node_modules/http/http_server_response.ts) (which is then served by [HttpServer](src/node_modules/http/http_server.ts)).

#### [Traffic Cop](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#traffic-cop)

The [WwwRouter](src/www/www_router.ts) and [Rot13Router](src/rot13_service/rot13_router.ts) routers are traffic cops. They receive events from the [HttpServer](src/node_modules/http/http_server.ts) via their `routeAsync()` methods, then turn around and call the appropriate methods on [HomePageController](src/www/home_page/home_page_controller.ts) and [Rot13Controller](src/rot13_service/rot13_controller.ts). However, because the pattern is spread across multiple classes, it's not very clear in the code.

#### [Grow Evolutionary Seeds](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#grow-seeds)

The code was built evolutionarily, but there's no way to easily see it.


### Logic Patterns

#### [Easily-Visible Behavior](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#visible-behavior)

The one Logic layer function, [Rot13Logic.transform()](src/rot13_service/rot13_logic.ts), is a pure function. Other classes expose their state as needed to make testing easy.

#### [Testable Libraries](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#testable-libraries)

This program doesn’t use any third-party logic libraries.


### Infrastructure Patterns

#### [Infrastructure Wrappers](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#infrastructure-wrappers)

There are many infrastructure wrappers. [HttpClient](src/node_modules/http/http_client.ts), [HttpServer](src/node_modules/http/http_server.ts), [HttpServerRequest](src/node_modules/http/http_server_request.ts), [Clock](src/node_modules/infrastructure/clock.ts), [CommandLine](src/node_modules/infrastructure/command_line.ts), and [UuidGenerator](src/www/infrastructure/uuid_generator.ts) are all low-level infrastructure wrappers. [Log](src/node_modules/infrastructure/log.ts) and [Rot13Client](src/www/infrastructure/rot13_client.ts) are high-level infrastructure wrappers. (Log uses CommandLine; Rot13Client uses HttpClient.)  

#### [Narrow Integration Tests](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#narrow-integration-tests)

The low-level infrastructure wrappers (mentioned above) all have narrow integration tests.

#### [Paranoic Telemetry](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#paranoic-telemetry)

[HomePageController](src/www/home_page/home_page_controller.ts) and [Rot13Client](src/www/infrastructure/rot13_client.ts) collectively implement Paranoid Telemetry. Rot13Client checks the ROT-13 microservice response for any unexpected behavior, and throws an exception if it finds any. HomePageController handles exceptions thrown by Rot13Client and additionally handles slow responses.


### Nullability Patterns

#### [Nullables](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#nullables)

Most classes are nullable.

#### [Embedded Stub](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#embedded-stub)

The low-level infrastructure wrappers (listed above) all have embedded stubs.

#### [Thin Wrapper](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#thin-wrapper)

The code is written in JavaScript, so thin wrappers aren't needed.

#### [Configurable Responses](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#configurable-responses)

Most of the infrastructure wrappers (listed above) have configurable responses. [UuidGenerator](src/www/infrastructure/uuid_generator.ts) and [HttpClient](src/node_modules/http/http_client.ts) in particular support multiple different responses.

#### [Output Tracking](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#output-tracking)

Several classes support output tracking: [HttpClient](src/node_modules/http/http_client.ts), [CommandLine](src/node_modules/infrastructure/command_line.ts), [Log](src/node_modules/infrastructure/command_line.ts), [GenericRouter](src/node_modules/http/generic_router.ts), and [Rot13Client](src/www/infrastructure/rot13_client.ts).

#### [Behavior Simulation](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#behavior-simulation)

[HttpServer](src/node_modules/http/http_server.ts) allows callers to simulate HTTP requests.

#### [Fake It Once You Make It](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks#fake-it)

[Log](src/node_modules/infrastructure/log.ts), [HomePageController](src/www/home_page/home_page_controller.ts), and [Rot13Client](src/www/infrastructure/rot13_client.ts) all use nullable dependencies to implement their code and tests. Of the production implementations, Rot13Client is the most interesting, because it has configurable responses.

### Legacy Code Patterns

The code was a green-field project, so the legacy code patterns weren't needed.


MIT License
-----------

Copyright (c) 2020-2023 Titanium I.T. LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.