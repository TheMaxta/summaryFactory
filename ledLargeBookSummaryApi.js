const ApiEndpoint = require('./apiEndpoint');

/**
 * LedLargeBookSummaryApi class encapsulates interactions with the Hugging Face LED Large Book Summary API.
 */
class LedLargeBookSummaryApi extends ApiEndpoint {
    /**
     * Constructor for the LedLargeBookSummaryApi class.
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
     * Generates a summary using the LED Large Book Summary model from Hugging Face API.
     * 
     * @param {string} transcript - The transcript to be summarized.
     * @returns {Promise<string>} - The summarized text.
     */
    async generateSummary(transcript) {
        const response = await this.queryLedLargeBookSummaryModel({ inputs: transcript });
        
        // Adjust the following line according to the actual response structure
        // Assuming the response is an array with a summary_text property like before
        return response[0]?.summary_text;
    }

    /**
     * Queries the LED Large Book Summary model from the Hugging Face API.
     * 
     * @param {object} data - The data to send in the request.
     * @returns {Promise<object>} - The response from the API.
     */
    async queryLedLargeBookSummaryModel(data) {
        const fetch = await this.fetchWrapper();

        const response = await fetch(
            "https://api-inference.huggingface.co/models/pszemraj/led-large-book-summary",
            {
                headers: { Authorization: `Bearer ${this.apiToken}` },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        
        if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }
}

module.exports = LedLargeBookSummaryApi;
