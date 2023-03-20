# Luacheck for Nova

This is an extension for the [Nova](https://nova.app) code editor which integrates the [Luacheck](https://github.com/mpeterv/luacheck) analyzer and linter for Lua code and shows its warnings and errors directly in Nova.

![A screenshot of Luacheck for Nova in action](https://raw.githubusercontent.com/GarrettAlbright/Luacheck.novaextension/master/Images/luacheck-screenshot.png)

## Installation

First, install [Luacheck](https://github.com/mpeterv/luacheck), if you haven't already. It's recommended that you install a version which corresponds to the version of Lua used in your project (it may be possible to specify a particular instance/version of Luacheck to use on a per-project basis in the future but that is not currently supported). Luacheck can be installed with MacPorts or with Luarocks directly. This extension will try to find Luacheck in the normal search paths configured for your user, so make sure the path to Luacheck is in your `$PATH` such that opening up a new shell and typing `luacheck` gets you something other than a "command not found" error.

Next, install this extension. Inside Nova, select "Extension Library…" from the "Extensions" menu and search for "Luacheck." Click the "Install" button when this extension appears.

## Configuration

You can create a `.luacheckrc` configuration file for your projects. The file itself should be written in Lua and can be located in you project's root folder (which is the default location this extension will use), or you can create it in the Lua file's folder itself and enable the option `Run Luacheck from the source file's folder` in your project's settings in Nova. Of particular interest is the `std` value which can be set to specify one or more standards which, for example, can stop globals defined by certain frameworks from being flagged by Luacheck. For example, for the LÖVE game framework, use `std="luajit+love"` to stop Luacheck from throwing warnings about accessing the `love` global from your code. See the "[Configuration file](https://luacheck.readthedocs.io/en/stable/config.html)" and "[Command line options](https://luacheck.readthedocs.io/en/stable/cli.html#command-line-options)" sections of [Luacheck's documentation](https://luacheck.readthedocs.io/en/stable/index.html) for more information.

## Troubleshooting

If you are getting an error on the first line of your document which says "Luacheck utility not found; see Luacheck Nova extension documentation," then you need to install Luacheck on your system. If you open a terminal window, enter `luacheck`, and get something along the lines of a "command not found" error message, then either Luacheck is not installed or it's not located in your `$PATH`. See the "Installation" section above.

If you're not seeing any errors or warnings in the editor even when you're sure you should see some, check the following.

- Make sure you are using the most recent version of Nova. The API for Nova extensions is not very stable and since it doesn't seem to be possible to easily download older versions of Nova, I can only realistically guarantee compatibility with the "current" version of Nova. As I write this, the extension is believed to work with Nova 7.4 through 8.3. To check what version of Nova you have and if any updates are available, select "About Nova…" from the "Nova" menu and click the "Check for Updates" button. (If you're sure you're using the most recent version of Nova and things still seem broken, please [create an issue](https://github.com/GarrettAlbright/Luacheck.novaextension/issues) or even a pull request if you're a legend.)
- Ensure this extension is installed and enabled. Inside Nova, select "Extension Library…" from the "Extensions" menu. If you don't see "Luacheck" in the list on the left under "Installed Extensions," the extension is not installed; see the "Installation" section above. If it is installed, check that the check box in that list is checked; if not, the extension is installed, but not enabled.
- Ensure Nova thinks the file you're editing is to be interpreted as Lua. This may not happen if it has a non-standard or no extension (eg, something other than ".lua"). In Nova, open the "Editor" menu, then check that "Lua" is selected from the "Syntax" submenu.
- If you're using a ".luacheckrc" configuration file, check that its rules are not causing your file, or the errors/warnings you are expecting to see in your file, are not being excluded.

## TODO & missing features

- Per-project paths to Luacheck
- i18n-able error messages?

## License & legal matters

This project is open source under the 2-clause BSD license. See the LICENSE file for the full text of the license.

The [Lua logo](http://www.lua.org/images/) was created by Alexandre Nakonechnyj. Copyright © 1998 Lua.org.
