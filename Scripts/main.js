
exports.activate = function() {
    // Do work when the extension is activated
    console.info("Luacheck extension for Nova activated.");
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
}


class IssuesProvider {
    // /Users/albright/Code/lovetest/main.lua:34:3-4: (E011) expected expression near 'if'
    lineMatchPattern = /^.+?:(\d+):(\d+)-(\d+): \((([WE])\d+)\) (.+)$/;

    constructor() {

    }

    provideIssues(editor) {
        // Defeat a scope issue later
        const lineMatchPattern = this.lineMatchPattern;

        return new Promise(function(resolve, reject) {
            let issues = [];

            let processOptions =  {
                args: ["luacheck", "--no-color", "--codes", "--ranges"],
            };

            // Is the current document unsaved? editor.document.path will not be a
            // string if so.
            const filePath = editor.document.path;
            const hasPath = typeof filePath === "string";

            // If the file is local and has been saved, set some more options
            // relating to its path.
            if (!editor.document.isRemote && hasPath) {
                // Set cwd to parent directory of the file. This allows luacheck
                // to check for configuration files in its ordinary way.
                const cwd = filePath.split("/").slice(0, -1).join("/");
                processOptions.cwd = cwd;

                // Add the filename to the process options
                processOptions.args.push("--filename");
                processOptions.args.push(filePath)
            }

            // Get text
            const fullRange = new Range(0, editor.document.length);
            const text = editor.document.getTextInRange(fullRange);
            processOptions.args.push("-");

            // Initialize process
            console.log(processOptions.args.join(" "));
            const process = new Process("/usr/bin/env", processOptions);

            // Collect and process error/warning lines
            process.onStdout(function(line) {
                const matches = line.trim().match(lineMatchPattern);
                if (matches === null) {
                    return;
                }
                console.log(lineMatchPattern);

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
                console.log(matches.join(" "));
                issues.push(issue);
            });

            process.onStderr(function(line) {
                console.error("Stderr line from Luacheck", line);
            });

            process.onDidExit(function(exitStatus) {
                // Note: Luacheck has exit status 2 if it reported errors
                // and 1 if it reported warnings. 0 if neither were found.
                // Thus exitStatus 1 and 2 are both "normal."
                if (exitStatus < 0 || exitStatus > 2) {
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
