import nodemailer from "nodemailer";

export default async function sendEmail(jobs, excludedJobs) {
  const transporter = nodemailer.createTransport({
    host: "smtp.chriswarren.tech.",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
    tls: {
      secureProtocol: "TLSv1_method",
      rejectUnauthorized: false,
    },
  });

  const selfMailOptions = {
    from: "chris@chriswarren.tech",
    to: "chriswarrentech@gmail.com",
    subject: `New jobs! ${new Date().toLocaleString()}`,
    text: `Plain text`,
    html: `<h1>Jscape - ${excludedJobs} jobs excluded</h1>
    <ul style="list-style: none; font-size: larger">
      ${jobs.map(
        (job) => `<li>
      <a href="${job.href}">${job.title}</a>
      </li>`
      )}
    </ul>
    `,
  };

  try {
    await transporter.sendMail(selfMailOptions);
    console.log("Jobs sent successfully");
  } catch (error) {
    console.log(error);
  }
}
