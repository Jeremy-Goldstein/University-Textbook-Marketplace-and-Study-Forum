/**
 * Loads current user data into side bar
 * Deals with multi-page shared site functionality such as logging out
 */

$(window).load(function () {
    console.log("Setting up GUI");

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("user is " + firebase.auth().currentUser);
        var user = firebase.auth().currentUser;
        // User is signed in.
        let email = user.email;
        let username = user.displayName;
        console.log(email);
        document.getElementById("userEmail").innerHTML = email;
        document.getElementById("username").innerHTML = username;
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

    document.getElementById("logoutBtn").addEventListener('click', e => {
      console.log("Logout Clicked");
      reset();
    });


});