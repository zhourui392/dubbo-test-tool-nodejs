const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Dubbo配置类
 */
class DubboConfig {
    constructor({
        host = '127.0.0.1',
        port = 20880,
        timeout = 5000,
        version = '',
        group = ''
    } = {}) {
        this.host = host;
        this.port = port;
        this.timeout = timeout;
        this.version = version;
        this.group = group;
    }

    toJSON() {
        return {
            host: this.host,
            port: this.port,
            timeout: this.timeout,
            version: this.version,
            group: this.group
        };
    }
}

/**
 * 方法类
 */
class Method {
    constructor({
        id = uuidv4(),
        name,
        params = '{}',
        returnType = '',
        description = ''
    }) {
        this.id = id;
        this.name = name;
        this.params = params;
        this.returnType = returnType;
        this.description = description;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            params: this.params,
            return_type: this.returnType,
            description: this.description
        };
    }
}

/**
 * 接口类（分类）
 */
class Interface {
    constructor({
        id = uuidv4(),
        name,
        methods = []
    }) {
        this.id = id;
        this.name = name;
        this.methods = methods.map(m => m instanceof Method ? m : new Method(m));
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            methods: this.methods.map(m => m.toJSON())
        };
    }
}

/**
 * 服务类
 */
class Service {
    constructor({
        id = uuidv4(),
        name,
        dubboConfig = new DubboConfig(),
        interfaces = []
    }) {
        this.id = id;
        this.name = name;
        this.dubboConfig = dubboConfig instanceof DubboConfig ? dubboConfig : new DubboConfig(dubboConfig);
        this.interfaces = interfaces.map(i => i instanceof Interface ? i : new Interface(i));
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            dubbo_config: this.dubboConfig.toJSON(),
            interfaces: this.interfaces.map(i => i.toJSON())
        };
    }
}

/**
 * 数据管理器
 */
class DataManager {
    constructor(dataFile = 'interfaces.json') {
        this.dataFile = dataFile;
        this.services = [];
    }

    /**
     * 加载数据
     */
    async loadData() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf-8');
            const parsed = JSON.parse(data);
            
            this.services = (parsed.services || []).map(serviceData => {
                return new Service({
                    id: serviceData.id,
                    name: serviceData.name,
                    dubboConfig: new DubboConfig(serviceData.dubbo_config),
                    interfaces: (serviceData.interfaces || []).map(interfaceData => {
                        return new Interface({
                            id: interfaceData.id,
                            name: interfaceData.name,
                            methods: (interfaceData.methods || []).map(methodData => {
                                return new Method({
                                    id: methodData.id,
                                    name: methodData.name,
                                    params: methodData.params,
                                    returnType: methodData.return_type,
                                    description: methodData.description
                                });
                            })
                        });
                    })
                });
            });
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.services = [];
            } else {
                console.error('Error loading data:', error.message);
                this.services = [];
            }
        }
    }

    /**
     * 保存数据
     */
    async saveData() {
        try {
            const data = {
                services: this.services.map(service => service.toJSON())
            };
            await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            console.error('Error saving data:', error.message);
            throw error;
        }
    }

    /**
     * 添加服务
     */
    async addService(name, dubboConfig = null) {
        const service = new Service({
            name,
            dubboConfig: dubboConfig || new DubboConfig()
        });
        this.services.push(service);
        await this.saveData();
        return service;
    }

    /**
     * 删除服务
     */
    async removeService(serviceId) {
        this.services = this.services.filter(s => s.id !== serviceId);
        await this.saveData();
    }

    /**
     * 更新服务
     */
    async updateService(serviceId, { name, dubboConfig } = {}) {
        const service = this.services.find(s => s.id === serviceId);
        if (service) {
            if (name) service.name = name;
            if (dubboConfig) service.dubboConfig = new DubboConfig(dubboConfig);
            await this.saveData();
        }
    }

    /**
     * 添加接口
     */
    async addInterface(serviceId, name) {
        const service = this.services.find(s => s.id === serviceId);
        if (service) {
            const newInterface = new Interface({ name });
            service.interfaces.push(newInterface);
            await this.saveData();
            return newInterface;
        }
        return null;
    }

    /**
     * 删除接口
     */
    async removeInterface(serviceId, interfaceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (service) {
            service.interfaces = service.interfaces.filter(i => i.id !== interfaceId);
            await this.saveData();
        }
    }

    /**
     * 添加方法
     */
    async addMethod(serviceId, interfaceId, { name, params = '{}', returnType = '', description = '' }) {
        const service = this.services.find(s => s.id === serviceId);
        if (service) {
            const targetInterface = service.interfaces.find(i => i.id === interfaceId);
            if (targetInterface) {
                const method = new Method({ name, params, returnType, description });
                targetInterface.methods.push(method);
                await this.saveData();
                return method;
            }
        }
        return null;
    }

    /**
     * 删除方法
     */
    async removeMethod(serviceId, interfaceId, methodId) {
        const service = this.services.find(s => s.id === serviceId);
        if (service) {
            const targetInterface = service.interfaces.find(i => i.id === interfaceId);
            if (targetInterface) {
                targetInterface.methods = targetInterface.methods.filter(m => m.id !== methodId);
                await this.saveData();
            }
        }
    }

    /**
     * 更新方法
     */
    async updateMethod(serviceId, interfaceId, methodId, { name, params, returnType, description } = {}) {
        const service = this.services.find(s => s.id === serviceId);
        if (service) {
            const targetInterface = service.interfaces.find(i => i.id === interfaceId);
            if (targetInterface) {
                const method = targetInterface.methods.find(m => m.id === methodId);
                if (method) {
                    if (name !== undefined) method.name = name;
                    if (params !== undefined) method.params = params;
                    if (returnType !== undefined) method.returnType = returnType;
                    if (description !== undefined) method.description = description;
                    await this.saveData();
                }
            }
        }
    }

    /**
     * 获取服务
     */
    getService(serviceId) {
        return this.services.find(s => s.id === serviceId) || null;
    }

    /**
     * 获取方法
     */
    getMethod(serviceId, interfaceId, methodId) {
        const service = this.getService(serviceId);
        if (service) {
            const targetInterface = service.interfaces.find(i => i.id === interfaceId);
            if (targetInterface) {
                return targetInterface.methods.find(m => m.id === methodId) || null;
            }
        }
        return null;
    }

    /**
     * 获取接口
     */
    getInterface(serviceId, interfaceId) {
        const service = this.getService(serviceId);
        if (service) {
            return service.interfaces.find(i => i.id === interfaceId) || null;
        }
        return null;
    }

    /**
     * 获取所有服务
     */
    getAllServices() {
        return this.services;
    }
}

module.exports = {
    DataManager,
    Service,
    Interface,
    Method,
    DubboConfig
};