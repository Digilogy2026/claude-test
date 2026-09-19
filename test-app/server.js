const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>Claude + Railway Test</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 60px;">
        <h1>It's live! 🎉</h1>
        <p>This page was built by Claude and deployed to Railway.</p>
        <p>Server time: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
