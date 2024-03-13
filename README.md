# University Textbook Marketplace and Study Forum

Host a website via Firebase where users post for-sale listings of 
textbooks and ask other users questions about class material.

### Live Website: https://washu-books.firebaseapp.com

### Installation
1. Install Node and NPM: https://nodejs.org/en/download/
2. Clone this repository
4. Install needed packages: `npm install`

### To Deploy to the Firebase Server
 1. Open the ./public directory: `cd public`
 2. Test the deployment: `firebase hosting:channel:deploy preview`
 3. To deploy to production: `firebase deploy --only hosting`
 4. If a rollback is needed, open the [Firebase Console](console.firebase.google.com/project/) and click Hosting then Releases. 
    Then, select the last stable deployment. 
5. Push changes to Github

### Solution Stack
- Node.js
- Express.js
- Firebase
- Javascript/HTML/CSS

### External Resources
- [Firebase full-text search](https://firebase.google.com/docs/firestore/solutions/search)
- [JQuery Upvote Plugin](https://janosgyerik.github.io/jquery-upvote)
