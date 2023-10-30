const register = {
    summary: 'Register new user',
    tags: ['Auth'],
    requestBody: {
        required: true,
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/User'
                }
            }
        }
    },
    responses: {
        201: {
            description: 'OK',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                $ref: '#/components/schemas/User'
                            },
                            message: {
                                type: 'string',
                                default: 'Register successfully'
                            }
                        }
                    }
                }
            }
        },
        400: {
            $ref: '#/responses/BadRequestError'
        },
        500: {
            $ref: '#/responses/InternalServerError'
        }
    }
}

const authRouteDoc = {
    '/auth/register': {
        post: register,
    },
    // '/auth/login': {
    //     post: login,
    // },
    // '/auth/get-token': {
    //     post: getAccessToken,
    // },
    // '/auth/check-duplicate': {
    //     post: checkDuplicateUser,
    // }
}

export default authRouteDoc