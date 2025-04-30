import sys
import json
from transformers import pipeline

def analyze_sentiment(text):
    try:
        pipe = pipeline("text-classification", model="tabularisai/multilingual-sentiment-analysis")
        
        result = pipe(text)
        
        prediction = result[0]
        label = prediction['label'].lower()
        score = prediction['score']
        
        normalized_score = 0
        if label == 'positive':
            normalized_score = score
        elif label == 'negative':
            normalized_score = -score
        
        # Return the result as a dictionary
        return {
            'label': label,
            'score': normalized_score,
            'confidence': score
        }
    except Exception as e:
        sys.stderr.write(f"Error in sentiment analysis: {str(e)}\n")
        return {
            'label': 'neutral',
            'score': 0,
            'confidence': 0
        }

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print(json.dumps({
                'label': 'neutral',
                'score': 0,
                'confidence': 0
            }))
            sys.exit(1)
        
        text = sys.argv[1]
        
        result = analyze_sentiment(text)
        
        print(json.dumps(result))
        sys.stdout.flush()  # Ensure output is flushed
    except Exception as e:
        sys.stderr.write(f"Unexpected error: {str(e)}\n")
        print(json.dumps({
            'label': 'neutral',
            'score': 0,
            'confidence': 0
        }))
        sys.exit(1)