# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by opening a GitHub issue or contacting the maintainers directly.

**Please do not disclose security vulnerabilities publicly until they have been addressed.**

## Security Considerations

### Data Privacy

WhatsApp Wrapped is designed with privacy in mind:

- **Client-side processing**: Chat parsing and analytics happen entirely in your browser
- **No chat storage**: Your WhatsApp export is never uploaded to or stored on any server
- **AI processing**: Chat data is sent to Google Gemini API for insight generation
- **Shared reports**: If you use the share feature, anonymized results are stored temporarily (30 days)

### API Key Security

When self-hosting:

- Never commit API keys to version control
- Use environment variables (`.env.local`)
- The `GEMINI_API_KEY` is exposed to the frontend; this is expected for client-side AI calls
- Consider using server-side API routes for production deployments with high traffic

### Deployment Security

When deploying:

- Use HTTPS in production
- Set appropriate CORS headers
- Consider rate limiting for API endpoints
- Review Vercel KV access controls if using the sharing feature

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Best Practices for Users

1. **Review your chat export** before uploading to ensure you're comfortable with the data
2. **Use "Without media"** option when exporting to minimize file size
3. **Don't share sensitive chats** via the public share link feature
4. **Use your own API key** when self-hosting for better control
