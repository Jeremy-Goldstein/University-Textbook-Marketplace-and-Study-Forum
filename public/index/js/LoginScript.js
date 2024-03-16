window.onload = function() {


  var login = function() {

    var userEmail = document.getElementById("email").value;
    var userPass = document.getElementById("password").value;
    firebase.auth().signInWithEmailAndPassword(userEmail, userPass).then(function(data) {
      var user = firebase.auth().currentUser;
      console.log("user is " + firebase.auth().currentUser);
      if(!user.emailVerified){
        document.getElementById("loginResult").innerText = "Please verify your email before logging in."
      }
      else{
        window.location.href = "/html/homepage.html";
      }  

    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;

      document.getElementById("loginResult").innerText = ("Error: " + errorMessage);

    });

  }

  function logout() {
    firebase.auth().signOut();
  }

  document.getElementById("forgotPassword").addEventListener('click', function(event) {
    event.preventDefault();
    window.location.href = "./html/PasswordReset.html";
  });

  document.getElementById("createAccount").addEventListener('click', function(event) {
    event.preventDefault();
    window.location.href = "./html/SignUp.html";
  });

  document.getElementById("login").addEventListener('click', function(event) {
    event.preventDefault();
    login();
  });


}
