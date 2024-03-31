/*
    JavaScript File
    Description: settings.html functionality.
*/

$(document).ready(function () {

  loadCurrentUserInfo();

  $("#updateUsernameEmailBtn").click(function (event) {
    event.preventDefault();
    updateUsernameEmail()
  });

  $("#updatePassBtn").click(function (event) {
    event.preventDefault();
    updatePassword(event);
  });

  document.getElementById("uploadedFile").addEventListener("change", function (event) {
    updateProfilePicture(event)
  });

});

function renderProfilePictureInSettings() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in
      if (user.photoURL == null) {
        document.getElementById("profilePicture").src = "../images/placeholder.png";
      } else {
        document.getElementById("profilePicture").src = user.photoURL;
      }
    }
  });
}


function loadCurrentUserInfo() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      let email = user.email;
      let username = user.displayName;
      document.getElementById("username").value = username;
      document.getElementById("email").value = email;
    }
  });
}

function updateUsernameEmail() {

  let newUsername = document.getElementById("username").value;
  let newEmail = document.getElementById("email").value;

  // Update username 
  if (isValidUsername(newUsername)) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        user.updateProfile({
          displayName: newUsername
        })
          .catch(function (error) {
            displayResultMessage(error.message, isError = true, show = true, id = "usernameEmailChangeResult");
            return
          });
      }
    });
  } else {
    displayResultMessage("Please ensure your username is valid and then try again", isError = true, show = true, id = "usernameEmailChangeResult");
    return
  }

  // Update email 
  if (isValidEmail(newEmail)) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        user.updateEmail(newEmail)
          .then(() => {
            displayResultMessage("Username and email updated.", isError = false, show = true, id = "usernameEmailChangeResult");
          })
          .catch(function (error) {
            displayResultMessage(error.message, isError = true, show = true, id = "usernameEmailChangeResult");
          });
      }
    });
  } else {
    displayResultMessage("Please ensure your email is valid and then try again", isError = true, show = true, id = "usernameEmailChangeResult");
    return
  }


}

function updatePassword() {

  let newPassword = document.getElementById("newPassword").value;
  let newPasswordConfirm = document.getElementById("newPasswordConfirm").value;

  if (newPassword != newPasswordConfirm) {
    displayResultMessage("Error: Password do not match.", isError = true, show = true, id = "passwordResetResult");
  } else if (newPassword.length < 6 || newPasswordConfirm < 6) {
    displayResultMessage("Error: Password must be at least 6 characters.", isError = true, show = true, id = "passwordResetResult");
  } else {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        user.updatePassword(newPassword).then(
          () => {
            displayResultMessage("Successfully updated password!", isError = false, show = true, id = "passwordResetResult");
          },
          error => {
            displayResultMessage(error, isError = true, show = true, id = "passwordResetResult");
          }
        );
      }
    });
  }
}

function updateProfilePicture(event) {

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.

      // Get File and check if the file is an image
      var file = event.target.files[0];
      if (!file.type.startsWith('image/')) {
        displayResultMessage('Selected file is not an image.', isError = true, show = true, id = "profilePicResetResult");
        return;
      }

      // Create a reference to the storage location for the user's profile picture
      const storageRef = firebase.storage().ref('users/' + user.uid + '/profilePicture.jpg')

      // Upload file
      var uploadTask = storageRef.put(file)

      // Listen for state changes, errors, and completion of the upload
      uploadTask.on('state_changed',
        function (snapshot) {
          // Handle upload progress
          let progress = Math.max(parseInt((((snapshot.bytesTransferred / snapshot.totalBytes) * 100) - 1)), 0);
          displayResultMessage('Upload is ' + progress + '% done...', isError = false, show = true, id = "profilePicResetResult");
        },
        function (error) {
          profilePicResetResult('Upload failed: ' + error.message, isError = true, show = true, id = "profilePicResetResult");
        },
        function () {
          console.log("Step 1: Successly uploaded image");

          uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            console.log("File URL: " + downloadURL);

            // Update user
            user
              .updateProfile({
                photoURL: downloadURL
              })
              .then(function () {
                renderProfilePictureInSettings();
                displayResultMessage("Successfully updated user profile image.", isError = false, show = true, id = "profilePicResetResult");
              })
              .catch(function (error) {
                console.log(error)
              });

          });
        });
    }
  });

}