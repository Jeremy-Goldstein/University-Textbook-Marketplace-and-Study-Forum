/*
    JavaScript File
    Description: password-reset.html functionality.
*/

window.onload = function () {

  var resetPassword = function () {
    var emailAddress = document.getElementById("email").value;

    firebase.auth().sendPasswordResetEmail(emailAddress).then(function () {
      displayResultMessage("Password Reset: Please check your email.", isError = false, show = true, id = "loginResult");
    }).catch(function (error) {
      displayResultMessage(error, isError = true, show = true, id = "loginResult");
    });

  }
  document.getElementById("resetPassword").addEventListener('click', function (event) {
    event.preventDefault();
    resetPassword();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      document.getElementById("resetPassword").click();
    }
  });

  document.getElementById("goHome").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = '../index.html';
  });

}