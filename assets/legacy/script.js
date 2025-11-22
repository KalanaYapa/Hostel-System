
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const studentId = document.getElementById('studentId').value;
    const password = document.getElementById('password').value;
    

    if (studentId.trim() === '' || password.trim() === '') {
        alert('Please fill in all fields');
        return;
    }
    
    console.log('Student ID:', studentId);
    console.log('Password:', password);
    
    alert('Login successful! Welcome, ' + studentId);

});

const inputs = document.querySelectorAll('input');

inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
        this.parentElement.style.transition = 'transform 0.2s';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});