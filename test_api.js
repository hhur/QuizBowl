// Test the questions API
fetch('http://localhost:3001/api/questions/random?count=2')
  .then(response => response.json())
  .then(data => {
    console.log('API Response:', JSON.stringify(data, null, 2));
    if (data.questions && data.questions.length > 0) {
      console.log('First question text field:', data.questions[0].question);
      console.log('First question category:', data.questions[0].category);
    }
  })
  .catch(error => console.error('Error:', error));