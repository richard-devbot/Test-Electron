// Wait until DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
  const webview = document.querySelector('#webview');
  const generateScenarioBtn = document.getElementById('generateScenarioBtn');
  const elementsOutput = document.getElementById('elementsOutput');
  const scenariosOutput = document.getElementById('scenariosOutput');
  
  let selectedElements = [];

  // Inject code into the webview to handle element selection
  webview.addEventListener('dom-ready', () => {
    webview.executeJavaScript(`
      var selectedElements = JSON.parse(localStorage.getItem('selectedElements')) || [];
      document.body.addEventListener('click', function(event) {
        event.preventDefault();
        var element = event.target;
        var elementInfo = {
          tag: element.tagName,
          id: element.id,
          class: element.className,
          text: element.textContent.trim().substring(0, 50)
        };
        var index = selectedElements.findIndex(e => e.id === elementInfo.id && e.tag === elementInfo.tag);
        if (index > -1) {
          element.style.border = '';  // Deselect
          selectedElements.splice(index, 1);
        } else {
          element.style.border = '2px solid red';  // Select and highlight
          selectedElements.push(elementInfo);
        }
        localStorage.setItem('selectedElements', JSON.stringify(selectedElements));  // Store in localStorage
      }, true);
    `);
  });

  // Generate test scenarios when the button is clicked
  generateScenarioBtn.addEventListener('click', () => {
    webview.executeJavaScript('localStorage.getItem("selectedElements");', (result) => {
      selectedElements = JSON.parse(result) || [];

      if (selectedElements.length === 0) {
        alert('No elements selected.');
        return;
      }

      // Display the selected elements as JSON
      elementsOutput.textContent = JSON.stringify(selectedElements, null, 2);

      // Get the current URL from the webview
      const url = webview.getURL();

      // Send selected elements and URL to Flask backend
      fetch('http://127.0.0.1:5000/generate_scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elements: selectedElements,
          url: url
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.scenarios) {
          // Display generated test scenarios
          scenariosOutput.textContent = JSON.stringify(data.scenarios, null, 2);
        } else {
          scenariosOutput.textContent = 'No scenarios generated or an error occurred.';
        }
      })
      .catch(error => {
        console.error('Error generating scenarios:', error);
        scenariosOutput.textContent = 'Error generating scenarios.';
      });
    });
  });
});