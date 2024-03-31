/*
    JavaScript File
    Description: index.html functionality.
*/

document.addEventListener("DOMContentLoaded", function () {

  document.getElementById("forgotPassword").addEventListener('click', function (event) {
    event.preventDefault();
    window.location.href = "./html/password-reset.html";
  });

  document.getElementById("createAccount").addEventListener('click', function (event) {
    event.preventDefault();
    window.location.href = "./html/sign-up.html";
  });

  document.getElementById("login").addEventListener('click', function (event) {
    event.preventDefault();
    login();
  });


  document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      document.getElementById("login").click();
    }
  });
});

function login() {

  let userEmail = document.getElementById("email").value;
  let userPass = document.getElementById("password").value;
  if (!isValidEmail(userEmail)) {
    displayResultMessage("Please ensure your email is valid", isError = true, show = true, id = "loginResult");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass)
    .then((userCredential) => {
      var user = userCredential.user;
      if (!user.emailVerified) {
        displayResultMessage("Please verify your email before logging in.", isError = true, show = true, id = "loginResult");
      } else {
        window.location.href = "/html/home.html";
      }

    })
    .catch((error) => {

      // Handle different error codes
      const errorCode = error.code;

      switch (errorCode) {
        case 'auth/invalid-email':
          displayResultMessage('Invalid email format', isError = true, show = true, id = "loginResult");
          break;
        case 'auth/user-disabled':
          displayResultMessage('User account is disabled', isError = true, show = true, id = "loginResult");
          break;
        case 'auth/user-not-found':
          displayResultMessage('User not found', isError = true, show = true, id = "loginResult");
          break;
        case 'auth/wrong-password':
          displayResultMessage('Incorrect password', isError = true, show = true, id = "loginResult");
          break;
        default:
          if (errorCode != null) {
            displayResultMessage('Incorrect email or password', isError = true, show = true, id = "loginResult");
          }
      }
    });
}