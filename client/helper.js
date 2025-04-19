const handleError = (message) => {
  const errorElement = document.getElementById('errorMessage');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show'); 
    errorElement.classList.remove('hidden');
  }
};

const hideError = () => {
  const errorElement = document.getElementById('errorMessage');
  if (errorElement) {
    errorElement.classList.remove('show'); 
    errorElement.classList.add('hidden');
    errorElement.textContent = ''; 
  }
};


const sendPost = async (url, data, handler) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  hideError();

  if (result.redirect) {
    window.location = result.redirect;
  }

  if (result.error) {
    handleError(result.error);
  }

  if (handler) {
    handler(result);
  }
};

module.exports = {
  handleError,
  sendPost,
  hideError,
};
