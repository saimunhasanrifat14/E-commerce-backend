exports.registerEmailTemplate = (code, expireTime) => {
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
    <div class="code">${code}</div>
    <div class="expire">This code will expire in ${expireTime}</div>
  </div>

</body>
</html>

    `;
};
