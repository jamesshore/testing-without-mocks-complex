// Copyright Titanium I.T. LLC.
"use strict";

const commandLine = require("./command_line").createNull();

commandLine.writeStdout("this output should never be seen");
commandLine.writeStderr("neither should this");
