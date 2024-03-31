/*
    JavaScript File
    Description: textbooks.html functionality.
*/

var textbookKeys = [];
var clickedListing = "";
var emails = [];

$(document).ready(function () {

  renderUserTextbooks();
  renderAllTextbooks();


  document.getElementById("newTextbookBtn").addEventListener('click', function (event) {
    event.preventDefault();
    addTextbook();
  });

  $("#saveBtn").click(function () {

    let id = clickedListing; // Get id of clicked listing
    // Parse listing to get key for post to update
    id = parseInt(id.substr(5)); // Upost# --> # = index within array

    let key = textbookKeys[id]; // Key

    // Update textbook info in database
    let utitle = document.getElementById("utitle").value;
    let uauthor = document.getElementById("uauthor").value;
    let uisbn = document.getElementById("uisbn").value;
    let uclass = document.getElementById("uclass").value;
    let uprice = document.getElementById("uprice").value;

    if (utitle == "" || uauthor == "" || uisbn == "" || uprice == "") {
      alert("Please make sure all fields are filled!");
      return;
    } else {
      var textbookRef = firebase
        .database()
        .ref()
        .child("textbooks/" + key);
      textbookRef.update({
        author: uauthor,
        isbn: uisbn,
        title: utitle,
        class: uclass,
        price: uprice
      });
      renderUserTextbooks();
      renderAllTextbooks();

      $("#userDetailModal").modal("toggle");
    }
  });

  $("#deleteBtn").click(function () {
    let id = clickedListing; // Get id of clicked listing
    id = parseInt(id.substr(5)); // Upost# --> # = index within array
    let key = textbookKeys[id]; // Key

    let ask = confirm("Are you sure? This action cannot be undone.");

    if (ask) {
      var textbookRef = firebase
        .database()
        .ref()
        .child("textbooks/" + key);
      textbookRef.remove();
      renderUserTextbooks();
      renderAllTextbooks();
      $("#userDetailModal").modal("toggle");
    } else {
      // Do nothing
    }
  });


  $('#closeEditTextbookModalBtn').click(function () {
    $('#userDetailModal').modal('hide');
  });

  $('#closeContactSellerModalBtn').click(function () {
    $('#contactSellerlModal').modal('hide');
  });

});

// Renders list-group divs into user submitted textbook listings
function renderUserTextbooks() {

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {

      deleteElementsExcept2("userTextbookListings", "userTextbook-0", "noListingsMessage", "collapseAddTextbookFields", "addTextbookBtn")
      let uid = firebase.auth().currentUser.uid;
      let rootRef = firebase.database().ref();
      rootRef
        .child("textbooks")
        .orderByChild("uid")
        .equalTo(uid)
        .on("value", function (snapshot) {

          // Pulls all textbook keys associated with current user account
          if (snapshot.val() != null) {
            textbookKeys = Object.keys(snapshot.val());
            document.getElementById("noListingsMessage").classList.add("d-none");
          } else {

            document.getElementById("noListingsMessage").classList.remove("d-none");
          }
          var idNum = 0;
          snapshot.forEach(function (data) {

            // Render each 
            var newTextbookElement = copyElement("userTextbook-0", "upost" + idNum)
            var newTextbookElementHeader = getItemByClass(newTextbookElement, "card-title")
            newTextbookElementHeader.innerHTML = data.val().title;
            newTextbookElement.classList.remove("d-none");

            // Add click event
            $("#" + newTextbookElement.id).click(function () {
              let utitle = document.getElementById("utitle");
              let uauthor = document.getElementById("uauthor");
              let uisbn = document.getElementById("uisbn");
              let uclass = document.getElementById("uclass");
              let uprice = document.getElementById("uprice");

              clickedListing = newTextbookElement.id;
              console.log(newTextbookElement.id + " clicked");
              utitle.value = data.val().title;
              uauthor.value = data.val().author;
              uisbn.value = data.val().isbn;
              uclass.value = data.val().class;
              uprice.value = data.val().price;

              $("#userDetailModal").modal("show");
            });
            idNum++;
          });
        });
    }
  });
}


// Renders all inputted textbooks
function renderAllTextbooks() {

  deleteElementsExcept2("textbookTableBody", "textbookNoSearchResultsMsg")

  let rootRef = firebase.database().ref();
  rootRef
    .child("textbooks")
    .once("value")
    .then(function (snapshot) {
      var idNum = 0;
      snapshot.forEach(function (data) {

        // render each within userTextbookListings div
        var textbookPost = document.createElement("tr");
        textbookPost.id = "post" + idNum;

        var cover = document.createElement("td");
        var image = document.createElement("img");
        if (data.val().coverURL == "" || data.val().coverURL == null) {
          image.src =
            "http://covers.openlibrary.org/b/isbn/" +
            data.val().isbn.replace(/ /g, "") +
            "-S.jpg";
        } else {
          image.src = data.val().coverURL
        }
        cover.appendChild(image);
        textbookPost.appendChild(cover);

        var title = document.createElement("td");
        title.innerHTML = data.val().title;
        textbookPost.appendChild(title);

        var author = document.createElement("td");
        author.innerHTML = data.val().author;
        textbookPost.appendChild(author);

        var isbn = document.createElement("td");
        isbn.innerHTML = data.val().isbn;
        textbookPost.appendChild(isbn);

        var aclass = document.createElement("td");
        aclass.innerHTML = data.val().class;
        textbookPost.appendChild(aclass);


        var price = document.createElement("td");
        price.innerHTML = "$" + data.val().price;
        textbookPost.appendChild(price);


        document.getElementById("textbookTableBody").appendChild(textbookPost);
        emails.push(data.val().email);

        $("#" + textbookPost.id).click(function () {
          console.log(textbookPost.id + " clicked");

          clickedEmail = emails[textbookPost.id.substring(4)];
          // Disable buttonifowner is viewing
          if (firebase.auth().currentUser.email == data.val().email) {
            $("#contactBtn").prop("disabled", true);
          } else {
            $("#contactBtn").prop("disabled", false);
          }

          document.getElementById("textbookTitle").innerHTML = data.val().title;
          document.getElementById("textbookAuthor").innerHTML =
            "Author: " + data.val().author;
          document.getElementById("textbookISBN").innerHTML =
            "ISBN #: " + data.val().isbn;
          document.getElementById("textbookSeller").innerHTML =
            "Seller Email: " + data.val().email;
          document.getElementById("textbookPrice").innerHTML =
            "Price: $" + data.val().price;
          if (data.val().coverURL == "" || data.val().coverURL == null) {
            document.getElementById("detailCoverImage").src =
              "http://covers.openlibrary.org/b/isbn/" +
              data.val().isbn.replace(/ /g, "") +
              "-M.jpg";
          } else {
            document.getElementById("detailCoverImage").src = data.val().coverURL
          }

          $("#contactSellerlModal").modal("show");
        });
        idNum++;
      });
    });
}

function isValidISBN(isbn) {
  // Remove any hyphens or spaces from the ISBN
  isbn = isbn.replace(/[-\s]/g, '');

  // Regular expression to match ISBN-10 or ISBN-13
  const isbnRegex = /^(?:ISBN(?:-10)?:?\s*)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-\s]){3})[-\s0-9]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-\s]){4})[-\s0-9]{17}$)[0-9]{1,5}[-\s]?[0-9]+[-\s]?[0-9]+[-\s]?[0-9X]$/;

  // Test if the provided ISBN matches the regular expression
  return isbnRegex.test(isbn);
}

async function searchBook(isbn) {
  if (!isValidISBN(isbn)) {
    return Promise.reject('Please enter valid ISBN-10.');
  }

  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.totalItems === 0) {
        return Promise.reject('Book not found. Please enter a valid ISBN-10.');
      } else {
        const book = data.items[0].volumeInfo;
        const title = book.title;
        const authors = book.authors ? book.authors.join(', ') : 'Unknown Author';
        const description = book.description ? book.description : 'No description available';
        const coverURL = book.imageLinks ? book.imageLinks.thumbnail : '';
        return {
          title: title,
          authors: authors,
          description: description,
          coverURL: coverURL
        };
      }
    });
}

/**
 *
 * Adds a new textbook sale post under current user
 * Appends listing to database
 *
 */
function addTextbook() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {

      let uid = firebase.auth().currentUser.uid;
      let email = firebase.auth().currentUser.email;
      let isbn = document.getElementById("addTextbookISBN").value;
      let aclass = document.getElementById("addTextbookClass").value;
      let price = document.getElementById("addTextbookPrice").value;

      let rootRef = firebase.database().ref();
      let storesRef = rootRef.child("textbooks");
      let newStoreRef = storesRef.push();

      if (!isValidCourseName(aclass)) {
        displayResultMessage("Error: Class name is not valid.", isError = true, show = true, id = "addTextbookResult")
        return;
      }
      if (!isvalidPrice(price)) {
        displayResultMessage("Error: Listing price is not valid.", isError = true, show = true, id = "addTextbookResult")
        return;
      }

      displayResultMessage("Processing...", isError = false, show = true, id = "addTextbookResult")


      searchBook(isbn)
        .then(bookInfo => {
          console.log(bookInfo)

          // Store key in case the user wants to edit any posts
          textbookKeys.push(newStoreRef.getKey());

          newStoreRef.set({
            uid: uid,
            email: email,
            author: bookInfo.authors,
            isbn: isbn,
            title: bookInfo.title,
            coverURL: bookInfo.coverURL,
            class: aclass,
            price: price
          },
            function (error) {
              if (error) {
                console.log(error);
              } else {
                displayResultMessage("Succesfully listed your textbook on the marketplace!", isError = false, show = true, id = "addTextbookResult")
                // Render new textbook listing
                renderUserTextbooks();
                renderAllTextbooks();
              }
            }
          );

        })
        .catch(error => {
          displayResultMessage(error, isError = true, show = true, id = "addTextbookResult")
          return;
        });
    }
  });
}


function sendEmail() {
  var link =
    "mailto:" +
    clickedEmail +
    "?" +
    "&subject=" +
    escape("Interest in Your Item") +
    "&body=" +
    escape(
      "Hi!\n\nI am interested in your listing for sale! If it is still available, let me know!\n\nThanks!"
    );
  window.location.href = link;
}