/*
    JavaScript File
    Description: sign-up.html functionality.
*/

window.onload = function () {
  var signup = function () {

    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    const reenterPassword = document.getElementById("reenterPassword").value;
    const username = document.getElementById("username").value;
    if (!isValidEmail(email)) {
      signUpResultMessage("Error: Ensure that the email is valid.", isError = true, show = true, id = "loginResult");
      return;
    }
    if (typeof isValidUsername(username) === 'string') { // Return string on fail
      signUpResultMessage(isValidUsername(username));
      return;
    }
    if (pass != reenterPassword) {
      signUpResultMessage("Error: Ensure passwords match.");
      return;
    }

    signUpResultMessage("Processing...");

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, pass).then(userCredential => {
        // User created successfully, return user object
        userCredential.user.sendEmailVerification()
          .then(() => {

            signUpResultMessage("Account Created: To login, verify your email via the sign-up link sent to your inbox.", false);
            userCredential.user.updateProfile({
              displayName: username,
            })
              .then(function () {
                console.log("Successfully sendEmailVerification()");
                setCookie("newEmailAccount", email, 7);
              })
              .catch(function (error) {
                console.log("Error: " + error.message);
              });
          })
          .catch(function (error) {
            console.log("Error: " + error.message);
          });

      })
      .catch(function (error) {
        console.log(error.message);
        if (error.message == "The email address is already in use by another account.") {

          if (getCookie("newEmailAccount") == email) {
            signUpResultMessage("Oops! Verify your account first from the link in your email inbox, and then return to the homepage to log in.");
          } else {
            signUpResultMessage("Error: The email address is already in use by another account.");
          }
        } else {
          signUpResultMessage("Account Not Created: " + error.message);
        }
      });

  };

  document.getElementById("createAccount").addEventListener("click", event => {
    event.preventDefault();
    signUpResultMessage("", isError = false, show = false) // Clear message from previous click
    signup();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById("createAccount").click();
    }
  });

  document.getElementById("goHome").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = '../index.html';
  });

  function setCookie(name, value, daysToExpire) {
    const date = new Date();
    date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

  function getCookie(name) {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length + 1, cookie.length);
      }
    }
    return null;
  }
};