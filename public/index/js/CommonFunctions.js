function signUpResultMessage(msg, isError = true, show = true, id = "loginResult"){
    document.getElementById(id).innerText = msg;
    if (show){
      document.getElementById(id).style.display = "block";
    }
    else{
      document.getElementById(id).style.display = "none";
    }
    if (isError){
      document.getElementById(id).classList.remove("text-info"); 
    }
    else{
      document.getElementById(id).classList.add("text-info"); 
    }
  }

  function isValidUsername(username = ""){
    if (username.length < 5 || username.length > 15 ) {
        return false
    }

    // If the username contains only alphanumeric characters, underscores, or hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return false;
    }

    return true;
  }

  function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
  