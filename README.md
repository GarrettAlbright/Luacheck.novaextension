# Luacheck for Nova

This is an extension for the [Nova](https://nova.app) code editor which integrates the [Luacheck](https://github.com/mpeterv/luacheck) analyzer and linter for Lua code and shows its warnings and errors directly in Nova.

![A screenshot of Luacheck for Nova in action](https://raw.githubusercontent.com/GarrettAlbright/Luacheck.novaextension/master/Images/luacheck-screenshot.png)

## Installation

First, install [Luacheck](https://github.com/mpeterv/luacheck), if you haven't already. It's recommended that you install a version which corresponds to the version of Lua used in your project (it may be possible to specify a particular instance/version of Luacheck to use on a per-project basis in the future but that is not currently supported). Luacheck can be installed with MacPorts or with Luarocks directly. This extension will try to find Luacheck in the normal search paths configured for your user, so make sure the path to Luacheck is in your `$PATH` such that opening up a new shell and typing `luacheck` gets you something other than a "command not found" error.

Next, install this extension. Inside Nova, select "Extension Library…" from the "Extensions" menu and search for "Luacheck." Click the "Install" button when this extension appears.

## Configuration

This extension doesn't have any configuration options itself, but you might be interested in creating a ".luacheckrc" configuration file for your projects. The file itself should be written in Lua. Of particular interest is the `std` value which can be set to specify one or more standards which, for example, can stop globals defined by certain frameworks from being flagged by Luacheck. For example, for the LÖVE game framework, use `std="luajit+love"` to stop Luacheck from throwing warnings about accessing the `love` global from your code. See the "[Configuration file](https://luacheck.readthedocs.io/en/stable/config.html)" and "[Command line options](https://luacheck.readthedocs.io/en/stable/cli.html#command-line-options)" sections of [Luacheck's documentation](https://luacheck.readthedocs.io/en/stable/index.html) for more information.

## Troubleshooting

If you're not seeing any errors or warnings in the editor even when you're sure your code contains some, check the following.

- Ensure this extension is installed and enabled. Inside Nova, select "Extension Library…" from the "Extensions" menu. If you don't see "Luacheck" in the list on the left under "Installed Extensions," the extension is not installed; see the "Installation" section above. If it is installed, check that the check box in that list is checked; if not, the extension is installed, but not enabled.
- Ensure Luacheck has been installed in such a way that the extension can find it. If you can go into a shell and type `luacheck` and get something other than a "command not found" error, then this extension should work. Otherwise, confirm that you've installed Luacheck and that the path to it is in your `$PATH`.
- Ensure Nova thinks the file you're editing is to be interpreted as Lua. This may not happen if it has a non-standard or no extension (eg, something other than ".lua"). In Nova, open the "Editor" menu, then check that "Lua" is selected from the "Syntax" submenu.
- If you're using a ".luacheckrc" configuration file, check that its rules are not causing your file, or the errors/warnings you are expecting to see in your file, are not being excluded.

## TODO & missing features

- Per-project paths to Luacheck
- i18n-able error messages?

## License & legal matters

This project is open source under the 2-clause BSD license. See the LICENSE file for the full text of the license.

The [Lua logo](http://www.lua.org/images/) was created by Alexandre Nakonechnyj. Copyright © 1998 Lua.org.
