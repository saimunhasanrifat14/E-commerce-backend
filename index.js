require("dotenv").config();
const { connectDB } = require("./src/database/db");
const app = require("./src/app");

const port = process.env.PORT || 3000;
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("DB Connection Failed", err);
  });
