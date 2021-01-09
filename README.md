# node-red-scriptable
2021 by Ranki <s.rankers@einfach-beraten.de>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER
IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
OF THIS SOFTWARE.

*DESCRIPTION*

This scriptable shows data from node-red resp. an external JSON-string.
See further details (example of JSON-file and node-red integration) at the end of the coding!

*INSTALLATION*

1. Implement the node-red-integration.js part into your node-red installation and adapt the created functions to fill the requested JSON. The current implementation expects the file to be written directly to the node-red instance file system. Alternativelly you can also create the file and upload it via FTP to a server of your choice.
2. Implement the node-red.js into your scriptable app and adapt the variables in the beginning (host, subfolder, filename, opt. authentication etc.)

Enjoy!

*RELEASE NOTES*

Version 1.02 (2021-01-09)
 - minimal bugfixing
 - manual dark mode does influence widget background color, but does not provide variable dark
 - enhaced error handling:
 		- missing widget in JSON
      - specify function in catch-error and write2error
      - add critical error indicator in order to write errors w/o error msg to the user

Version 1.01 (2021-01-08)
- enhanced color support of dark mode
- seperated header and footer creation
- separate logging and errors into separate functions
- enhanced error handling

Version 1.0 (2021-01-06)
- initial creation

*EXPECTED JSON-file (Example)*

see file: scriptable.ioswidget

*NODE-RED INTEGRATION (Example)*

see file: node-red-integration.js
