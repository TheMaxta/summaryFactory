// const fetch = require("node-fetch"); // Uncomment this line if you're not using ES6 imports
require("dotenv").config();
const API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

async function query(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
        {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

query({
    inputs: {
        "prompt": "The history of the internet dates back significantly further than that of the World consume media, to the manner in which we communicate and participate in civic life.",
        "max_length": 500, // You can adjust this for longer or shorter responses
        "temperature": 0.7, // Adjust for more or less randomness
        "top_k": 50, // Control for diversity
        "top_p": 1.0, // Nucleus sampling
        "seed": 42, // For reproducibility, optional
    }
}).then((response) => {
    console.log(JSON.stringify(response));
});
