# Notification Service - Complete Setup & Testing Guide

## Overview

This notification service uses RabbitMQ for message queuing and Nodemailer for email sending. It consists of two microservices:
- **app-service.ts**: API server that receives notification requests and queues them
- **notification-service.ts**: Worker that consumes from queue and sends emails

---

## Architecture

```
Client → API (app-service) → RabbitMQ Queue → Worker (notification-service) → Email (Gmail)
```

---

## Prerequisites

- Node.js >= 18.0.0
- Homebrew (for macOS)
- Gmail account with App Password

---

## Part 1: Install RabbitMQ Locally

### Step 1: Install RabbitMQ with Homebrew

```bash
# Install RabbitMQ
brew install rabbitmq

# Add RabbitMQ to your PATH
echo 'export PATH=$PATH:/opt/homebrew/opt/rabbitmq/sbin' >> ~/.zshrc
source ~/.zshrc
```

### Step 2: Start RabbitMQ Server

```bash
# Start RabbitMQ as a background service
brew services start rabbitmq

# OR start in foreground (to see logs)
rabbitmq-server
```

You should see output like:
```
  ##  ##      RabbitMQ 3.x.x
  ##  ##
  ##########  Copyright (c) 2007-2023 VMware, Inc.
  ######  ##
  ##########  Licensed under the MPL 2.0

  Starting broker... completed with 3 plugins.
```

### Step 3: Verify RabbitMQ is Running

```bash
# Check status
rabbitmqctl status
```

### Step 4: Enable Management UI (Optional but Recommended)

```bash
# Enable management plugin
rabbitmq-plugins enable rabbitmq_management

# Access at: http://localhost:15672
# Default credentials: guest / guest
```

---

## Part 2: Gmail App Password Setup

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** if not already enabled

### Step 2: Create App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select **App**: Mail
3. Select **Device**: Other (Custom name) - enter "Notification Service"
4. Click **Generate**
5. **Copy the 16-character password** (you'll use this in .env file)

---

## Part 3: Project Setup

### Step 1: Install Dependencies

```bash
cd /Users/ronil/Desktop/Web\ Dev/ACM-X-PU

# Install dotenv for environment variables
npm install dotenv
```

### Step 2: Create .env File

Create a `.env` file in the project root:

```bash
RABBITMQ_URL=amqp://guest:guest@localhost:5672
QUEUE_NAME=notifications
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
PORT=4000
```

**Replace:**
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASSWORD`: The 16-character App Password from Step 2
- `EMAIL_FROM`: Your Gmail address (or desired "from" address)

### Step 3: Update Service Files to Load .env

Both service files should have this at the top:

**notification-service.ts:**
```typescript
/* eslint-disable import/no-named-as-default-member */
import 'dotenv/config'; // Add this line
import type amqplib from 'amqplib';
// ...rest of imports
```

**app-service.ts:**
```typescript
/* eslint-disable import/no-named-as-default-member */
import 'dotenv/config'; // Add this line
import type amqplib from 'amqplib';
// ...rest of imports
```

### Step 4: Build the Project

```bash
npm run build
```

---

## Part 4: Running the Services

### Terminal 1: Start Worker Service

```bash
npm run notify:worker
```

**Expected Output:**
```
Notification worker started
```

### Terminal 2: Start API Service

```bash
npm run notify:api
```

**Expected Output:**
```
App-Service running on port 4000
```

---

## Part 5: Testing

### Test 1: Send Notification via curl

**Terminal 3:**
```bash
curl -X POST http://localhost:4000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Notification",
    "text": "Hello! This is a test email from your notification service."
  }'
```

**Expected Response:**
```json
{"message":"Notification queued"}
```

**Worker Terminal Output:**
```
Email sent to: recipient@example.com
```

### Test 2: Send to Real Email Address

```bash
curl -X POST http://localhost:4000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-actual-email@gmail.com",
    "subject": "Test Notification",
    "text": "Hello! This is a test email from your notification service."
  }'
```

**Check your email inbox** - you should receive the email within seconds!

### Test 3: Test Invalid Request (Missing Fields)

```bash
curl -X POST http://localhost:4000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email"
  }'
```

**Expected Response:**
```json
{"error":"Missing required fields"}
```

### Test 4: Test from RabbitMQ Management UI

1. Open http://localhost:15672
2. Login with `guest` / `guest`
3. Go to **Queues** tab
4. Click on **`notifications`** queue
5. Scroll to **"Publish message"** section
6. In **Payload** field, paste:
```json
{
  "to": "your-email@gmail.com",
  "subject": "Test from RabbitMQ UI",
  "text": "This was sent directly from RabbitMQ Management interface!"
}
```
7. Click **Publish message**
8. Watch worker terminal - email should be sent!

---

## Part 6: Monitoring with RabbitMQ Dashboard

### Access Dashboard

**URL:** http://localhost:15672  
**Username:** `guest`  
**Password:** `guest`

### Key Tabs to Monitor

#### 1. Overview Tab
- Server status
- Message rates (messages/second)
- Total queues and connections

#### 2. Connections Tab
- Shows active connections from:
  - app-service (API)
  - notification-service (Worker)

#### 3. Channels Tab
- Active channels
- Consumer details

#### 4. Queues Tab (Most Important)
- **Queue name:** `notifications`
- **Messages ready:** Waiting to be processed
- **Messages unacknowledged:** Currently being processed
- **Total messages:** All messages ever sent

**Click on `notifications` queue to:**
- View message details
- Inspect message content
- Publish test messages manually
- Purge queue (clear all messages)
- Monitor consumer activity

---

## Part 7: Testing Without Email (Development Mode)

If you want to test the queue flow without sending real emails:

### Option 1: Mock Email Sending

Temporarily modify `notification-service.ts`:

```typescript
export async function processMessage(
  msg: amqplib.ConsumeMessage,
  channel: amqplib.Channel,
  transporter: nodemailer.Transporter,
  emailFrom: string,
): Promise<void> {
  try {
    const notification = JSON.parse(msg.content.toString()) as Notification;
    
    // Comment out actual email sending
    // await sendEmail(transporter, notification, emailFrom);
    
    // Just log instead
    console.log('📧 Would send email to:', notification.to);
    console.log('   Subject:', notification.subject);
    console.log('   Text:', notification.text);
    
    channel.ack(msg);
  } catch (error) {
    console.error('Failed to process message:', error);
    channel.nack(msg, false, true);
  }
}
```

### Option 2: Direct Email Test (Bypass Queue)

Create `test-email.ts`:

```typescript
import 'dotenv/config';
import { createTransporter, sendEmail } from './src/services/notification-services/notification-service';
import type { Notification } from './src/services/notification-services/types';

async function testEmail(): Promise<void> {
  const config = {
    emailService: process.env.EMAIL_SERVICE || 'gmail',
    emailUser: process.env.EMAIL_USER || '',
    emailPassword: process.env.EMAIL_PASSWORD || '',
    emailFrom: process.env.EMAIL_FROM || '',
  } as any;

  const transporter = createTransporter(config);

  const notification: Notification = {
    to: 'your-email@gmail.com',
    subject: 'Direct Test Email',
    text: 'This email was sent directly without RabbitMQ!',
  };

  try {
    await sendEmail(transporter, notification, config.emailFrom);
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
}

testEmail();
```

Run it:
```bash
npx tsx test-email.ts
```

### Option 3: Test Validation Logic

Create `test-logic.ts`:

```typescript
import { validateNotification } from './src/services/notification-services/app-service';

const validNotification = {
  to: 'test@example.com',
  subject: 'Test',
  text: 'Hello',
};

const invalidNotification = {
  to: 'test@example.com',
  subject: 'Test',
  // missing 'text' field
};

console.log('✅ Valid notification:', validateNotification(validNotification)); // true
console.log('❌ Invalid notification:', validateNotification(invalidNotification)); // false
```

Run it:
```bash
npx tsx test-logic.ts
```

---

## Part 8: Troubleshooting

### RabbitMQ Won't Start

```bash
# Check if port 5672 is in use
lsof -i :5672

# Stop existing RabbitMQ
brew services stop rabbitmq

# Start again
brew services start rabbitmq

# View logs
tail -f /opt/homebrew/var/log/rabbitmq/rabbit@localhost.log
```

### Emails Not Sending

**Check 1: Verify Gmail App Password**
- Make sure you're using the 16-character App Password, not your regular password
- Regenerate if needed at https://myaccount.google.com/apppasswords

**Check 2: Check .env File**
```bash
cat .env
# Verify EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM are correct
```

**Check 3: Look at Worker Logs**
- Check Terminal 1 (worker) for error messages
- Common errors:
  - "Invalid login" → Wrong email/password
  - "ECONNREFUSED" → Gmail blocked the connection

**Check 4: Check Spam Folder**
- Test emails might go to spam initially

**Check 5: Test Email Transporter**
Create a simple test:
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password',
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error:', error);
  } else {
    console.log('✅ Server is ready to send emails');
  }
});
```

### API Not Responding

```bash
# Check if port 4000 is already in use
lsof -i :4000

# If something is using it, kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=4001
```

### Worker Not Processing Messages

**Check 1: Verify RabbitMQ Connection**
- Worker terminal should show "Notification worker started"
- Check RabbitMQ dashboard for active connections

**Check 2: Check Queue**
- Go to http://localhost:15672
- Click "Queues" tab
- Verify "notifications" queue exists
- Check if messages are piling up (not being consumed)

**Check 3: Restart Worker**
```bash
# In Terminal 1
Ctrl+C  # Stop worker
npm run notify:worker  # Restart
```

### Build Errors

```bash
# Clean build
rm -rf dist/
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

---

## Part 9: Managing RabbitMQ

### Start/Stop Commands

```bash
# Start as background service
brew services start rabbitmq

# Stop background service
brew services stop rabbitmq

# Restart
brew services restart rabbitmq

# Check status
brew services list | grep rabbitmq

# Run in foreground (see logs)
rabbitmq-server

# Stop foreground process
Ctrl+C
```

### Useful RabbitMQ Commands

```bash
# Check server status
rabbitmqctl status

# List queues
rabbitmqctl list_queues

# List connections
rabbitmqctl list_connections

# Purge a queue (clear all messages)
rabbitmqctl purge_queue notifications

# Reset everything (WARNING: deletes all data)
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl start_app
```

### View Logs

```bash
# RabbitMQ logs
tail -f /opt/homebrew/var/log/rabbitmq/rabbit@localhost.log

# Or check location from status
rabbitmqctl status | grep log_file
```

---

## Part 10: File Structure

```
ACM-X-PU/
├── .env                           # Environment variables
├── src/
│   └── services/
│       └── notification-services/
│           ├── types.ts           # Shared types (Notification interface)
│           ├── app-service.ts     # API server (queues notifications)
│           └── notification-service.ts  # Worker (sends emails)
├── dist/                          # Compiled JavaScript (after build)
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript configuration
```

---

## Part 11: npm Scripts

```bash
# Build TypeScript to JavaScript
npm run build

# Run API service (development mode with auto-reload)
npm run notify:api

# Run Worker service (development mode with auto-reload)
npm run notify:worker

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Format code
npm run format
```

---

## Part 12: Production Deployment Considerations

When deploying to production:

1. **Use Cloud RabbitMQ** (e.g., CloudAMQP) instead of local instance
2. **Environment Variables**: Never commit `.env` to git
3. **Logging**: Replace `console.log` with proper logging (Winston)
4. **Error Handling**: Add retry logic with exponential backoff
5. **Monitoring**: Set up health checks and metrics
6. **Rate Limiting**: Add rate limiting to API endpoint
7. **Authentication**: Add API authentication
8. **SSL/TLS**: Use AMQPS (not AMQP) for RabbitMQ
9. **Dead Letter Queue**: Handle failed messages
10. **Scaling**: Run multiple worker instances

---

## Part 13: Common Use Cases

### Send Welcome Email to New User

```bash
curl -X POST http://localhost:4000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "to": "newuser@example.com",
    "subject": "Welcome to Our Platform!",
    "text": "Thanks for signing up! We are excited to have you."
  }'
```

### Send Password Reset Email

```bash
curl -X POST http://localhost:4000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Password Reset Request",
    "text": "Click here to reset your password: https://example.com/reset/token123"
  }'
```

### Send Bulk Notifications (Multiple Requests)

```bash
# Send multiple notifications
for email in user1@example.com user2@example.com user3@example.com
do
  curl -X POST http://localhost:4000/notify \
    -H "Content-Type: application/json" \
    -d "{
      \"to\": \"$email\",
      \"subject\": \"Important Announcement\",
      \"text\": \"Hello! This is an important message.\"
    }"
done
```

---

## Part 14: Next Steps & Enhancements

### Add HTML Email Support

Modify `sendEmail` function to support HTML:

```typescript
export async function sendEmail(
  transporter: nodemailer.Transporter,
  notification: Notification & { html?: string },
  emailFrom: string,
): Promise<void> {
  await transporter.sendMail({
    from: emailFrom,
    to: notification.to,
    subject: notification.subject,
    text: notification.text,
    html: notification.html, // HTML version
  });
}
```

### Add Email Templates

Create template system for common emails (welcome, reset, etc.)

### Add Attachments Support

Extend notification type to include attachments

### Add Email Tracking

Track open rates, click rates, bounces

### Add Scheduling

Schedule emails to be sent at specific times

### Add Priority Queue

Implement high/low priority queues

---

## Quick Reference

**Start Everything:**
```bash
# Terminal 1
brew services start rabbitmq
npm run notify:worker

# Terminal 2
npm run notify:api

# Terminal 3 (testing)
curl -X POST http://localhost:4000/notify \
  -H "Content-Type: application/json" \
  -d '{"to":"your@email.com","subject":"Test","text":"Hello"}'
```

**Stop Everything:**
```bash
# In each terminal
Ctrl+C

# Stop RabbitMQ
brew services stop rabbitmq
```

**Check Status:**
- RabbitMQ: http://localhost:15672 (guest/guest)
- API: http://localhost:4000
- Worker: Check Terminal 1 logs

---

## Support & Resources

- **RabbitMQ Docs:** https://www.rabbitmq.com/documentation.html
- **Nodemailer Docs:** https://nodemailer.com/
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Project Repository:** https://github.com/BPHC-ACM/ACM-X-PU

---

**Last Updated:** November 1, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
