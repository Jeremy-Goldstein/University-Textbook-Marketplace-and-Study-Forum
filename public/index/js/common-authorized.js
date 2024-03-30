/*
    JavaScript File
    Description: Common functions used by all other JavaScript files when user is logged in.
*/

document.addEventListener("DOMContentLoaded", function () {
  confirmUserIsLoggedIn();

  document.getElementById("logoutBtn").addEventListener("click", e => {
    userLogout();
  });
});

function setUpSidebar() {

  $("#sidebar").mCustomScrollbar({
    theme: "minimal"
  });

  $('#dismiss, .overlay').on('click', function () {

    $('#sidebar').removeClass('active');
    $('.overlay').removeClass('active');
  });

  $('#sidebarCollapse').on('click', function () {
    $('#sidebar').addClass('active');
    $('.overlay').addClass('active');
    $('.collapse.in').toggleClass('in');
    $('a[aria-expanded=true]').attr('aria-expanded', 'false');
  });
}

function renderSidebarInfo() {
  var user = firebase.auth().currentUser;

  let email = user.email;
  let username = user.displayName;
  document.getElementById("userEmail").innerHTML = email;
  document.getElementById("userName").innerHTML = username;

  if (user != null) {
    if (user.photoURL == null) {
      document.getElementById("profileImg").src = "../images/placeholder.png";
    } else {
      document.getElementById("profileImg").src = user.photoURL;
    }
  }
}

function confirmUserIsLoggedIn() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user && user.emailVerified) {
      console.log("User logged in: " + user.email);

      setUpSidebar();
      renderSidebarInfo();

    } else {
      userLogout();
    }
  });
}