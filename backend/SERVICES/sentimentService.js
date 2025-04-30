const { spawn } = require('child_process');
const path = require('path');

class SentimentService {
  constructor() {
    this.pythonPath = path.join(__dirname, 'env', 'bin', 'python3');
    
    this.modelScript = path.join(__dirname, 'model.py');
  }

  /**
   * @param {string} text 
   * @returns {Promise<Object>} 
   */
  async analyzeText(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        score: 0,
        comparativeScore: 0,
        sentiment: 'neutral',
        analysisDetails: {
          wordCount: 0,
          confidence: 0
        },
        summary: 'No valid content provided for analysis.'
      };
    }

    try {
      const result = await this._callPythonModel(text);
      
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;
      
      return {
        score: result.score,
        comparativeScore: result.score, 
        sentiment: result.label,
        analysisDetails: {
          wordCount: wordCount,
          confidence: result.confidence,
          model: "tabularisai/multilingual-sentiment-analysis"
        },
        summary: `Analyzed ${wordCount} words. Overall sentiment appears ${result.label} with confidence ${(result.confidence * 100).toFixed(2)}%.`
      };
    } catch (error) {
      return {
        score: 0,
        comparativeScore: 0,
        sentiment: 'neutral',
        analysisDetails: {
          wordCount: 0,
          error: error.message
        },
        summary: `Error analyzing sentiment: ${error.message}`
      };
    }
  }

  /**
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} - Model prediction
   */
  _callPythonModel(text) {
    return new Promise((resolve, reject) => {
      
      const process = spawn(this.pythonPath, [this.modelScript, text]);
      
      let outputData = '';
      let errorData = '';
      
      process.stdout.on('data', (data) => {
        outputData += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        errorData += data.toString();
      });
      
      process.on('error', (err) => {
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
      
      process.on('close', (code) => {
        
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${errorData}`));
          return;
        }
        
        try {
          const trimmedOutput = outputData.trim();
          const result = JSON.parse(trimmedOutput);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error.message}, Output was: ${outputData}`));
        }
      });
    });
  }

  /**
   * @param {Object} article - Article object with title, description and content
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeArticle(article) {
    if (!article || typeof article !== 'object') {
      return this.analyzeText('');
    }
    
    const content = [
      article.title || '',
      article.description || '',
      article.content || ''
    ].join(' . ');

    return this.analyzeText(content);
  }
}

module.exports = new SentimentService();
