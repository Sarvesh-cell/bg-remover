import { Webhook } from "svix";
import userModel from "../models/userModel.js";
import razorpay from "razorpay";
import transactionModel from "../models/transactionModel.js";

//API controller function to manage clerk user with database
//https://localhost:4000/api/user/webhooks

const clerkWebhooks = async (req, res) => {
  try {
    //create a svix instance with clerk secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstname: data.first_name,
          lastname: data.last_name,
          photo: data.image_url,
        };

        await userModel.create(userData);
        res.json({});

        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          firstname: data.first_name,
          lastname: data.last_name,
          photo: data.image_url,
        };

        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        res.json({});

        break;
      }

      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id });
        res.json({});
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API controller function to get user available credits

const userCredits = async (req, res) => {
  try {
    const clerkId = req.clerkId;

    const userData = await userModel.findOne({ clerkId });
    // console.log("data: ", userData);

    res.json({ success: true, credits: userData.creditBalance });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//gateway initialize

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//api to make payment for credits

const paymentRazorpay = async (req, res) => {
  try {
    // const { clerkId, planId } = req.body;

    const clerkId = req.clerkId;
    const { planId } = req.body;

    // ✅ First, validate inputs
    if (!planId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing planId" });
    }
    // const receipt = `receipt_${Date.now()}`;
    // if (!clerkId) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Missing clerkId" });
    // }
    // ✅ Then, safely query the database
    const userData = await userModel.findOne({ clerkId });

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found with this clerkId",
      });
    }

    let credits, plan, amount, date;

    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 100;
        amount = 10;
        break;

      case "Advanced":
        plan = "Advanced";
        credits = 500;
        amount = 50;
        break;

      case "Business":
        plan = "Business";
        credits = 5000;
        amount = 250;
        break;

      default:
        break;
    }

    date = Date.now();

    //creating transaction
    const transactionData = {
      clerkId,
      plan,
      amount,
      credits,
      date,
    };

    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY, // receipt: `receipt_${Date.now()}`,
      receipt: newTransaction.id,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API controller function to verify razorpay payment

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const clerkId = req.clerkId;

    if (!razorpay_order_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing order ID" });
    }

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      const transactionData = await transactionModel.findById(
        orderInfo.receipt
      );

      // if (!transactionData.payment) {
      //   return res
      //     .status(404)
      //     .json({ success: false, message: "Transaction not found" });
      // } else {
      //   console.log(transactionData);
      // }

      if (transactionData.payment) {
        return res.json({
          success: false,
          message: "Payment already processed",
        });
      }

      //adding credits in user data
      const userData = await userModel.findOne({
        clerkId: transactionData.clerkId,
      });

      if (!userData) {
        return res.status(404).json({
          success: false,
          message: "User not found with this clerkId",
        });
      }

      const creditBalance = userData.creditBalance + transactionData.credits;

      await userModel.findByIdAndUpdate(userData._id, { creditBalance });

      //making the payment true
      await transactionModel.findByIdAndUpdate(transactionData._id, {
        payment: true,
      });

      res.json({ success: true, message: "Credits added successfully" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
};

export { clerkWebhooks, userCredits, paymentRazorpay, verifyRazorpay };
