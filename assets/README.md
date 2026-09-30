# Memory Site

A 3-page memory site: Intro, Memories, Letter. Light violet theme with pink highlights and background music.

## 1. Open in VS Code
1. Unzip/copy the `memory-site` folder, then in VS Code: **File > Open Folder**.
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` > **Open with Live Server**.

## 2. Add your content
- Photos: put in `assets/photos/` (e.g. `1.jpg`, `2.jpg`).
- Videos: put in `assets/videos/` (use `.mp4`, H.264, keep each under ~25 MB).
- Song: put in `assets/music/` and name it `song.mp3` (or change the path in `data.js`).
- Edit **`js/data.js`**: her name, your name, start date, intro message, each photo/video caption, and the long letter. You never need to touch the other files.

## 3. Put it online (needed for the QR code)
A QR code can only open a site that is on the internet. Easiest free options:
- **Netlify Drop:** go to app.netlify.com/drop and drag the whole `memory-site` folder in. You get a link like `https://something.netlify.app`.
- **GitHub Pages:** push the folder to a repo, then Settings > Pages.

Tip: rename the Netlify site (Site settings > Change site name) to something short, which makes a cleaner QR.

## 4. Make the QR code
1. Open `qr/qr-generator.html` in your browser (internet needed).
2. Paste your live `https://` link, click **Make QR code**, then **Download PNG**.
3. Print it or put it on a card/gift. Test it with your own phone first.

## Notes
- Music starts when she taps **Open it** on the first screen (browsers block autoplay otherwise).
- The music pauses while a video plays and resumes after.
- The whole site is one page that switches views, so the music never restarts between pages.
- Missing photos show a soft violet placeholder instead of breaking the page.
