// Get elements
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const profilePic = document.getElementById('profile-pic');
const closeModal = document.getElementById('close-modal');

// Open modal on profile picture click
profilePic.onclick = function() {
  modal.style.display = "block"; // Show the modal
  modalImg.src = profilePic.src; // Set the modal image to the clicked profile image
}

// Close modal on click of close button
closeModal.onclick = function() {
  modal.style.display = "none"; // Hide the modal
}

// Close modal if clicked anywhere outside the image
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
