const Transcript = require('./Transcript.js'); // Ensure the path is correct

class YouTubeService {
    constructor(fetch) {
      this.fetch = fetch;
    }
  
    async getVideoHtml(videoId) {
      const WATCH_URL = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await this.fetch(WATCH_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    }
  
    extractCaptionsJson(html) {
      const splitHtml = html.split('"captions":');
      if (splitHtml.length <= 1) {
        throw new Error("No captions found.");
      }
      const jsonDataStr = splitHtml[1].split(',"videoDetails')[0].replace('\n', '');
      return JSON.parse(jsonDataStr);
    }
  
    async fetchCaptions(videoId, captionType = 'SRT') {
      const html = await this.getVideoHtml(videoId);
      const captionsJson = this.extractCaptionsJson(html);
      const transcript = new Transcript(
        this.fetch, 
        videoId, 
        `https://www.youtube.com/watch?v=${videoId}`, 
        "English", 
        "en", 
        true, 
        [] // For simplicity, not handling translation languages here
      );
  
      return await transcript.fetchCaptionsFromData(captionsJson, captionType);
    
    }
  }
  
  module.exports = YouTubeService;
  