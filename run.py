
from flask import Flask, request, jsonify
from llama_index.core.llms import ChatMessage
from llama_index.llms.gemini import Gemini
from llama_index.multi_modal_llms.gemini import GeminiMultiModal
from llama_index.embeddings.gemini import GeminiEmbedding
import os

app = Flask(__name__)

# Initialize the LLM components
llm = Gemini(model_name="models/gemini-1.5-pro-latest", api_key="AIzaSyAPO8LmtX0hfpnsRYARR9hG7l7bXXohD9g")
# embedding = GeminiEmbedding(model_name="models/text-embedding-004", api_key="your-api-key")
# mm_llm = GeminiMultiModal(model_name="models/gemini-1.5-pro-latest", api_key="your-api-key")

def generate_test_scenarios(url, selected_elements, screenshot_available):
    role = "You are a Software Test Consultant with expertise in web application testing"
    prompt = f"""Generate test ideas based on the selected elements of the webpage. 
    Focus on user-oriented tests that cover functionality, usability, and potential edge cases. 
    Include both positive and negative test scenarios. Consider the element types and their potential interactions.

    Page URL: {url}
    
    Selected Elements:
    {selected_elements}
    
    Screenshot: {"Available" if screenshot_available else "Not available"}

    Please provide a mix of positive and negative test scenarios, considering the interactions between the selected elements.
    Format the output as a numbered list of test scenarios.

    Format the output as the following example:
    Positive Tests:
    - <Idea 1>
    - <Idea 2>

    Negative Tests:
    - <Idea 1>
    - <Idea 2>

    Edge Cases and Usability Tests:
    - <Idea 1>
    - <Idea 2>
    """
    
    messages = [ChatMessage(role="system", content=role),
                ChatMessage(role="user", content=prompt)]
    
    response = llm.chat(messages)
    return response.message.content

@app.route('/generate_scenarios', methods=['POST'])
def generate_scenarios():
    data = request.get_json()
    elements = data.get('elements', [])
    url = data.get('url', '')

    print(f"Received elements: {elements}")
    print(f"Received URL: {url}")
    
    if elements:
        # Generate test scenarios using the selected elements
        test_scenarios = generate_test_scenarios(url, elements, screenshot_available=False)
        return jsonify({"scenarios": test_scenarios})
    return jsonify({"error": "No elements provided"}), 400

if __name__ == '__main__':
    app.run(debug=True)
