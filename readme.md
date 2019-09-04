Project setup and execution: (Assuming Chrome or Firefox is already installed, and project folder is the base folder of the code base)
1. Install Java 8 (openJDK or oracle JDK)
2. Install Node (version 10.x)
3. Inside project folder run "npm install"
4. Inside project/ui folder "run npm install"
5. Inside project folder run "npm install -- --open" (This will build UI and start server, then open up the application on the default browser)

Project structure:
1. Inside project folder, all node JS server related files are present
    a. server.js -> starts the express/socket.io server using spdy module and listens on given host/port, also takes care of compression and https
    b. url_mappings.js -> registers all routes for rest APIs available for this server and their respective controller functions
    c. dataprovider.js -> acts as a data provider service used by route controllers to supply data for rest APIs
    d. executor.js -> module to handle all native java calls for the tool
    e. cache.js -> singleton cache module for the server
    f. event_bus.js -> module to provide common event bus across the server for communication between modules
    g. store.json -> json file that acts as a persistence layer, server's cache is stored on process shutdown and loaded on process startup from this file
2. certificates -> provides cert and key files for https server
3. executables -> contains all java code and jars to be executed for the tool
4. logs -> stores log files for each mapping conversion, can be downloaded from UI
5. resources -> contains all props files needed by the java code
5. templates -> contains tmpl files which would be filled up with repo specific data and replaced inside resources folder for execution
6. ui -> contains all code for React/Material UI app
    a. config -> contains webpack configuration for app build and load
    b. app -> React app code
        i. assets -> images and gifs for UI
        ii. components -> jsx files for all components
        iii. services -> common service to perform http calls
        iv. styles -> SASS files for app
        v. views -> index.html
        vi. Application.jsx -> main application root component
        vii. main.js -> application entry point for webpack and react