const ApiEndpoint = require('./apiEndpoint');

/**
 * TextSummarizationApi class encapsulates interactions with the Hugging Face Falconsai/text_summarization API.
 */
class TextSummarizationApi extends ApiEndpoint {
    /**
     * Constructor for the TextSummarizationApi class.
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
     * @param {string} prompt - A prompt describing the desired summary (unused in this model).
     * @param {string} transcript - The transcript to be summarized.
     * @returns {Promise<string>} - The summarized text.
     */
    async generateSummary(prompt, transcript) {
        const response = await this.queryTextSummarizationModel({ inputs: transcript });
        
        // Since the response is an array, access the first element
        const summary = response[0]?.summary_text; // Use optional chaining in case the array is empty
    
        if (!summary) {
            console.error('No summary returned from the API:', response);
            return 'No summary available.';
        }
    
        return summary;
    }
    

    /**
     * Queries the Falconsai/text_summarization model from the Hugging Face API.
     * 
     * @param {object} data - The data to send in the request.
     * @returns {Promise<object>} - The response from the API.
     */
    async queryTextSummarizationModel(data) {
        const fetch = await this.fetchWrapper();

        const response = await fetch(
            "https://api-inference.huggingface.co/models/Falconsai/text_summarization",
            {
                headers: { Authorization: `Bearer ${this.apiToken}` },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        return await response.json();
    }
}

module.exports = TextSummarizationApi;
