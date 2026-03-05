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

  const authHeader = 'Basic ' + Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64');

  const headers = {
    'Authorization': authHeader,
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
          from_name: 'Semi-Articulate Podcast',
          reply_to: 'like.semi.articulate.podcast@gmail.com',
          subject_line: '*|FNAME|*, here\u2019s a prompt to start your day!',
          preview_text: 'No right answers. Just yours.',
          title: 'Prompt #' + promptNumber + ' - ' + date
        }
      })
    });

    const campaign = await campaignRes.json();
    console.log('Campaign response:', JSON.stringify(campaign));
    if (!campaign.id) {
      return res.status(500).json({ error: 'Failed to create campaign', detail: campaign });
    }

    // Step 2: Set the email content
    const emailHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Semi-Articulate Daily Prompt</title>
<style type="text/css">
  body, table, td, p, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0; }
  table { border-collapse:collapse !important; }
  body { background-color:#ede7d9; font-family:Arial,sans-serif; color:#1a1714; }
  @media only screen and (max-width:620px) {
    .wrapper { width:100% !important; }
    .inner-pad { padding:32px 24px !important; }
    .question-text { font-size:20px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#ede7d9;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ede7d9;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table class="wrapper" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f0e8;border-radius:4px;overflow:hidden;">

        <!-- HEADER -->
        <tr>
          <td style="padding:28px 40px;border-bottom:1px solid #e0d9cc;background-color:#f5f0e8;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-family:Georgia,serif;font-size:18px;color:#1a1714;">Semi-<em style="font-style:italic;color:#a20100;">Articulate</em> Podcast</span>
                </td>
                <td align="right">
                  <span style="font-family:Georgia,serif;font-size:18px;color:#a20100;line-height:1;">&hearts;</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- DATE STRIP -->
        <tr>
          <td style="background-color:#a20100;padding:10px 40px;">
            <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#f5f0e8;margin:0;">Today&#39;s Prompt &nbsp;&middot;&nbsp; ${date}</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td class="inner-pad" style="padding:48px 40px 40px;">

            <!-- Greeting -->
            <p style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8a7f72;margin:0 0 16px;">Good morning, *|FNAME|* <span style="color:#a20100;">&hearts;</span></p>

            <!-- Prompt label -->
            <p style="font-family:Georgia,serif;font-size:28px;font-style:italic;color:#a20100;margin:0 0 12px;line-height:1.3;">Today&#39;s question is...</p>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
              <tr><td style="border-top:1px solid #e0d9cc;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>

            <!-- Question -->
            <p class="question-text" style="font-family:Georgia,serif;font-size:24px;font-style:italic;line-height:1.5;color:#1a1714;margin:0 0 24px;">&ldquo;${question}&rdquo;</p>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 28px;">
              <tr><td style="border-top:1px solid #e0d9cc;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>

            <!-- Body text -->
            <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#4a4540;margin:0 0 32px;">Sit with it for a moment. There&#39;s no right answer &mdash; just yours. When you&#39;re ready, head to the site to write it out. Keep it private, share it anonymously, or put your name to it.</p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;">
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" border="0" style="background-color:#fffef9;border:1px solid #ddd;border-radius:3px;overflow:hidden;">
                    <tr>
                      <td width="24" style="background-color:#a20100;border-right:1px solid #871000;">&nbsp;</td>
                      <td style="padding:16px 28px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #d4e4f7;border-bottom:1px solid #d4e4f7;">
                          <tr>
                            <td style="padding:10px 20px;">
                              <a href="https://www.semiarticulatepodcast.com" style="font-family:Arial,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#a20100;text-decoration:none;display:block;text-align:center;">Write My Answer &rarr;</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Heart divider -->
            <p style="text-align:center;font-family:Georgia,serif;font-size:16px;color:#a20100;margin:0 0 28px;letter-spacing:10px;">&hearts; &hearts; &hearts;</p>

            <!-- Signature -->
            <p style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:14px;color:#8a7f72;margin:0;">— Bella &amp; Cynthia</p>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background-color:#ede7d9;border-top:1px solid #e0d9cc;padding:28px 40px;text-align:center;">
            <p style="font-family:Georgia,serif;font-size:15px;color:#1a1714;margin:0 0 8px;">Semi-<em style="font-style:italic;color:#a20100;">Articulate</em> Podcast</p>
            <p style="font-family:Arial,sans-serif;font-size:12px;color:#8a7f72;margin:0 0 4px;line-height:1.6;">You&#39;re receiving this because you signed up at semiarticulatepodcast.com</p>
            <p style="font-family:Arial,sans-serif;font-size:12px;color:#8a7f72;margin:0;">
              <a href="*|UNSUB|*" style="color:#8a7f72;text-decoration:underline;">Unsubscribe</a>
              &nbsp;&middot;&nbsp;
              <a href="*|UPDATE_PROFILE|*" style="color:#8a7f72;text-decoration:underline;">Update preferences</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
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
