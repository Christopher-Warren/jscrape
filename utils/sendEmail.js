import nodemailer from "nodemailer";

export default async function sendEmail(jobs, excludedJobs) {
  const host = process.env.NODEMAILER_HOST;
  const user = process.env.NODEMAILER_EMAIL;
  const pass = process.env.NODEMAILER_PASSWORD;
  const recipient = process.env.NODEMAILER_RECIPIENT;

  const transporter = nodemailer.createTransport({
    host: host,
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      secureProtocol: "TLSv1_2_method",
      rejectUnauthorized: false,
    },
  });

  const selfMailOptions = {
    from: user,
    to: recipient,
    subject: `New jobs! ${new Date().toLocaleString()}`,
    text: `Plain text`,
    html: `
    <div style="">
      <h1 style="margin-top: 5px; margin-bottom: 5px">New jobs found.</h1>
      <h2 style="margin-top: 5px; margin-bottom: 5px">${excludedJobs} jobs were excluded.</h2>
      <ul style="list-style: none; font-size: larger; padding-left: 0px">
        ${jobs
          .map(
            (job) =>
              ` <li style="margin-top: 10px; padding-bottom: 20px">
                  <h1><a href="${job.href}">${job.title}</a></h1>
                  <div style="height: 20rem; overflow-y: scroll">${job.body}</div>
                 
                </li>`
          )
          .join("")}
      </ul>
    </div>
    `,
  };

  try {
    await transporter.sendMail(selfMailOptions);

    return `Found and sent ${jobs.length} new job(s).`;
  } catch (error) {
    console.log(error);
    return error;
  }
}
