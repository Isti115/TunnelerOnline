window.addEventListener('load', index_init, false);

function index_init() {
  var message = localStorage.getItem('message');
  if (message !== null) {
    document.getElementById('message').innerHTML = 'Message: ' + message;
    localStorage.removeItem('message');
  }
  
  console.log('Index initialized.');
}
