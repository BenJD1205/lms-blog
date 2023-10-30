import Joi from "joi";

const orderSchema = {
    orderBody: Joi.object().keys({
        courseId: Joi.string().not('').required(),
        payment_info: Joi.object().keys({})
    })
}

export default orderSchema;