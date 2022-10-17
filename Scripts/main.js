exports.activate = function() {
    // Do work when the extension is activated
    console.info("Luacheck extension for Nova activated.");
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
}

class IssuesProvider {
    // Will match warning or error notification with "--codes" and "--ranges"
    // flags active (as well as "--no-color" to ensure color codes don't
    // muck things up). Resulting lines look like this, after trimming:
    // /Volumes/Macintosh HD/Users/albright/Code/lovetest/main.lua:34:3-4: (E011) expected expression near 'if'
    lineMatchPattern = /^.+?:(\d+):(\d+)-(\d+): \((([WE])\d+)\) (.+)$/;

    constructor() {
    }

    provideIssues(editor) {
        let enableDebugLog = nova.config.get("pro.albright.luacheck.enable-debug-log");
        if (enableDebugLog == true) {
            console.log("in provideIssues");
        }

        // provideIssues() seems to sometimes be called before a document is
        // ready to read. Bail out early if so.
        const docLen = editor.document.length;
        if (docLen === 0) {
            if (enableDebugLog == true) {
                console.log("Bailing out early as document length is 0");
            }
            return [];
        }

        // Defeat a scope issue later
        const lineMatchPattern = this.lineMatchPattern;

        return new Promise(function(resolve, reject) {
            let issues = [];

            let processOptions =  {
                args: ["luacheck", "--no-color", "--codes", "--ranges"]
            };

            // If the file is local and has been saved, set some more options
            // relating to its path. Document path will be a string if the
            // document has been saved; "this may be `null` or `undefined`"
            // otherwise.
            if (!editor.document.isRemote && typeof editor.document.path === "string") {
                let runFromProjectFolder = nova.workspace.config.get("pro.albright.luacheck.run-from-project-folder");
                if (runFromProjectFolder == true) {
                    // Set cwd to the project folder. This allows luacheck to
                    // use one main config file for the entire project.
                    processOptions.cwd = nova.workspace.path;
                }
                else {
                    // Set cwd to parent directory of the file. This allows
                    // luacheck to check for configuration files in its ordinary
                    // way.
                    const cwd = editor.document.path.split("/").slice(0, -1).join("/");
                    processOptions.cwd = cwd;
                }

                // Add the filename to the process options
                processOptions.args.push("--filename");
                processOptions.args.push(editor.document.path)
            }

            // Hyphen argument tells luacheck to read input from stdin
            processOptions.args.push("-");

            // Initialize process
            const process = new Process("/usr/bin/env", processOptions);

            // Collect and process error/warning lines
            process.onStdout(function(line) {
                // Line will include spaces at front for formatting and,
                // annoyingly, a line break at the end. Get rid of that stuff
                line = line.trim();

                // Some lines are blank for human-friendly formatting
                // reasons; bail out now if so
                if (line === "") {
                    return;
                }

                if (enableDebugLog == true) {
                    console.log("in onStdout with line: '" + line + "'");
                }

                const matches = line.match(lineMatchPattern);
                if (matches === null) {
                    // The first and last lines have human-friendly stats/info
                    // which won't match the pattern. That's probably the case
                    // here.
                    return;
                }

                let issue = new Issue();
                issue.code = matches[4];
                issue.message = matches[6];
                issue.severity = matches[5] === "E" ? IssueSeverity.Error : IssueSeverity.Warning;
                issue.line = matches[1];
                issue.column = matches[2];
                // Luacheck doesn't specify a separate end line
                issue.endLine = matches[1];
                // Nova seems to want endColumn to be the first "good"
                // column rather than the last bad one.
                issue.endColumn = Number(matches[3]) + 1;
                issues.push(issue);
            });

            process.onStderr(function(line) {
                console.warn("Stderr line from Luacheck", line);
            });

            process.onDidExit(function(exitStatus) {
                // Status 127 most likely means `luacheck` is not installed or
                // can't be found in $PATH.
                if (exitStatus == 127) {
                    // Create an "issue" reporting this.
                    let issue = new Issue();
                    issue.message = "Luacheck utility not found; see Luacheck Nova extension documentation";
                    issue.severity = IssueSeverity.Error;
                    issue.line = 1;
                    issues.push(issue);
                    resolve(issues);
                }
                // Note: Luacheck has exit status 2 if it reported errors
                // and 1 if it reported warnings. 0 if neither were found.
                // Thus exitStatus 1 and 2 are both "normal."
                else if (exitStatus < 0 || exitStatus > 2) {
                    reject();
                }
                else {
                    resolve(issues);
                }
            });

            // Trick to send text to process via stdin
            // https://devforum.nova.app/t/formating-code-with-a-cli-tool/1089
            const writer = process.stdin.getWriter();
            writer.ready.then(function() {
                // Get text
                const fullRange = new Range(0, docLen);
                const text = editor.document.getTextInRange(fullRange);

                if (enableDebugLog == true) {
                    console.log("in writer.ready callback; doc length: " + text.length);
                }

                writer.write(text);
                writer.close();
            });

            try {
                process.start();
            }
            catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }
}

nova.assistants.registerIssueAssistant("lua", new IssuesProvider());
