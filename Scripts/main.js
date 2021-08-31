
exports.activate = function() {
    // Do work when the extension is activated
    console.info("Luacheck extension for Nova activated.");
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
}


class IssuesProvider {
    constructor() {
        //    /Users/albright/Code/lovetest/main.lua:34:3-4: (E011) expected expression near 'if'
        this.lineMatchPattern = /    .+?:(\d+):(\d+)-(\d+): \((([WE])\d+)\) (.+)/
    }

    provideIssues(editor) {
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

        // Get text and add to args
        const fullRange = new Range(0, editor.document.length);
        const text = editor.document.getTextInRange(fullRange);
        processOptions.args.push("-");
        processOptions.args.push(text);

        const process = new Process("/usr/bin/env", processOptions);

        process.onStdout(function(line) {
            const matches = line.match(this.lineMatchPattern);
            if (matches === null) {
                return;
            }

            let issue = new Issue();
            issue.code = matches[3];
            issue.message = matches[5];
            issue.severity = matches[4] === "E" ? IssueSeverity.Error : IssueSeverity.Warning;
            issue.line = matches[0];
            issue.column = matches[1];
            // Luacheck doesn't specify a separate end line
            issue.endLine = matches[0];
            issue.endColumn = matches[2];
            issues.push(issue);
        });

        process.onStderr(function(line) {
            console.error("Stderr line from Luacheck", line);
        });

        process.start();

        return issues;
    }
}

nova.assistants.registerIssueAssistant("lua", new IssuesProvider());
