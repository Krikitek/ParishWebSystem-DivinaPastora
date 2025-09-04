const response = await fetch("gcash.php", {
  method: "POST",
});
const data = await response.json();

if (data.data && data.data.attributes.next_action) {
  window.location.href = data.data.attributes.next_action.redirect.url;
} else {
  alert("Error creating payment!");
}
