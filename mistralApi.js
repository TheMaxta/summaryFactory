const ApiEndpoint = require('./apiEndpoint');

/**
 * MistralApi class encapsulates interactions with the Hugging Face Mistral-7B-v0.1 API.
 */
class MistralApi extends ApiEndpoint {
    /**
     * Constructor for the MistralApi class.
     * Initializes the API token.
     * 
     * @param {string} apiToken - API token for the Hugging Face API.
     */
    constructor(apiToken) {
        super();
        this.apiToken = apiToken;
    }

    /**
     * Fetch wrapper to dynamically import the 'node-fetch' module.
     * This method ensures compatibility with ES Modules.
     * 
     * @returns {function} - The fetch function from 'node-fetch'.
     */
    async fetchWrapper() {
        if (!this.fetch) {
            const { default: fetch } = await import('node-fetch');
            this.fetch = fetch;
        }
        return this.fetch;
    }

    /**
     * Implements a method to interact with the Mistral-7B-v0.1 model.
     * 
     * @param {string} prompt - The prompt to send to the model.
     * @returns {Promise<string>} - The response from the model.
     */
    async generateText(prompt) {
        const response = await this.queryMistralModel({ inputs: prompt });
        return response.generated_text;  // Adjust according to the actual response structure
    }

    /**
     * Queries the Mistral-7B-v0.1 model from the Hugging Face API.
     * 
     * @param {object} data - The data to send in the request.
     * @returns {Promise<object>} - The response from the API.
     */
    async queryMistralModel(data) {
        const fetch = await this.fetchWrapper();

        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1",
            {
                headers: { Authorization: `Bearer ${this.apiToken}` },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        return await response.json();
    }
}

module.exports = MistralApi;
