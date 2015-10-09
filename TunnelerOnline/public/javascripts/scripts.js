window.addEventListener('load', init, false);

function init() {
  console.log('Main script initialized.');
}

function messageIn(message) {
  var parsedData = JSON.parse(message.data);
}