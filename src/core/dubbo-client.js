const net = require('net');

/**
 * Dubbo客户端实现
 */
class DubboClient {
    constructor() {
        this.requestId = 0;
    }

    /**
     * 获取下一个请求ID
     */
    getNextRequestId() {
        return ++this.requestId;
    }

    /**
     * 编码Dubbo请求
     */
    encodeRequest(interfaceName, method, params, config) {
        // Dubbo协议简化实现
        // 实际生产环境建议使用成熟的Node.js Dubbo客户端库
        
        const callData = {
            dubbo: '2.0.2',
            interface: interfaceName,
            method: method,
            parameter: params,
            version: config.version,
            group: config.group
        };

        // 序列化为JSON（简化版本，实际dubbo使用hessian2）
        const body = Buffer.from(JSON.stringify(callData), 'utf-8');

        // Dubbo协议头（简化版本）
        const magic = 0xdabb; // dubbo magic number
        const flag = 0x02; // request flag
        const requestId = this.getNextRequestId();
        const dataLength = body.length;

        // 构建协议头（16字节）
        const header = Buffer.alloc(16);
        header.writeUInt16BE(magic, 0);
        header.writeUInt16BE(flag, 2);
        header.writeUInt8(0, 4);
        header.writeUInt8(0, 5);
        header.writeBigUInt64BE(BigInt(requestId), 6);
        header.writeUInt32BE(dataLength, 12);

        return Buffer.concat([header, body]);
    }

    /**
     * 解码Dubbo响应
     */
    decodeResponse(data) {
        try {
            // 解析协议头
            if (data.length < 16) {
                return { error: '响应数据不完整' };
            }

            const header = data.slice(0, 16);
            const body = data.slice(16);

            // 简化解析，实际应该按dubbo协议解析
            try {
                const responseData = JSON.parse(body.toString('utf-8'));
                return { success: true, data: responseData };
            } catch {
                // 如果不是JSON格式，返回原始数据
                return { success: true, data: body.toString('utf-8') };
            }
        } catch (error) {
            return { error: `解析响应失败: ${error.message}` };
        }
    }

    /**
     * 调用Dubbo方法
     */
    async callMethod(interfaceName, method, paramsJson, config) {
        return new Promise((resolve) => {
            try {
                // 解析参数
                let paramsList;
                try {
                    const params = paramsJson.trim() ? JSON.parse(paramsJson) : {};
                    if (Array.isArray(params)) {
                        paramsList = params;
                    } else if (typeof params === 'object') {
                        paramsList = [params];
                    } else {
                        paramsList = [params];
                    }
                } catch (error) {
                    resolve({ error: `参数JSON格式错误: ${error.message}` });
                    return;
                }

                // 创建socket连接
                const socket = new net.Socket();
                socket.setTimeout(config.timeout);

                let responseData = Buffer.alloc(0);

                socket.on('connect', () => {
                    try {
                        // 编码请求
                        const requestData = this.encodeRequest(interfaceName, method, paramsList, config);
                        
                        // 发送请求
                        socket.write(requestData);
                    } catch (error) {
                        resolve({ error: `编码请求失败: ${error.message}` });
                        socket.destroy();
                    }
                });

                socket.on('data', (chunk) => {
                    responseData = Buffer.concat([responseData, chunk]);
                    
                    // 简单的完整性检查
                    if (responseData.length >= 16) {
                        // 读取数据长度
                        const dataLength = responseData.readUInt32BE(12);
                        if (responseData.length >= 16 + dataLength) {
                            // 解码响应
                            const result = this.decodeResponse(responseData);
                            resolve(result);
                            socket.destroy();
                        }
                    }
                });

                socket.on('timeout', () => {
                    resolve({ error: '请求超时' });
                    socket.destroy();
                });

                socket.on('error', (error) => {
                    if (error.code === 'ECONNREFUSED') {
                        resolve({ error: `连接被拒绝，请检查服务地址 ${config.host}:${config.port}` });
                    } else {
                        resolve({ error: `调用失败: ${error.message}` });
                    }
                });

                socket.on('close', () => {
                    if (responseData.length === 0) {
                        resolve({ error: '连接被服务器关闭，未收到响应' });
                    }
                });

                // 连接到dubbo服务
                socket.connect(config.port, config.host);

            } catch (error) {
                resolve({ error: `调用异常: ${error.message}` });
            }
        });
    }
}

module.exports = {
    DubboClient
};