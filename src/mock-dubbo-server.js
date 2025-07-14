const net = require('net');

/**
 * 模拟Dubbo服务器
 * 用于测试Dubbo客户端连接和调用
 */
class MockDubboServer {
    constructor(port = 28880) {
        this.port = port;
        this.server = null;
    }

    start() {
        this.server = net.createServer((socket) => {
            console.log(`[模拟Dubbo服务] 客户端连接: ${socket.remoteAddress}:${socket.remotePort}`);
            
            socket.on('data', (data) => {
                console.log(`[模拟Dubbo服务] 收到数据: ${data.length} bytes`);
                
                try {
                    // 解析Dubbo协议头
                    if (data.length >= 16) {
                        const header = data.slice(0, 16);
                        const body = data.slice(16);
                        
                        // 读取请求ID
                        const requestId = header.readBigUInt64BE(6);
                        
                        console.log(`[模拟Dubbo服务] 请求ID: ${requestId}`);
                        
                        // 尝试解析请求体
                        try {
                            const requestData = JSON.parse(body.toString('utf-8'));
                            console.log(`[模拟Dubbo服务] 请求数据:`, requestData);
                            
                            // 生成模拟响应
                            const responseData = this.generateMockResponse(requestData);
                            
                            // 编码响应
                            const response = this.encodeResponse(requestId, responseData);
                            
                            console.log(`[模拟Dubbo服务] 发送响应: ${response.length} bytes`);
                            socket.write(response);
                            
                        } catch (parseError) {
                            console.log(`[模拟Dubbo服务] 无法解析请求体，发送默认响应`);
                            const defaultResponse = { success: true, message: "模拟响应", timestamp: new Date().toISOString() };
                            const response = this.encodeResponse(requestId, defaultResponse);
                            socket.write(response);
                        }
                    }
                } catch (error) {
                    console.error(`[模拟Dubbo服务] 处理请求失败:`, error.message);
                }
            });

            socket.on('close', () => {
                console.log(`[模拟Dubbo服务] 客户端断开连接`);
            });

            socket.on('error', (error) => {
                console.error(`[模拟Dubbo服务] Socket错误:`, error.message);
            });
        });

        this.server.listen(this.port, '0.0.0.0', () => {
            console.log(`🎭 模拟Dubbo服务已启动`);
            console.log(`📡 监听地址: 0.0.0.0:${this.port}`);
            console.log(`💡 可用于测试Dubbo客户端连接`);
            console.log(`⚠️  这是一个模拟服务，仅用于开发测试\n`);
        });

        this.server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ 端口 ${this.port} 已被占用`);
                console.log(`💡 提示: 可能已有Dubbo服务在该端口运行，或选择其他端口`);
            } else {
                console.error(`❌ 服务启动失败:`, error.message);
            }
        });

        return this.server;
    }

    stop() {
        if (this.server) {
            this.server.close(() => {
                console.log(`[模拟Dubbo服务] 服务已停止`);
            });
        }
    }

    /**
     * 生成模拟响应数据
     */
    generateMockResponse(requestData) {
        const { interface: interfaceName, method, parameter } = requestData;
        
        console.log(`[模拟Dubbo服务] 调用接口: ${interfaceName}.${method}`);
        
        // 根据接口和方法生成不同的模拟数据
        const responses = {
            // 用户服务响应
            'getUserInfo': {
                success: true,
                data: {
                    userId: parameter?.[0]?.userId || "123456",
                    name: "张三",
                    email: "zhangsan@example.com",
                    phone: "13800138000",
                    createTime: "2024-01-01T00:00:00Z",
                    status: "ACTIVE"
                },
                message: "获取用户信息成功"
            },
            'updateUser': {
                success: true,
                data: true,
                message: "用户信息更新成功"
            },
            'createUser': {
                success: true,
                data: "USR_" + Date.now(),
                message: "用户创建成功"
            },
            'login': {
                success: true,
                data: {
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token." + Date.now(),
                    expireTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    userInfo: {
                        userId: "123456",
                        username: parameter?.[0]?.username || "admin",
                        roles: ["USER"]
                    }
                },
                message: "登录成功"
            },
            'logout': {
                success: true,
                data: true,
                message: "退出登录成功"
            },
            // 订单服务响应
            'createOrder': {
                success: true,
                data: {
                    orderId: "ORD_" + Date.now(),
                    userId: parameter?.[0]?.userId || "123456",
                    status: "CREATED",
                    totalAmount: 59.98,
                    createTime: new Date().toISOString(),
                    items: parameter?.[0]?.items || []
                },
                message: "订单创建成功"
            },
            'getOrder': {
                success: true,
                data: {
                    orderId: parameter?.[0]?.orderId || "ORD001",
                    userId: "123456",
                    status: "IN_PROGRESS",
                    totalAmount: 59.98,
                    createTime: "2024-01-01T10:00:00Z",
                    items: [
                        { productId: "P001", quantity: 2, price: 29.99, name: "商品A" }
                    ]
                },
                message: "获取订单成功"
            },
            'updateOrderStatus': {
                success: true,
                data: true,
                message: "订单状态更新成功"
            },
            'cancelOrder': {
                success: true,
                data: true,
                message: "订单取消成功"
            },
            // 支付服务响应
            'createPayment': {
                success: true,
                data: {
                    paymentId: "PAY_" + Date.now(),
                    orderId: parameter?.[0]?.orderId || "ORD001",
                    amount: parameter?.[0]?.amount || 59.98,
                    paymentMethod: parameter?.[0]?.paymentMethod || "WECHAT_PAY",
                    status: "PENDING",
                    createTime: new Date().toISOString()
                },
                message: "支付订单创建成功"
            },
            'processPayment': {
                success: true,
                data: {
                    paymentId: parameter?.[0]?.paymentId || "PAY001",
                    status: "SUCCESS",
                    transactionId: "TXN_" + Date.now(),
                    paidTime: new Date().toISOString()
                },
                message: "支付处理成功"
            },
            'refundPayment': {
                success: true,
                data: {
                    refundId: "REF_" + Date.now(),
                    paymentId: parameter?.[0]?.paymentId || "PAY001",
                    refundAmount: parameter?.[0]?.refundAmount || 59.98,
                    status: "SUCCESS",
                    refundTime: new Date().toISOString()
                },
                message: "退款处理成功"
            }
        };

        // 返回对应方法的响应，或默认响应
        return responses[method] || {
            success: true,
            data: {
                interface: interfaceName,
                method: method,
                parameters: parameter,
                timestamp: new Date().toISOString()
            },
            message: `模拟响应: ${method} 调用成功`
        };
    }

    /**
     * 编码Dubbo响应
     */
    encodeResponse(requestId, responseData) {
        // 序列化响应数据
        const responseJson = JSON.stringify(responseData);
        const body = Buffer.from(responseJson, 'utf-8');

        // 构建响应头
        const magic = 0xdabb;
        const flag = 0x02; // response flag
        const status = 0x14; // OK status
        const dataLength = body.length;

        const header = Buffer.alloc(16);
        header.writeUInt16BE(magic, 0);
        header.writeUInt16BE(flag, 2);
        header.writeUInt8(status, 4);
        header.writeUInt8(0, 5);
        header.writeBigUInt64BE(requestId, 6);
        header.writeUInt32BE(dataLength, 12);

        return Buffer.concat([header, body]);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const port = process.env.MOCK_PORT || 20880;
    const mockServer = new MockDubboServer(port);
    
    mockServer.start();
    
    // 处理进程退出
    process.on('SIGINT', () => {
        console.log('\n正在停止模拟服务...');
        mockServer.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        mockServer.stop();
        process.exit(0);
    });
}

module.exports = MockDubboServer;