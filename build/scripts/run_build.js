// Copyright Titanium I.T. LLC.

import { checkNodeVersion } from "../util/node_version_checker.js";
import { runBuildAsync } from "./build.js";

checkNodeVersion();

runBuildAsync(process.argv.slice(2)).then((failedTask) => {
	setImmediate(() => {
		if (failedTask === "lint" || failedTask === "compile") process.exit(1);
		else if (failedTask !== null) process.exit(2);
		// Otherwise, exits with exit code 0. We don’t explicitly exit because we want to
		// detect timers, servers, etc. that don't get shut down. The process will not
		// to exit in that case, and the watch script will log a warning.
	});

});
