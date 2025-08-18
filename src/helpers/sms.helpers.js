const { CustomError } = require("../utilities/CustomError");

// sms sender
exports.smsSend = async (phoneNumber , message)=> {
    try {
      const response =  await axios.post(process.env.API_URL , {
        api_key:process.env.API_KEY, 
        senderid: process.env.SENDER_ID,
        number:Array.isArray(phoneNumber) ? phoneNumber.join(',') : phoneNumber,
        message:message
      })
      return response.data;
    } catch (error) {
      console.log('error from send sms' , error);
      throw new CustomError(500 , "smsSend function"+ error)
    }
  }