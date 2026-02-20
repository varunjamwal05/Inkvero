const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'Gmail', // or use host/port for other providers
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Define email options
    const mailOptions = {
        from: `Inkvero <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
