import { Resend } from 'resend';
import { config, initializeConfig } from '../config/index.js'; // Ensure correct import path


const formatTransactionDetails = (txn) => {
  const commonDetails = `Transaction Hash: ${txn.hash}
From: ${txn.from}
Timestamp: ${txn.timestamp}`;

  if (txn.tokenData) {
    // Parse token data
    const tokenInfo = JSON.parse(txn.tokenData);
    
    if (tokenInfo.method === 'transfer') {
      return `${commonDetails}
Type: Token Transfer
To: ${txn.to}
Amount: ${txn.amount} ${tokenInfo.symbol || 'tokens'}
Token Contract: ${tokenInfo.tokenAddress || 'N/A'}
Token Decimals: ${tokenInfo.decimals || 'N/A'}`;
    } else if (tokenInfo.method === 'approve') {
      return `${commonDetails}
Type: Token Approval
Spender: ${txn.spender}
Approved Amount: ${txn.approvedAmount} ${tokenInfo.symbol || 'tokens'}
Token Contract: ${tokenInfo.tokenAddress || 'N/A'}
Token Decimals: ${tokenInfo.decimals || 'N/A'}`;
    }
  }

  // Default ETH transfer format
  return `${commonDetails}
Type: ETH Transfer
To: ${txn.to}
Amount: ${txn.amount} ETH`;
};

// Format HTML for a single transaction
const formatTransactionHTML = (txn) => {
  const tokenInfo = txn.tokenData ? JSON.parse(txn.tokenData) : null;
  
  const commonHTML = `
    <li><strong>Hash:</strong> ${txn.hash}</li>
    <li><strong>From:</strong> ${txn.from}</li>
    <li><strong>Timestamp:</strong> ${txn.timestamp}</li>`;

  if (tokenInfo) {
    if (tokenInfo.method === 'transfer') {
      return `<ul>
        ${commonHTML}
        <li><strong>Type:</strong> Token Transfer</li>
        <li><strong>To:</strong> ${txn.to}</li>
        <li><strong>Amount:</strong> ${txn.amount} ${tokenInfo.symbol || 'tokens'}</li>
        <li><strong>Token Contract:</strong> ${tokenInfo.tokenAddress || 'N/A'}</li>
        <li><strong>Token Decimals:</strong> ${tokenInfo.decimals || 'N/A'}</li>
      </ul>`;
    } else if (tokenInfo.method === 'approve') {
      return `<ul>
        ${commonHTML}
        <li><strong>Type:</strong> Token Approval</li>
        <li><strong>Spender:</strong> ${txn.spender}</li>
        <li><strong>Approved Amount:</strong> ${txn.approvedAmount} ${tokenInfo.symbol || 'tokens'}</li>
        <li><strong>Token Contract:</strong> ${tokenInfo.tokenAddress || 'N/A'}</li>
        <li><strong>Token Decimals:</strong> ${tokenInfo.decimals || 'N/A'}</li>
      </ul>`;
    }
  }

  return `<ul>
    ${commonHTML}
    <li><strong>Type:</strong> ETH Transfer</li>
    <li><strong>To:</strong> ${txn.to}</li>
    <li><strong>Amount:</strong> ${txn.amount} ETH</li>
  </ul>`;
};
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

  const subject = combined
    ? 'New Blockchain Transactions Detected'
    : 'New Blockchain Transaction Detected';

  const body = combined
    ? `<div style="font-family: Arial, sans-serif;">
        <h2>New Transactions Detected</h2>
        <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">${details}</pre>
        <p>Note: Token amounts are displayed in their standard units with appropriate decimals.</p>
      </div>`
    : `<div style="font-family: Arial, sans-serif;">
        <h2>New Transaction Detected</h2>
        ${formatTransactionHTML(transactionDetails)}
        <p>Note: Token amounts are displayed in their standard units with appropriate decimals.</p>
      </div>`;

  try {
    await initializeConfig();
    const resend = new Resend(config.resend.apiKey);

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
    ? transactions.map(txn => formatTransactionDetails(txn)).join('\n---------------------\n')
    : 'No transactions found yet.';

  const subject = 'Wallet Tracking Started Successfully';
  const body = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Wallet Tracking Started</h2>
      <p>Hello,</p>
      <p>Your wallet tracking for address <strong>${walletAddress}</strong> has started successfully.</p>
      <h3>Recent Transactions:</h3>
      <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
${transactionDetails}
      </pre>
      <p>Note: Token amounts are displayed in their standard units with appropriate decimals.</p>
      <p>Best Regards,<br>Wallet Tracker Team</p>
    </div>`;

  try {
    await initializeConfig();
    const resend = new Resend(config.resend.apiKey);

    await resend.emails.send({
      from: 'Wallet Monitor <wallettracker@tixflip.in>',
      to: recipientEmail,
      subject,
      html: body,
    });

    console.log('Tracking started email sent successfully');
  } catch (error) {
    console.error('Error sending tracking started email:', error.message);
    throw new Error('Failed to send tracking started email');
  }
};

// Export functions
export { formatTransactionDetails,sendVerificationEmail, sendEmailNotification,sendTrackingStartedEmail };