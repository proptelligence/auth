const nodemailer = require('nodemailer');

const configuremail = () => {
    // Configure transporter for sending emails
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your_email@gmail.com', // Replace with your email address
            pass: 'your_password' // Replace with your email password or app password if using Gmail
        }
    });

    return transporter;
};

const sendLoginMail = async (transporter, email, link) => {
    // Send login email
    const mailOptions = {
        from: 'your_email@gmail.com', // Sender's email address
        to: email, // Recipient's email address
        subject: 'Reset Password Link',
        html: `<p>You requested for password reset, kindly use this <a href="${link}">link</a> to reset your password.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    configuremail,
    sendLoginMail
};
