/*
    JavaScript File
    Description: Common functions used by all other JavaScript files.
*/

function displayResultMessage(msg, isError = true, show = true, id = "loginResult") {
  document.getElementById(id).innerText = msg;
  if (show) {
    document.getElementById(id).style.display = "block";
  } else {
    document.getElementById(id).style.display = "none";
  }
  if (isError) {
    document.getElementById(id).classList.remove("text-info");
  } else {
    document.getElementById(id).classList.add("text-info");
  }
}

function isValidUsername(username) {
  username = username.trim()
  if (username.length < 5) {
    return "Error: Username too short.";
  }
  if (username.length > 35) {
    return "Error: Username too long."
  }

  // Regular expression pattern for validating a name
  var nameRegex = /^[a-zA-Z\- ]+$/;
  // Test the name against the regular expression pattern
  if (!nameRegex.test(username)) {
    return "Error: Username only alphanumeric characters, hyphens, or spaces.";
  }

  return true;
}

function isValidPersonName(name) {
  // Regular expression pattern for validating a name
  var nameRegex = /^[a-zA-Z\u00C0-\u017F\s'-]+$/;
  // Test the name against the regular expression pattern
  return nameRegex.test(name);
}

function isValidCourseName(courseName) {
  // Regular expression pattern for validating a course name
  var courseNameRegex = /^[a-zA-Z0-9\s-]+$/;

  // Check if the course name is not empty
  if (!courseName.trim()) {
    return false;
  }

  // Check if the course name length is within a reasonable range
  if (courseName.length < 4 || courseName.length > 50) {
    return false;
  }

  // Check if the course name matches the regular expression pattern
  if (!courseNameRegex.test(courseName)) {
    return false;
  }

  // All checks passed, return true
  return true;
}

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function isvalidPrice(price) {
  var regex = /^\d+(\.\d{1,2})?$/; // Regular expression to match a valid price with up to two decimal places
  return regex.test(price);
}

function isValidForumTextInput(text) {
  text = text.trim()

  // Check length
  if (text.length < 10 || text.length > 600) {
    return false;
  }

  // If all checks pass, return true
  return true;

}

function userLogout() {
  firebase.auth().signOut();
  window.location.href = "../index.html";
};

function copyElement(id, newId) {
  // Find the original element by its ID
  var original = document.getElementById(id);

  // Create a copy of the original element
  var copy = original.cloneNode(true);

  // Set the ID of the copy to the new ID
  copy.id = newId;

  // Insert the copy right after the original element
  original.parentNode.insertBefore(copy, original.nextSibling);
  return copy
}


function deleteElementsExcept(containerId, exceptId) {
  var container = document.getElementById(containerId);
  var children = container.children;

  for (var i = 0; i < children.length; i++) {
    var child = children[i];

    // Check if the child matches the exceptId or is a descendant of the exceptId
    if (!isDescendantOrSelfOf(child, exceptId)) {
      container.removeChild(child);
      i--; // Decrement the index as the children collection shrinks
    }
  }
}

function isDescendantOrSelfOf(element, parentId) {
  // Check if the element itself matches the parent ID
  if (element.id === parentId) {
    return true;
  }

  // Recursively check if any ancestor matches the parent ID
  while (element.parentElement) {
    element = element.parentElement;
    if (element.id === parentId) {
      return true;
    }
  }

  return false;
}

function deleteElementsExcept2(containerId, ...exceptIds) {
  var container = document.getElementById(containerId);
  var children = container.children;

  for (var i = 0; i < children.length; i++) {
    var child = children[i];

    // Check if the child matches any of the exceptIds or is a descendant of any exceptId
    if (!matchesAnyDescendant2(child, exceptIds)) {
      container.removeChild(child);
      i--; // Decrement the index as the children collection shrinks
    }
  }
}

function matchesAnyDescendant2(element, ids) {
  // Check if the element itself matches any of the IDs
  if (ids.includes(element.id)) {
    return true;
  }

  // Recursively check if any ancestor matches any of the IDs
  while (element.parentElement) {
    element = element.parentElement;
    if (ids.includes(element.id)) {
      return true;
    }
  }

  return false;
}

function getItemByClass(element, className) {
  // Select the item within the element with the class that matches the string
  return element.querySelector('.' + className);
}

function searchTable(inputID, noresultMsg) {
  var foundAResult = false;
  var input, filter, table, tr, td, i;
  input = document.getElementById(inputID);
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  // Start i at 2 to account for spinners and results msg
  for (i = 2; i < tr.length; i++) {
    for (j = 0; j < tr.length; j++) {
      td = tr[i].getElementsByTagName("td")[j];
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
          foundAResult = true;
          break;
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }

  if (foundAResult) {
    document.getElementById(noresultMsg).classList.add("d-none");
  } else {
    document.getElementById(noresultMsg).classList.remove("d-none");
    document.getElementById(noresultMsg).classList.remove("d-none");
  }
}

function formatTime(originalTimestamp) {

  // Convert the original timestamp string to a Date object
  var date = new Date(originalTimestamp);

  // Extract date components
  var dayOfWeek = date.toLocaleString('en', {
    weekday: 'short'
  }); // Short day name
  var month = date.toLocaleString('en', {
    month: 'short'
  }); // Short month name
  var day = date.getDate(); // Day of the month
  var year = date.getFullYear(); // Year
  var hours = date.getHours(); // Hours
  var minutes = date.getMinutes(); // Minutes

  // Determine AM or PM
  var period = hours < 12 ? 'AM' : 'PM';

  // Convert 24-hour time to 12-hour time
  if (hours > 12) {
    hours -= 12;
  }

  // Format the date in the desired format
  return `${dayOfWeek} ${month} ${day} ${year} ${hours}:${minutes} ${period}`;

}

function sendEmail(mailList, subject, body) {

  var i = 0;
  var adminEmail = "";
  for (i = 0; i < mailList.length; i++) {
    adminEmail += mailList[i] + ";";
  }
  var link =
    "mailto:" + adminEmail +
    "?&subject=" + escape(subject) +
    "&body=" + escape(body);
  window.location.href = link;
}