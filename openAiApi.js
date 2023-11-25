const { default: OpenAI } = require('openai');
const ApiEndpoint = require('./apiEndpoint');

/**
 * OpenAiApi class encapsulates interactions with the OpenAI API.
 */
class OpenAiApi extends ApiEndpoint {
    /**
     * Constructor for the OpenAiApi class.
     * Initializes the OpenAI API client.
     * 
     * @param {string} apiKey - API key for the OpenAI API.
     */
    constructor(apiKey) {
        super(); // Call the constructor of the base class (ApiEndpoint)
        this.openai = new OpenAI(apiKey);
    }

    /**
     * Implements the generateSummary method from ApiEndpoint.
     * 
     * @param {string} prompt - A prompt describing the desired summary.
     * @param {string} transcript - The transcript to be summarized.
     * @returns {Promise<string>} - The summarized text.
     */
    async generateSummary(prompt, transcript) {
        // Use the provided prompt or default to a summarization task
        const completePrompt = prompt || `Summarize the following transcript:\n\n${transcript}`;
        return this.chatCompletion(completePrompt);
    }

    /**
     * Fetches completions from the OpenAI chat API.
     * 
     * @param {string} inputString - The string input for which the completion is sought.
     * @returns {string} - Completed message content.
     */
    async chatCompletion(inputString) {
        const chatResponse = await this.openai.chat.completions.create({
            messages: [{ role: 'user', content: inputString }],
            model: 'gpt-4-1106-preview', // Adjust the model as per requirement
        });
        return chatResponse.choices[0].message.content;
    }

}

module.exports = OpenAiApi;
