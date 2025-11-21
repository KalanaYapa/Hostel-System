const form = document.getElementById("form");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    let id = document.getElementById("studentId").value;
    let name = document.getElementById("fullName").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let pass = document.getElementById("password").value;
    let confirm = document.getElementById("confirmPassword").value;

    if (id === "" || name === "" || email === "" || phone === "" || pass === "" || confirm === "") {
        alert("Please fill all fields");
        return;
    }

    if (pass !== confirm) {
        alert("Passwords do not match");
        return;
    }

    alert("Registration Successful!");
    form.reset();
});
