const net = require('net');
const hessian = require('hessian.js');

/**
 * Dubbo协议常量
 */
const DUBBO_MAGIC = 0xdabb;
const DUBBO_VERSION = 0x00;
const FLAG_REQUEST = 0x80;
const FLAG_TWOWAY = 0x40;
const FLAG_EVENT = 0x20;
const SERIALIZATION_HESSIAN2 = 2;

/**
 * 自定义Dubbo直连客户端 - 实现真实Dubbo协议调用
 */
class DubboClient {
    constructor() {
        this.connections = new Map(); // 缓存TCP连接
        this.requestId = 0; // 请求ID计数器
    }

    /**
     * 生成唯一请求ID
     */
    generateRequestId() {
        return ++this.requestId;
    }

    /**
     * 编码Dubbo请求 - 使用Hessian2序列化
     */
    encodeDubboRequest(interfaceName, methodName, args, config) {
        const requestId = this.generateRequestId();
        
        // 构建请求数据 - 按照Dubbo协议格式
        const dubboVersion = '2.7.0';
        const serviceName = interfaceName;
        const serviceVersion = config.version || '1.0.0';
        const group = config.group || '';
        
        // 使用Hessian2序列化请求体
        const encoder = new hessian.EncoderV2();
        
        // 按照Dubbo协议顺序写入数据
        encoder.writeString(dubboVersion);           // Dubbo version
        encoder.writeString(serviceName);            // Service name  
        encoder.writeString(serviceVersion);         // Service version
        encoder.writeString(methodName);             // Method name
        
        // 参数类型描述
        const paramTypes = this.getParameterTypes(args);
        encoder.writeString(paramTypes.join(';'));   // Parameter types
        
        // 参数值
        for (const arg of args) {
            if (typeof arg === 'string') {
                encoder.writeString(arg);
            } else if (typeof arg === 'number') {
                if (Number.isInteger(arg)) {
                    encoder.writeInt(arg);
                } else {
                    encoder.writeDouble(arg);
                }
            } else if (typeof arg === 'boolean') {
                encoder.writeBoolean(arg);
            } else {
                encoder.writeObject(arg);
            }
        }
        
        // 附加信息
        const attachments = {
            path: serviceName,
            interface: serviceName,
            version: serviceVersion
        };
        if (group) {
            attachments.group = group;
        }
        encoder.writeObject(attachments);
        
        const body = encoder.byteBuffer._bytes.slice(0, encoder.byteBuffer._offset);
        const bodyLength = body.length;
        
        // 构建Dubbo协议头 (16字节)
        const header = Buffer.alloc(16);
        
        // Magic Number (2字节)
        header.writeUInt16BE(DUBBO_MAGIC, 0);
        
        // Message Flag (1字节) - Request + TwoWay + Hessian2
        header.writeUInt8(FLAG_REQUEST | FLAG_TWOWAY | SERIALIZATION_HESSIAN2, 2);
        
        // Status (1字节) - OK
        header.writeUInt8(0x14, 3);
        
        // Request ID (8字节)
        header.writeBigUInt64BE(BigInt(requestId), 4);
        
        // Body Length (4字节)
        header.writeUInt32BE(bodyLength, 12);
        
        return { header, body: Buffer.from(body), requestId };
    }

    /**
     * 获取参数类型
     */
    getParameterTypes(args) {
        return args.map(arg => {
            if (typeof arg === 'string') return 'java.lang.String';
            if (typeof arg === 'number') return Number.isInteger(arg) ? 'java.lang.Integer' : 'java.lang.Double';
            if (typeof arg === 'boolean') return 'java.lang.Boolean';
            if (typeof arg === 'object') return 'java.lang.Object';
            return 'java.lang.Object';
        });
    }

    /**
     * 解码Dubbo响应 - 使用Hessian2反序列化
     */
    decodeDubboResponse(buffer) {
        if (buffer.length < 16) {
            throw new Error('Invalid response: header too short');
        }
        
        // 读取头部
        const magic = buffer.readUInt16BE(0);
        if (magic !== DUBBO_MAGIC) {
            throw new Error('Invalid magic number');
        }
        
        const flag = buffer.readUInt8(2);
        const status = buffer.readUInt8(3);
        const requestId = buffer.readBigUInt64BE(4);
        const bodyLength = buffer.readUInt32BE(12);
        
        if (buffer.length < 16 + bodyLength) {
            throw new Error('Incomplete response body');
        }
        
        // 读取响应体
        const body = buffer.slice(16, 16 + bodyLength);
        
        try {
            // 使用Hessian2反序列化
            const decoder = new hessian.DecoderV2(body);
            
            // 检查响应状态
            if ((flag & 0x80) === 0) { // 这是响应
                if (status === 20) { // OK
                    const result = decoder.readObject();
                    return {
                        requestId: Number(requestId),
                        status: status,
                        data: result
                    };
                } else {
                    // 错误响应
                    const errorMsg = decoder.readString();
                    return {
                        requestId: Number(requestId),
                        status: status,
                        data: errorMsg,
                        error: true
                    };
                }
            }
            
            return {
                requestId: Number(requestId),
                status: status,
                data: body.toString('utf8')
            };
        } catch (error) {
            // 如果Hessian解析失败，返回原始数据
            return {
                requestId: Number(requestId),
                status: status,
                data: body.toString('utf8'),
                parseError: error.message
            };
        }
    }

    /**
     * 获取或创建TCP连接
     */
    async getConnection(config) {
        const key = `${config.host}:${config.port}`;
        
        if (!this.connections.has(key)) {
            const socket = new net.Socket();
            socket.setTimeout(config.timeout || 6000);
            
            await new Promise((resolve, reject) => {
                socket.connect(config.port, config.host, resolve);
                socket.on('error', reject);
                socket.on('timeout', () => reject(new Error('Connection timeout')));
            });
            
            this.connections.set(key, socket);
        }
        
        return this.connections.get(key);
    }

    /**
     * 测试连接到Dubbo服务
     */
    async testConnection(config) {
        const startTime = Date.now();
        console.log(`[连接测试] 测试连接到 ${config.host}:${config.port}`);
        
        try {
            // 使用简单的TCP连接测试
            const net = require('net');
            return new Promise((resolve) => {
                const timeout = Math.min(config.timeout || 5000, 3000);
                const socket = new net.Socket();
                socket.setTimeout(timeout);
                
                let isResolved = false;
                const resolveOnce = (result) => {
                    if (!isResolved) {
                        isResolved = true;
                        const elapsed = Date.now() - startTime;
                        console.log(`[连接测试] 测试结束，耗时: ${elapsed}ms`);
                        resolve(result);
                    }
                };

                socket.on('connect', () => {
                    console.log(`[连接测试] TCP连接成功建立`);
                    resolveOnce({
                        success: true,
                        message: '连接成功',
                        elapsed: Date.now() - startTime
                    });
                    socket.destroy();
                });

                socket.on('timeout', () => {
                    console.error(`[连接测试] 连接超时 (${timeout}ms)`);
                    resolveOnce({
                        success: false,
                        error: `连接超时 (${timeout}ms)`,
                        details: { host: config.host, port: config.port, timeout: timeout }
                    });
                    socket.destroy();
                });

                socket.on('error', (error) => {
                    console.error(`[连接测试] 连接失败:`, error);
                    resolveOnce({
                        success: false,
                        error: error.message,
                        errorCode: error.code,
                        details: { host: config.host, port: config.port, errorCode: error.code }
                    });
                });

                socket.connect(config.port, config.host);
            });
        } catch (error) {
            return {
                success: false,
                error: `连接测试异常: ${error.message}`,
                elapsed: Date.now() - startTime
            };
        }
    }

    /**
     * 调用Dubbo方法 - 真实Dubbo协议实现
     */
    async callMethod(interfaceName, method, paramsJson, config) {
        const startTime = Date.now();
        console.log(`[Dubbo调用] 开始调用 ${interfaceName}.${method}`);
        console.log(`[Dubbo调用] 连接地址: ${config.host}:${config.port}`);
        
        try {
            // 解析参数
            let paramsList;
            try {
                const params = paramsJson.trim() ? JSON.parse(paramsJson) : [];
                if (Array.isArray(params)) {
                    paramsList = params;
                } else {
                    paramsList = [params];
                }
                console.log(`[Dubbo调用] 参数解析成功:`, paramsList);
            } catch (error) {
                console.error(`[Dubbo调用] 参数解析失败:`, error.message);
                return { error: `参数JSON格式错误: ${error.message}` };
            }

            // 获取TCP连接
            const socket = await this.getConnection(config);
            
            // 编码Dubbo请求
            const { header, body, requestId } = this.encodeDubboRequest(interfaceName, method, paramsList, config);
            
            console.log(`[Dubbo调用] 发送Dubbo请求, requestId: ${requestId}`);
            
            // 发送请求
            const requestBuffer = Buffer.concat([header, body]);
            socket.write(requestBuffer);
            
            // 等待响应
            const response = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Request timeout'));
                }, config.timeout || 6000);
                
                let responseBuffer = Buffer.alloc(0);
                
                const onData = (data) => {
                    responseBuffer = Buffer.concat([responseBuffer, data]);
                    
                    // 检查是否收到完整响应
                    if (responseBuffer.length >= 16) {
                        const bodyLength = responseBuffer.readUInt32BE(12);
                        if (responseBuffer.length >= 16 + bodyLength) {
                            clearTimeout(timeout);
                            socket.off('data', onData);
                            socket.off('error', onError);
                            
                            try {
                                const decoded = this.decodeDubboResponse(responseBuffer);
                                resolve(decoded);
                            } catch (error) {
                                reject(error);
                            }
                        }
                    }
                };
                
                const onError = (error) => {
                    clearTimeout(timeout);
                    socket.off('data', onData);
                    socket.off('error', onError);
                    reject(error);
                };
                
                socket.on('data', onData);
                socket.on('error', onError);
            });
            
            const elapsed = Date.now() - startTime;
            console.log(`[Dubbo调用] 调用成功，耗时: ${elapsed}ms`);
            
            return {
                success: true,
                data: response.data,
                elapsed: elapsed,
                requestId: response.requestId
            };
            
        } catch (error) {
            const elapsed = Date.now() - startTime;
            console.error(`[Dubbo调用] 调用失败:`, error);
            
            return {
                success: false,
                error: error.message || '调用失败',
                details: {
                    host: config.host,
                    port: config.port,
                    interface: interfaceName,
                    method: method,
                    elapsed: elapsed
                }
            };
        }
    }

    /**
     * 清理资源
     */
    async cleanup() {
        console.log('[Dubbo客户端] 清理资源...');
        for (const [key, socket] of this.connections) {
            try {
                if (socket && !socket.destroyed) {
                    socket.destroy();
                }
                console.log(`[Dubbo客户端] 已关闭连接: ${key}`);
            } catch (error) {
                console.error(`[Dubbo客户端] 关闭连接失败: ${key}`, error);
            }
        }
        this.connections.clear();
    }
}

module.exports = {
    DubboClient
};