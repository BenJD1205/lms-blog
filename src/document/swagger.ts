const swaggerUi = require('swagger-ui-express')
const swaggerDoc = require('./swagger-doc')

const swagger = (app: any) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
}

export default swagger;
