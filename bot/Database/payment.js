const Payment = require("../Model/payment");

exports.createPayment=async(paymentData) =>{
    try {
        const payment = new Payment({
            telegramid: paymentData.telegramid,
            order: paymentData.order,
            total_amount: paymentData.total_amount,
            invoice_id: paymentData.invoice_id,
            paymentType: paymentData.paymentType,
            telegram_payment_charge_id: paymentData.telegram_payment_charge_id,
        });

        const savedPayment = await payment.save();
        return savedPayment;
    } catch (error) {
        console.error('Error creating payment:', error);
        throw new Error('Failed to create payment.');
    }
}
