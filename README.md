# University Textbook Marketplace and Study Forum
### Live Demo: [universitystudyhall.web.app](https://universitystudyhall.web.app)

Host a website via Firebase where users post for-sale listings of 
textbooks and ask other users questions about class material.


## Developer Info
### Installation
1. Install Node and NPM: https://nodejs.org/en/download/
2. Clone this repository
3. Install the Firebase CLI: `npm install -g firebase-tools`
4. Install packages: `npm install`
5. Initialize Firebase in the project: `firebase init`

### To Deploy to the Firebase Server
1. Open the ./public directory: `cd public`
2. Test the deployment: `firebase hosting:channel:deploy preview`
3. To deploy to production: `firebase deploy --only hosting`
4. If a rollback is needed, open the [Firebase Console](console.firebase.google.com/project/) and click Hosting then Releases. 
    Then, select the last stable deployment. 
5. Push changes to Github

### Solution Stack
- Firebase
- Node.js
- JavaScript, HTML, CSS