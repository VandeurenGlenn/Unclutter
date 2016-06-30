# Unclutter

## Getting started
### Prerequisites
To clone and run this repository Unclutter requires following major dependencies to be installed on your computer.

- [Git](https://git-scm.com) a freely distributed version control system.
- [Node.js](https://nodejs.org/en/download/) an open-source, cross-platform runtime environment for developing server-side Web applications.
- [npm](https://npmjs.com) the default package manager for the JavaScript runtime environment Node.js.
- [bower](https://bower.io/) A package manager for the web.

### Getting Unclutter for development (build from source)

In your command line:

```bash
# Clone this repository
git clone https://github.com/vandeurenglenn/unclutter
# Go into the repository
cd unclutter
# Install dependencies and run the app
npm install && npm start
```

### when ready doing changes
```bash
# Build the app (checkout dist for builds)
npm run dist
```



## Some info:
We use 2 package.json file (checkout [electron-boilerplate](https://github.com/szwacz/electron-boilerplate#omg-but-seriously-why-there-are-two-packagejson) for more info).
- `package.json` - Points to the app's devDependencies & scripts (like npm start).
- `app/package.json` - Points to the app's main file and lists its details and dependencies.
- `app/main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `app/index.html` - A web page to render. This is the app's **renderer process** (for now Unclutter is an single page app).
- `app/scripts/monitor.js` - The one resposible for starting and handling the watcher

Learn more about Unclutter and its API in the [documentation](docs/) (coming soon, working on the API to be more stable & a less resources sucking monster :D).

#### License [CC BY-NC-SA 3.0](LICENSE.md)
