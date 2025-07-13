const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { DataManager } = require('./core/data-manager');
const { DubboClient } = require('./core/dubbo-client');

class DubboTestWebServer {
    constructor(port = 3000) {
        this.port = port;
        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server);
        this.dataManager = new DataManager();
        this.dubboClient = new DubboClient();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupRoutes() {
        // API路由
        this.app.get('/api/services', async (req, res) => {
            try {
                const services = this.dataManager.getAllServices();
                res.json({ success: true, data: services });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/services', async (req, res) => {
            try {
                const { name, dubboConfig } = req.body;
                const service = await this.dataManager.addService(name, dubboConfig);
                res.json({ success: true, data: service });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.delete('/api/services/:serviceId', async (req, res) => {
            try {
                await this.dataManager.removeService(req.params.serviceId);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/services/:serviceId/interfaces', async (req, res) => {
            try {
                const { name } = req.body;
                const newInterface = await this.dataManager.addInterface(req.params.serviceId, name);
                res.json({ success: true, data: newInterface });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 删除接口
        this.app.delete('/api/services/:serviceId/interfaces/:interfaceId', async (req, res) => {
            try {
                await this.dataManager.removeInterface(req.params.serviceId, req.params.interfaceId);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/services/:serviceId/interfaces/:interfaceId/methods', async (req, res) => {
            try {
                const methodData = req.body;
                const method = await this.dataManager.addMethod(
                    req.params.serviceId,
                    req.params.interfaceId,
                    methodData
                );
                res.json({ success: true, data: method });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 删除方法
        this.app.delete('/api/services/:serviceId/interfaces/:interfaceId/methods/:methodId', async (req, res) => {
            try {
                await this.dataManager.removeMethod(
                    req.params.serviceId,
                    req.params.interfaceId,
                    req.params.methodId
                );
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/test-method', async (req, res) => {
            try {
                const { serviceId, interfaceId, methodId, params } = req.body;
                
                const service = this.dataManager.getService(serviceId);
                const targetInterface = this.dataManager.getInterface(serviceId, interfaceId);
                const method = this.dataManager.getMethod(serviceId, interfaceId, methodId);

                if (!service || !targetInterface || !method) {
                    return res.status(404).json({ success: false, error: '未找到指定的服务/接口/方法' });
                }

                const result = await this.dubboClient.callMethod(
                    targetInterface.name,
                    method.name,
                    params || method.params,
                    service.dubboConfig
                );

                res.json({ success: true, data: result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 主页
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('get-services', async () => {
                try {
                    const services = this.dataManager.getAllServices();
                    socket.emit('services-data', { success: true, data: services });
                } catch (error) {
                    socket.emit('services-data', { success: false, error: error.message });
                }
            });

            socket.on('test-method', async (data) => {
                try {
                    const { serviceId, interfaceId, methodId, params } = data;
                    
                    const service = this.dataManager.getService(serviceId);
                    const targetInterface = this.dataManager.getInterface(serviceId, interfaceId);
                    const method = this.dataManager.getMethod(serviceId, interfaceId, methodId);

                    if (!service || !targetInterface || !method) {
                        socket.emit('test-result', { success: false, error: '未找到指定的服务/接口/方法' });
                        return;
                    }

                    socket.emit('test-start', { message: '开始测试...' });

                    const result = await this.dubboClient.callMethod(
                        targetInterface.name,
                        method.name,
                        params || method.params,
                        service.dubboConfig
                    );

                    socket.emit('test-result', { success: true, data: result });
                } catch (error) {
                    socket.emit('test-result', { success: false, error: error.message });
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    async start() {
        await this.dataManager.loadData();
        
        this.server.listen(this.port, () => {
            console.log(`\\n🚀 Dubbo测试工具Web服务已启动`);
            console.log(`📱 访问地址: http://localhost:${this.port}`);
            console.log(`🛠️  API端点: http://localhost:${this.port}/api`);
            console.log(`\\n按 Ctrl+C 停止服务\\n`);
        });
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const port = process.env.PORT || 3000;
    const server = new DubboTestWebServer(port);
    server.start().catch(console.error);
}

module.exports = DubboTestWebServer;