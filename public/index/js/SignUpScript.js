function signUpResultMessage(msg, isError = true, show = true){
  document.getElementById("SignUpResultMessage").innerText = msg;
  if (show){
    document.getElementById("SignUpResultMessage").style.display = "block";
  }
  else{
    document.getElementById("SignUpResultMessage").style.display = "none";
  }
  if (isError){
    document.getElementById("SignUpResultMessage").style.backgroundColor = "darksalmon"; 
  }
  else{
    document.getElementById("SignUpResultMessage").style.backgroundColor = "green"; 
  }
}

window.onload = function() {
  var signup = function() {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    const reenterPassword = document.getElementById("reenterPassword").value;
    const username = document.getElementById("username").value;
    if (email.length < 4 || username.length == 0 || pass != reenterPassword) {
      signUpResultMessage("Account not created: Please ensure that all inputs are correctly filled and that passwords match. Then, try again.");
      return false;
    }
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, pass).then(userCredential => {
            // User created successfully, return user object
            userCredential.user.sendEmailVerification()
            .then(()=> {
            
              signUpResultMessage("Account Created: To login, verify your email via the sign-up link sent to your inbox.", false);
                userCredential.user.updateProfile({
                  displayName: username, 
                })
              .then(function() {
                console.log("Successfully sendEmailVerification()");
                setCookie("newEmailAccount", email, 7);
              })
              .catch(function(error) {
                console.log("Error: " + error.message);
              });
            })
            .catch(function(error) {
              console.log("Error: " + error.message);
            });

      })
      .catch(function(error) {
        console.log(error.message);
        if (error.message == "The email address is badly formatted.") {
          signUpResultMessage("Account Not Created: The email address is badly formatted.");
        }
        if (error.message == "Password should be at least 6 characters") {
          signUpResultMessage("Account Not Created: Password should be at least 6 characters.");
        }
        if (error.message == "The email address is already in use by another account.") {
          
          if (getCookie("newEmailAccount") == email){
            signUpResultMessage("Account Already Created: Please verify your account and return to the home page to log in.");
          }
          else{
            signUpResultMessage("Account Not Created: The email address is already in use by another account.");
          }
        }
      });
  
    };

  document.getElementById("signup").addEventListener("click", e => {
    event.preventDefault();
    signUpResultMessage("", isError = false, show = false) // Clear message from previous click
    signup();
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById("signup").click();
    }
  });

  document.getElementById("goHome").addEventListener("click", function(event) {
    window.location.href = "../index.html";
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
