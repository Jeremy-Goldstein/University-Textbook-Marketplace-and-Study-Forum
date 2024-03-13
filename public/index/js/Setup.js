/**
 * Loads current user data into side bar
 * Deals with multi-page shared site functionality such as logging out
 */
$(document).ready(function() {
  console.log("Setting up GUI");

  firebase.auth().onAuthStateChanged(function(user) {
    if (user && user.emailVerified) {
      console.log("user is " + firebase.auth().currentUser);
      var user = firebase.auth().currentUser;
      showUserAvatar();
      // User is signed in.
      let email = user.email;
      let username = user.displayName;
      console.log(email);
      document.getElementById("userEmail").innerHTML = email;
      document.getElementById("userName").innerHTML = username;

      document.getElementById("logoutBtn").addEventListener("click", e => {
        console.log("Logout Clicked");
        reset();
      });
    } else {
      console.log("User is not logged in!");
    }
  });

  var reset = function() {
    console.log("reset button clicked");
    firebase.auth().signOut();
    window.location.href = "../index.html";
    return false;
  };
});

function showUserAvatar() {
  var user = firebase.auth().currentUser;

  if (user != null) {
    if (user.photoURL == null) {
      document.getElementById("profileImg").src = "../images/placeholder.png";
    } else {
      document.getElementById("profileImg").src = user.photoURL;
    }
  }
}
