exports.registerEmailTemplate = (Otp, expireTime) => {
  const date = new Date(expireTime);
  const formattedTime = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verification Code</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 500px;
      margin: auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      text-align: center;
    }
    .code {
      font-size: 32px;
      font-weight: bold;
      color: #2c3e50;
      margin: 20px 0;
    }
    .expire {
      font-size: 14px;
      color: #888;
      margin-top: 10px;
    }
  </style>
</head>
<body>

  <div class="container">
    <h2>Email Verification</h2>
    <p>To verify your email address, please use the code below. Do not share this code with anyone.</p>
    <div class="code">${Otp}</div>
    <div class="expire">This code will expire at ${formattedTime}</div>
  </div>

</body>
</html>

    `;
};

exports.forgotPasswordEmailTemplate = (expireTime, resetUrl) => {
  const date = new Date(expireTime);
  const formattedTime = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verification Code</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 500px;
      margin: auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      text-align: center;
    }
    .expire {
      font-size: 14px;
      color: #888;
      margin-top: 10px;
    }
    .ResetUrl {
      font-size: 14px;
      color: #888;
      padding: 10px 20px;
      border-radius: 5px;
      background-color: #2c3e50;
      color: #fff;
      text-decoration: none;
    }
    .ResetUrl:hover {
      background-color: #34495e;
    }
  </style>
</head>
<body>

  <div class="container">
    <h2>Forgot Password</h2>
    <p>Click the link below to reset your password:</p>
    <a class="ResetUrl" href="${resetUrl}">Reset Password</a>
    <div class="expire">This link will expire at ${formattedTime}</div>
  </div>

</body>
</html>

    `;
};
