import { Resend } from 'resend';
import { config, initializeConfig } from '../config/index.js'; // Ensure correct import path

// Define the sendVerificationEmail function
const sendVerificationEmail = async (email, otp) => {
  try {
    // Wait for the config to be initialized
    await initializeConfig();

    // Initialize Resend with the API key from config
    const resend = new Resend(config.resend.apiKey);

    // Send the email
    await resend.emails.send({
      from: 'Wallet Monitor <wallettracker@tixflip.in>',
      to: email,
      subject: 'Email Verification - Wallet Monitor',
      html: `
        <h1>Verify Your Email</h1>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send a transaction notification email
 * @param {Object} transactionDetails - Details of the Ethereum transaction(s)
 * @param {string} recipientEmail - Recipient's email address
 */
const sendEmailNotification = async (transactionDetails, recipientEmail) => {
  const { combined, details } = transactionDetails;

  // Compose email content dynamically based on transaction details
  const subject = combined
    ? 'New Ethereum Transactions Detected (Multiple)'
    : 'New Ethereum Transaction Detected';

  const body = combined
    ? `<p>The following transactions were detected:</p><pre>${details}</pre>`
    : `<p>Transaction details:</p>
        <ul>
          <li><strong>Hash:</strong> ${transactionDetails.hash}</li>
          <li><strong>From:</strong> ${transactionDetails.from}</li>
          <li><strong>To:</strong> ${transactionDetails.to}</li>
          <li><strong>Amount:</strong> ${transactionDetails.amount} ETH</li>
          <li><strong>Timestamp:</strong> ${transactionDetails.timestamp}</li>
          <li><strong>Token Data:</strong> ${transactionDetails.tokenData || 'N/A'}</li>
        </ul>`;

  try {
    // Wait for the config to be initialized
    await initializeConfig();

    // Initialize Resend with the API key from config
    const resend = new Resend(config.resend.apiKey);

    // Send email using Resend API
    await resend.emails.send({
      from: 'Wallet Monitor <wallettracker@tixflip.in>',
      to: recipientEmail,
      subject,
      html: body,
    });

    console.log('Notification email sent successfully');
  } catch (error) {
    console.error('Error sending email notification:', error.message);
    throw new Error('Failed to send email notification');
  }
};
const sendTrackingStartedEmail = async (recipientEmail, walletAddress, transactions) => {
  const transactionDetails = transactions.length > 0
    ? transactions.map(txn => (
        `Transaction Hash: ${txn.hash}\n` +
        `From: ${txn.from}\nTo: ${txn.to}\n` +
        `Amount: ${txn.amount} ETH\n` +
        `Timestamp: ${txn.timestamp}\n` +
        `Token Data: ${txn.tokenData || 'N/A'}\n\n`
      )).join('---------------------\n')
    : 'No transactions found yet.';

  const subject = 'Wallet Tracking Started Successfully';
  const body = `Hello,\n\nYour wallet tracking for address ${walletAddress} has started successfully.\n\nRecent transactions:\n${transactionDetails}\n\nBest Regards,\nWallet Tracker Team`;

  try {
    // Wait for the config to be initialized
    await initializeConfig();

    // Initialize Resend with the API key from config
    const resend = new Resend(config.resend.apiKey);

    // Send email using Resend API
    await resend.emails.send({
      from: 'Wallet Monitor <wallettracker@tixflip.in>',
      to: recipientEmail,
      subject,
      html: `<pre>${body}</pre>`
    });

    console.log('Tracking started email sent successfully');
  } catch (error) {
    console.error('Error sending tracking started email:', error.message);
    throw new Error('Failed to send tracking started email');
  }
};

// Export functions
export { sendVerificationEmail, sendEmailNotification,sendTrackingStartedEmail };