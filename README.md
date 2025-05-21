# DJ Portfolio Website

A modern, responsive DJ portfolio website built with HTML, CSS, and JavaScript. Designed to be hosted on Cloudflare Pages.

## Features

- Responsive design that works on all devices
- Dark theme with red and neon accents
- Smooth scrolling and animations
- Mobile-friendly navigation
- Contact form integration with Formspree
- Image lazy loading
- SEO optimized
- Cross-browser compatible

## Project Structure

```
dj-portfolio/
├── index.html              # Main HTML file
├── assets/
│   ├── css/
│   │   ├── style.css      # Main styles
│   │   └── responsive.css # Responsive styles
│   ├── js/
│   │   └── main.js       # JavaScript functionality
│   ├── images/           # Image assets
│   └── fonts/           # Custom fonts (if any)
└── README.md            # Project documentation
```

## Setup Instructions

1. Clone the repository
2. Replace placeholder content in index.html with your personal content
3. Update the Formspree endpoint in the contact form
4. Add your own images to the assets/images directory
5. Deploy to Cloudflare Pages

## Deployment

This website is designed to be deployed on Cloudflare Pages:

1. Push your code to a GitHub repository
2. Log in to your Cloudflare dashboard
3. Go to Pages > Create a project
4. Connect your GitHub repository
5. Configure your build settings:
   - Build command: (none required)
   - Build output directory: /
6. Deploy

## Customization

### Colors
The color scheme can be customized in `assets/css/style.css`:
```css
:root {
    --primary-color: #ff0000;    /* Main red color */
    --accent-color: #ff1f1f;     /* Secondary red */
    --neon-color: #ff4444;       /* Neon accent */
    --bg-color: #000000;         /* Background */
    --text-color: #ffffff;       /* Text color */
}
```

### Content
Update the following sections in `index.html`:
- DJ name and branding
- About section content
- Services offered
- Gallery images
- Contact form endpoint
- Social media links

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

The website includes several performance optimizations:
- Lazy loading for images
- Minified CSS and JavaScript
- Optimized animations
- Responsive images
- Efficient asset loading

## Contact Form

The contact form uses Formspree for handling submissions. To set it up:
1. Create a Formspree account
2. Create a new form
3. Replace the form action URL in index.html with your Formspree endpoint

## License

This project is open source and available under the MIT License.
