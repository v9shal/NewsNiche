
// Positive and negative word lists for sentiment analysis
const positiveWords = [
    'good', 'great', 'excellent', 'positive', 'amazing', 'wonderful', 'fantastic',
    'beneficial', 'success', 'successful', 'win', 'winning', 'achievement', 'improve',
    'improvement', 'improved', 'increase', 'increased', 'gain', 'progress', 'innovation',
    'innovative', 'breakthrough', 'advance', 'advantage', 'profit', 'profitable',
    'solution', 'solved', 'resolve', 'resolved', 'effective', 'efficient', 'best',
    'better', 'celebrate', 'celebrated', 'achievement', 'opportunity', 'opportunities',
    'support', 'supported', 'supporting', 'hope', 'hopeful', 'optimistic', 'optimism',
    'joy', 'happy', 'happiness', 'pleased', 'pleasure', 'delight', 'delighted',
    'impressive', 'impressed', 'excited', 'exciting', 'thrilled', 'boost', 'boosted'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'negative', 'poor', 'disaster', 'unfortunate',
    'fail', 'failed', 'failure', 'lose', 'losing', 'lost', 'loss', 'decline',
    'declined', 'decrease', 'decreased', 'damage', 'damaged', 'problem', 'problematic',
    'crisis', 'critical', 'danger', 'dangerous', 'threat', 'threatening', 'threatened',
    'struggle', 'struggling', 'difficult', 'difficulty', 'challenge', 'challenging',
    'concern', 'concerned', 'concerning', 'worry', 'worried', 'worrying', 'fear',
    'feared', 'fearful', 'panic', 'alarming', 'alarm', 'trouble', 'troubled',
    'troubling', 'disappointment', 'disappointed', 'disappointing', 'setback',
    'risk', 'risky', 'warning', 'warned', 'controversy', 'controversial', 'conflict',
    'dispute', 'disputed', 'cut', 'cuts', 'cutting', 'violence', 'violent'
  ];
  
  // Words that negate sentiment
  const negationWords = [
    'not', 'no', 'never', 'cannot', "can't", "won't", "don't", 'without',
    'lack', 'lacking', 'fails to', 'absence of', 'free of'
  ];
  
  class SentimentService {
    /**
     * Analyze text to determine sentiment
     * @param {string} text - The text to analyze
     * @returns {Object} - Sentiment analysis result
     */
    analyzeText(text) {
      if (!text) {
        return {
          score: 0,
          sentimenhomet: 'neutral',
          positiveWords: [],
          negativeWords: [],
          summary: 'No content to analyze'
        };
      }
  
      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      let positiveCount = 0;
      let negativeCount = 0;
      const foundPositiveWords = [];
      const foundNegativeWords = [];
      
      // Simple negation handling
      let isNegated = false;
  
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Check if this is a negation word
        if (negationWords.includes(word)) {
          isNegated = true;
          continue;
        }
  
        // Check positive words
        if (positiveWords.includes(word)) {
          if (isNegated) {
            negativeCount++;
            foundNegativeWords.push(word + ' (negated)');
          } else {
            positiveCount++;
            foundPositiveWords.push(word);
          }
          isNegated = false;
          continue;
        }
  
        // Check negative words
        if (negativeWords.includes(word)) {
          if (isNegated) {
            positiveCount++;
            foundPositiveWords.push(word + ' (negated)');
          } else {
            negativeCount++;
            foundNegativeWords.push(word);
          }
          isNegated = false;
          continue;
        }
  
        // Reset negation after 3 words if not used
        if (i - words.indexOf(word) >= 3) {
          isNegated = false;
        }
      }
  
      // Calculate score between -1 and 1
      const totalSentimentWords = positiveCount + negativeCount;
      let score = 0;
      
      if (totalSentimentWords > 0) {
        score = (positiveCount - negativeCount) / totalSentimentWords;
      }
  
      // Determine sentiment category
      let sentiment;
      if (score > 0.25) sentiment = 'positive';
      else if (score < -0.25) sentiment = 'negative';
      else sentiment = 'neutral';
  
      // Prepare summary statement
      let summary;
      if (sentiment === 'positive') {
        summary = 'This content appears positive in tone';
      } else if (sentiment === 'negative') {
        summary = 'This content appears negative in tone';
      } else {
        summary = 'This content appears neutral in tone';
      }
      
      // Add detail if we found specific sentiment words
      if (foundPositiveWords.length > 0 || foundNegativeWords.length > 0) {
        summary += `, with ${foundPositiveWords.length} positive and ${foundNegativeWords.length} negative indicators`;
      }
  
      return {
        score: parseFloat(score.toFixed(2)),
        sentiment,
        positiveWords: foundPositiveWords,
        negativeWords: foundNegativeWords,
        summary
      };
    }
  
    /**
     * Analyze a news article to determine its sentiment
     * @param {Object} article - The article to analyze
     * @returns {Object} - Sentiment analysis result
     */
    analyzeArticle(article) {
      // Combine title and description for analysis
      const content = [
        article.title || '',
        article.description || ''
      ].join(' ');
      
      return this.analyzeText(content);
    }
  }
  
  module.exports = new SentimentService();