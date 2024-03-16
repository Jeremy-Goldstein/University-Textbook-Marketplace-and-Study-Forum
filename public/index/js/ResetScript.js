window.onload = function () {

  var resetPassword = function () {
    var emailAddress = document.getElementById("email").value;

    firebase.auth().sendPasswordResetEmail(emailAddress).then(function () {
      signUpResultMessage("Password Reset: Please check your email.", false);
    }).catch(function (error) {
      signUpResultMessage(error, false);
    });

  }
  document.getElementById("resetPassword").addEventListener('click', function(event) {
    event.preventDefault();
    resetPassword();
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById("resetPassword").click();
    }
  });

  document.getElementById("goHome").addEventListener("click", function(event) {
    event.preventDefault();
    window.location.href = '../index.html';
  });

}
