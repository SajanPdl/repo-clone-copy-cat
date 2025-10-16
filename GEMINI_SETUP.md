# Gemini AI Integration Setup

This application now uses Google Gemini instead of OpenAI for all AI-powered features including:
- Study Assistant
- ChatBot
- AI-powered study help

## Setup Instructions

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. Configure Environment Variables

#### For Supabase Functions (Production)
Add the following environment variable to your Supabase project:

```bash
# In Supabase Dashboard > Settings > Edge Functions > Environment Variables
GEMINI_API_KEY=your_gemini_api_key_here
```

#### For Local Development
Create a `.env.local` file in your project root:

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Deploy the Updated Function

The `chat-with-ai` function has been updated to use Gemini. Deploy it to Supabase:

```bash
npx supabase functions deploy chat-with-ai
```

### 4. Features Now Powered by Gemini

- **Study Assistant**: Interactive AI tutor with multiple modes (chat, explain, quiz, flashcards)
- **ChatBot**: Floating chat widget for instant study help
- **AI Study Help**: Context-aware educational assistance

### 5. Model Information

- **Model**: `gemini-1.5-flash`
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
- **Features**: OpenAI-compatible API for easy migration

### 6. Benefits of Gemini

- Cost-effective alternative to OpenAI
- Fast response times
- High-quality educational responses
- Google's advanced AI capabilities
- Seamless integration with existing codebase

## Troubleshooting

If you encounter issues:

1. **API Key Issues**: Ensure your Gemini API key is correctly set in environment variables
2. **Rate Limits**: Check your Gemini API quota in Google AI Studio
3. **Function Deployment**: Verify the `chat-with-ai` function is deployed with the latest code
4. **Network Issues**: Ensure your Supabase project can access Google's API endpoints

## Migration Notes

- All existing functionality remains the same
- UI has been updated to reflect Gemini branding
- API calls now use Gemini's OpenAI-compatible endpoint
- No changes needed to frontend components beyond branding updates

