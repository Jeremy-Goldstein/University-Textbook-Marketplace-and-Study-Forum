var user = firebase.auth().currentUser;

$(document).ready(function() {

  loadCurrentUserInfo();

  $("#updateUsernameEmailBtn").click(function(event){
    event.preventDefault();
    updateUsernameEmail()
  });
  $("#updatePassBtn").click(function(event){
    event.preventDefault();
    updatePassword(event);
  });

  //  $("#moderateBtn").click(sendEmail);
  $("#moderateBtn").click(moderatorForm);

  //document.getElementById("moderateBtn").addEventListener("click",moderatorForm);
  document.getElementById("uploadedFile").addEventListener("change", function(event) {
    updateProfilePicture(event)
  });
   
});

function showUserAvatar() {
  

  if (user != null) {
    if (user.photoURL == null) {
      document.getElementById("profileImg").src = "../images/placeholder.png";
      document.getElementById("profilePicture").src = "../images/placeholder.png";
    } else {
      document.getElementById("profileImg").src = user.photoURL;
      document.getElementById("profilePicture").src = user.photoURL;
    }
  }
}

function loadCurrentUserInfo() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      
      // User is signed in.
      let email = user.email;
      let username = user.displayName;
      document.getElementById("username").value = username;
      document.getElementById("email").value = email;
    } else {
      console.log("User is not logged in!");
    }
  });
}

function updateUsernameEmail() {
  
  let newUsername = document.getElementById("username").value;
  let newEmail = document.getElementById("email").value;

  // Update username 
  if (isValidUsername(newUsername)){
    user.updateProfile({
      displayName: newUsername
    })
    .catch(function(error) {
      signUpResultMessage(error.message, isError=true, show=true, id="usernameEmailChangeResult");
      return
    });  
  }
  else{
    signUpResultMessage("Please ensure your username is valid and then try again", isError=true, show=true, id="usernameEmailChangeResult");
    return
  }

  // Update email 
  if(isValidEmail(newEmail)){
    user.updateEmail(newEmail)
    .then(() => {
        signUpResultMessage("Username and email updated.", isError=false, show=true, id="usernameEmailChangeResult");
      })
    .catch(function(error){
      signUpResultMessage(error.message, isError=true, show=true, id="usernameEmailChangeResult");
    });
  }
  else{
    signUpResultMessage("Please ensure your email is valid and then try again", isError=true, show=true, id="usernameEmailChangeResult");
    return
  }

  
}

function moderatorForm() {
  console.log("moderator form");

  $("#detailModal").modal("show");

  var sendEmail = function() {
    adminEmail = "sntegegn13@ole.augie.edu";
    console.log(adminEmail);
    var emailVar = document.getElementById("emailVal").value;
    var nameVar = document.getElementById("nameVal").value;
    var radios = document.getElementsByName("reason");
    var classVar = document.getElementById("classVal").value;

    console.log(nameVar);
    console.log(emailVar);
    console.log(classVar);

    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        var reasonVar = radios[i].value;
        console.log(reasonVar);
      }
    }
    console.log(reasonVar);
    adminEmail =
      "sntegegn13@ole.augie.edu;isabelle.xu88@gmail.com;jeremy.goldstein@wustl.edu";
    var link =
      "mailto:" +
      adminEmail +
      "?&subject=" +
      escape("Moderator access") +
      "&body=" +
      escape(
        "Hi! \n\n " +
          "My name is " +
          nameVar +
          ". My email address is " +
          emailVar +
          ". I am " +
          reasonVar +
          " for " +
          classVar +
          ". I was wondering " +
          " if I can get a moderator access." +
          "\n\n Thanks! "
      );
    window.location.href = link;
    console.log(emailVar);
  };
  $("#contactBtn").click(sendEmail);
}

function updatePassword() {
  
  let newPassword = document.getElementById("newPassword").value;
  let newPasswordConfirm = document.getElementById("newPasswordConfirm").value;

  if (newPassword != newPasswordConfirm){
    signUpResultMessage("Error: Password do not match.", isError=true, show=true, id="passwordResetResult");
  }
  else if (newPassword.length < 6 || newPasswordConfirm < 6) {
    signUpResultMessage("Error: Password must be at least 6 characters.", isError=true, show=true, id="passwordResetResult");
  } 
  else {
    user.updatePassword(newPassword).then(
      () => {
        signUpResultMessage("Successfully updated password!", isError=false, show=true, id="passwordResetResult");
      },
      error => {
        signUpResultMessage(error) ;
      }
    );
  }
}

function updateProfilePicture(event){

  //Get File
  var file = event.target.files[0];

  //Create a Storage Ref
  var storageRef = firebase
    .storage()
    .ref(user + "/profilePictures/" + file.name);

  //Upload file
  var uploadTask = storageRef.put(file)
  
  // Listen for state changes, errors, and completion of the upload
  uploadTask.on('state_changed', 
    function(error) {
      // Handle unsuccessful uploads
      console.error('Upload failed:', error);
    },
    function() {
      console.log("Successly uploaded image");

      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        console.log("File available at", downloadURL);
        
        // Update user
        user
          .updateProfile({
            photoURL: downloadURL
          })
          .then(function() {
            console.log("Successfully updated user profile image.");
            showUserAvatar();
          })
          .catch(function(error) {
            console.log(error)
          });
        
      });
  });

}
