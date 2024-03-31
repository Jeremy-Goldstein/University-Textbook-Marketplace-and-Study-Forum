/*
    JavaScript File
    Description: forum.html functionality.
*/

var postKeys = [];
var clickedListing = "";
var currentClassKey = "";

document.addEventListener("DOMContentLoaded", function () {
  // Retrieve current class from cookie
  document.getElementById("className").innerText = getCookie("currentClass");

  loadPostListings();

  document.getElementById("submitBtn").addEventListener("click", newPost);

  document.getElementById("upBtn").addEventListener("click", function () {
    checkIfDownvoted("upvoted", true);
  });

  document.getElementById("downBtn").addEventListener("click", function () {
    checkIfDownvoted("downvoted", true);
  });

  document.getElementById("deleteBtn").addEventListener("click", function () {
    deletePost();
  });

  document.getElementById("flagBtn").addEventListener("click", function () {
    flagPost();
  });
});

function flagPost() {
  postTitle = document.getElementById("postDetailsTitle").innerText;

  adminEmail = "";
  var mailList = [];
  let rootRef = firebase.database().ref();
  rootRef
    .child("classes/" + currentClassKey + "/Moderators")
    .once("value")
    .then(function (snapshot) {

      snapshot.forEach(function (data) {
        adminEmail += data.val();
        mailList.push(data.val());
      });
      subject = "Flag Post in " + getCookie("currentClass")
      body = "Hello Moderators:\n\n" +
        "This is an automated email that the following forum post needs to be reviewed: '" + postTitle + "'."
      sendEmail(mailList, subject, body);
    });
}

function deletePost() {
  console.log("attempting deletePost: ", clickedListing)

  let rootRef = firebase.database().ref();

  /// Get the reference to the file URL in the database
  let urlRef = rootRef.child("classes/" + currentClassKey + "/posts/" + clickedListing + "/fileURL");

  // Retrieve the value from the database
  urlRef.once('value')
    .then((snapshot) => {
      const fileURL = snapshot.val(); // Get the value associated with the key
      if (fileURL != "" && fileURL != null) {
        // Create a reference to the file in Firebase Storage
        let storageRef = firebase.storage().refFromURL(fileURL);

        // Delete the file from Firebase Storage
        storageRef.delete()
          .then(() => {
            console.log("File deleted successfully.");
          })
          .then(function () {
            // Remove the post after the file deletion
            // Get the reference to the element you want to delete
            let postToDelete = rootRef.child("classes/" + currentClassKey + "/posts/" + clickedListing);

            // Remove the post
            postToDelete.remove()
              .then(() => {
                console.log("Post deleted successfully.", clickedListing);
                loadPostListings()
              })
              .catch((error) => {
                console.error("Error deleting Post:", error);
              });

          })

          .catch((error) => {
            console.error("Error deleting file:", error);
          });
      } else {
        // Return true representing that the post is ready to be deleted
        // Since there is no file to delete first
        return true
      }
    }).then(function (readyToDeletePost) {
      if (readyToDeletePost) {
        // Remove the post after the file deletion
        // Get the reference to the element you want to delete
        let postToDelete = rootRef.child("classes/" + currentClassKey + "/posts/" + clickedListing);

        // Remove the post
        postToDelete.remove()
          .then(() => {
            console.log("Post deleted successfully.", clickedListing);
            loadPostListings()
          })
          .catch((error) => {
            console.error("Error deleting Post:", error);
          });
      }

    })
    .catch((error) => {
      console.error("Error retrieving file URL:", error);
    });


}

// grab all posts from firebase then render
function loadPostListings() {

  currentClassKey = getCookie("currentClassKey");
  console.log("currentClassKey : " + currentClassKey);
  postKeys = []; // Reset post keys

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // Clear prev listings
      deleteElementsExcept2("postListings", "postListings-0")
      if (!document.getElementById("detailedView").classList.contains("detailedView")) {
        document.getElementById("detailedView").classList.add("d-none");
      }

      let rootRef = firebase.database().ref();
      // get all keys
      rootRef
        .child("classes/" + currentClassKey + "/posts")
        .once("value")
        .then(function (snapshot) {
          if (snapshot.val()) {
            let total = Object.keys(snapshot.val()).length;
            let i = 0;
            while (i < total) {
              postKeys.push(Object.keys(snapshot.val())[i]);
              i++;
            }
          }
        }).then(function () {
          // pull all posts from firebase
          rootRef
            .child("classes/" + currentClassKey + "/posts")
            .once("value")
            .then(function (snapshot) {

              var idNum = 0;

              snapshot.forEach(function (postData) {

                let thisPostInSidebar = copyElement("postListings-0", "post" + idNum);
                thisPostInSidebar.classList.remove("d-none");
                thisPostInSidebar.firstElementChild.innerText = postData.val().title;

                // Add click event
                thisPostInSidebar.addEventListener("click", function () {
                  sidebarPostClicked(this.id, postData, user)
                });

                idNum++;
              });

              // Since at least one post, don't display 'no post' message
              if (idNum > 0) {
                document.getElementById("postListings-0").classList.add("d-none");
                document.getElementById("post" + (idNum - 1)).click();
              } else {
                document.getElementById("postListings-0").classList.remove("d-none");
                document.getElementById("postListings-0").classList.remove("d-none");
              }
            })

        })

    }
  });
}

function sidebarPostClicked(postID, postData, user) {
  // Make the main post in the center of the screen visible
  document.getElementById("detailedView").classList.remove("d-none")

  // Append information to details view
  clickedListing = postKeys[parseInt(postID.replace("post", ""))];
  console.log("clicked Listing for " + postID + " = " + clickedListing);

  document.getElementById("voteScore").innerText = postData.val().score;

  if (postData.val().score > -2) {
    if (postData.val().profileUrl != null) {
      document.getElementById("profileImgSmall").src = postData.val().profileUrl;
    }
    document.getElementById(
      "postDetailsTitle"
    ).innerText = postData.val().title;
    document.getElementById(
      "postDetailsContent"
    ).innerHTML = postData.val().content;

    if (postData.val().fileName != null && postData.val().fileName != "") {

      document.getElementById(
        "postDetailsFile"
      ).innerText = postData.val().fileName;
      document.getElementById(
        "postDetailsFile"
      ).href = postData.val().fileURL;
    }
    else {
      document.getElementById(
        "postDetailsFile"
      ).innerText = "";
      document.getElementById(
        "postDetailsFile"
      ).href = "";
    }
    document.getElementById("postCreatedBy").innerText = postData.val().username;
    document.getElementById("postCreatedAt").innerText = formatTime(postData.val().timestamp);

    renderComments();

    currentClassKey = getCookie("currentClassKey");
    let rootRef = firebase.database().ref();

    // Let moderators delete any post
    var ableToDeletePost = false
    rootRef
      .child("classes/" + currentClassKey + "/Moderators")
      .once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (moderator) {
          if (moderator.val() == user.email) {
            ableToDeletePost = true;
          }
        });
      });

    // Is moderator or user who created post
    if (ableToDeletePost || postData.val().email == user.email) {
      document.getElementById("deleteBtn").classList.remove("d-none")
    } else {
      document.getElementById("deleteBtn").classList.add("d-none")
    }

    renderScore();
    checkIfDownvoted("", false)

  } else {
    document.getElementById("profileImgSmall").src = "../images/placeholder.png";
    document.getElementById("postDetailsTitle").innerText =
      "This post has been automatically hidden due to significant downvotes.";
  }
}

function newPost() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {

      let username = firebase.auth().currentUser.displayName;
      let email = firebase.auth().currentUser.email;
      let profileUrl = firebase.auth().currentUser.photoURL;
      let title = document.getElementById("postTitle").value;
      let content = document.getElementById("postContent").value;
      const fileInput = document.getElementById('fileId');

      var fileName = "";
      let timestamp = new Date();

      if (!isValidForumTextInput(title)) {
        displayResultMessage("Error: Post title is invalid.", isError = true, show = true, id = "newPostResult")
        return
      }
      if (!isValidForumTextInput(content)) {
        displayResultMessage("Error: Post content is invalid.", isError = true, show = true, id = "newPostResult")
        return
      }


      // Check if files were selected
      if (fileInput.files.length > 0) {

        const file = fileInput.files[0];
        // Check if the file MIME type is an .exe
        if (file.type.startsWith('application/x-msdownload') || !file) {
          displayResultMessage("Error: Uploading executable files is not permitted.", isError = true, show = true, id = "newPostResult")
          return;
        }

        const name = parseInt(timestamp.getTime() / 1000) + "-" + file.name;
        const metadata = {
          contentType: file.type
        };

        // Create a reference to the storage location for the user's profile picture
        const storageRef = firebase.storage().ref('users/' + user.uid + '/uploads/')

        //Upload file
        var uploadTask = storageRef.child(name).put(file, metadata);

        fileName = file.name;

        // Listen for state changes, errors, and completion of the upload
        uploadTask.on('state_changed',
          function (snapshot) {
            // Handle upload progress
            let progress = Math.max(parseInt((((snapshot.bytesTransferred / snapshot.totalBytes) * 100) - 1)), 0);
            displayResultMessage('Upload is ' + progress + '% done...', isError = false, show = true, id = "newPostResult");
          },
          function (error) {
            displayResultMessage('Upload failed: ' + error.message, isError = true, show = true, id = "newPostResult");
          },
          function () {

            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
              newPostFirebaseCall(username, email, profileUrl,
                timestamp, title, content,
                fileName, downloadURL
              );
            });
          }
        );

      } else {
        newPostFirebaseCall(username, email, profileUrl,
          timestamp, title, content,
          "", ""
        );
      }
    }
  });
}

function newPostFirebaseCall(
  username,
  email,
  profileUrl,
  timestamp,
  title,
  content,
  fileName,
  fileURL,
  currentClassKey
) {
  currentClassKey = getCookie("currentClassKey");
  let rootRef = firebase.database().ref();
  let storesRef = rootRef.child("classes/" + currentClassKey + "/posts");
  let newStoreRef = storesRef.push();
  Moderators = " ";
  newStoreRef.set({
    username: username, // Original post username
    email: email,
    profileUrl: profileUrl,
    timestamp: timestamp.toString(),
    title: title,
    content: content,
    score: 0,
    fileName: fileName,
    fileURL: fileURL
  },

    function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log("User input Success");

        // Close modal
        $("#postModal").modal("toggle");
        // Clear file name
        document.getElementById('fileId').value = "";
        // Reset message
        displayResultMessage('', isError = false, show = false, id = "newPostResult");
        // Render post
        loadPostListings();
        // Render voting buttons
        checkIfDownvoted("", false)
      }
    }
  );
}

function renderComments() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // Clear comments section to prepare for fresh load
      deleteElementsExcept2("postComments", "postComments-0")

      // Append click event for new comment
      document
        .getElementById("newCommentBtn")
        .addEventListener("click", newComment);

      let uid = firebase.auth().currentUser.uid;
      let rootRef = firebase.database().ref();

      // Render comments for current post key
      rootRef
        .child(
          "classes/" +
          currentClassKey +
          "/posts/" +
          clickedListing +
          "/comments/"
        )
        .once("value")
        .then(function (snapshot) {
          var commentNumber = 0
          snapshot.forEach(function (data) {
            profileImg = data.val().profileUrl;
            if (profileImg == null) {
              profileImg = "../images/placeholder.png";
            }
            // Copy placeholder element and make it visible
            let commentElement = copyElement("postComments-" + commentNumber, "postComments-" + (commentNumber + 1))
            commentElement.classList.remove("d-none")

            // Set commenter's profile picture
            var commenterProfileImgs = commentElement.querySelectorAll('.profileImgCommenter');
            var thisCommenterProfileImg = commenterProfileImgs[commenterProfileImgs.length - 1];
            thisCommenterProfileImg.src = profileImg

            // Set commenter's username
            var usernameCommenter = commentElement.querySelectorAll('.usernameCommenter');
            var thisusernameCommenter = usernameCommenter[usernameCommenter.length - 1];
            thisusernameCommenter.innerText = data.val().username

            // Set commenter's content
            var contentCommenter = commentElement.querySelectorAll('.contentCommenter');
            var thiscontentCommenter = contentCommenter[contentCommenter.length - 1];
            thiscontentCommenter.innerText = data.val().comment

            commentNumber += 1;
          });
        });
    }
  });
}

function newComment() {
  // add comment to database
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      let username = firebase.auth().currentUser.displayName;
      let profileUrl = firebase.auth().currentUser.photoURL;
      let comment = document.getElementById("inputBox").value;
      if (comment.trim() != "") { } else {
        alert("Please input a valid comment.");
        return;
      }

      let rootRef = firebase.database().ref();
      // store underneath current post (get key)

      let storesRef = rootRef.child(
        "classes/" + currentClassKey + "/posts/" + clickedListing + "/comments/"
      );
      let newStoreRef = storesRef.push();

      newStoreRef.set({
        username: username,
        profileUrl: profileUrl,
        comment: comment
      },
        function (error) {
          if (error) {
            console.log(error);
          } else {
            console.log("User input Success");
            // Empty comment box
            document.getElementById("inputBox").value = "";
            // Render comments
            renderComments();
          }
        }
      );
    }
  });
}

function renderScore() {

  let rootRef = firebase.database().ref("classes/" + currentClassKey +
    "/posts/" + clickedListing + "/" +
    "score" + "/")

  rootRef.once('value')
    .then(function (snapshot) {

      // Retrieve the value from the snapshot
      document.getElementById("voteScore").innerText = snapshot.val();

      rootRef = firebase.database().ref("classes/" + currentClassKey +
        "/posts/" + clickedListing + "/" +
        "upvoted" + "/")
      rootRef.once("value")
        .then(snapshot => {
          let count = snapshot.numChildren(); // Get the number of children

          rootRef = firebase.database().ref("classes/" + currentClassKey +
            "/posts/" + clickedListing + "/" +
            "downvoted" + "/")
          rootRef.once("value")
            .then(snapshot => {
              count += snapshot.numChildren(); // Get the number of children
              document.getElementById("voteTotal").innerText = count;
            })

        })
    })
    .catch(function (error) {
      console.error("Error getting value from location:", error);
    });
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setVote(vote) {
  let rootRef = firebase.database().ref();
  // store underneath current post (get key)
  console.log("setVote: ", vote, clickedListing);

  let storesRef = rootRef.child(
    "classes/" + currentClassKey + "/posts/" + clickedListing + "/" + vote + "/"
  );

  storesRef.once("value")

    .then(function () {
      var currentUserUid = firebase.auth().currentUser.uid;
      storesRef.child(currentUserUid).set(true);
      if (vote == "downvoted") {
        console.log("adding downvote")
        document.getElementById("downBtn").classList.add("active");
        changeScore(-1);
      } else {
        console.log("adding upvote")
        document.getElementById("upBtn").classList.add("active");
        changeScore(1)
      }
    })
    .catch(function (error) {
      console.error("Error checking or creating storesRef: ", error);
    });

}

// Remove current user from upvoted or downvoted list
function removeVote(vote) {
  console.log("removing ", vote, currentClassKey, clickedListing);
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // Get the current user's UID
      var currentUserUid = firebase.auth().currentUser.uid;

      // Construct the path to the node you want to delete
      var pathToDelete = "classes/" + currentClassKey + "/posts/" + clickedListing + "/" + vote + "/" + currentUserUid;

      // Reference to your Firebase database
      var database = firebase.database();

      // Remove the child node
      database.ref(pathToDelete).remove()
        .then(function () {
          if (vote == "downvoted") {
            console.log("removing downvote")
            document.getElementById("downBtn").classList.remove("active");
            changeScore(1);
          } else {
            console.log("removing upvote")
            document.getElementById("upBtn").classList.remove("active");
            changeScore(-1)
          }
        })
        .catch(function (error) {
          console.error("Error deleting child node: ", error);
        });
    }
  });
}

function changeScore(change) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {

      // Check if the user has downvoted the post already
      let rootRef = firebase.database().ref("classes/" + currentClassKey +
        "/posts/" + clickedListing + "/" +
        "score" + "/"
      )
      // Create a transaction to modify the value
      rootRef.transaction(function (currentValue) {
        return currentValue + change; // Add the change to the existing value
      })
        .then(function (transactionResult) {
          if (transactionResult.committed) {
            console.log("Value updated successfully.");
          } else {
            console.log("Transaction aborted: ", transactionResult.error);
          }
          renderScore();
        })
        .catch(function (error) {
          console.error("Error updating value: ", error);
        });
    }
  });
}

// Takes in either "upvoted" or "downvoted"
function checkIfDownvoted(vote, castNewVote) {

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      var currentUserUid = firebase.auth().currentUser.uid;

      // Check if the user has downvoted the post already
      let rootRef = firebase.database().ref("classes/" + currentClassKey +
        "/posts/" + clickedListing + "/" +
        "downvoted" + "/"
      )
      rootRef.once("value")
        .then(function (snapshot) {

          if (snapshot.hasChild(currentUserUid)) {
            console.log("user has downvoted already");
            if (castNewVote) {
              // Since a vote already exists, delete it
              removeVote("downvoted");
              if (vote == "upvoted") {
                // Since new vote is opposite of existing, set new
                setVote(vote)
              }
              renderScore();
            } else {
              document.getElementById("downBtn").classList.add("active");
            }
          } else {
            console.log("user has not already downvoted")
            checkIfUpvoted(vote, castNewVote);
          }
        })
    }
  });
}

function checkIfUpvoted(vote, castNewVote) {

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      var currentUserUid = firebase.auth().currentUser.uid;

      // Check if the user has upvoted the post already
      rootRef = firebase.database().ref("classes/" + currentClassKey +
        "/posts/" + clickedListing + "/" +
        "upvoted" + "/"
      )
      rootRef.once("value")
        .then(function (snapshot) {

          if (snapshot.hasChild(currentUserUid)) {
            console.log("user has upvoted already");
            if (castNewVote) {
              // Since a vote already exists, delete it
              removeVote("upvoted");
              if (vote == "downvoted") {
                // Since new vote is opposite of existing, set new
                setVote(vote)
              }

            } else {
              document.getElementById("upBtn").classList.add("active");
            }
          } else {
            console.log("user has not already upvoted")

            if (castNewVote) {
              setVote(vote)

            }
          }
        })
    }
  })
}


function searchPosts() {
  let searchQuery = document.getElementById("searchPostsQuery").value;

  let rootRef = firebase.database().ref();
  let postIndex = 0;
  let postMatchesCount = 0;
  // Get all keys
  rootRef
    .child("classes/" + currentClassKey + "/posts")
    .once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (data) {

        if (data.val().content.includes(searchQuery) || data.val().title.includes(searchQuery)) {
          document.getElementById("post" + postIndex).classList.remove("d-none")
          postMatchesCount += 1;
          document.getElementById("post" + postIndex).click();
        } else {
          if (!document.getElementById("post" + postIndex).classList.contains("d-none")) {
            document.getElementById("post" + postIndex).classList.add("d-none")
          }
        }
        postIndex += 1;
      });

      // Return variables to be used in the next then block
      return postMatchesCount
    })
    .then(function (postMatchesCount) {
      if (postMatchesCount == 0) {
        if (!document.getElementById("detailedView").classList.contains("d-none")) {
          document.getElementById("detailedView").classList.add("d-none")
        }
      } else {
        document.getElementById("post" + (postIndex - 1)).click();
      }
    })
}