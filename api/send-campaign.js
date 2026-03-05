export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, promptNumber, date } = req.body;

  if (!question || !promptNumber) {
    return res.status(400).json({ error: 'Missing question or promptNumber' });
  }

  const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
  const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
  const MAILCHIMP_SERVER = 'us4';

  const headers = {
    'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    // Step 1: Create the campaign
    const campaignRes = await fetch(`https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/campaigns`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'regular',
        recipients: { list_id: MAILCHIMP_AUDIENCE_ID },
        settings: {
          subject_line: `*|FNAME|*, here's today's question`,
          preview_text: 'No right answers. Just yours.',
          title: `Prompt #${promptNumber} - ${date}`,
          from_name: 'Bella & Cynthia',
          reply_to: 'like.semi.articulate.podcast@gmail.com'
        }
      })
    });

    const campaign = await campaignRes.json();
    if (!campaign.id) {
      return res.status(500).json({ error: 'Failed to create campaign', detail: campaign });
    }

    // Step 2: Set the email content
    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Semi-Articulate Daily Prompt</title>
<link href="https://fonts.googleapis.com/css2?family=Meow+Script&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet">
<style>
  body { margin:0; padding:0; background-color:#ede7d9; font-family:'DM Sans',Arial,sans-serif; color:#1a1714; }
  .wrapper { max-width:600px; margin:40px auto; background-color:#f5f0e8; border-radius:4px; overflow:hidden; }
  .header { background-color:#f5f0e8; border-bottom:1px solid rgba(26,23,20,0.13); padding:28px 40px; display:flex; align-items:center; justify-content:space-between; }
  .logo { font-family:'Playfair Display',Georgia,serif; font-size:18px; color:#1a1714; text-decoration:none; }
  .logo em { font-style:italic; color:#a20100; }
  .logo-podcast { font-family:'Meow Script',cursive; font-size:22px; color:#1a1714; }
  .date-strip { background-color:#a20100; padding:10px 40px; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:#f5f0e8; }
  .body { padding:48px 40px 40px; }
  .eyebrow { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:#8a7f72; margin:0 0 16px; }
  .prompt-label { font-family:'Meow Script',cursive; font-size:32px; color:#a20100; margin:0 0 8px; line-height:1.2; }
  .divider { border:none; border-top:1px solid rgba(26,23,20,0.13); margin:24px 0; }
  .question { font-family:'Playfair Display',Georgia,serif; font-size:26px; font-style:italic; line-height:1.5; color:#1a1714; margin:0 0 32px; }
  .body-text { font-size:15px; line-height:1.7; color:#4a4540; margin:0 0 32px; }
  .cta-wrap { text-align:center; margin:36px 0; }
  .notebook { display:inline-block; text-decoration:none; background-color:#fffef9; border:1px solid rgba(26,23,20,0.15); border-radius:3px; width:300px; box-shadow:2px 3px 8px rgba(26,23,20,0.1); overflow:hidden; position:relative; }
  .notebook-spine { background-color:#a20100; width:24px; position:absolute; top:0; left:0; bottom:0; border-right:1px solid #871000; }
  .notebook-inner { margin-left:24px; padding:20px 18px; }
  .notebook-lines { border-top:1px solid #d4e4f7; border-bottom:1px solid #d4e4f7; padding:10px 0; margin-bottom:8px; }
  .notebook-text { font-family:'DM Mono',monospace; font-size:14px; letter-spacing:0.1em; text-transform:uppercase; color:#a20100; display:block; text-align:center; padding:4px 0; }
  .notebook-arrow { font-size:18px; color:#a20100; display:block; text-align:center; margin-top:6px; }
  .heart-divider { text-align:center; color:#a20100; font-size:18px; margin:8px 0 32px; letter-spacing:8px; }
  .footer { background-color:#ede7d9; border-top:1px solid rgba(26,23,20,0.13); padding:28px 40px; text-align:center; }
  .footer-logo { font-family:'Playfair Display',Georgia,serif; font-size:15px; color:#1a1714; margin:0 0 8px; }
  .footer-logo em { font-style:italic; color:#a20100; }
  .footer-text { font-size:12px; color:#8a7f72; margin:0 0 4px; line-height:1.6; }
  .footer-link { color:#8a7f72; text-decoration:underline; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <span class="logo">Semi-<em>Articulate</em> <span class="logo-podcast">Podcast</span></span>
    <span style="font-size:20px;color:#a20100;">♥</span>
  </div>
  <div class="date-strip">Today's Prompt &nbsp;·&nbsp; ${date}</div>
  <div class="body">
    <p class="eyebrow">Good morning, *|FNAME|* ♥</p>
    <p class="prompt-label">Today's question is...</p>
    <hr class="divider">
    <p class="question">"${question}"</p>
    <hr class="divider">
    <p class="body-text">Sit with it for a moment. There's no right answer — just yours. When you're ready, head to the site to write it out. Keep it private, share it anonymously, or put your name to it.</p>
    <div class="cta-wrap">
      <a href="https://www.semiarticulatepodcast.com" class="notebook">
        <div class="notebook-spine"></div>
        <div class="notebook-inner">
          <div class="notebook-lines"><span class="notebook-text">Write My Answer</span></div>
          <span class="notebook-arrow">→</span>
        </div>
      </a>
    </div>
    <div class="heart-divider">♥ ♥ ♥</div>
    <p class="body-text" style="text-align:center;font-style:italic;color:#8a7f72;font-family:'Playfair Display',Georgia,serif;font-size:14px;">— Bella & Cynthia</p>
  </div>
  <div class="footer">
    <p class="footer-logo">Semi-<em>Articulate</em> Podcast</p>
    <p class="footer-text">You're receiving this because you signed up at semiarticulatepodcast.com</p>
    <p class="footer-text"><a href="*|UNSUB|*" class="footer-link">Unsubscribe</a> &nbsp;·&nbsp; <a href="*|UPDATE_PROFILE|*" class="footer-link">Update preferences</a></p>
  </div>
</div>
</body>
</html>`;

    await fetch(`https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/campaigns/${campaign.id}/content`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ html: emailHtml })
    });

    // Step 3: Send the campaign
    await fetch(`https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/campaigns/${campaign.id}/actions/send`, {
      method: 'POST',
      headers
    });

    return res.status(200).json({ success: true, campaignId: campaign.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
