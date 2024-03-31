/*
    JavaScript File
    Description: classes.html functionality.
*/

var classKeys = [];
var clickedListing = "";
var allClassKeys = [];
var allClassNames = [];

$(document).ready(function () {
  renderModeratedClasses();
  renderAllClasses();
  renderSubscriptions();

  // Event Listeners
  document.getElementById("newClassBtn").addEventListener("click", addClass);
  document.getElementById("searchClassBtn").addEventListener("click", searchClass);
  document.getElementById("unsubscribeButton").addEventListener('click', function (event) {
    event.preventDefault();
    subscribeClass(false);
  });
  document.getElementById("subscribeButton").addEventListener('click', function (event) {
    event.preventDefault();
    subscribeClass(true);
  });

  document.getElementById("addBtn").addEventListener('click', function (event) {
    event.preventDefault();
    $("#addClassModal").modal("show");
  });

  document.getElementById("closeAddClassModalBtn").addEventListener('click', function (event) {
    event.preventDefault();
    $('#addClassModal').modal('hide');

  });

  $('#closeSubscriptionModalBtn').click(function () {
    $('#subscriptionModal').modal('hide');
  });

  $('#closeEditClassModalBtn').click(function () {
    $('#editClassModal').modal('hide');
  });

  $("#editClassConfirmBtn").click(function () {
    editClass();
  });
});

function editClass() {
  let id = clickedListing; // get id of clicked listing

  // Parse listing to get key for post to update
  id = parseInt(id.substr(5)); // upost# --> # = index within array

  let key = classKeys[id]; // KEY

  // Update class info in database
  let utitle = document.getElementById("utitle").value;
  let uinstructor = document.getElementById("uinstructor").value;

  if (!isValidCourseName(utitle)) {
    displayResultMessage("Course title is invalid.", isError = true, show = true, "editClassResult");
    return;
  }
  if (!isValidPersonName(uinstructor)) {
    displayResultMessage("Instructor name is invalid.", isError = true, show = true, "editClassResult");
    return;
  }

  var classesRef = firebase
    .database()
    .ref()
    .child("classes/" + key);
  classesRef.update({
    title: utitle,
    instructor: uinstructor,
  });

  renderModeratedClasses();
  renderAllClasses();

  $("#editClassModal").modal("toggle");

}

function isUserSubscribed(uid, key, rootRef) {
  return rootRef
    .child("subscriptions")
    .orderByChild("uid")
    .equalTo(uid)
    .once("value")
    .then(function (snapshot) {
      let result = false;
      snapshot.forEach(function (data) {
        if (data.val().classid === key) {
          result = true;
        }
      });
      return result;
    });
}

function getClickedListingID() {
  // parse listing to get key for post to update
  return parseInt(clickedListing.substr(7)); // upost# --> # = index within array
}


function getClickedListingKey(id) {
  return allClassKeys[id];
}


// Renders list-group divs into user submitted class listings
function renderModeratedClasses() {
  // Read data in from Firebase and render
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {

      deleteElementsExcept("userClassListings", "classModerate-0")

      let uid = firebase.auth().currentUser.uid;
      let rootRef = firebase.database().ref();
      rootRef
        .child("classes")
        .orderByChild("uid")
        .equalTo(uid)
        .on("value", function (snapshot) {

          if (snapshot.val() != null) classKeys = Object.keys(snapshot.val());
          var idNum = 0;
          snapshot.forEach(function (data) {

            // Render each within div

            var newModerationElement = copyElement("classModerate-0", "upost" + idNum)
            var newModerationHeader = getItemByClass(newModerationElement, "card-title")
            newModerationHeader.innerHTML = data.val().title;
            newModerationElement.classList.remove("d-none");

            // Add click event
            $("#" + newModerationElement.id).click(function () {
              clickedListing = newModerationElement.id;
              console.log(newModerationElement.id + " clicked");
              utitle.value = data.val().title;
              uinstructor.value = data.val().instructor;

              $("#editClassModal").modal("show");
            });
            idNum++;
          });
        });
    }
  });
}

function setSubscriptionModalCheck(isSusbscribed) {
  if (isSusbscribed) {
    document.getElementById("subscribeButton").checked = true;
    document.getElementById("unsubscribeButton").checked = false;
  } else {
    document.getElementById("subscribeButton").checked = false;
    document.getElementById("unsubscribeButton").checked = true;
  }
}

function openSubscriptionModal() {
  let id = getClickedListingID();
  let key = getClickedListingKey(id)

  // Check if already defined subscription
  var uid = firebase.auth().currentUser.uid;
  var rootRef = firebase.database().ref();
  isUserSubscribed(uid, key, rootRef).then(function (isSusbscribed) {
    document.getElementById("subscriptionModalTitle").innerText = allClassNames[id] + " Subscription"

    setSubscriptionModalCheck(isSusbscribed)
    $("#subscriptionModal").modal("show");
  })
}

// Renders all inputted classes
function renderAllClasses() {
  let body = document.getElementById("classTableBody");
  // Clear body
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  let rootRef = firebase.database().ref();
  rootRef.child("classes").on("value", function (snapshot) {
    idNumAll = 0;
    allClassKeys = Object.keys(snapshot.val());
    snapshot.forEach(function (data) {
      // Render each within div
      var classPost = document.createElement("tr");

      var title = document.createElement("td");
      title.innerHTML = data.val().title;

      var department = document.createElement("td");
      department.innerHTML = data.val().department;

      var instructor = document.createElement("td");
      instructor.innerHTML = data.val().instructor;

      var school = document.createElement("td");
      school.innerHTML = data.val().school;

      classPost.appendChild(title);
      classPost.appendChild(department);
      classPost.appendChild(instructor);
      classPost.appendChild(school);
      classPost.id = "allpost" + idNumAll;

      body.appendChild(classPost);

      // Add click event
      $("#" + classPost.id).click(function () {
        clickedListing = classPost.id;
        openSubscriptionModal(clickedListing)
      });

      idNumAll++;
      allClassNames.push(data.val().title);
    });
  });
}

/**
 *
 * Adds a new class
 */
function addClass() {

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      let ownerID = firebase.auth().currentUser.uid;
      let department = document.getElementById("department").value;
      let email = document.getElementById("email").value;
      let title = document.getElementById("title").value;
      let school = document.getElementById("school").value;
      let instructor = document.getElementById("instructor").value;

      if (!isValidEmail(email)) {
        displayResultMessage("Instructor email is invalid", isError = true, show = true, "addClassResult")
        return
      }
      if (!isValidCourseName(title)) {
        displayResultMessage("Course title is invalid", isError = true, show = true, "addClassResult")
        return;
      }
      if (!isValidPersonName(instructor)) {
        displayResultMessage("Instructor name is invalid", isError = true, show = true, "addClassResult")
        return
      }
      if (school.includes("Select a School") || department.includes("Select a School First")) {
        displayResultMessage("A school and deparment must be selected", isError = true, show = true, "addClassResult")
        return
      }

      displayResultMessage("", isError = true, show = false, "addClassResult")

      let rootRef = firebase.database().ref();
      let classesRef = rootRef.child("classes");
      let newClassesRef = classesRef.push();
      newClassesRef.set({
        uid: ownerID,
        department: department,
        email: firebase.auth().currentUser.email,
        title: title,
        instructor: instructor,
        school: school,
        posts: {},
        Moderators: {
          "1": email,
          "2": firebase.auth().currentUser.email,
        },
      },
        function (error) {
          if (error) {
            console.log(error);
          } else {
            console.log("User input Success");
            // Render new class listing
            renderModeratedClasses();
            renderAllClasses();
          }
        }
      );

      // Close modal
      $("#addClassModal").modal("toggle");
    }
  });
}

/**
 *
 * Subscribes to a new class
 */
function subscribeClass(val) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      let id = getClickedListingID();
      let key = getClickedListingKey(id)

      // Check if already defined subscription
      var uid = firebase.auth().currentUser.uid;

      var rootRef = firebase.database().ref();
      isUserSubscribed(uid, key, rootRef).then(function (isSusbscribed) {
        if ((!isSusbscribed && !val) || (isSusbscribed && val)) {
          // If user is not subscribed and they clicked on unsubscribe
          // Or if user is subscribed and they clicked on subscribe
          // Do nothing 
        } else if (!isSusbscribed && val) {
          let subscriptionsRef = rootRef.child("subscriptions");
          let newSubscriptionsRef = subscriptionsRef.push();
          newSubscriptionsRef.set({
            uid: uid,
            classid: key,
            subscription: val,
            classname: allClassNames[id]
          },
            function (error) {
              if (error) {
                console.log(error);
              } else {
                console.log("User input Success");
                // Render new class listing
                renderSubscriptions();
                setSubscriptionModalCheck(true);
              }
            }
          );
        } else {
          var foundSub,
            index = 0;
          rootRef
            .child("subscriptions")
            .orderByChild("uid")
            .equalTo(uid)
            .on("value", function (snapshot) {
              snapshot.forEach(function (data) {
                if (data.val().classid == key) {
                  foundSub = Object.keys(snapshot.val())[index];
                }
                index++;
              });
            });
          let removeSubscriptionsRef = firebase
            .database()
            .ref()
            .child("subscriptions/" + foundSub);
          removeSubscriptionsRef.remove()
            .catch(function (error) {
              console.log(error);
            })
            .then(function () {
              console.log("User input Success");
              // Render new class listing
              renderSubscriptions();
              setSubscriptionModalCheck(false);
            });
        }
      })
    }
  });
  renderSubscriptions();
}


function renderSubscriptions() {
  // Read data in from Firebase and render
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      deleteElementsExcept("yourSubscriptionClasses", "classSubscribed-0")


      let uid = firebase.auth().currentUser.uid;
      let rootRef = firebase.database().ref();
      rootRef
        .child("subscriptions")
        .orderByChild("uid")
        .equalTo(uid)
        .on("value", function (snapshot) {
          let i = 0;
          snapshot.forEach(function (data) {

            var newSubsciptionElement = copyElement("classSubscribed-0", i)
            var newSubsciptionElementHeader = getItemByClass(newSubsciptionElement, "card-title")
            newSubsciptionElementHeader.innerHTML = data.val().classname;
            newSubsciptionElement.classList.remove("d-none");

            // Jquery click event to unique class posts page
            var posts = function () {
              document.cookie = "currentClassKey=" + data.val().classid;
              document.cookie = "currentClass=" + data.val().classname;
              window.location.href = "../html/forum.html";
            }
            document.getElementById(i).addEventListener("click", posts);

            i++;
          });
          if (i == 0) {
            document.getElementById("classSubscribed-0").classList.remove("d-none")
            document.getElementById("classSubscribed-0").classList.remove("d-none")
          } else {
            document.getElementById("classSubscribed-0").classList.add("d-none")
          }
        })

    }
  });
}


/**
 * Sorts table on header click. Resorts asc/dec on each click
 * Adapted from: w3schools.com/howto/tryit.asp?filename=tryhow_js_sort_table_desc
 */
function sortTable(n) {
  var table,
    rows,
    switching,
    i,
    x,
    y,
    shouldSwitch,
    dir,
    switchcount = 0;
  table = document.getElementById("myTable");
  switching = true;
  // Set the sorting direction to ascending:
  dir = "asc";
  // Make a loop that will continue until no switching has been done:
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    // Loop through all table rows (except the first, which contains table headers):
    for (i = 1; i < rows.length - 1; i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      // Get the two elements you want to compare, one from current row and one from the next:
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      // Check if the two rows should switch place, based on the direction, asc or desc:
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      // If a switch has been marked, make the switch and mark that a switch has been done:
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      // Each time a switch is done, increase this count by 1:
      switchcount++;
    } else {
      // If no switching has been done AND the direction is "asc", set the direction to "desc" and run the while loop again.
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

/*
 * Search when typing all rows for input
 * Adapted from: w3schools.com/howto/tryit.asp?filename=tryhow_js_filter_table
 */
function searchClass() {
  var input, filter, table, tr, td, i;
  input = document.getElementById("searchClassQuery");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    for (j = 0; j < tr.length; j++) {
      td = tr[i].getElementsByTagName("td")[j];
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
          break;
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }
}

function populateDepartments() {
  var schoolSelect = document.getElementById("school");
  var departmentSelect = document.getElementById("department");
  departmentSelect.innerHTML = ""; // Clear previous options

  var schoolValue = schoolSelect.value;

  if (schoolValue === "Engineering") {
    addDepartments([
      "Mechanical Engineering",
      "Electrical Engineering",
      "Computer Science",
      "Biomedical Engineering",
      "Civil Engineering",
      "Chemical Engineering",
      "Biomedical Engineering",
      "Materials Science"
      // Add more departments as needed
    ]);
  } else if (schoolValue === "Business") {
    addDepartments([
      "Finance",
      "Marketing",
      "Accounting",
      "Management",
      "Supply Chain Management",
      "Business Analytics",
      "Information Systems"
      // Add more departments as needed
    ]);
  } else if (schoolValue === "Arts and Sciences") {
    addDepartments([
      "History",
      "Biology",
      "Psychology",
      "English",
      "Chemistry",
      "Political Science",
      "Mathematics",
      "Economics",
      "Sociology",
      "Physics"
      // Add more departments as needed
    ]);
  } else if (schoolValue === "Arts and Architecture") {
    addDepartments([
      "Architecture",
      "Fine Arts",
      "Interior Design",
      "Graphic Design",
      "Urban Planning",
      "Art History",
      "Industrial Design",
      "Photography",
      "Fashion Design"
      // Add more departments as needed
    ]);
  }
}

function addDepartments(departments) {
  var departmentSelect = document.getElementById("department");
  departments.forEach(function (department) {
    var option = document.createElement("option");
    option.text = department;
    departmentSelect.add(option);
  });
}