const ApiEndpoint = require('./apiEndpoint');

/**
 * PegasusApi class encapsulates interactions with the Hugging Face Pegasus XSum API.
 */
class PegasusApi extends ApiEndpoint {
    /**
     * Constructor for the PegasusApi class.
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
     * Implements the generateSummary method from ApiEndpoint.
     * 
     * @param {string} prompt - A prompt describing the desired summary (unused in Pegasus).
     * @param {string} transcript - The transcript to be summarized.
     * @returns {Promise<string>} - The summarized text.
     */
    async generateSummary(prompt, transcript) {
        const response = await this.queryPegasusModel({ inputs: transcript });
        return response[0].summary_text;
    }

    /**
     * Queries the Pegasus XSum model from the Hugging Face API.
     * 
     * @param {object} data - The data to send in the request.
     * @returns {Promise<object>} - The response from the API.
     */
    async queryPegasusModel(data) {
        const fetch = await this.fetchWrapper();

        const response = await fetch(
            "https://api-inference.huggingface.co/models/google/pegasus-xsum",
            {
                headers: { Authorization: `Bearer ${this.apiToken}` },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        return await response.json();
    }
}

module.exports = PegasusApi;
