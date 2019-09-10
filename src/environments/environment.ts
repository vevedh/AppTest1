// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyB5HXZKZtDTShbG720kMdRbVmjMNDr8AXY",
    authDomain: "hdcapp-ffab2.firebaseapp.com",
    databaseURL: "https://hdcapp-ffab2.firebaseio.com",
    projectId: "hdcapp-ffab2",
    storageBucket: "",
    messagingSenderId: "144677699490",
    appId: "1:144677699490:web:926a7463f4793836"
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
