import axios from "axios";
import AppError from "../../shared/errors/app_errors";
import { StatusCodes } from "http-status-codes";
import { otpStatusCodeToMessage } from "../../shared/utils/helper_functions";

export interface IOTPHandler {
  sendSmsOTP(
    phone: string,
    message: string,
  ): Promise<{ message: string }>;
}

export default class OTPHandler implements IOTPHandler {
   async sendSmsOTP(
    phone: string,
    message: string,
  ): Promise<{ message: string }> {
    const msgBody = {
      api_key: process.env.SMS_API_KEY,
      senderid: process.env.SMS_SENDER_ID,
      number: phone,
      message: message,
    };

    let code = 202;
    try {
      const res = await axios.post("http://bulksmsbd.net/api/smsapi", msgBody);
      code = res.data.response_code;
    } catch (error) {
      console.error("Failed to send OTP:", error);
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "SMS sending failed"
      );
    }
    return { message: otpStatusCodeToMessage(code) };
  }
}
