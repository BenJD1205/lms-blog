const apiVersion = process.env.API_VERSION || '/api/v1'
import authRouteDoc from './routes/auth-route-doc'
import userRouteDoc from './routes/user-route-doc'
import { Types } from 'mongoose'

const swaggerDoc = {
    openapi: '3.0.0',
    info: {
        title: 'LMS API Document',
        version: '1.0.0',
        description: 'API Document For LMS blog',
        contact: {
            name: 'BenJD1205',
            email: 's.anh2209@gmail.com',
        },
    },
    servers: [
        {
            url: `http://localhost:5001${apiVersion}`,
            description: 'Local server',
        },
    ],
    apis: ['../routes/*.js'],
    tags: [{ name: 'Auth' }, { name: 'User' }, { name: 'Course' }],
    components: {
        securitySchemes: {
            basicAuth: {
                type: 'http',
                scheme: 'basic',
            },
            cookieAuth: {},
        },
        schemas: {
            User: {
                type: 'object',
                required: ['name', 'password', 'email'],
                properties: {
                    id: {
                        type: 'string',
                        readOnly: true,
                        default: Types.ObjectId,
                    },
                    name: {
                        type: 'string',
                        description: 'The user name of user',
                        default: 'admin',
                    },
                    password: {
                        type: 'string',
                        description: 'The password of user',
                        default: 'P@ssw0rd1',
                    },
                    email: {
                        type: 'string',
                        description: 'The email of user',
                        default: 'admin@example.com',
                    },
                    createdDate: {
                        type: 'datetime',
                        readOnly: true,
                        description: 'The day user is created',
                        default: '2023-01-01 00:00:00',
                    },
                    updatedDate: {
                        type: 'datetime',
                        readOnly: true,
                        description: 'The day user is updated',
                        default: '2023-01-01 00:00:00',
                    },
                },
            },
        },
    },
    security: [
        {
            cookieAuth: [],
        },
    ],
    paths: {
        ...authRouteDoc,
        ...userRouteDoc,
    },
    responses: {
        BadRequestError: {
            description: 'Bad Request Error',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                default: {},
                            },
                            message: {
                                type: 'string',
                                default: 'Bad Request Error',
                            },
                        },
                    },
                },
            },
        },
        UnauthorizedError: {
            description: 'Unauthorized Error',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                default: {},
                            },
                            message: {
                                type: 'string',
                                default: 'Unauthorized Error',
                            },
                        },
                    },
                },
            },
        },
        ForbiddenError: {
            description: 'Forbidden Error',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                default: {},
                            },
                            message: {
                                type: 'string',
                                default: 'Forbidden Error',
                            },
                        },
                    },
                },
            },
        },
        NotFoundError: {
            description: 'Not Found Error',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                default: {},
                            },
                            message: {
                                type: 'string',
                                default: 'Not Found Error',
                            },
                        },
                    },
                },
            },
        },
        UnprocessableEntityError: {
            description: 'Unprocessable Entity Error',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                default: {},
                            },
                            message: {
                                type: 'string',
                                default: 'Unprocessable Entity Error',
                            },
                        },
                    },
                },
            },
        },
        InternalServerError: {
            description: 'Internal Server Error',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                default: {},
                            },
                            message: {
                                type: 'string',
                                default: 'Internal Server Error',
                            },
                        },
                    },
                },
            },
        },
        NotDuplicateResponse: {
            description: 'Not Duplicate Response',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                properties: {
                                    isDuplicate: {
                                        type: 'bool',
                                        default: false,
                                    },
                                },
                            },
                            message: {
                                type: 'string',
                                default: 'Not duplicate value',
                            },
                        },
                    },
                },
            },
        },
        DuplicateResponse: {
            description: 'Bad Request Error',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                properties: {
                                    isDuplicate: {
                                        type: 'bool',
                                        default: true,
                                    },
                                },
                            },
                            message: {
                                type: 'string',
                                default: 'Duplicate value',
                            },
                        },
                    },
                },
            },
        },
    },
}

export default swaggerDoc
